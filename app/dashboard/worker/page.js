"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import WorkerMedicalRecords from "@/Components/WorkerMedicalRecords";
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Search, 
  UserPlus, 
  Activity, 
  Droplets, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Save, 
  Loader2,
  History,
  ChevronRight,
  FileText
} from "lucide-react";

export default function WorkerDashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, docsUploaded: 0, checkedThisMonth: 0 });
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState([]);

  const [form, setForm] = useState({
    bp: "",
    sugar: "",
    weight: "",
    symptoms: "",
    condition: "stable",
  });

  /* ---------------- 1. FETCH STATS ---------------- */
  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: totalPatients } = await supabase
        .from("app_users")
        .select("*", { count: "exact", head: true })
        .eq("role", "patient");

      const { count: docsUploaded } = await supabase
        .from("worker_patient_records")
        .select("*", { count: "exact", head: true })
        .eq("worker_id", user.id);

      setStats({ 
        totalPatients: totalPatients || 0, 
        docsUploaded: docsUploaded || 0, 
        checkedThisMonth: docsUploaded || 0 // Assuming month activity based on total for now
      });
    };
    fetchStats();
  }, []);

  /* ---------------- 2. SEARCH ---------------- */
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (search.trim().length < 1) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("app_users")
      .select("id, name")
      .eq("role", "patient")
      .ilike("name", `${search}%`)
      .limit(8);

    if (!error) setPatients(data || []);
    setIsLoading(false);
  };

  /* ---------------- 3. SELECT PATIENT ---------------- */
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setPatients([]); 
    const { data } = await supabase
      .from("worker_patient_records")
      .select("*")
      .eq("patient_id", patient.id)
      .order('created_at', { ascending: false });
    
    setDocuments(data || []);
  };

  /* ---------------- 4. SUBMIT FORM ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Session expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // Insert Clinical Record
    const { error: recordError } = await supabase
      .from("worker_patient_records")
      .insert({
        patient_id: selectedPatient.id,
        worker_id: user.id,
        bp: form.bp,
        sugar: form.sugar,
        weight: form.weight,
        symptoms: form.symptoms,
        condition: form.condition,
      });

    if (recordError) {
      alert(recordError.message);
      setIsSubmitting(false);
      return;
    }

    // Update Patient Status
    await supabase
      .from("app_users")
      .update({ worker_checked: true })
      .eq("id", selectedPatient.id);

    // Reset UI
    setForm({ bp: "", sugar: "", weight: "", symptoms: "", condition: "stable" });
    setSelectedPatient(null);
    setSearch("");
    setStats(s => ({ ...s, docsUploaded: s.docsUploaded + 1 }));
    setIsSubmitting(false);
    alert("Patient record synchronized successfully.");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={32} /> Field Worker Portal
          </h1>
          <p className="text-slate-500 font-medium">Record and sync village clinical data to the central network.</p>
        </div>
        <div className="hidden md:flex bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Connection Stable</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Assigned Patients" value={stats.totalPatients} icon={<Users className="text-indigo-500" size={20}/>} />
        <StatCard title="Synced Records" value={stats.docsUploaded} icon={<TrendingUp className="text-emerald-500" size={20}/>} />
        <StatCard title="Personal Impact" value={stats.checkedThisMonth} icon={<Activity className="text-orange-500" size={20}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search & Quick Navigation */}
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
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-3 top-3 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24}/> : <ChevronRight size={24}/>}
                    </button>
                </form>

                {/* Search Results */}
                {patients.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {patients.map((p) => (
                    <button
                        key={p.id}
                        className="w-full p-4 bg-slate-50 rounded-2xl flex justify-between items-center transition-all hover:bg-indigo-50 hover:scale-[1.02] border-2 border-transparent hover:border-indigo-100"
                        onClick={() => handleSelectPatient(p)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                <UserPlus size={18} />
                            </div>
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

        {/* Right Column: Data Entry Form */}
        <section className="lg:col-span-7">
          {selectedPatient ? (
            <div className="bg-white border-2 border-indigo-600 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-indigo-600 p-8 flex justify-between items-center text-white">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                      <FileText size={28} />
                   </div>
                   <div>
                    <h2 className="text-2xl font-black leading-none tracking-tight">Vitals Entry</h2>
                    <p className="text-indigo-100 text-sm font-bold mt-1 opacity-90">Patient: {selectedPatient.name}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Vitals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputWithIcon 
                        label="Blood Pressure" 
                        placeholder="120/80" 
                        icon={<Activity size={18}/>}
                        value={form.bp} 
                        onChange={(v) => setForm({ ...form, bp: v })} 
                    />
                    <InputWithIcon 
                        label="Sugar (mg/dL)" 
                        placeholder="110" 
                        icon={<Droplets size={18}/>}
                        value={form.sugar} 
                        onChange={(v) => setForm({ ...form, sugar: v })} 
                    />
                    <InputWithIcon 
                        label="Weight (kg)" 
                        placeholder="68" 
                        icon={<Scale size={18}/>}
                        value={form.weight} 
                        onChange={(v) => setForm({ ...form, weight: v })} 
                    />
                </div>

                {/* Condition Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Patient Health Status</label>
                  <div className="grid grid-cols-3 gap-4">
                    <ConditionBtn 
                        label="Stable" 
                        active={form.condition === 'stable'} 
                        color="emerald" 
                        icon={<CheckCircle2 size={20}/>}
                        onClick={() => setForm({...form, condition: 'stable'})}
                    />
                    <ConditionBtn 
                        label="Needs Care" 
                        active={form.condition === 'attention'} 
                        color="amber" 
                        icon={<AlertCircle size={20}/>}
                        onClick={() => setForm({...form, condition: 'attention'})}
                    />
                    <ConditionBtn 
                        label="Critical" 
                        active={form.condition === 'critical'} 
                        color="rose" 
                        icon={<AlertCircle size={20}/>}
                        onClick={() => setForm({...form, condition: 'critical'})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Clinical Symptoms & Notes</label>
                    <textarea 
                        rows={4}
                        placeholder="Describe any symptoms or observations..."
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-6 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-700"
                        value={form.symptoms} 
                        onChange={(e) => setForm({ ...form, symptoms: e.target.value })} 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                    {isSubmitting ? "Syncing Data..." : "Synchronize Medical Record"}
                </button>
              </form>

              {/* History Preview */}
              {documents.length > 0 && (
                <div className="px-8 pb-8">
                    <div className="bg-slate-50 rounded-[2.5rem] p-6 border-2 border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <History className="text-slate-400" size={18} />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Previous Visit History</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {documents.slice(0, 3).map((doc, i) => (
                                <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                                    <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(doc.created_at).toLocaleDateString()}</span>
                                    <span className={`text-[10px] font-black mt-1 uppercase ${
                                        doc.condition === 'stable' ? 'text-emerald-500' : doc.condition === 'attention' ? 'text-amber-500' : 'text-rose-500'
                                    }`}>
                                        {doc.condition}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center bg-slate-100/30 border-4 border-dashed border-slate-100 rounded-[4rem] text-slate-400">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 mb-8">
                    <UserPlus size={56} className="text-slate-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-400">No Patient Selected</h3>
                <p className="text-base max-w-xs mt-3 font-medium">Find a patient using the lookup tool to start recording clinical vitals.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

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