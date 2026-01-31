"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  User, Users, ChevronDown, MessageSquare, Stethoscope, 
  UserCheck, MapPin, Search, Loader2, Link as LinkIcon,
  Shield, Activity
} from "lucide-react";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("patient"); // Default tab

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: usersData } = await supabase.from("app_users").select("*");
    const { data: recordsData } = await supabase
      .from("worker_patient_records")
      .select("patient_id, worker_id");

    setUsers(usersData || []);
    setConnections(recordsData || []);
    setLoading(false);
  };

  // Helper to find associated users
  const getRelatedUsers = (targetUser) => {
    if (targetUser.role === 'patient') {
      const workerIds = connections.filter(c => c.patient_id === targetUser.id).map(c => c.worker_id);
      return users.filter(u => workerIds.includes(u.id));
    } 
    if (targetUser.role === 'worker') {
      const patientIds = connections.filter(c => c.worker_id === targetUser.id).map(c => c.patient_id);
      return users.filter(u => patientIds.includes(u.id));
    }
    return [];
  };

  // Filter logic: Role Match + Search Match
  const filteredUsers = users.filter(u => 
    u.role === activeTab &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-indigo-600" size={32} />
            User Directory
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">Manage roles and review clinical communication across the network.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder={`Search ${activeTab}s...`}
            className="w-full bg-white border-2 border-slate-100 pl-12 pr-4 py-3 rounded-2xl outline-none focus:border-indigo-600 transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit">
        <TabButton 
          active={activeTab === 'patient'} 
          onClick={() => setActiveTab('patient')} 
          label="Patients" 
          icon={<User size={16}/>} 
        />
        <TabButton 
          active={activeTab === 'worker'} 
          onClick={() => setActiveTab('worker')} 
          label="Field Workers" 
          icon={<UserCheck size={16}/>} 
        />
        <TabButton 
          active={activeTab === 'doctor'} 
          onClick={() => setActiveTab('doctor')} 
          label="Doctors" 
          icon={<Stethoscope size={16}/>} 
        />
      </div>

      {/* --- LIST SECTION --- */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
           <UserCard 
             key={user.id}
             user={user}
             isExpanded={expandedId === user.id}
             onToggle={() => setExpandedId(expandedId === user.id ? null : user.id)}
             related={getRelatedUsers(user)}
           />
        )) : (
          <EmptyState tab={activeTab} />
        )}
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-[1.6rem] font-black text-xs uppercase tracking-widest transition-all ${
        active 
          ? "bg-white text-indigo-600 shadow-sm" 
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function UserCard({ user, isExpanded, onToggle, related }) {
  return (
    <div className={`bg-white border transition-all duration-300 rounded-[2.5rem] overflow-hidden ${isExpanded ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-50' : 'border-slate-100'}`}>
      <button onClick={onToggle} className="w-full p-6 flex items-center justify-between text-left">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
            {user.role === 'doctor' ? <Stethoscope size={22}/> : user.role === 'worker' ? <UserCheck size={22}/> : <User size={22}/>}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">{user.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{user.village || "Global"} • {user.email}</p>
          </div>
        </div>
        <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
      </button>

      {isExpanded && (
        <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-2">
          <div className="pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contextual Connection Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={12}/> {user.role === 'patient' ? 'Care Team' : 'Associated Patients'}
              </h4>
              <div className="grid gap-2">
                {related.map(rel => (
                  <div key={rel.id} className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm"><User size={14}/></div>
                    <span className="text-xs font-bold text-slate-700">{rel.name}</span>
                  </div>
                ))}
                {related.length === 0 && <p className="text-xs italic text-slate-400">No active links found.</p>}
              </div>
            </div>

            {/* Assessment Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12}/> Medical Logs
              </h4>
              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                <p className="text-sm font-semibold text-slate-700 italic leading-relaxed">
                  "{user.doctor_message || "No assessment history for this user."}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Database...</p>
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
      <p className="text-slate-400 font-bold text-sm">No {tab}s found matching your criteria.</p>
    </div>
  );
}