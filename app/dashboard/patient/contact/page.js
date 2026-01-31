"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Phone, 
  MessageCircle, 
  User, 
  Loader2, 
  MapPin, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function PatientToWorkerContact() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyWorker = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get patient's village to find their assigned worker
      const { data: patient } = await supabase
        .from("app_users")
        .select("village")
        .eq("id", user.id)
        .single();

      if (patient?.village) {
        // 2. Find the worker assigned to this village
        const { data: workerData } = await supabase
          .from("app_users")
          .select("name, phone, village")
          .eq("role", "worker")
          .eq("village", patient.village)
          .single();

        setWorker(workerData);
      }
      setLoading(false);
    };

    fetchMyWorker();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support</h1>
        <p className="text-slate-500 font-medium">Need help? Contact your local health worker.</p>
      </div>

      {worker ? (
        <div className="space-y-6">
          {/* Worker Profile Card */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 text-center space-y-4">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
              <User size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{worker.name}</h2>
              <div className="flex items-center justify-center gap-1.5 text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-1">
                <MapPin size={12} /> {worker.village} Area
              </div>
            </div>
            <div className="pt-4 flex items-center justify-center gap-2 text-emerald-500 font-bold text-xs">
              <ShieldCheck size={16} /> Verified Health Worker
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4">
            {/* WHATSAPP BUTTON */}
            <a 
              href={`https://wa.me/${worker.phone?.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-[#25D366] text-white p-6 rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-100"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <MessageCircle size={24} fill="white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none">WhatsApp</p>
                  <p className="text-white/80 text-[10px] font-bold uppercase mt-1">Chat Instantly</p>
                </div>
              </div>
              <ExternalLink size={20} className="opacity-50" />
            </a>

            {/* DIRECT CALL BUTTON */}
            <a 
              href={`tel:${worker.phone}`}
              className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Phone size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none">Direct Call</p>
                  <p className="text-white/50 text-[10px] font-bold uppercase mt-1">Voice Consultation</p>
                </div>
              </div>
              <ExternalLink size={20} className="opacity-30" />
            </a>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Available for emergency and routine checkups
          </p>
        </div>
      ) : (
        <div className="text-center p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">No health worker assigned to your village yet.</p>
        </div>
      )}
    </div>
  );
}