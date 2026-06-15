import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e', '#ec4899', '#3b82f6', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>
      {payload[0].name || payload[0].payload?.app}: <span className="font-semibold">{payload[0].value}</span>
    </div>
  );
};

export function AppBreakdownPie({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Application Breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="packets"
            nameKey="app"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            strokeWidth={0}
            label={({ app, percent }) => `${app} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProtocolBar({ data }) {
  if (!data) return null;
  const items = [
    { name: 'TCP', value: data.tcp ?? 0 },
    { name: 'UDP', value: data.udp ?? 0 },
    { name: 'Other', value: data.other ?? 0 },
  ];
  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Protocol Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={items}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {items.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
