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
  Menu, 
  LogOut,
  HeartPulse,
  Bell,
  Search
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data } = await supabase.from("app_users").select("role").eq("id", user.id).single();
      setRole(data?.role || "patient");
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
    <div className="min-h-screen flex bg-[#f8fafc] font-sans pt-20">
      
      {/* --- Mobile Sidebar Overlay --- */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* --- Sidebar --- */}
      <aside className={`
        fixed md:sticky top-0 z-[70] bg-white border-r border-slate-100 w-72 h-screen flex flex-col
        transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <HeartPulse size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight italic">Caresora</span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {links.map((link) => (
            <SidebarLink key={link.id} href={link.href} label={link.label} icon={link.icon} active={pathname === link.href} onClick={() => setMenuOpen(false)} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold text-sm rounded-2xl hover:bg-rose-50 transition-colors group">
             <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* --- Top Glass Navbar --- */}
        <header className="sticky top-0 z-50 w-full px-6 py-4">
          <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-[1.5rem] px-6 py-3 flex items-center justify-between">
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 bg-slate-50 rounded-lg text-slate-600">
              <Menu size={20} />
            </button>
            
            {/* <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-64">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-full" />
            </div> */}

            <div className="flex items-center gap-4">
             {/* --- Dynamic Notification Link --- */}
<Link 
  href={
    role === "patient" 
      ? "/dashboard/patient/contact" 
      : role === "admin" 
      ? "/dashboard/admin/requests" 
      : `/dashboard/${role}/messages`
  }
>
  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative group">
    <Bell size={20} className="group-hover:rotate-[15deg] transition-transform" />
    
    {/* Notification Dot */}
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
    
    {/* Optional: Hover Tooltip */}
    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest">
      {role === "admin" ? "Requests" : "Messages"}
    </span>
  </button>
</Link>
              <div className="h-8 w-[1px] bg-slate-200 mx-1" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none capitalize">{role}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Status: Online</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl border border-indigo-200 flex items-center justify-center text-indigo-600 font-black">
                  {role?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- Content --- */}
        <main className="flex-1 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}

/* --- Same Sub-components and roleBasedLinks as your original code --- */
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
    </Link>
  );
}