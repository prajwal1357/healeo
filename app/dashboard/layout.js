export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-6">Caresora</h2>

        <nav className="space-y-3 text-sm">
          <a href="/dashboard/admin">Admin</a>
          <a href="/dashboard/doctor">Doctor</a>
          <a href="/dashboard/helper">Helper</a>
          <a href="/dashboard/patient">Patient</a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
