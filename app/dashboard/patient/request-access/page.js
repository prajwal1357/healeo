"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  ShieldCheck, 
  Stethoscope, 
  HeartHandshake, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from "lucide-react";

export default function RequestAccessPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    requested_role: "worker",
    reason: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const { error: requestError } = await supabase
        .from("access_requests")
        .insert({
          user_id: user.id,
          requested_role: form.requested_role,
          reason: form.reason,
          status: 'pending'
        });

      if (requestError) throw requestError;

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit request. You might already have a pending request.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 bg-white border border-slate-100 rounded-[3rem] shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Request Received</h2>
        <p className="text-slate-500 font-medium">
          Our administrators are reviewing your application. You will be notified once your role is updated.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" size={32} />
          Professional Access
        </h1>
        <p className="text-slate-500 font-medium italic">Apply for Doctor or Health Worker credentials within the Caresora network.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 space-y-8">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Desired Role</label>
          <div className="grid grid-cols-2 gap-4">
            <RoleOption 
              active={form.requested_role === 'worker'}
              onClick={() => setForm({...form, requested_role: 'worker'})}
              icon={<HeartHandshake size={20} />}
              title="Field Worker"
              desc="Record patient vitals in rural areas."
            />
            <RoleOption 
              active={form.requested_role === 'doctor'}
              onClick={() => setForm({...form, requested_role: 'doctor'})}
              icon={<Stethoscope size={20} />}
              title="Medical Doctor"
              desc="Review records and provide assessment."
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Background / Reason</label>
          <textarea 
            required
            rows={5}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-6 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
            placeholder="Please detail your medical experience, license number (if applicable), or your goal in joining the field team..."
            value={form.reason}
            onChange={(e) => setForm({...form, reason: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          {loading ? "Processing..." : "Submit Application"}
        </button>
      </form>

      <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex gap-4">
        <FileText className="text-indigo-400 shrink-0" size={24} />
        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
          <strong>Note:</strong> Applications are usually reviewed within 24-48 hours. Providing accurate professional details increases the speed of approval.
        </p>
      </div>
    </div>
  );
}

function RoleOption({ active, onClick, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 text-left transition-all space-y-2 ${
        active 
        ? "bg-white border-indigo-600 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50" 
        : "bg-slate-50 border-transparent hover:border-slate-200"
      }`}
    >
      <div className={`p-3 w-fit rounded-xl ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
        {icon}
      </div>
      <p className={`font-black text-sm tracking-tight ${active ? 'text-slate-900' : 'text-slate-500'}`}>{title}</p>
      <p className="text-[10px] text-slate-400 font-bold leading-tight">{desc}</p>
    </button>
  );
}