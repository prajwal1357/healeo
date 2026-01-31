"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { saveRecordOffline, getPendingRecords, clearSyncedRecord } from "@/lib/offline-db"; // Ensure these are exported
import WorkerMedicalRecords from "@/Components/WorkerMedicalRecords";
import { 
  Users, ClipboardList, TrendingUp, Search, UserPlus, Activity, 
  Droplets, Scale, AlertCircle, CheckCircle2, X, Save, 
  Loader2, History, ChevronRight, FileText, WifiOff, Wifi 
} from "lucide-react";

export default function WorkerDashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, docsUploaded: 0, checkedThisMonth: 0 });
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  const [form, setForm] = useState({
    bp: "", sugar: "", weight: "", symptoms: "", condition: "stable",
  });

  /* ---------------- 1. NETWORK & AUTO-SYNC LOGIC ---------------- */
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const syncOfflineData = async () => {
      if (!navigator.onLine) return;
      
      const pending = await getPendingRecords();
      if (pending.length === 0) return;

      for (const record of pending) {
        const { id, ...data } = record;
        const { error } = await supabase.from('worker_patient_records').insert([data]);
        if (!error) {
          await clearSyncedRecord(id);
          setStats(s => ({ ...s, docsUploaded: s.docsUploaded + 1 }));
        }
      }
    };

    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) syncOfflineData();
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    syncOfflineData(); // Try sync on initial load

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  /* ---------------- 2. FETCH INITIAL STATS ---------------- */
  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: totalPatients } = await supabase
        .from("app_users").select("*", { count: "exact", head: true }).eq("role", "patient");

      const { count: docsUploaded } = await supabase
        .from("worker_patient_records").select("*", { count: "exact", head: true }).eq("worker_id", user.id);

      setStats({ 
        totalPatients: totalPatients || 0, 
        docsUploaded: docsUploaded || 0, 
        checkedThisMonth: docsUploaded || 0 
      });
    };
    fetchStats();
  }, []);

  /* ---------------- 3. SEARCH & SELECT ---------------- */
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (search.trim().length < 1) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("app_users").select("id, name").eq("role", "patient").ilike("name", `${search}%`).limit(8);
    if (!error) setPatients(data || []);
    setIsLoading(false);
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setPatients([]); 
    const { data } = await supabase
      .from("worker_patient_records").select("*").eq("patient_id", patient.id).order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  /* ---------------- 4. UPDATED SUBMIT (OFFLINE READY) ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    const recordData = {
      patient_id: selectedPatient.id,
      worker_id: user.id,
      bp: form.bp,
      sugar: form.sugar,
      weight: form.weight,
      symptoms: form.symptoms,
      condition: form.condition,
      created_at: new Date().toISOString() // Ensure timestamp is preserved if offline
    };

    if (!navigator.onLine) {
      await saveRecordOffline(recordData);
      alert("📡 Saved Locally: No internet detected. The record will sync once you are back in a signal area.");
      finalizeSubmission();
      return;
    }

    const { error: recordError } = await supabase.from("worker_patient_records").insert(recordData);

    if (recordError) {
      await saveRecordOffline(recordData);
      alert("⚠️ Sync Interrupted: Record saved to local queue.");
    } else {
      await supabase.from("app_users").update({ worker_checked: true }).eq("id", selectedPatient.id);
      alert("✅ Success: Patient record synchronized.");
    }
    
    finalizeSubmission();
  };

  const finalizeSubmission = () => {
    setForm({ bp: "", sugar: "", weight: "", symptoms: "", condition: "stable" });
    setSelectedPatient(null);
    setSearch("");
    setStats(s => ({ ...s, docsUploaded: s.docsUploaded + 1 }));
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={32} /> Field Worker Portal
          </h1>
          <p className="text-slate-500 font-medium">Record and sync village clinical data even without network.</p>
        </div>
        
        {/* Dynamic Status Indicator */}
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl shadow-sm border transition-all ${
          isOnline ? 'bg-white border-slate-100' : 'bg-rose-50 border-rose-100'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-slate-600' : 'text-rose-600'}`}>
            {isOnline ? 'System Online' : 'Offline Mode Active'}
          </span>
          {isOnline ? <Wifi size={14} className="text-slate-400" /> : <WifiOff size={14} className="text-rose-400" />}
        </div>
      </header>

      {/* ... Rest of your JSX (Stats, Search, Form) remains the same ... */}
      
      {/* (Inserting the rest of your original JSX here) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Assigned Patients" value={stats.totalPatients} icon={<Users className="text-indigo-500" size={20}/>} />
        <StatCard title="Synced Records" value={stats.docsUploaded} icon={<TrendingUp className="text-emerald-500" size={20}/>} />
        <StatCard title="Personal Impact" value={stats.checkedThisMonth} icon={<Activity className="text-orange-500" size={20}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Search size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Patient Lookup</h2>
                </div>

                <form onSubmit={handleSearch} className="relative group">
                    <input
                        placeholder="Search patient name..."
                        className="w-full bg-slate-50 border-2 border-transparent group-focus-within:border-indigo-500 px-6 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" disabled={isLoading} className="absolute right-3 top-3 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                        {isLoading ? <Loader2 className="animate-spin" size={24}/> : <ChevronRight size={24}/>}
                    </button>
                </form>

                {patients.length > 0 && (
                <div className="space-y-2">
                    {patients.map((p) => (
                    <button key={p.id} className="w-full p-4 bg-slate-50 rounded-2xl flex justify-between items-center transition-all hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-100" onClick={() => handleSelectPatient(p)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600"><UserPlus size={18} /></div>
                            <span className="font-bold text-slate-700">{p.name}</span>
                        </div>
                        <span className="text-[10px] bg-indigo-600 text-white px-3 py-2 rounded-lg font-black uppercase tracking-widest">Open File</span>
                    </button>
                    ))}
                </div>
                )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                 <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <History className="text-slate-400" size={22} /> My Activity Log
                 </h2>
                 <WorkerMedicalRecords />
            </div>
        </section>

        <section className="lg:col-span-7">
          {selectedPatient ? (
            <div className="bg-white border-2 border-indigo-600 rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="bg-indigo-600 p-8 flex justify-between items-center text-white">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20"><FileText size={28} /></div>
                   <div>
                    <h2 className="text-2xl font-black leading-none tracking-tight">Vitals Entry</h2>
                    <p className="text-indigo-100 text-sm font-bold mt-1 opacity-90">Patient: {selectedPatient.name}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputWithIcon label="Blood Pressure" placeholder="120/80" icon={<Activity size={18}/>} value={form.bp} onChange={(v) => setForm({ ...form, bp: v })} />
                    <InputWithIcon label="Sugar (mg/dL)" placeholder="110" icon={<Droplets size={18}/>} value={form.sugar} onChange={(v) => setForm({ ...form, sugar: v })} />
                    <InputWithIcon label="Weight (kg)" placeholder="68" icon={<Scale size={18}/>} value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Patient Health Status</label>
                  <div className="grid grid-cols-3 gap-4">
                    <ConditionBtn label="Stable" active={form.condition === 'stable'} color="emerald" icon={<CheckCircle2 size={20}/>} onClick={() => setForm({...form, condition: 'stable'})}/>
                    <ConditionBtn label="Needs Care" active={form.condition === 'attention'} color="amber" icon={<AlertCircle size={20}/>} onClick={() => setForm({...form, condition: 'attention'})}/>
                    <ConditionBtn label="Critical" active={form.condition === 'critical'} color="rose" icon={<AlertCircle size={20}/>} onClick={() => setForm({...form, condition: 'critical'})}/>
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Clinical Symptoms & Notes</label>
                    <textarea rows={4} placeholder="Describe any symptoms..." className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-6 outline-none transition-all font-bold text-slate-700" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-black transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                    {isSubmitting ? "Syncing Data..." : "Synchronize Medical Record"}
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center bg-slate-100/30 border-4 border-dashed border-slate-100 rounded-[4rem] text-slate-400">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 mb-8"><UserPlus size={56} className="text-slate-100" /></div>
                <h3 className="text-2xl font-black text-slate-400">No Patient Selected</h3>
                <p className="text-base max-w-xs mt-3 font-medium">Find a patient using the lookup tool to start recording clinical vitals.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// (StatCard, InputWithIcon, ConditionBtn sub-components remain exactly the same)
/* ---------------- UI SUB-COMPONENTS ---------------- */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
            {icon}
        </div>
      </div>
      <p className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{value}</p>
    </div>
  );
}

function InputWithIcon({ label, value, onChange, placeholder, icon }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            {icon}
        </div>
        <input
            placeholder={placeholder}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 pl-14 pr-5 py-5 rounded-3xl outline-none transition-all placeholder:text-slate-300 font-black text-slate-700 text-lg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function ConditionBtn({ label, active, color, icon, onClick }) {
    const variants = {
        emerald: active ? "bg-emerald-500 text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-50 border-emerald-500" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-500",
        amber: active ? "bg-amber-500 text-white shadow-xl shadow-amber-100 ring-4 ring-amber-50 border-amber-500" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:text-amber-500",
        rose: active ? "bg-rose-500 text-white shadow-xl shadow-rose-100 ring-4 ring-rose-50 border-rose-500" : "bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500",
    };

    return (
        <button 
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${variants[color]}`}
        >
            {icon}
            {label}
        </button>
    );
}