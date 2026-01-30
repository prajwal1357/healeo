"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      // 1️⃣ Get logged-in user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch patient profile
      const { data: patient } = await supabase
        .from("users")
        .select(
          "id, name, age, village, worker_checked, doctor_checked, doctor_message"
        )
        .eq("id", authUser.id)
        .single();

      // 3️⃣ Fetch medical records
      const { data: records } = await supabase
        .from("worker_patient_records")
        .select(`
          id,
          bp,
          sugar,
          weight,
          symptoms,
          condition,
          created_at,
          worker:users!worker_patient_records_worker_id_fkey (
            name
          )
        `)
        .eq("patient_id", authUser.id)
        .order("created_at", { ascending: false });

      setUser(patient);
      setRecords(records || []);
      setLoading(false);
    };

    fetchPatientData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading your data...</p>;
  }

  if (!user) {
    return <p className="text-sm text-red-600">Unable to load patient data</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Health Dashboard</h1>
        <p className="text-sm text-gray-600">
          View your health records and doctor updates
        </p>
      </div>

      {/* Patient Info */}
      <section className="bg-white border rounded p-4 space-y-2">
        <h2 className="font-semibold">Personal Information</h2>

        <Info label="Name" value={user.name} />
        <Info label="Age" value={user.age || "—"} />
        <Info label="Village" value={user.village || "—"} />
        <Info
          label="Status"
          value={renderStatus(user.worker_checked, user.doctor_checked)}
        />
      </section>

      {/* Doctor Message */}
      <section className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Doctor’s Message</h2>

        {user.doctor_message ? (
          <p className="text-sm whitespace-pre-line">
            {user.doctor_message}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            No message from doctor yet.
          </p>
        )}
      </section>

      {/* Medical Records */}
      <section className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Medical Records</h2>

        {records.length === 0 ? (
          <p className="text-sm text-gray-500">
            No medical records available.
          </p>
        ) : (
          <ul className="divide-y">
            {records.map((r) => (
              <li key={r.id} className="py-3 space-y-1">
                <p className="text-sm font-medium">
                  Condition: {renderCondition(r.condition)}
                </p>
                <p className="text-sm">
                  BP: {r.bp || "—"} | Sugar: {r.sugar || "—"} | Weight:{" "}
                  {r.weight || "—"}
                </p>
                <p className="text-sm">
                  Symptoms: {r.symptoms || "—"}
                </p>
                <p className="text-xs text-gray-500">
                  Checked by {r.worker?.name} on{" "}
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function Info({ label, value }) {
  return (
    <p className="text-sm">
      <span className="text-gray-600">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </p>
  );
}

function renderStatus(workerChecked, doctorChecked) {
  if (!workerChecked) return "🟡 Awaiting Worker Check";
  if (workerChecked && !doctorChecked) return "🟠 Awaiting Doctor Review";
  return "🟢 Completed";
}

function renderCondition(condition) {
  if (condition === "stable") return "🟢 Stable";
  if (condition === "attention") return "🟡 Needs Attention";
  if (condition === "critical") return "🔴 Critical";
  return "—";
}
