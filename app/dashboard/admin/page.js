export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Total Patients" value="1,540" />
        <Stat title="Doctors" value="12" />
        <Stat title="Helpers" value="46" />
        <Stat title="Villages Covered" value="82" />
      </div>

      <section className="mt-8">
        <h2 className="font-semibold mb-3">System Controls</h2>
        <div className="flex gap-3">
          <button className="btn">Manage Users</button>
          <button className="btn">Assign Roles</button>
          <button className="btn">View Reports</button>
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
