"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ShieldCheck, Loader2, ArrowRight, Smartphone, AlertCircle } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Retrieve the phone number stored during the login/signup step
    const storedData = localStorage.getItem("signup_profile");
    if (storedData) {
      const { phone } = JSON.parse(storedData);
      setPhone(phone);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    // If this was a new signup, now is the time to create their app_users record
    const storedData = localStorage.getItem("signup_profile");
    if (storedData) {
      const profile = JSON.parse(storedData);
      
      // Create user profile in app_users
      await supabase.from("app_users").insert({
        id: data.user.id,
        name: profile.name,
        village: profile.place,
        role: "patient" // Default role
      });
      
      localStorage.removeItem("signup_profile");
    }

    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Check</h1>
          <p className="text-slate-500 font-medium italic">We sent a code to {phone || "your phone"}</p>
        </div>

        <form onSubmit={handleVerify} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter 6-Digit Code</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 pl-12 pr-4 py-4 rounded-2xl outline-none transition-all text-2xl font-black tracking-[0.5em] text-slate-700"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
            {loading ? "Verifying..." : "Verify & Access"}
          </button>
        </form>
        
        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Didn&apos;t get a code? <button className="text-indigo-600 hover:underline">Resend SMS</button>
        </p>
      </div>
    </div>
  );
}