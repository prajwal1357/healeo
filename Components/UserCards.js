"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Mail, MapPin, Calendar, Shield } from "lucide-react";

export default function UserCards({ onUpdateRole }) {
  const [appUsers, setAppUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppUsers = async () => {
    const { data, error } = await supabase
      .from("app_users")
      .select("id, name, age, email, role, village, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Failed to fetch app_users");
    } else {
      setAppUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    // Execute the parent's update logic
    await onUpdateRole(userId, newRole);
    
    // Optimistically update the local state for immediate feedback
    setAppUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
        <Loader2 className="animate-spin" size={20} />
        <span className="font-medium">Loading records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-bold text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <Th>User Detail</Th>
            <Th>Age</Th>
            <Th>Location</Th>
            <Th>Joined</Th>
            <Th>Role / Permissions</Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {appUsers.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
              <Td>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{user.name || "Unknown"}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail size={12} /> {user.email}
                  </span>
                </div>
              </Td>
              
              <Td>
                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                  <Calendar size={12} /> {user.age || "—"}
                </span>
              </Td>

              <Td>
                <div className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin size={14} className="text-slate-400" />
                  {user.village || "Not set"}
                </div>
              </Td>

              <Td>
                <span className="text-slate-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </Td>

              <Td>
                <div className="flex items-center gap-3">
                  <RoleSelector 
                    role={user.role} 
                    disabled={updatingId === user.id}
                    onChange={(newRole) => handleRoleChange(user.id, newRole)}
                  />
                  {updatingId === user.id && (
                    <Loader2 size={14} className="animate-spin text-indigo-600" />
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {appUsers.length === 0 && (
        <div className="py-20 text-center space-y-2">
          <p className="text-slate-400 font-medium italic">No users found in the system.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Th({ children }) {
  return (
    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-6 py-4 text-sm whitespace-nowrap">{children}</td>;
}

function RoleSelector({ role, onChange, disabled }) {
  const getRoleColor = (r) => {
    switch (r) {
      case "admin": return "text-rose-600";
      case "doctor": return "text-blue-600";
      case "worker": return "text-indigo-600";
      case "patient": return "text-emerald-600";
      default: return "text-slate-600";
    }
  };

  return (
    <div className="relative flex items-center group">
      <Shield className={`absolute left-3 pointer-events-none ${getRoleColor(role)}`} size={14} />
      <select
        value={role || "patient"}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none pl-9 pr-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider
          border-2 border-slate-100 bg-white cursor-pointer
          focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10
          transition-all hover:border-slate-300 disabled:opacity-50
          ${getRoleColor(role)}
        `}
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="worker">Worker</option>
        <option value="admin">Admin</option>
      </select>
      <div className="absolute right-3 pointer-events-none text-slate-400">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}