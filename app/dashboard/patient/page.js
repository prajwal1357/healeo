export default function PatientDashboard() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Health</h1>
        <p className="text-gray-600 text-sm">
          Your recent health information and checkups
        </p>
      </div>

      {/* Health Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthCard title="Blood Pressure" value="120 / 80" status="Normal" />
        <HealthCard title="Blood Sugar" value="98 mg/dL" status="Normal" />
        <HealthCard title="Heart Rate" value="72 bpm" status="Good" />
        <HealthCard title="BMI" value="22.4" status="Healthy" />
      </section>

      {/* Next Visit */}
      <section className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Next Medical Visit</h2>
        <p className="text-sm text-gray-700">
          📅 <strong>20 Feb 2026</strong>
        </p>
        <p className="text-sm text-gray-700">
          👨‍⚕️ Doctor: Dr. Anil Kumar
        </p>
        <p className="text-sm text-gray-700">
          📍 Location: Primary Health Center, Beng Village
        </p>
      </section>

      {/* Recent Checkups */}
      <section>
        <h2 className="font-semibold mb-3">Recent Checkups</h2>
        <div className="bg-white border rounded divide-y">
          <Record
            date="12 Jan 2026"
            title="General Health Checkup"
            note="All vitals normal"
          />
          <Record
            date="28 Dec 2025"
            title="Blood Sugar Test"
            note="Slightly high, reduce sugar intake"
          />
          <Record
            date="10 Dec 2025"
            title="Blood Pressure Check"
            note="Normal"
          />
        </div>
      </section>

      {/* Doctor Advice */}
      <section className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Doctor’s Advice</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Walk at least 30 minutes daily</li>
          <li>Reduce salt and sugar intake</li>
          <li>Take prescribed medicines regularly</li>
        </ul>
      </section>

    </div>
  );
}

/* ---------------- Components ---------------- */

function HealthCard({ title, value, status }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-green-600">{status}</p>
    </div>
  );
}

function Record({ date, title, note }) {
  return (
    <div className="p-4">
      <p className="text-sm text-gray-500">{date}</p>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-600">{note}</p>
    </div>
  );
}
