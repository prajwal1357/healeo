"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [tab, setTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // common fields
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [age, setAge] = useState("");

  // email signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone signup
  const [phone, setPhone] = useState("");

  /* ---------------- EMAIL SIGNUP ---------------- */
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // goes to raw_user_meta_data
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // update profile table
    await supabase.from("profiles").update({
      name,
      place,
      age,
      phone: null,
    }).eq("id", data.user.id);

    setLoading(false);
    router.replace("/login");
  };

  /* ---------------- PHONE OTP SIGNUP ---------------- */
  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone.startsWith("+")) {
      setError("Phone must include country code (e.g. +91)");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // save temporary data locally (used after OTP verify)
    localStorage.setItem(
      "signup_profile",
      JSON.stringify({ name, place, age, phone })
    );

    setLoading(false);
    router.replace("/verify");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">

        <h1 className="text-2xl font-bold text-center mb-4">
          Create Account
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setTab("email")}
            className={`flex-1 py-2 ${
              tab === "email"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setTab("phone")}
            className={`flex-1 py-2 ${
              tab === "phone"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Phone
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center mb-3">
            {error}
          </p>
        )}

        {/* Common Fields */}
        <div className="space-y-3 mb-4">
          <input
            required
            placeholder="Full Name"
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Place / Village"
            className="w-full border px-3 py-2 rounded"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />

          <input
            type="number"
            placeholder="Age"
            className="w-full border px-3 py-2 rounded"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Email Signup */}
        {tab === "email" && (
          <form onSubmit={handleEmailSignup} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
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
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Creating..." : "Sign up with Email"}
            </button>
          </form>
        )}

        {/* Phone Signup */}
        {tab === "phone" && (
          <form onSubmit={handlePhoneSignup} className="space-y-3">
            <input
              type="tel"
              required
              placeholder="+91XXXXXXXXXX"
              className="w-full border px-3 py-2 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Sending OTP..." : "Sign up with Phone"}
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
