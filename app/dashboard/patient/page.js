export default function PatientDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HealthCard title="Blood Pressure" value="120 / 80" />
        <HealthCard title="Blood Sugar" value="95 mg/dL" />
        <HealthCard title="Last Checkup" value="10 Jan 2026" />
        <HealthCard title="Next Visit" value="05 Feb 2026" />
      </div>

      <section className="mt-8">
        <h2 className="font-semibold mb-2">Health History</h2>
        <ul className="bg-white rounded border divide-y">
          <li className="p-3">BP Check – Normal</li>
          <li className="p-3">Sugar Test – Normal</li>
          <li className="p-3">Doctor Consultation</li>
        </ul>
      </section>
    </div>
  );
}

function HealthCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
