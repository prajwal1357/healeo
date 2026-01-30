export default function DoctorDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Patients Needing Review</h2>
        <ul className="bg-white rounded border divide-y">
          <li className="p-3">Ramesh – High BP</li>
          <li className="p-3">Anita – Diabetes follow-up</li>
          <li className="p-3">Kiran – Abnormal ECG</li>
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Quick Actions</h2>
        <div className="flex gap-3">
          <button className="btn">Review Reports</button>
          <button className="btn">Prescriptions</button>
          <button className="btn">Consultation Notes</button>
        </div>
      </section>
    </div>
  );
}
