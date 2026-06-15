import { useState, useEffect } from 'react';
import { ScrollText, Globe, Wifi, DoorOpen, Ban, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLogs } from '../api/client';
import { useToast } from '../components/Toast';
import { SkeletonPage } from '../components/Skeleton';

const TYPE_ICONS = { domain: Globe, ip: Wifi, port: DoorOpen, app: Ban };
const ITEMS_PER_PAGE = 15;

export default function LogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    try { setLogs(await getLogs(500)); }
    catch { addToast('Failed to load logs', 'error'); }
    finally { setLoading(false); }
  }

  if (loading) return <SkeletonPage />;

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Block Log</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>History of all blocking actions</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'domain', 'ip', 'port'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-full border capitalize transition-all duration-200"
            style={filter === f ? {
              background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981', color: '#10b981'
            } : {
              background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)'
            }}
          >{f === 'all' ? 'All Types' : f}</button>
        ))}
      </div>

      {paged.length === 0 ? (
        <div className="glass p-14 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
            <ScrollText className="w-7 h-7" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No log entries</p>
        </div>
      ) : (
        <>
          <div className="glass overflow-hidden page-enter">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Action</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Value</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((log, i) => {
                    const Icon = TYPE_ICONS[log.type] || Ban;
                    return (
                      <tr key={log.id || i} className="glass-hover" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={log.action === 'add' ? { background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' } : { background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{log.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{log.value}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs" style={{ color: log.status === 'applied' ? '#10b981' : 'var(--text-muted)' }}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt || log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs px-3 py-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
