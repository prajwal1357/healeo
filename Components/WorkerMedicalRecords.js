"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function WorkerMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("worker_patient_records")
        .select(
          `
    id,
    bp,
    sugar,
    weight,
    symptoms,
    condition,
    created_at,
    patient:users!worker_patient_records_patient_id_fkey (
      id,
      name
    )
  `,
        )
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load medical records");
      } else {
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchRecords();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading medical records...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (records.length === 0) {
    return (
      <p className="text-sm text-gray-500">No medical records entered yet.</p>
    );
  }

  return (
    <div className="bg-white border rounded overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th>Patient</Th>
            <Th>BP</Th>
            <Th>Sugar</Th>
            <Th>Weight</Th>
            <Th>Symptoms</Th>
            <Th>Condition</Th>
            <Th>Date</Th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
              <Td>{r.patient?.name || "—"}</Td>
              <Td>{r.bp || "—"}</Td>
              <Td>{r.sugar || "—"}</Td>
              <Td>{r.weight || "—"}</Td>
              <Td className="max-w-xs truncate">{r.symptoms || "—"}</Td>
              <Td>{renderCondition(r.condition)}</Td>
              <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left font-medium text-gray-600">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-2">{children}</td>;
}

function renderCondition(condition) {
  if (condition === "stable") return "🟢 Stable";
  if (condition === "attention") return "🟡 Attention";
  if (condition === "critical") return "🔴 Critical";
  return "—";
}
