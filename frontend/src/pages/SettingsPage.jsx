import { useState, useEffect } from 'react';
import { Shield, Info, Terminal, Loader2, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';
import { getStatus } from '../api/client';

export default function SettingsPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getStatus().then(s => setStatus(s)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function copy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">System status and configuration</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> System Status
        </h2>
        <div className="space-y-3">
          <StatusRow
            label="Administrator Privileges"
            ok={status?.admin}
            okText="Running as Admin"
            failText="Not running as Admin — blocking limited"
          />
          <StatusRow
            label="Hosts File Access"
            ok={status?.hostsFile}
            okText="Writable — domain blocking active"
            failText="Not writable — domain blocking unavailable"
          />
          <StatusRow
            label="Windows Firewall Access"
            ok={status?.firewall}
            okText="Accessible — IP/port blocking active"
            failText="Not accessible — IP/port blocking unavailable"
          />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-400">Domains Currently Blocked</span>
            <span className="text-sm font-mono text-gray-200">{status?.blockedDomains?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-400">Firewall Rules Active</span>
            <span className="text-sm font-mono text-gray-200">{status?.firewallRules?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" /> How to Run as Administrator
        </h2>
        <div className="space-y-3 text-sm text-gray-300">
          <p>For full blocking capabilities (hosts file + firewall), run the backend with admin privileges:</p>
          <div className="bg-gray-950 rounded-lg p-3 font-mono text-sm relative">
            <code># Open PowerShell as Administrator, then:<br/>cd {process.cwd()}<br/>cd backend<br/>node src/server.js</code>
            <button
              onClick={() => copy(`# Open PowerShell as Administrator, then:\ncd ${process.cwd()}\ncd backend\nnode src/server.js`)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-gray-400">Or run this shortcut as Administrator once to set it up:</p>
          <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs text-gray-400">
            <Terminal className="w-3.5 h-3.5 inline mr-1" />
            npm run dev (from project root)
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">How Blocking Works</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <Globe className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-gray-200 font-medium">Domain Blocking</span>
              <p>Adds entries to Windows hosts file (<code className="text-xs text-indigo-400">C:\Windows\System32\drivers\etc\hosts</code>), mapping blocked domains to <code className="text-xs text-indigo-400">0.0.0.0</code>. This prevents DNS resolution.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wifi className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-gray-200 font-medium">IP / Port Blocking</span>
              <p>Creates outbound Windows Firewall rules using <code className="text-xs text-indigo-400">netsh advfirewall</code> to block traffic to specific IPs or ports.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileSearch className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-gray-200 font-medium">DPI Analysis</span>
              <p>Upload .pcap captures to the DPI engine which inspects TLS SNI, HTTP Host headers, and DNS queries to classify traffic and test blocking rules before applying them live.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, okText, failText }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300">{ok ? okText : failText}</span>
        {ok ? (
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
        )}
      </div>
    </div>
  );
}
