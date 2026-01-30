"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function WorkerMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be logged in to view records.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("worker_patient_records")
        .select(`
          id,
          bp,
          sugar,
          weight,
          symptoms,
          condition,
          created_at,
          patient:app_users!worker_patient_records_patient_fkey (
            id,
            name
          )
        `)
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load medical records.");
      } else {
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchRecords();
  }, []);

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <div className="bg-white border rounded p-6 text-center text-gray-500">
        Loading medical records…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white border rounded p-8 text-center">
        <p className="text-gray-600 font-medium">
          No medical records found
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Start by selecting a patient and submitting a checkup.
        </p>
      </div>
    );
  }

  /* ---------------- TABLE ---------------- */

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
            <tr
              key={r.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <Td className="font-medium">
                {r.patient?.name || "—"}
              </Td>
              <Td>{r.bp || "—"}</Td>
              <Td>{r.sugar || "—"}</Td>
              <Td>{r.weight || "—"}</Td>
              <Td className="max-w-xs truncate">
                {r.symptoms || "—"}
              </Td>
              <Td>{renderConditionBadge(r.condition)}</Td>
              <Td className="text-gray-500">
                {new Date(r.created_at).toLocaleDateString()}
              </Td>
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
    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function renderConditionBadge(condition) {
  if (condition === "stable") {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
        🟢 Stable
      </span>
    );
  }

  if (condition === "attention") {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
        🟡 Attention
      </span>
    );
  }

  if (condition === "critical") {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
        🔴 Critical
      </span>
    );
  }

  return <span className="text-gray-400">—</span>;
}
