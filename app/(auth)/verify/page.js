"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Verify OTP
        </h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          Enter the 6-digit code sent to your mobile number
        </p>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-3">{error}</p>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              OTP Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full text-center tracking-widest text-lg border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Didn’t receive the OTP? Please wait a moment and try again.
        </p>
      </div>
    </div>
  );
}
