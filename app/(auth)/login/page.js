"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Mail, 
  Lock, 
  Smartphone, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [tab, setTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone OTP
  const [phone, setPhone] = useState("");

  /* ---------------- EMAIL LOGIN LOGIC ---------------- */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace("/dashboard");
    }
  };

  /* ---------------- PHONE OTP LOGIN LOGIC ---------------- */
  const handleOtpLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const { error: otpError } = await supabase.auth.signInWithOtp({ 
    phone: phone // e.g. "+919876543210"
  });

  if (otpError) {
    setError(otpError.message);
    setLoading(false);
  } else {
    // Crucial: Store the phone so the /verify page can use it
    localStorage.setItem("signup_profile", JSON.stringify({ phone }));
    router.push("/verify");
  }
};

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-indigo-100">
      
      {/* --- Branding Section (Desktop Only) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-700 rounded-full -ml-20 -mb-20 opacity-50 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl">
            <HeartHandshake size={28} />
          </div>
          <span className="text-2xl font-black text-white tracking-tight italic">Caresora</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-black text-white leading-tight">
            Healthcare access,<br /> simplified for everyone.
          </h2>
          <p className="text-indigo-100 text-lg max-w-md">
            The all-in-one clinical dashboard for rural healthcare workers, doctors, and patients.
          </p>
          <div className="flex gap-4 pt-4">
            <FeatureBadge icon={ShieldCheck} text="Secure Data" />
            <FeatureBadge icon={Smartphone} text="Offline Ready" />
          </div>
        </div>

        <div className="relative z-10 text-indigo-200 text-sm font-medium">
          &copy; {new Date().getFullYear()} Caresora Public Health Initiative.
        </div>
      </div>

      {/* --- Login Form Section --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center space-y-2">
            <div className="lg:hidden flex justify-center mb-6">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <HeartHandshake size={32} />
                </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Please enter your details to access your account.</p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            <TabButton 
              active={tab === 'email'} 
              onClick={() => setTab('email')} 
              label="Email" 
              icon={<Mail size={16} />} 
            />
            <TabButton 
              active={tab === 'otp'} 
              onClick={() => setTab('otp')} 
              label="Phone OTP" 
              icon={<Smartphone size={16} />} 
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}

          <div className="mt-8">
            {tab === "email" ? (
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-4">
                  <InputWrapper label="Email Address">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="doctor@caresora.org"
                      className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputWrapper>

                  <InputWrapper label="Password">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </InputWrapper>
                </div>

                <div className="flex items-center justify-end">
                  <a href="/forgot-password" size="sm" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                    Forgot Password?
                  </a>
                </div>

                <SubmitButton loading={loading}>
                  Sign in to Dashboard
                </SubmitButton>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-6">
                <InputWrapper label="Mobile Number">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </InputWrapper>
                
                <p className="text-xs text-slate-400 font-medium px-1">
                  We'll send a 6-digit security code to this number via SMS.
                </p>

                <SubmitButton loading={loading}>
                  Send Verification Code
                </SubmitButton>
              </form>
            )}
          </div>

          <div className="pt-6 text-center">
            <p className="text-slate-500 font-medium">
              Don’t have an account?{" "}
              <a href="/signup" className="text-indigo-600 font-bold hover:underline underline-offset-4 decoration-2">
                Join Caresora
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- UI HELPERS --- */

function FeatureBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 bg-indigo-500/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/30">
      <Icon className="text-indigo-100" size={16} />
      <span className="text-xs font-bold text-white uppercase tracking-wider">{text}</span>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active 
          ? "bg-white text-indigo-600 shadow-sm" 
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InputWrapper({ label, children }) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight size={20} />
        </>
      )}
    </button>
  );
}