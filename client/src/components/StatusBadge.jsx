const STATUS_STYLES = {
  'New Request': 'bg-orange-100 text-orange-700 border-orange-200',
  'Technician Assigned': 'bg-amber-100 text-amber-800 border-amber-200',
  Resolved: 'bg-green-100 text-green-700 border-green-200',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
