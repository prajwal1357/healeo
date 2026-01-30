"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  ShieldAlert, Check, X, User, Clock, AlertCircle, Loader2, Trash2, ChevronDown 
} from "lucide-react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { data: reqData, error: reqError } = await supabase
        .from("access_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (reqError) throw reqError;

      if (reqData?.length > 0) {
        const userIds = reqData.map(r => r.user_id);
        const { data: userData, error: userError } = await supabase
          .from("app_users")
          .select("id, name, email, village")
          .in("id", userIds);

        if (userError) throw userError;

        const combined = reqData.map(req => ({
          ...req,
          user: userData.find(u => u.id === req.user_id)
        }));
        setRequests(combined);
      } else {
        setRequests([]);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ---------------- ACTION: PROMOTE & APPROVE ---------------- */
  const handleAction = async (request, newRole, isRejection = false) => {
    setActionId(request.id);
    try {
      if (isRejection) {
        // Option A: Just delete the request from the table
        const { error } = await supabase
          .from("access_requests")
          .delete()
          .eq("id", request.id);
        if (error) throw error;
      } else {
        // Option B: Approve and change role in app_users
        // 1. Update request status
        const { error: reqUpdateErr } = await supabase
          .from("access_requests")
          .update({ status: "approved", requested_role: newRole })
          .eq("id", request.id);
        if (reqUpdateErr) throw reqUpdateErr;

        // 2. Update actual user role
        const { error: userUpdateErr } = await supabase
          .from("app_users")
          .update({ role: newRole })
          .eq("id", request.user_id);
        if (userUpdateErr) throw userUpdateErr;
      }

      // Remove from UI
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      alert("Action failed: " + err.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verifying Credentials...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-indigo-600" size={32} />
            Access Requests
          </h1>
          <p className="text-slate-500 font-medium mt-1">Process pending professional applications.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending</p>
          <p className="text-2xl font-black text-indigo-600 leading-none">{requests.length}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex gap-3 text-sm font-bold">
          <AlertCircle size={18} className="shrink-0" /> {errorMessage}
        </div>
      )}

      {/* Requests List */}
      <div className="grid gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              
              {/* Left: User Detail */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{req.user?.name || "Unknown User"}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{req.user?.email || "No Email"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[1.8rem] p-6 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-slate-100"><Clock size={40} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Application Statement</p>
                  <p className="text-slate-700 font-medium italic text-sm leading-relaxed relative z-10">
                    "{req.reason || "No reason provided."}"
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Approve As:</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      disabled={actionId === req.id}
                      onClick={() => handleAction(req, "doctor")}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Promote to Doctor
                    </button>
                    <button 
                      disabled={actionId === req.id}
                      onClick={() => handleAction(req, "worker")}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Promote to Worker
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <button 
                    disabled={actionId === req.id}
                    onClick={() => handleAction(req, null, true)}
                    className="flex items-center gap-2 text-rose-500 hover:text-rose-700 font-black text-[10px] uppercase tracking-widest transition-colors"
                  >
                    <Trash2 size={14} /> Delete Request
                  </button>
                  {actionId === req.id && <Loader2 size={16} className="animate-spin text-indigo-600" />}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All applications processed.</p>
        </div>
      )}
    </div>
  );
}