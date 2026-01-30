"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import UserCards from "@/Components/UserCards";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    patient: 0,
    doctor: 0,
    helper: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchapp_users = async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("role");

      if (error) {
        console.error(error);
        setError("Failed to fetch app_users");
        return;
      }

      setCounts({
        patient: data.filter((u) => u.role === "patient").length,
        doctor: data.filter((u) => u.role === "doctor").length,
        helper: data.filter((u) => u.role === "worker").length, // or "helper"
      });
    };

    fetchapp_users();
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">
          Overview of app_users and roles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Patients" value={counts.patient} />
        <Card title="Doctors" value={counts.doctor} />
        <Card title="Helpers" value={counts.helper} />
      </div>

      {/* app_users Table */}
      <section>
        <h2 className="text-lg font-semibold mb-2">All app_users</h2>
        <UserCards />
      </section>
    </div>
  );
}

/* ---------------- UI ---------------- */

function Card({ title, value }) {
  return (
    <div className="bg-white border p-4 rounded">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
