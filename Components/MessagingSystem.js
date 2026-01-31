"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Send, MessageSquare, User, CheckCircle, 
  Loader2, Inbox, Search, ArrowLeft 
} from "lucide-react";

export default function MessagingSystem({ currentUser, allowedRoles }) {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      // Optional: Set up real-time subscription here
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    setLoading(true);
    // Fetch users that match the allowed roles for the current user
    const { data } = await supabase
      .from("app_users")
      .select("id, name, role, village")
      .in("role", allowedRoles)
      .order("name", { ascending: true });
    
    setContacts(data || []);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},recipient_id.eq.${currentUser.id})`)
      .order("created_at", { ascending: true });
    
    setMessages(data || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUser.id,
      sender_role: currentUser.role,
      recipient_id: selectedContact.id,
      content: newMessage,
    });

    if (!error) {
      setNewMessage("");
      fetchMessages();
    }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px] bg-slate-50/50 p-4 rounded-[3rem]">
      
      {/* Sidebar: Contacts */}
      <aside className={`lg:col-span-4 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col shadow-sm overflow-hidden ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Inbox className="text-indigo-600" size={20} /> Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedContact(u)}
              className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all ${
                selectedContact?.id === u.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedContact?.id === u.id ? "bg-white/20" : "bg-slate-100 text-slate-400"}`}>
                <User size={24} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-black truncate">{u.name}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-70`}>{u.role} • {u.village}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main: Chat Area */}
      <section className={`lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden ${!selectedContact ? 'hidden lg:flex' : 'flex'}`}>
        {selectedContact ? (
          <>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedContact(null)} className="lg:hidden p-2 hover:bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
                <div>
                  <h3 className="font-black text-slate-900 leading-none">{selectedContact.name}</h3>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Active Thread</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm font-medium ${
                    msg.sender_id === currentUser.id 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
                  }`}>
                    {msg.content}
                    <p className="text-[9px] mt-2 font-black uppercase opacity-50 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-3">
              <input
                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-sm"
                placeholder="Write your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button disabled={sending || !newMessage.trim()} className="bg-slate-900 text-white p-5 rounded-2xl hover:bg-black transition-all disabled:opacity-50">
                {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><MessageSquare size={40}/></div>
            <p className="font-bold text-slate-400">Select a contact to open conversation</p>
          </div>
        )}
      </section>
    </div>
  );
}