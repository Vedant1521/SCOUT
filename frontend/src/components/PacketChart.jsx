import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];

export function AppBreakdownPie({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Application Breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="packets" nameKey="app" cx="50%" cy="50%" outerRadius={90} label={({ app, percent }) => `${app} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Protocol Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={items}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
