"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ workers: 0, patients: 0, patientsLooked: 0 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("patients");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [records, setRecords] = useState([]); // This will hold medical history for patients
  const [doctorMessage, setDoctorMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  /* ---------------- FETCH STATS ---------------- */
  useEffect(() => {
    const fetchStats = async () => {
      const { count: workers } = await supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "worker");
      const { count: patients } = await supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "patient");
      const { data: recordsData } = await supabase.from("worker_patient_records").select("patient_id");
      const uniquePatients = new Set((recordsData || []).map((r) => r.patient_id));

      setStats({
        workers: workers || 0,
        patients: patients || 0,
        patientsLooked: uniquePatients.size,
      });
    };
    fetchStats();
  }, []);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      const role = activeTab === "patients" ? "patient" : "worker";
      const { data } = await supabase
        .from("app_users")
        .select("id, name, role, worker_checked, doctor_checked, doctor_message")
        .eq("role", role)
        .ilike("name", `%${search}%`)
        .limit(10);
      setResults(data || []);
    };
    fetchResults();
  }, [search, activeTab]);

  /* ---------------- USER CLICK (Modified to fetch detailed records) ---------------- */
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setDoctorMessage(user.doctor_message || "");
    setRecords([]);

    if (user.role === "patient") {
      // Fetch all clinical data recorded by workers for this patient
      const { data, error } = await supabase
        .from("worker_patient_records")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setRecords(data || []);
    }

    if (user.role === "worker") {
      const { data } = await supabase
        .from("worker_patient_records")
        .select(`id, created_at, patient:app_users!worker_patient_records_patient_id_fkey (name)`)
        .eq("worker_id", user.id);
      setRecords(data || []);
    }
  };

  const markDoctorReviewed = async () => {
    if (!selectedUser) return;
    setSavingReview(true);
    const { error } = await supabase
      .from("app_users")
      .update({ doctor_checked: true, doctor_message: doctorMessage })
      .eq("id", selectedUser.id);

    setSavingReview(false);
    if (error) { alert(error.message); return; }
    alert("Patient marked as reviewed");
    setSelectedUser({ ...selectedUser, doctor_checked: true, doctor_message: doctorMessage });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {/* Header & Stats */}
      <header>
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <StatCard title="Workers" value={stats.workers} />
          <StatCard title="Patients" value={stats.patients} />
          <StatCard title="Review Completed" value={stats.patientsLooked} />
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex gap-2 border-b pb-2">
          <Tab label="Patients" active={activeTab === "patients"} onClick={() => setActiveTab("patients")} />
          <Tab label="Workers" active={activeTab === "workers"} onClick={() => setActiveTab("workers")} />
        </div>
        <input
          placeholder={`Search ${activeTab}...`}
          className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {results.length > 0 && (
          <div className="border rounded-lg divide-y">
            {results.map((r) => (
              <div key={r.id} onClick={() => handleUserClick(r)} className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                <span className="font-medium">{r.name}</span>
                {r.role === "patient" && <StatusBadge workerChecked={r.worker_checked} doctorChecked={r.doctor_checked} />}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DETAILS PANEL */}
      {selectedUser && (
        <section className="bg-white border rounded-xl shadow-lg p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
              <p className="text-sm text-gray-500 uppercase tracking-widest">{selectedUser.role}</p>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-red-500">✕ Close</button>
          </div>

          {selectedUser.role === "patient" && (
            <div className="space-y-6">
              {/* Clinical History Table */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  📋 Clinical History
                </h3>
                {records.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No medical records found for this patient.</p>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">BP</th>
                          <th className="p-3">Sugar</th>
                          <th className="p-3">Weight</th>
                          <th className="p-3">Condition</th>
                          <th className="p-3">Symptoms</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {records.map((rec) => (
                          <tr key={rec.id} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-600">{new Date(rec.created_at).toLocaleDateString()}</td>
                            <td className="p-3 font-mono">{rec.bp || "--"}</td>
                            <td className="p-3 font-mono">{rec.sugar || "--"}</td>
                            <td className="p-3">{rec.weight}kg</td>
                            <td className="p-3">{renderCondition(rec.condition)}</td>
                            <td className="p-3 text-gray-500 italic">{rec.symptoms || "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">Doctor's Assessment</h3>
                <textarea
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter medical advice or diagnosis..."
                  value={doctorMessage}
                  onChange={(e) => setDoctorMessage(e.target.value)}
                />
                <button
                  onClick={markDoctorReviewed}
                  disabled={savingReview}
                  className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {savingReview ? "Saving..." : "Save Assessment & Mark Reviewed"}
                </button>
              </div>
            </div>
          )}

          {selectedUser.role === "worker" && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700">Recent Activity</h3>
              <ul className="divide-y border rounded-lg">
                {records.map((r) => (
                  <li key={r.id} className="p-3 flex justify-between text-sm">
                    <span>Checked <strong>{r.patient?.name}</strong></span>
                    <span className="text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
        active ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ workerChecked, doctorChecked }) {
  if (!workerChecked) return <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Awaiting Worker</span>;
  if (!doctorChecked) return <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Awaiting Doctor</span>;
  return <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Completed</span>;
}

function renderCondition(condition) {
  const styles = {
    stable: "🟢 Stable",
    attention: "🟡 Attention",
    critical: "🔴 Critical"
  };
  return styles[condition] || "—";
}