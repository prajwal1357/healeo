"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Users, 
  Stethoscope, 
  ClipboardCheck, 
  Search, 
  X, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ArrowRight,
  User,
  HeartPulse,
  Save,
  Loader2,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ workers: 0, patients: 0, patientsLooked: 0 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("patients");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [records, setRecords] = useState([]); 
  const [doctorMessage, setDoctorMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
const [aiDraft, setAiDraft] = useState("");

const generateAIReport = async (retryCount = 0) => {
  // Guard clause: ensure there are records to process
  if (!records || records.length === 0) {
    toast.error("No patient records found to generate a report.");
    return;
  }

  setIsGeneratingAI(true);
  const latest = records[0];

  try {
    const response = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: selectedUser.name,
        vitals: { 
          bp: latest.bp, 
          sugar: latest.sugar, 
          weight: latest.weight 
        },
        symptoms: latest.symptoms || "None reported"
      }),
    });

    // 1. Handle Rate Limiting (429)
    if (response.status === 429 && retryCount < 3) {
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.warn(`Rate limited. Retrying in ${waitTime}ms...`);
      
      await new Promise(res => setTimeout(res, waitTime));
      // Recursively call the function and RETURN so the current execution stops
      return await generateAIReport(retryCount + 1); 
    }

    // 2. Safety Check: If response is not 200-299, don't parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server Error (${response.status}):`, errorText);
      toast.error(`AI generation failed: ${response.statusText}`);
      return;
    }

    // 3. Successful response
    const data = await response.json();
    
    if (data.report) {
      setDoctorMessage(data.report); // Update the UI
      setAiDraft(data.report);
    } else {
      toast.error(data.error || "AI could not generate a report format.");
    }

  } catch (err) {
    console.error("Network/Client Error:", err);
    toast.error("An unexpected error occurred. Please check your connection.");
  } finally {
    // Only stop the loading state if we are not in the middle of a retry
    setIsGeneratingAI(false);
  }
};

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
      setIsSearching(true);
      const role = activeTab === "patients" ? "patient" : "worker";
      const { data } = await supabase
        .from("app_users")
        .select("id, name, role, worker_checked, doctor_checked, doctor_message")
        .eq("role", role)
        .ilike("name", `%${search}%`)
        .limit(10);
      setResults(data || []);
      setIsSearching(false);
    };
    fetchResults();
  }, [search, activeTab]);

  /* ---------------- USER CLICK ---------------- */
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setDoctorMessage(user.doctor_message || "");
    setRecords([]);

    if (user.role === "patient") {
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
        .select(`id, created_at, patient:app_users!worker_patient_records_patient_fkey (name)`)
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
    if (error) { 
      console.error(error.message); 
      return; 
    }
    setSelectedUser({ ...selectedUser, doctor_checked: true, doctor_message: doctorMessage });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header & Stats */}
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctor Dashboard</h1>
            <p className="text-slate-500 font-medium">Remote clinical oversight and field team coordination.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold border border-indigo-100 shadow-sm">
            <HeartPulse size={16} className="animate-pulse" /> Live Tele-Health Monitoring
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard 
            title="Field Workers" 
            value={stats.workers} 
            icon={<Users size={20} />} 
            color="bg-blue-600"
            lightColor="bg-blue-50"
          />
          <StatCard 
            title="Assigned Patients" 
            value={stats.patients} 
            icon={<User size={20} />} 
            color="bg-purple-600"
            lightColor="bg-purple-50"
          />
          <StatCard 
            title="Reviews Completed" 
            value={stats.patientsLooked} 
            icon={<ClipboardCheck size={20} />} 
            color="bg-emerald-600"
            lightColor="bg-emerald-50"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SEARCH SECTION */}
        <section className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6 space-y-6 h-fit">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <Tab label="Patients" icon={<User size={16}/>} active={activeTab === "patients"} onClick={() => setActiveTab("patients")} />
            <Tab label="Workers" icon={<Users size={16}/>} active={activeTab === "workers"} onClick={() => setActiveTab("workers")} />
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              placeholder={`Search ${activeTab}...`}
              className="w-full border-2 border-slate-50 bg-slate-50 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-600" size={18} />}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {results.length > 0 ? (
              results.map((r) => (
                <div 
                  key={r.id} 
                  onClick={() => handleUserClick(r)} 
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group ${
                    selectedUser?.id === r.id 
                      ? "bg-indigo-50 border-indigo-100" 
                      : "bg-white border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl shadow-sm ${selectedUser?.id === r.id ? "bg-white text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                      {activeTab === "patients" ? <User size={18} /> : <Users size={18} />}
                    </div>
                    <span className="font-bold text-slate-700">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.role === "patient" && <StatusBadge workerChecked={r.worker_checked} doctorChecked={r.doctor_checked} />}
                    <ChevronRight size={18} className={`text-slate-300 group-hover:text-indigo-400 transition-all ${selectedUser?.id === r.id ? 'translate-x-1 text-indigo-500' : ''}`} />
                  </div>
                </div>
              ))
            ) : search.length >= 2 ? (
              <EmptyState icon={<Search size={32}/>} text={`No ${activeTab} found for "${search}"`} />
            ) : (
              <EmptyState icon={<Activity size={32}/>} text={`Enter name to find ${activeTab}`} italic />
            )}
          </div>
        </section>

        {/* DETAILS PANEL */}
        <section className="lg:col-span-8">
          {selectedUser ? (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 p-8 flex justify-between items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner">
                      {selectedUser.role === 'patient' ? <User size={32} /> : <Users size={32} />}
                   </div>
                   <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedUser.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-2 py-0.5 rounded text-indigo-300">
                        {selectedUser.role}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">ID: {selectedUser.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="relative z-10 w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-10">
                {selectedUser.role === "patient" && (
                  <>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                          <FileText className="text-indigo-600" size={22} /> Clinical Vitals History
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {records.length} Logs recorded
                        </span>
                      </div>
                      
                      {records.length === 0 ? (
                        <div className="bg-slate-50/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                          <p className="text-slate-400 font-medium italic">No field records have been submitted for this patient yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="bg-slate-50/80">
                                <th className="p-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">Date</th>
                                <th className="p-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">Blood Pressure</th>
                                <th className="p-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">Sugar (mg/dL)</th>
                                <th className="p-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">Weight</th>
                                <th className="p-5 font-black text-slate-500 uppercase text-[10px] tracking-widest text-center">Condition</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="p-5 text-slate-700 font-bold">{new Date(rec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                  <td className="p-5 text-indigo-600 font-mono font-black text-base">{rec.bp || "--"}</td>
                                  <td className="p-5 text-rose-600 font-mono font-black text-base">{rec.sugar || "--"}</td>
                                  <td className="p-5 text-slate-600 font-bold">{rec.weight} kg</td>
                                  <td className="p-5"><div className="flex justify-center">{renderCondition(rec.condition)}</div></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* --- CLINICAL ASSESSMENT SECTION WITH AI --- */}
<div className="bg-indigo-50/30 p-8 rounded-[2rem] border-2 border-indigo-50 space-y-6 relative overflow-hidden">
  
  {/* Header with AI Trigger */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
        <Stethoscope size={20} />
      </div>
      <h3 className="font-black text-slate-900 text-lg">Clinical Assessment</h3>
    </div>
    
    {/* NEW: AI GENERATION BUTTON */}
    <button
      onClick={generateAIReport}
      disabled={isGeneratingAI || records.length === 0}
      className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
    >
      {isGeneratingAI ? (
        <Loader2 className="animate-spin" size={14} />
      ) : (
        <Activity size={14} className="group-hover:animate-pulse" />
      )}
      {isGeneratingAI ? "AI Analyzing..." : "Generate AI Summary"}
    </button>
  </div>

  {/* Textarea with AI Draft indicator */}
  <div className="relative z-10">
    <textarea
      rows={4}
      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700 leading-relaxed"
      placeholder="Detail your clinical observations or use AI to generate a basic report based on vitals..."
      value={doctorMessage}
      onChange={(e) => setDoctorMessage(e.target.value)}
    />
    {aiDraft && doctorMessage === aiDraft && (
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-indigo-100 animate-in fade-in slide-in-from-top-1">
        <CheckCircle2 size={12} /> Gemini AI Draft
      </div>
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex flex-col sm:flex-row gap-3 relative z-10">
    <button
      onClick={markDoctorReviewed}
      disabled={savingReview || !doctorMessage.trim()}
      className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
    >
      {savingReview ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
      {savingReview ? "Finalizing Review..." : "Authorize Assessment & Mark Verified"}
    </button>
    
    {/* Reject/Clear Button */}
    <button
      onClick={() => {
        setDoctorMessage("");
        setAiDraft("");
      }}
      className="px-6 py-5 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
    >
      Clear / Reject
    </button>
  </div>

  {/* Decorative Background Icon */}
  <div className="absolute -bottom-6 -right-6 opacity-5 text-indigo-600 pointer-events-none">
    <HeartPulse size={120} />
  </div>
</div>
                  </>
                )}

                {selectedUser.role === "worker" && (
                  <div className="space-y-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                      <Clock className="text-indigo-600" size={22} /> Recent Field Visitations
                    </h3>
                    <div className="grid gap-4">
                      {records.map((r) => (
                        <div key={r.id} className="p-5 bg-white border-2 border-slate-50 rounded-3xl flex justify-between items-center group hover:border-indigo-100 transition-all hover:shadow-lg hover:shadow-indigo-50/50">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <UserCheck size={20} />
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-800 tracking-tight">Checked {r.patient?.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Reference ID: #{r.id.substring(0, 6)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-slate-400 font-bold">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-300 p-12 border-4 border-dashed border-slate-50 rounded-[3rem] bg-slate-50/30">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 mb-6 text-slate-100">
                <ArrowRight size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-400">Select a Profile to Begin</h3>
              <p className="text-slate-400 font-medium text-center mt-2 max-w-sm">Use the search panel on the left to select a patient or field worker for detailed clinical review.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function StatCard({ title, value, icon, color, lightColor }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 ${lightColor} rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-50`}></div>
      <div className="flex justify-between items-start relative z-10 mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <div className={`p-3 rounded-2xl text-white shadow-lg ${color} group-hover:rotate-12 transition-transform`}>
          {icon}
        </div>
      </div>
      <p className="text-4xl font-black text-slate-900 tabular-nums relative z-10 tracking-tight">{value}</p>
    </div>
  );
}

function Tab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 flex-1 px-4 py-3.5 rounded-xl text-sm font-black transition-all ${
        active 
          ? "bg-white text-indigo-600 shadow-xl shadow-slate-200/50" 
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ icon, text, italic }) {
  return (
    <div className="text-center py-12 text-slate-300 flex flex-col items-center gap-4">
      <div className="p-4 bg-slate-50 rounded-full">{icon}</div>
      <p className={`text-sm font-bold ${italic ? 'italic text-slate-400' : ''}`}>{text}</p>
    </div>
  );
}

function StatusBadge({ workerChecked, doctorChecked }) {
  if (!workerChecked) return (
    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
      <Clock size={10} strokeWidth={3} /> Awaiting Field
    </span>
  );
  if (!doctorChecked) return (
    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100">
      <AlertCircle size={10} strokeWidth={3} /> Review Needed
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
      <CheckCircle2 size={10} strokeWidth={3} /> Verified
    </span>
  );
}

function renderCondition(condition) {
  const styles = {
    stable: { color: "text-emerald-700 bg-emerald-100", label: "Stable", icon: <Activity size={12}/> },
    attention: { color: "text-amber-700 bg-amber-100", label: "Attention", icon: <AlertCircle size={12}/> },
    critical: { color: "text-red-700 bg-red-100", label: "Critical", icon: <AlertCircle size={12}/> }
  };
  const data = styles[condition] || { color: "text-slate-500 bg-slate-100", label: "N/A", icon: null };
  
  return (
    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${data.color}`}>
      {data.icon}
      {data.label}
    </span>
  );
}