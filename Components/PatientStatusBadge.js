export default function PatientStatusBadge({ workerChecked, doctorChecked }) {
  if (!workerChecked) {
    return <span className="text-yellow-600">🟡 Awaiting Worker</span>;
  }

  if (workerChecked && !doctorChecked) {
    return <span className="text-orange-600">🟠 Awaiting Doctor</span>;
  }

  return <span className="text-green-600">🟢 Completed</span>;
}
