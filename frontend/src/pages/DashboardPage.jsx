import { useState, useEffect } from 'react';
import {
  Shield, ShieldOff, Globe, Ban, Activity, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { getStatus, getRules, getLogs } from '../api/client';

export default function DashboardPage() {
  const [status, setStatus] = useState(null);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStatus(), getRules(), getLogs(50)])
      .then(([s, r, l]) => { setStatus(s); setRules(r); setLogs(l); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );

  const enabledRules = rules.filter(r => r.enabled);
  const recentBlocks = logs.filter(l => l.status === 'applied').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time status of your DPI-based website blocker</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-sm text-gray-400">Domains Blocked</div>
              <div className="text-2xl font-bold">{status?.blockedDomains?.length || 0}</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Ban className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-sm text-gray-400">Active Rules</div>
              <div className="text-2xl font-bold">{enabledRules.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm text-gray-400">Firewall Rules</div>
              <div className="text-2xl font-bold">{status?.firewallRules?.length || 0}</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            {status?.admin ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
            <div>
              <div className="text-sm text-gray-400">Admin Status</div>
              <div className="text-2xl font-bold">{status?.admin ? 'Active' : 'Limited'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Blocked Domains
          </h2>
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {status?.blockedDomains?.length > 0 ? status.blockedDomains.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-gray-800/50">
                <span className="text-gray-300">{d}</span>
                <ShieldOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
              </div>
            )) : (
              <p className="text-gray-500 text-sm py-4 text-center">No domains blocked yet</p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Activity
          </h2>
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {recentBlocks.length > 0 ? recentBlocks.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-gray-800/50">
                <span className="text-gray-400">{log.type}: <span className="text-gray-200">{log.value}</span></span>
                <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm py-4 text-center">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {!status?.admin && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Limited functionality</p>
            <p className="text-sm text-yellow-400/70 mt-1">
              Run the backend as Administrator to enable hosts file and firewall blocking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
