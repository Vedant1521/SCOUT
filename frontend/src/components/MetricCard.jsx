export default function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      {icon && <div className="text-indigo-400">{icon}</div>}
      <div>
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-2xl font-bold">{value ?? '—'}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
}
