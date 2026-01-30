"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) setError(error.message);
    else router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold text-center mb-4">
          Set New Password
        </h1>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-md">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
