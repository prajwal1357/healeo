export default function HelperDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Helper Dashboard</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Today’s Tasks</h2>
        <ul className="bg-white rounded border divide-y">
          <li className="p-3">Village A – BP Checks</li>
          <li className="p-3">Village B – New Patient Registration</li>
          <li className="p-3">Village C – Follow-up Visits</li>
        </ul>
      </section>

      <div className="flex gap-3">
        <button className="btn">Add Patient</button>
        <button className="btn">Record Vitals</button>
        <button className="btn">Sync Data</button>
      </div>
    </div>
  );
}
