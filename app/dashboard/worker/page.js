"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ConditionOption from "@/Components/ConditionOption";
import WorkerMedicalRecords from "@/Components/WorkerMedicalRecords";


export default function WorkerDashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, docsUploaded: 0, checkedThisMonth: 0 });
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const [form, setForm] = useState({
    bp: "",
    sugar: "",
    weight: "",
    symptoms: "",
    notes: "",
    condition: "stable",
  });

  // 1. Fetch Stats on Load
  useEffect(() => {
    const fetchStats = async () => {
      const workerId = "demo-worker-id"; 
      const { count: totalPatients } = await supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "patient");
      const { count: docsUploaded } = await supabase.from("worker_patient_records").select("*", { count: "exact", head: true }).eq("worker_id", workerId);
      
      setStats({
        totalPatients: totalPatients || 0,
        docsUploaded: docsUploaded || 0,
        checkedThisMonth: 0, 
      });
    };
    fetchStats();
  }, []);

  // 2. Manual Search Function
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (search.trim().length < 1) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("app_users")
      .select("id, name")
      .eq("role", "patient")
      .ilike("name", `${search}%`)
      .limit(10);

    if (!error) {
      setPatients(data || []);
    }
    setIsLoading(false);
  };

  // 3. Fetch Records and Open Form
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setPatients([]); // Clear search results
    
    // Fetch historical records for this patient
    const { data } = await supabase
      .from("worker_patient_records")
      .select("*")
      .eq("patient_id", patient.id)
      .order('created_at', { ascending: false });
    
    setDocuments(data || []);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Not authenticated");
    return;
  }

  // 1️⃣ Insert medical record
  const { error: recordError } = await supabase
    .from("worker_patient_records")
    .insert({
      patient_id: selectedPatient.id,
      worker_id: user.id,
      bp: form.bp,
      sugar: form.sugar,
      weight: form.weight,
      symptoms: form.symptoms,
      condition: form.condition,
    });

  if (recordError) {
    console.error(recordError);
    alert(recordError.message);
    return;
  }

  // 2️⃣ Mark patient as checked by worker
  const { error: statusError } = await supabase
    .from("app_users")
    .update({ worker_checked: true })
    .eq("id", selectedPatient.id);

  if (statusError) {
    console.error(statusError);
    alert(statusError.message);
    return;
  }

  alert("Medical data saved successfully!");

  // Reset UI
  setForm({
    bp: "",
    sugar: "",
    weight: "",
    symptoms: "",
    notes: "",
    condition: "stable",
  });
  setSelectedPatient(null);
  setSearch("");
};



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Worker Dashboard</h1>
        <p className="text-gray-500">Search patient to record new clinical data</p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients} />
        <StatCard title="Your Records" value={stats.docsUploaded} />
        <StatCard title="Month Activity" value={stats.checkedThisMonth} />
      </div>

      {/* Search Bar Section */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            placeholder="Search name (e.g., 'John')"
            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {isLoading ? "..." : "Search"}
          </button>
        </form>

        {/* Search Results */}
        {patients.length > 0 && (
          <div className="mt-4 border rounded-lg divide-y bg-white overflow-hidden">
            {patients.map((p) => (
              <button
                key={p.id}
                className="w-full p-4 hover:bg-blue-50 flex justify-between items-center transition"
                onClick={() => handleSelectPatient(p)}
              >
                <span className="font-semibold text-gray-700">{p.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">ADD DATA +</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* The Medical Form - Opens when a patient is selected */}
      {selectedPatient && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white border-2 border-blue-500 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">New Clinical Record</h2>
                <p className="text-sm text-blue-600 font-medium">Patient: {selectedPatient.name}</p>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)} 
                className="text-gray-400 hover:text-red-500 transition p-2"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Blood Pressure" placeholder="120/80" value={form.bp} onChange={(v) => setForm({ ...form, bp: v })} />
                <Input label="Sugar Level" placeholder="90 mg/dL" value={form.sugar} onChange={(v) => setForm({ ...form, sugar: v })} />
                <Input label="Weight (kg)" placeholder="70" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Patient Condition</label>
                <div className="flex gap-3">
                  {["stable", "attention", "critical"].map((lvl) => (
                    <ConditionOption
                      key={lvl}
                      label={lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      value={lvl}
                      emoji={lvl === "stable" ? "🟢" : lvl === "attention" ? "🟡" : "🔴"}
                      selected={form.condition}
                      onSelect={(v) => setForm({ ...form, condition: v })}
                    />
                  ))}
                </div>
              </div>

              <Textarea label="Symptoms & Notes" placeholder="Describe symptoms or clinical observations..." value={form.symptoms} onChange={(v) => setForm({ ...form, symptoms: v })} />

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 shadow-lg transition-all active:scale-[0.98]">
                Submit Patient Record
              </button>
            </form>
          </section>

          {/* Previous Records Mini-List */}
          {documents.length > 0 && (
            <section className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Recent History</h3>
              <div className="space-y-2">
                {documents.slice(0, 3).map((doc, i) => (
                  <div key={i} className="text-xs bg-white p-2 rounded border border-gray-200 flex justify-between">
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    <span className="font-bold">{doc.condition.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      <section>
  <h2 className="text-lg font-semibold mb-2">
    My Submitted Medical Records
  </h2>
  <WorkerMedicalRecords />
</section>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <input
        placeholder={placeholder}
        className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <textarea
        placeholder={placeholder}
        className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}