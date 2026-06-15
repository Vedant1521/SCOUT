export default function MetricCard({ title, value, subtitle, icon, color = 'emerald' }) {
  const accents = {
    emerald: '#10b981',
    rose: '#f43f5e',
    purple: '#8b5cf6',
    amber: '#f59e0b',
    cyan: '#06b6d4',
  };

  return (
    <div className="glass glass-hover p-5">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accents[color]}12`, color: accents[color] }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</div>
          <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</div>
          {subtitle && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
