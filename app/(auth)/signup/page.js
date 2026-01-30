"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP signup
  const [phone, setPhone] = useState("");

  /* ---------- EMAIL SIGNUP ---------- */
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) setError(error.message);
    else router.push("/login");
  };

  /* ---------- OTP SIGNUP ---------- */
  const handleOtpSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    setLoading(false);

    if (error) setError(error.message);
    else router.push("/verify");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold text-center mb-4">
          Create your Caresora account
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 ${
              activeTab === "email"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab("otp")}
            className={`flex-1 py-2 ${
              activeTab === "otp"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            OTP
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
        )}

        {/* EMAIL SIGNUP */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            />

            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded-md">
              Sign up with Email
            </button>
          </form>
        )}

        {/* OTP SIGNUP */}
        {activeTab === "otp" && (
          <form onSubmit={handleOtpSignup} className="space-y-4">
            <input
              type="tel"
              required
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded-md">
              Sign up with OTP
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
