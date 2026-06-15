import { Shield, ShieldOff, Activity, Clock, Globe, Ban } from 'lucide-react';
import MetricCard from './MetricCard';
import { AppBreakdownPie, ProtocolBar } from './PacketChart';

export default function Dashboard({ report }) {
  if (!report) return null;
  const { summary, protocolBreakdown, applicationBreakdown, detectedDomains, blockedConnections, rulesApplied, durationMs } = report;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Packets" value={summary?.totalPackets?.toLocaleString()} icon={<Activity className="w-5 h-5" />} />
        <MetricCard title="Forwarded" value={summary?.forwarded?.toLocaleString()} icon={<Shield className="w-5 h-5 text-green-400" />} />
        <MetricCard title="Dropped" value={summary?.dropped?.toLocaleString()} icon={<ShieldOff className="w-5 h-5 text-red-400" />} subtitle={summary?.dropped > 0 ? `${((summary.dropped / summary.totalPackets) * 100).toFixed(1)}% blocked` : '0% blocked'} />
        <MetricCard title="Duration" value={durationMs ? `${(durationMs / 1000).toFixed(2)}s` : '—'} icon={<Clock className="w-5 h-5" />} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <AppBreakdownPie data={applicationBreakdown} />
        <ProtocolBar data={protocolBreakdown} />
      </div>

      {/* Detected Domains & Blocked Connections */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Detected Domains ({detectedDomains?.length || 0})</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {detectedDomains?.map((d, i) => (
              <div key={i} className="text-sm flex justify-between">
                <span className="text-gray-300">{d.domain}</span>
                <span className="text-indigo-400">{d.app}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2"><Ban className="w-4 h-4" /> Blocked Connections ({blockedConnections?.length || 0})</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {blockedConnections?.map((c, i) => (
              <div key={i} className="text-sm flex justify-between">
                <span className="text-gray-300">{c.srcIp} → {c.dstIp}</span>
                <span className="text-red-400">{c.app || c.domain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Applied */}
      {rulesApplied && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Rules Applied</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500">IPs:</span> <span className="text-gray-300">{(rulesApplied.blockedIps || []).join(', ') || 'none'}</span></div>
            <div><span className="text-gray-500">Apps:</span> <span className="text-gray-300">{(rulesApplied.blockedApps || []).join(', ') || 'none'}</span></div>
            <div><span className="text-gray-500">Domains:</span> <span className="text-gray-300">{(rulesApplied.blockedDomains || []).join(', ') || 'none'}</span></div>
            <div><span className="text-gray-500">Ports:</span> <span className="text-gray-300">{(rulesApplied.blockedPorts || []).join(', ') || 'none'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
