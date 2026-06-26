const COLOR_MAP = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  yellow: 'bg-amber-50 border-amber-200 text-amber-800',
  green: 'bg-green-50 border-green-200 text-green-700',
};

export default function StatCard({ label, value, color = 'blue' }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colors}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
