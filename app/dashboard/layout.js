"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [role, setrole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------------- FETCH USER role ---------------- */
  useEffect(() => {
    const fetchrole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .single();

      setrole(data?.role);
    };

    fetchrole();
  }, [router]);

  if (!role) return null;

  const links = roleBasedLinks[role] || [];

  return (
    <div className="min-h-[100vh] flex bg-gray-100">
      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 bg-white border-r w-64 p-4 h-full
        transform transition-transform duration-200
        ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h2 className="text-xl font-bold mb-6 text-blue-600">
          Caresora
        </h2>

        <nav className="space-y-3 text-sm">
          {links.map((link) => (
            <SidebarLink
              key={link.id}
              href={link.href}
              label={link.label}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar (Mobile) */}
        <header className="md:hidden bg-white border-b px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-xl"
          >
            ☰
          </button>
          <span className="font-semibold capitalize">
            {role} dashboard
          </span>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

/* ---------------- MENU CONFIG ---------------- */

const roleBasedLinks = {
  admin: [
    { id: "admin-dashboard", label: "Dashboard", href: "/dashboard/admin" },
    { id: "admin-users", label: "Users", href: "/dashboard/admin/app_users" },
    { id: "admin-requests", label: "Access Requests", href: "/dashboard/admin/requests" }, // NEW
  ],
  doctor: [
    { id: "doctor-dashboard", label: "Dashboard", href: "/dashboard/doctor" },
    { id: "doctor-messages", label: "Worker Messages", href: "/dashboard/doctor/messages" }, // NEW
  ],
  worker: [
    { id: "worker-dashboard", label: "Dashboard", href: "/dashboard/worker" },
    { id: "worker-messages", label: "Patient Messages", href: "/dashboard/worker/messages" }, // NEW
  ],
  patient: [
    { id: "patient-dashboard", label: "Dashboard", href: "/dashboard/patient" },
    { id: "patient-contact", label: "Contact Worker", href: "/dashboard/patient/contact" }, // NEW
  ],
};


/* ---------------- UI COMPONENT ---------------- */

function SidebarLink({ href, label, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block px-3 py-2 rounded hover:bg-blue-50 text-gray-700"
    >
      {label}
    </a>
  );
}
