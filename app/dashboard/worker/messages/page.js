"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Send, MessageSquare, Stethoscope, Loader2, Inbox, ArrowLeft, Clock, ShieldCheck 
} from "lucide-react";

export default function WorkerToDoctorMessages() {
  const [workerData, setWorkerData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /* 1. INITIAL LOAD: AUTH & DOCTOR LIST */
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: profile } = await supabase
        .from("app_users")
        .select("id, name, role, village")
        .eq("id", user.id)
        .single();
      
      setWorkerData(profile);

      // Workers typically talk to Doctors in their region/village
      const { data: doctorList } = await supabase
        .from("app_users")
        .select("id, name")
        .eq("role", "doctor")
        .order("name", { ascending: true });

      setDoctors(doctorList || []);
      setLoading(false);
    };

    initData();
  }, []);

  /* 2. FETCH CHAT & SET UP REALTIME */
  useEffect(() => {
    if (selectedDoctor && workerData) {
      fetchChat();

      const channel = supabase
        .channel(`worker_chat_${selectedDoctor.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${workerData.id}`,
          },
          (payload) => {
            if (payload.new.sender_id === selectedDoctor.id) {
              setMessages((prev) => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedDoctor, workerData]);

  const fetchChat = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${workerData.id},recipient_id.eq.${selectedDoctor.id}),and(sender_id.eq.${selectedDoctor.id},recipient_id.eq.${workerData.id})`)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDoctor) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: workerData.id,
      sender_role: "worker",
      recipient_id: selectedDoctor.id,
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
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Clinical Support</h1>
        <p className="text-slate-500 font-medium">Consult with doctors regarding patient assessments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
        {/* DOCTOR LIST SIDEBAR */}
        <aside className={`lg:col-span-4 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col shadow-sm ${selectedDoctor ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
             Medical Officers ({doctors.length})
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all ${
                  selectedDoctor?.id === doc.id ? "bg-indigo-600 text-white shadow-xl" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedDoctor?.id === doc.id ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}>
                  <Stethoscope size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black">{doc.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${selectedDoctor?.id === doc.id ? "text-indigo-100" : "text-slate-400"}`}>
                    Clinical Supervisor
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CHAT WINDOW */}
        <section className={`lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden ${!selectedDoctor ? 'hidden lg:flex' : 'flex'}`}>
          {selectedDoctor ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedDoctor(null)} className="lg:hidden p-2 text-slate-400"><ArrowLeft/></button>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><ShieldCheck size={24}/></div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none">Dr. {selectedDoctor.name}</h3>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Verified Clinical Line
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === workerData.id ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[75%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                      msg.sender_id === workerData.id 
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-lg" 
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                    }`}>
                      {msg.content}
                      <div className={`text-[9px] mt-2 font-black uppercase opacity-40 flex items-center gap-1 ${msg.sender_id === workerData.id ? "justify-end" : "justify-start"}`}>
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-3">
                <input
                  className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[1.8rem] px-6 py-4 outline-none transition-all font-medium text-sm"
                  placeholder={`Consult with Dr. ${selectedDoctor.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  disabled={sending || !newMessage.trim()} 
                  className="bg-slate-900 text-white p-5 rounded-[1.5rem] hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={24}/> : <Send size={24}/>}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4"><Stethoscope size={40}/></div>
              <p className="font-bold text-slate-400">Select a doctor to report field findings</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}