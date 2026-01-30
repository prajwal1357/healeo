"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  User, 
  Clock, 
  Activity, 
  Droplets, 
  Scale, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Inbox,
  CalendarDays
} from "lucide-react";

export default function WorkerMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("worker_patient_records")
        .select(`
          id, bp, sugar, weight, symptoms, condition, created_at,
          patient:app_users!worker_patient_records_patient_fkey (name)
        `)
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) setError("Failed to load records.");
      else setRecords(data || []);
      setLoading(false);
    };

    fetchRecords();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (records.length === 0) return <EmptyRecordsState />;

  return (
    <div className="relative group">
      {/* Header for the Slider */}
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <CalendarDays size={14} /> Recent Field Submissions
        </h3>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
          Swipe to view {records.length}
        </span>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar select-none">
        {records.map((record) => (
          <div key={record.id} className="min-w-[280px] md:min-w-[320px] snap-center">
            <RecordSliderCard record={record} />
          </div>
        ))}
        {/* Decorative end-spacer */}
        <div className="min-w-[20px] shrink-0" />
      </div>

      {/* Fade indicators for better UX */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
    </div>
  );
}

/* ---------------- SLIDER CARD COMPONENT ---------------- */

function RecordSliderCard({ record }) {
  const isCritical = record.condition === 'critical';

  return (
    <div className={`h-full bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isCritical ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
            <User size={22} />
          </div>
          <div>
            <h4 className="font-black text-slate-900 leading-tight">{record.patient?.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {new Date(record.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <StatusIcon condition={record.condition} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <VitalBox label="BP" value={record.bp || "—"} />
        <VitalBox label="Sugar" value={record.sugar || "—"} />
        <VitalBox label="Wt" value={`${record.weight}kg`} />
      </div>

      <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all p-3 rounded-2xl group/btn">
        <span className="text-[10px] font-black uppercase tracking-widest ml-2">Full History</span>
        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function VitalBox({ label, value }) {
  return (
    <div className="flex flex-col items-center bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</span>
      <span className="text-xs font-black text-slate-700">{value}</span>
    </div>
  );
}

function StatusIcon({ condition }) {
  const styles = {
    stable: "bg-emerald-500 shadow-emerald-200",
    attention: "bg-amber-500 shadow-amber-200",
    critical: "bg-rose-500 shadow-rose-200",
  };
  return (
    <div className={`w-3 h-3 rounded-full shadow-lg ${styles[condition] || 'bg-slate-300'}`} />
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <Loader2 className="animate-spin text-indigo-600" size={28} />
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Feed...</span>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="p-8 bg-rose-50 rounded-[2rem] text-center border-2 border-rose-100">
      <p className="text-rose-600 font-black text-xs uppercase">{message}</p>
    </div>
  );
}

function EmptyRecordsState() {
  return (
    <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-10 rounded-[3rem] text-center">
      <Inbox className="mx-auto text-slate-300 mb-3" size={32} />
      <p className="text-slate-400 font-bold text-sm">No activity recorded today.</p>
    </div>
  );
}