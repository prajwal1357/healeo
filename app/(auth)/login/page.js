"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.replace("/dashboard");
    }
  };

  /* ---------------- PHONE OTP LOGIN ---------------- */
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone.startsWith("+")) {
      setError("Phone number must include country code (e.g. +91)");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/verify"); // OTP verification page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-1">
          Login to Caresora
        </h1>
        <p className="text-sm text-gray-600 text-center mb-5">
          Access your health dashboard
        </p>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setTab("email")}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "email"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setTab("otp")}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "otp"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-3">
            {error}
          </p>
        )}

        {/* EMAIL LOGIN */}
        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              required
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Logging in..." : "Login with Email"}
            </button>

            <p className="text-sm text-center">
              <a href="/forgot-password" className="text-blue-600 underline">
                Forgot password?
              </a>
            </p>
          </form>
        )}

        {/* OTP LOGIN */}
        {tab === "otp" && (
          <form onSubmit={handleOtpLogin} className="space-y-3">
            <input
              type="tel"
              required
              placeholder="+91XXXXXXXXXX"
              className="w-full border px-3 py-2 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Signup */}
        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
