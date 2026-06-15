import { useState, useEffect, useCallback } from 'react';
import { Globe, Ban, Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { getStatus, getRules, getLogs } from '../api/client';
import { useToast } from '../components/Toast';
import { SkeletonPage } from '../components/Skeleton';
import MetricCard from '../components/MetricCard';

export default function DashboardPage() {
  const [status, setStatus] = useState(null);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  const loadData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const [s, r, l] = await Promise.all([getStatus(), getRules(), getLogs(50)]);
      setStatus(s);
      setRules(r);
      setLogs(l);
    } catch (err) {
      if (!silent) addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) return <SkeletonPage />;

  const enabledRules = rules.filter(r => r.enabled);
  const recentBlocks = logs.filter(l => l.status === 'applied').slice(0, 5);

  return (
    <div className="space-y-6 page-enter">
      {!status?.admin && (
        <div className="glass p-3 flex items-center gap-3 border border-amber-500/30" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
          <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Not running as admin — re-blocked sites may still open. Close and re-launch <code className="text-xs text-accent">start.bat</code> as admin for full protection.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Real-time status of your Deep Packet Inspection website blocker</p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="btn-ghost flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="page-enter stagger-1">
          <MetricCard title="Domains Blocked" value={status?.blockedDomains?.length || 0} icon={<Globe className="w-5 h-5" />} color="cyan" />
        </div>
        <div className="page-enter stagger-2">
          <MetricCard title="Active Rules" value={enabledRules.length} icon={<Ban className="w-5 h-5" />} color="rose" />
        </div>
        <div className="page-enter stagger-3">
          <MetricCard title="Firewall Rules" value={status?.firewallRules?.length || 0} icon={<Activity className="w-5 h-5" />} color="purple" />
        </div>
        <div className="page-enter stagger-4">
          <MetricCard
            title="Admin Status"
            value={status?.admin ? 'Active' : 'Limited'}
            icon={status?.admin ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            color={status?.admin ? 'emerald' : 'rose'}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-5 page-enter stagger-2">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Globe className="w-4 h-4 text-accent" /> Blocked Domains
          </h2>
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {status?.blockedDomains?.length > 0 ? status.blockedDomains.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg glass-hover">
                <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{d}</span>
                <div className="w-2 h-2 rounded-full bg-rose animate-pulse" />
              </div>
            )) : (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>No domains blocked yet</p>
            )}
          </div>
        </div>

        <div className="glass p-5 page-enter stagger-3">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Activity className="w-4 h-4 text-purple" /> Recent Activity
          </h2>
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {recentBlocks.length > 0 ? recentBlocks.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg glass-hover">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {log.type}: <span style={{ color: 'var(--text-primary)' }}>{log.value}</span>
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            )) : (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {!status?.admin && (
        <div className="glass p-4 flex items-start gap-3 page-enter" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <AlertTriangle className="w-5 h-5 text-rose shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium" style={{ color: '#f43f5e' }}>Limited functionality</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Run the backend as Administrator to enable hosts file and firewall blocking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
