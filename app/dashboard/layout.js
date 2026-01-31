"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Stethoscope, 
  MessageSquare, 
  UserCircle, 
  ClipboardList, 
  Menu, 
  X, 
  LogOut,
  HeartPulse
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH & ROLE CHECK ---------------- */
  useEffect(() => {
    const fetchRole = async () => {
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

      if (error || !data) {
        setRole("patient"); // Fallback
      } else {
        setRole(data.role);
      }
      setLoading(false);
    };

    fetchRole();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return null;

  const links = roleBasedLinks[role] || [];

  return (
    <div className="min-h-screen flex bg-[#fcfcfd] font-sans">
      
      {/* --- Mobile Overlay --- */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside
        className={`fixed md:sticky top-0 z-50 bg-white border-r border-slate-100 w-72 h-screen flex flex-col
        transform transition-all duration-300 ease-in-out
        ${menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <HeartPulse size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight italic">Caresora</span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {links.map((link) => (
            <SidebarLink
              key={link.id}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={pathname === link.href}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>

        {/* User Profile / Logout Section */}
        <div className="p-4 border-t border-slate-50">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold text-sm rounded-2xl hover:bg-rose-50 transition-colors group"
           >
             <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
             Sign Out Account
           </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header (Mobile Only) */}
        <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{role}</span>
            <div className="w-8 h-8 bg-slate-100 rounded-full border border-slate-200" />
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-10 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ---------------- MENU CONFIG ---------------- */

const roleBasedLinks = {
  admin: [
    { id: "admin-db", label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard size={20}/> },
    { id: "admin-usr", label: "User Management", href: "/dashboard/admin/app_users", icon: <Users size={20}/> },
    { id: "admin-req", label: "Access Requests", href: "/dashboard/admin/requests", icon: <ShieldCheck size={20}/> },
  ],
  doctor: [
    { id: "doc-db", label: "Clinical Overview", href: "/dashboard/doctor", icon: <Stethoscope size={20}/> },
    { id: "doc-msg", label: "Field Messages", href: "/dashboard/doctor/messages", icon: <MessageSquare size={20}/> },
  ],
  worker: [
    { id: "wrk-db", label: "Worker Portal", href: "/dashboard/worker", icon: <LayoutDashboard size={20}/> },
    { id: "wrk-msg", label: "Patient Messages", href: "/dashboard/worker/messages", icon: <MessageSquare size={20}/> },
  ],
  patient: [
    { id: "pat-db", label: "My Health Status", href: "/dashboard/patient", icon: <UserCircle size={20}/> },
    { id: "pat-con", label: "Contact worker", href: "/dashboard/patient/contact", icon: <MessageSquare size={20}/> },
    { id: "pat-req", label: "Professional Access", href: "/dashboard/patient/request-access", icon: <ShieldCheck size={20}/> },
  ],
};

/* ---------------- UI COMPONENTS ---------------- */

function SidebarLink({ href, label, icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 group
      ${active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
    >
      <div className={`transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
        {icon}
      </div>
      {label}
      {active && (
        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      )}
    </Link>
  );
}