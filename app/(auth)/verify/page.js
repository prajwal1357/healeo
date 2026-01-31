"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, RefreshCcw } from "lucide-react";

export default function VerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phone, setPhone] = useState("");
  const [timer, setTimer] = useState(30); // 30 second cooldown
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const storedPhone = localStorage.getItem("pending_phone");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhone(storedPhone);

    // Timer Logic
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;
    
    setResending(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    
    if (!error) {
      setTimer(30); // Reset timer
      setCanResend(false);
    } else {
      alert(error.message);
    }
    setResending(false);
  };

  return (
    <div className="space-y-8">
      {/* ... (Previous OTP Input Fields) ... */}

      <div className="text-center space-y-4">
        <button
          type="button"
          disabled={!canResend || resending}
          onClick={handleResend}
          className={`flex items-center justify-center gap-2 mx-auto text-sm font-black uppercase tracking-widest transition-all ${
            canResend 
              ? "text-indigo-600 hover:text-indigo-800" 
              : "text-slate-300 cursor-not-allowed"
          }`}
        >
          {resending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCcw size={16} className={timer > 0 ? "opacity-20" : ""} />
          )}
          {timer > 0 ? `Resend Code in ${timer}s` : "Resend Security Code"}
        </button>
        
        <p className="text-[10px] text-slate-400 font-medium px-6">
          If you don't receive the SMS within 60 seconds, please check if your 
          phone number includes the correct country code.
        </p>
      </div>
    </div>
  );
}