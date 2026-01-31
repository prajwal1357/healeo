"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Send, MessageSquare, User, Loader2, Inbox, ArrowLeft, Clock, MapPin 
} from "lucide-react";

export default function DoctorMessagesPage() {
  const [doctorData, setDoctorData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /* 1. INITIAL LOAD: AUTH & WORKER LIST */
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: profile } = await supabase
        .from("app_users")
        .select("id, name, role")
        .eq("id", user.id)
        .single();
      
      setDoctorData(profile);

      const { data: workerList } = await supabase
        .from("app_users")
        .select("id, name, village")
        .eq("role", "worker")
        .order("name", { ascending: true });

      setWorkers(workerList || []);
      setLoading(false);
    };

    initData();
  }, []);

  /* 2. FETCH CHAT HISTORY ON SELECTION */
  useEffect(() => {
    if (selectedWorker && doctorData) {
      fetchChat();
    }
  }, [selectedWorker, doctorData]);

  /* 3. REALTIME SUBSCRIPTION (The "Receiver" Logic) */
  useEffect(() => {
    if (!selectedWorker || !doctorData) return;

    // Listen for new messages where the Doctor is the recipient
    const channel = supabase
      .channel(`chat_${selectedWorker.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${doctorData.id}`,
        },
        (payload) => {
          // Only append if the message is from the worker currently selected
          if (payload.new.sender_id === selectedWorker.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedWorker, doctorData]);

  const fetchChat = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${doctorData.id},recipient_id.eq.${selectedWorker.id}),and(sender_id.eq.${selectedWorker.id},recipient_id.eq.${doctorData.id})`)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedWorker) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: doctorData.id,
      sender_role: "doctor",
      recipient_id: selectedWorker.id,
      content: newMessage,
    });

    if (!error) {
      setNewMessage("");
      fetchChat(); 
    }
    setSending(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Field Comms</h1>
          <p className="text-slate-500 font-medium">Coordinate care with rural health workers in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
        {/* WORKER LIST SIDEBAR */}
        <aside className={`lg:col-span-4 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm ${selectedWorker ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <Inbox size={14} /> Available Workers ({workers.length})
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {workers.map((worker) => (
              <button
                key={worker.id}
                onClick={() => setSelectedWorker(worker)}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group ${
                  selectedWorker?.id === worker.id ? "bg-indigo-600 text-white shadow-xl" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedWorker?.id === worker.id ? "bg-white/20" : "bg-slate-100 text-slate-400 group-hover:bg-white"}`}>
                  <User size={20} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-black leading-tight">{worker.name}</p>
                  <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest mt-1 ${selectedWorker?.id === worker.id ? "text-indigo-100" : "text-slate-400"}`}>
                    <MapPin size={10} /> {worker.village || "Regional"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CHAT WINDOW */}
        <section className={`lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden ${!selectedWorker ? 'hidden lg:flex' : 'flex'}`}>
          {selectedWorker ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedWorker(null)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><ArrowLeft/></button>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><MessageSquare size={24}/></div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none">{selectedWorker.name}</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Connection
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === doctorData.id ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[75%] p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender_id === doctorData.id 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                    }`}>
                      {msg.content}
                      <div className={`text-[9px] mt-2 font-black uppercase opacity-40 flex items-center gap-1 ${msg.sender_id === doctorData.id ? "justify-end" : "justify-start"}`}>
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-3">
                <input
                  className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[1.8rem] px-6 py-4 outline-none transition-all font-medium text-sm placeholder:text-slate-400"
                  placeholder={`Reply to ${selectedWorker.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  disabled={sending || !newMessage.trim()} 
                  className="bg-slate-900 text-white p-5 rounded-[1.5rem] hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {sending ? <Loader2 className="animate-spin" size={24}/> : <Send size={24}/>}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 bg-slate-50/10">
              <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-400">Secure Messaging</h3>
              <p className="font-bold text-slate-300 text-center mt-2 max-w-xs uppercase text-[10px] tracking-widest leading-loose">
                Select a worker from the sidebar to coordinate field operations and clinical reviews.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}