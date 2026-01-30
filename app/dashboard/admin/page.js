"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import UserCards from "@/Components/UserCards"; // Assuming this handles the user list
import { 
  Users, 
  Stethoscope, 
  HeartHandshake, 
  RefreshCw, 
  AlertCircle,
  LayoutDashboard,
  UserCheck,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [counts, setCounts] = useState({ patient: 0, doctor: 0, worker: 0 });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ---------------- AUTH + ROLE CHECK ---------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || data?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setRole(data.role);
    };

    checkAdmin();
  }, [router]);

  /* ---------------- FETCH USER COUNTS ---------------- */
  const fetchCounts = async () => {
    if (role !== "admin" && !isLoading) return;
    setIsRefreshing(true);
    
    try {
      const [{ count: patients }, { count: doctors }, { count: workers }] =
        await Promise.all([
          supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "patient"),
          supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "doctor"),
          supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "worker"),
        ]);

      setCounts({
        patient: patients || 0,
        doctor: doctors || 0,
        worker: workers || 0,
      });
      setError("");
    } catch (err) {
      setError("Failed to fetch user counts");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchCounts();
  }, [role]);

  /* ---------------- FEATURE: CHANGE ROLE ---------------- */
  const handleUpdateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from("app_users")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("Error updating role: " + error.message);
    } else {
      fetchCounts(); // Refresh stats after role change
    }
  };

  if (!role && isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-800">System Error</h3>
        <p className="text-red-600 mb-6 text-center">{error}</p>
        <button onClick={fetchCounts} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <ShieldAlert size={18} />
            <span className="text-sm uppercase tracking-wider font-bold">Admin Console</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Manage user permissions and monitor Caresora adoption.</p>
        </div>
        
        <button 
          onClick={fetchCounts}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Patients" 
          value={counts.patient} 
          icon={<Users className="w-6 h-6" />}
          color="blue"
          loading={isLoading}
        />
        <StatCard 
          title="Active Doctors" 
          value={counts.doctor} 
          icon={<Stethoscope className="w-6 h-6" />}
          color="emerald"
          loading={isLoading}
        />
        <StatCard 
          title="Field Workers" 
          value={counts.worker} 
          icon={<HeartHandshake className="w-6 h-6" />}
          color="indigo"
          loading={isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">User Management</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Update roles & permissions</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* PRO TIP: Pass handleUpdateRole to your UserCards component 
              so it can render a "Change Role" dropdown for each user.
          */}
          <UserCards onUpdateRole={handleUpdateRole} />
        </div>
      </div>
    </div>
  );
}

/**
 * Premium StatCard Component
 */
function StatCard({ title, value, icon, color, loading }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <div className="group relative bg-white border border-slate-100 p-6 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          {loading ? (
            <div className="h-10 w-16 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <p className="text-4xl font-black text-slate-900 tabular-nums">
              {value.toLocaleString()}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl transition-all duration-300 shadow-sm ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-6 flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg mr-3">
          ● Live
        </span>
        Database Records
      </div>
    </div>
  );
}

function Loader2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${props.className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}