import { useState, useEffect } from 'react';
import { ScrollText, Loader2, Ban, Globe, Wifi, DoorOpen } from 'lucide-react';
import { getLogs } from '../api/client';

const TYPE_ICONS = {
  domain: Globe,
  ip: Wifi,
  port: DoorOpen,
  app: Ban,
};

export default function LogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLogs(await getLogs(200));
    } catch {} finally { setLoading(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Block Log</h1>
          <p className="text-sm text-gray-500 mt-1">History of all blocking actions applied</p>
        </div>
        <button onClick={load} className="text-sm text-gray-400 hover:text-gray-200 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
          Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'domain', 'ip', 'port'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
              filter === f
                ? 'bg-indigo-600/20 border-indigo-600 text-indigo-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >{f === 'all' ? 'All Types' : f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-14 text-center">
          <ScrollText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500 text-sm">No block log entries yet</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Value</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const Icon = TYPE_ICONS[log.type] || Ban;
                  return (
                    <tr key={log.id || i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.action === 'add' ? 'bg-red-900/40 text-red-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-400 capitalize">{log.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-200">{log.value}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs ${
                          log.status === 'applied' ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500 text-xs">
                        {new Date(log.createdAt || log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
