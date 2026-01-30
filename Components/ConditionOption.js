// Components/ConditionOption.js

export default function ConditionOption({ label, value, emoji, selected, onSelect }) {
  const isActive = selected === value;

  // Define colors based on the condition level
  const statusColors = {
    stable: "border-green-500 bg-green-50 text-green-700",
    attention: "border-yellow-500 bg-yellow-50 text-yellow-700",
    critical: "border-red-500 bg-red-50 text-red-700",
  };

  return (
    <button
      type="button" // Important: prevents form from submitting when clicked
      onClick={() => onSelect(value)}
      className={`
        flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
        ${isActive 
          ? `${statusColors[value]} shadow-md scale-105` 
          : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
        }
      `}
    >
      <span className="text-2xl mb-1">{emoji}</span>
      <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}