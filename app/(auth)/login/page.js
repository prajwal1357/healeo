"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP state
  const [phone, setPhone] = useState("");

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  /* ---------------- OTP LOGIN ---------------- */
  const handleOtpLogin = async (e) => {
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
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-1">
          Welcome to Caresora
        </h1>
        <p className="text-sm text-center text-gray-600 mb-5">
          Sign in to continue
        </p>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "email"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Email
          </button>

          <button
            onClick={() => setActiveTab("otp")}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "otp"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            OTP
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-3">{error}</p>
        )}

        {/* ---------------- EMAIL TAB ---------------- */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* ---------------- OTP TAB ---------------- */}
        {activeTab === "otp" && (
          <form onSubmit={handleOtpLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Google OAuth */}
        <div className="my-5 flex items-center">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/dashboard`,
              },
            })
          }
          disabled={loading}
          className="w-full border flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
        >
          <span className="font-medium">Continue with Google</span>
        </button>
        <p className="text-sm text-center mt-4">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
}
