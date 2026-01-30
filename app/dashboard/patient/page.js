"use client";

import React, { useEffect, useState } from "react";
import { 
  User, MapPin, Calendar, Heart, Activity, Scale, Stethoscope, 
  Clock, CheckCircle2, AlertCircle, ClipboardList, 
  PhoneCall, TrendingUp, Pill, Loader2, MessageSquare, UserCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      // 1. Get current authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      // 2. Fetch Profile details (including Doctor's global message)
      const { data: patient, error: pError } = await supabase
        .from("app_users")
        .select("id, name, age, village, worker_checked, doctor_checked, doctor_message")
        .eq("id", authUser.id)
        .single();

      // 3. Fetch Clinical Vitals & Worker Notes
      const { data: history, error: hError } = await supabase
        .from("worker_patient_records")
        .select(`
          id, bp, sugar, weight, symptoms, condition, created_at, 
          worker:app_users!worker_patient_records_worker_fkey (name)
        `)
        .eq("patient_id", authUser.id)
        .order("created_at", { ascending: false });

      if (!pError) setUser(patient);
      if (!hError) setRecords(history || []);
      
      setLoading(false);
    };

    fetchPatientData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorScreen />;

  const latest = records[0] || {};
  const previous = records[1] || null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-700 font-sans">
      
      {/* --- TOP PROFILE HEADER --- */}
      <header className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
            <User size={36} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500" /> {user.village || "Rural District"}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500" /> {user.age || "—"} Years</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = "tel:108"}
          className="flex items-center gap-3 bg-rose-500 text-white px-8 py-5 rounded-[1.8rem] font-black shadow-xl shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all"
        >
          <PhoneCall size={20} /> SOS EMERGENCY
        </button>
      </header>

      {/* --- CLINICAL VITALS DASHBOARD --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VitalsCard 
          label="Blood Pressure" 
          value={latest.bp} 
          unit="SYS/DIA" 
          icon={<Activity />} 
          color="indigo" 
        />
        <VitalsCard 
          label="Sugar Level" 
          value={latest.sugar} 
          unit="mg/dL" 
          icon={<Heart />} 
          color="rose" 
          diff={previous ? (latest.sugar - previous.sugar) : null}
        />
        <VitalsCard 
          label="Body Weight" 
          value={latest.weight} 
          unit="kg" 
          icon={<Scale />} 
          color="blue" 
        />
      </section>

      {/* --- DUAL MESSAGING SYSTEM --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor's Advice */}
        <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] text-indigo-200">
              <Stethoscope size={16} /> Clinical Assessment
            </div>
            <p className="text-lg font-bold leading-relaxed italic">
              "{user.doctor_message || "Reports are synchronized. Your doctor will provide an assessment shortly."}"
            </p>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-indigo-300">Official Doctor Feed</span>
              {user.doctor_checked && <CheckCircle2 className="text-emerald-300" size={18} />}
            </div>
          </div>
        </div>

        {/* Health Worker's Latest Notes */}
        <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">
            <UserCheck size={16} className="text-emerald-500" /> Worker Observation
          </div>
          <p className="text-lg font-bold text-slate-700 leading-relaxed">
            "{latest.symptoms || "Patient is stable. No acute symptoms reported during the field visit."}"
          </p>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Reported by: {latest.worker?.name || "Staff"}</span>
            <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
              {latest.condition || "Checking"}
            </span>
          </div>
        </div>
      </div>

      {/* --- LONGITUDINAL HISTORY TIMELINE --- */}
      <section className="bg-white border border-slate-100 rounded-[3rem] p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={28} /> Health History
          </h2>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Clock size={14} /> Updated {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="space-y-6">
          {records.length === 0 ? (
            <div className="py-20 text-center text-slate-300 italic font-medium">No checkup records found yet.</div>
          ) : (
            records.map((r, idx) => (
              <div key={r.id} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${idx === 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                    <Activity size={20} />
                  </div>
                  {idx !== records.length - 1 && <div className="w-1 h-full bg-slate-100 mt-2 rounded-full" />}
                </div>
                
                <div className="flex-1 bg-slate-50/50 rounded-[2rem] p-6 border border-transparent hover:border-indigo-100 hover:bg-white transition-all mb-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div>
                      <p className="text-sm font-black text-slate-800">Field Checkup Result</p>
                      <p className="text-xs font-bold text-slate-400">{new Date(r.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <ConditionLabel condition={r.condition} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                     <HistoryStat label="BP" value={r.bp} />
                     <HistoryStat label="Glucose" value={r.sugar} />
                     <HistoryStat label="Weight" value={`${r.weight}kg`} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */

function VitalsCard({ label, value, unit, icon, color, diff }) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="bg-white border border-slate-100 p-7 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm ${styles[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value || "—"}</h3>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
      {diff !== null && diff !== undefined && (
        <div className={`mt-3 text-[10px] font-black flex items-center gap-1 ${diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
          <TrendingUp size={12} className={diff < 0 ? 'rotate-180' : ''} />
          {Math.abs(diff)} {unit} from last check
        </div>
      )}
    </div>
  );
}

function ConditionLabel({ condition }) {
  const colors = {
    stable: "bg-emerald-50 text-emerald-600 border-emerald-100",
    attention: "bg-amber-50 text-amber-600 border-amber-100",
    critical: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${colors[condition] || "bg-slate-100 text-slate-400"}`}>
      {condition || "Pending"}
    </span>
  );
}

function HistoryStat({ label, value }) {
  return (
    <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className="text-sm font-black text-slate-700">{value || "—"}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Accessing Clinical Database</p>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="p-12 text-center bg-white rounded-[3rem] border border-slate-100 max-w-md mx-auto mt-20">
      <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-slate-900 leading-tight">Identity Not Confirmed</h2>
      <p className="text-slate-500 mt-2 font-medium">We could not link this account to a patient file. Contact your healthcare worker for registration.</p>
    </div>
  );
}