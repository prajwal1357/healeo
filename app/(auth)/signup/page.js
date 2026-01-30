"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  User, 
  MapPin, 
  Calendar, 
  Mail, 
  Lock, 
  Phone, 
  UserPlus, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [tab, setTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // common fields
  const [name, setName] = useState("");
  const [place, setPlace] = useState(""); // Maps to 'village' in DB
  const [age, setAge] = useState("");

  // email signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone signup
  const [phone, setPhone] = useState("");

  /* ---------------- EMAIL SIGNUP LOGIC ---------------- */
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Auth Signup
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // Metadata for Supabase Auth
        },
      });

      if (authError || !data?.user) {
        throw new Error(authError?.message || "Signup failed");
      }

      const userId = data.user.id;

      // 2. Insert into app_users table
      const { error: userError } = await supabase
        .from("app_users")
        .insert({
          id: userId,
          name,
          email,
          age: age ? Number(age) : null,
          village: place || null,
          role: "patient",
        });

      if (userError) throw userError;

      // 3. Insert into patients table
      const { error: patientError } = await supabase
        .from("patients")
        .insert({
          user_id: userId,
          age: age ? Number(age) : null,
        });

      if (patientError) throw patientError;

      setLoading(false);
      router.replace("/login");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /* ---------------- PHONE OTP SIGNUP LOGIC ---------------- */
  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone.startsWith("+")) {
      setError("Phone must include country code (e.g. +91)");
      setLoading(false);
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: { name },
      },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    // Save temporary data locally to be used after OTP verification
    localStorage.setItem(
      "signup_profile",
      JSON.stringify({ name, place, age, phone })
    );

    setLoading(false);
    router.replace("/verify");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-indigo-100">
      
      {/* --- Visual Branding Panel --- */}
      <div className="hidden lg:flex lg:w-1/3 bg-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 shadow-lg">
            <HeartHandshake size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tight italic">Caresora</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Empowering<br />Rural Healthcare.
          </h2>
          <div className="space-y-4">
            <FeatureItem icon={CheckCircle2} text="Digitize patient records easily" />
            <FeatureItem icon={CheckCircle2} text="Connect with doctors remotely" />
            <FeatureItem icon={CheckCircle2} text="Secure, encrypted health data" />
          </div>
        </div>

        <div className="relative z-10 bg-indigo-800/50 p-6 rounded-3xl border border-indigo-400/20 backdrop-blur-sm">
          <p className="text-indigo-100 text-sm font-medium leading-relaxed">
            "Caresora has helped our village clinic track patient health trends much faster than paper records."
          </p>
          <p className="text-indigo-300 text-xs mt-3 font-bold uppercase tracking-widest">— Public Health Volunteer</p>
        </div>
      </div>

      {/* --- Signup Form Panel --- */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 font-medium">Join our community to start managing healthcare data effectively.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-10 space-y-8">
            
            {/* Identity Section (Common Fields) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Personal Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputWrapper label="Full Name">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    required
                    placeholder="e.g. Rahul Singh"
                    className="w-full bg-slate-50 border-2 border-transparent pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper label="Age">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="number"
                    placeholder="Years"
                    className="w-full bg-slate-50 border-2 border-transparent pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </InputWrapper>

                <div className="md:col-span-2">
                  <InputWrapper label="Place / Village">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      placeholder="Enter village or city name"
                      className="w-full bg-slate-50 border-2 border-transparent pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                    />
                  </InputWrapper>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Security Section (Auth Method) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Account Security</h3>
                </div>
                
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                  <TabPill active={tab === 'email'} onClick={() => setTab('email')} label="Email" />
                  <TabPill active={tab === 'phone'} onClick={() => setTab('phone')} label="Phone" />
                </div>
              </div>

              {tab === "email" ? (
                <form onSubmit={handleEmailSignup} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputWrapper label="Email Address">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border-2 border-transparent pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputWrapper>

                    <InputWrapper label="Password">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        placeholder="Min. 6 chars"
                        className="w-full bg-slate-50 border-2 border-transparent pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </InputWrapper>
                  </div>

                  <SubmitButton loading={loading}>
                    Complete Email Registration
                  </SubmitButton>
                </form>
              ) : (
                <form onSubmit={handlePhoneSignup} className="space-y-6">
                  <InputWrapper label="Mobile Number">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border-2 border-transparent pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </InputWrapper>
                  
                  <SubmitButton loading={loading}>
                    Send OTP to Verify Phone
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-slate-500 font-medium">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4 decoration-2">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* --- UI COMPONENTS (SAME AS ORIGINAL) --- */

function FeatureItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-indigo-400/20 flex items-center justify-center text-indigo-100">
        <Icon size={14} />
      </div>
      <span className="text-indigo-100 text-sm font-medium">{text}</span>
    </div>
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

function TabPill({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
        active 
          ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100" 
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Setting up...</span>
        </>
      ) : (
        <>
          <UserPlus size={20} />
          <span>{children}</span>
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}