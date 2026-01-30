"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import UserCards from "@/Components/UserCards";

export default function AdminDashboard() {
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [counts, setCounts] = useState({
    patient: 0,
    doctor: 0,
    worker: 0,
  });
  const [error, setError] = useState("");

  /* ---------------- AUTH + ROLE CHECK ---------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("Auth user:", user);
      console.log("Fetched role data:", data);

      if (error || !data?.role) {
        console.error("Role fetch failed:", error);
        router.replace("/login");
        return;
      }

      if (data.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setRole(data.role);
    };

    checkAdmin();
  }, [router]);

  /* ---------------- FETCH USER COUNTS ---------------- */
  useEffect(() => {
    if (role !== "admin") return;

    const fetchCounts = async () => {
      try {
        const [{ count: patients }, { count: doctors }, { count: workers }] =
          await Promise.all([
            supabase
              .from("app_users")
              .select("*", { count: "exact", head: true })
              .eq("role", "patient"),

            supabase
              .from("app_users")
              .select("*", { count: "exact", head: true })
              .eq("role", "doctor"),

            supabase
              .from("app_users")
              .select("*", { count: "exact", head: true })
              .eq("role", "worker"),
          ]);

        setCounts({
          patient: patients || 0,
          doctor: doctors || 0,
          worker: workers || 0,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user counts");
      }
    };

    fetchCounts();
  }, [role]);

  if (!role) return null;

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">
          Overview of users and roles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Patients" value={counts.patient} />
        <Card title="Doctors" value={counts.doctor} />
        <Card title="Workers" value={counts.worker} />
      </div>

      {/* Users List */}
      <section>
        <h2 className="text-lg font-semibold mb-2">All Users</h2>
        <UserCards />
      </section>
    </div>
  );
}

/* ---------------- UI COMPONENT ---------------- */

function Card({ title, value }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
