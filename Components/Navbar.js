"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LogOut, User, Zap } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false); // Added missing state

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- AUTH STATE ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // Hide Navbar if not logged in or still loading
  if (loading || !isLoggedIn) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
      scrolled ? "py-3" : "py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <nav className={`
          relative flex items-center justify-between px-6 py-3 
          rounded-[2rem] border transition-all duration-500
          /* --- THE GLASS EFFECT --- */
          bg-blue-400/10 backdrop-blur-md 
          border-blue-200/30 shadow-[0_8px_32px_0_rgba(148,163,184,0.1)]
          ${scrolled ? "mx-4 shadow-xl" : "mx-0"}
        `}>
          
          {/* Logo with Glow */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
              <Zap size={18} className="text-white fill-current" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Caresora<span className="text-blue-600">.</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Profile Circle */}
              <div className="hidden sm:flex w-10 h-10 bg-white/50 border border-blue-100 rounded-full items-center justify-center text-blue-600 shadow-inner">
                <User size={18} />
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 px-5 py-2.5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-200/50"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}