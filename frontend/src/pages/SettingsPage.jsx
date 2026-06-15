import { useState, useEffect } from 'react';
import { Shield, Info, Terminal, CheckCircle2, AlertTriangle, Globe, Wifi, FileSearch, Copy } from 'lucide-react';
import { getStatus } from '../api/client';
import { useToast } from '../components/Toast';
import { SkeletonPage } from '../components/Skeleton';

export default function SettingsPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    getStatus().then(s => setStatus(s)).catch(() => addToast('Failed to load status', 'error')).finally(() => setLoading(false));
  }, [addToast]);

  function copy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Copied to clipboard', 'info');
    });
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6 max-w-3xl page-enter">
      {!status?.admin && (
        <div className="glass p-4 border border-amber-500/30 page-enter" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber">Administrator Privileges Required</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Without admin rights, blocked sites may still open in your browser after being re-added.
                The browser caches DNS lookups and only a firewall rule (which requires admin) can block them at the IP level.
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                <strong>Fix:</strong> Close this app, right-click <code className="text-xs text-accent">start.bat</code> and choose "Run as administrator".
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>System status and configuration</p>
      </div>

      <div className="glass p-5 page-enter stagger-1">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <Shield className="w-4 h-4" /> System Status
        </h2>
        <div className="space-y-1">
          <StatusRow label="Administrator Privileges" ok={status?.admin} okText="Running as Admin" failText="Not running as Admin" />
          <StatusRow label="Hosts File Access" ok={status?.hostsFile} okText="Writable" failText="Not writable" />
          <StatusRow label="Windows Firewall" ok={status?.firewall} okText="Accessible" failText="Not accessible" />
          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Domains Blocked</span>
            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{status?.blockedDomains?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Firewall Rules</span>
            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{status?.firewallRules?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="glass p-5 page-enter stagger-2">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <Terminal className="w-4 h-4" /> Run as Administrator
        </h2>
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>For full blocking, restart the backend with admin privileges:</p>
          <div className="relative rounded-xl p-3 font-mono text-xs" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}>
            <pre className="whitespace-pre-wrap">{'# Open PowerShell as Administrator, then:\ncd "C:\\Projects Placements\\DPI-Modified\\Packet_analyzer\\backend"\nnode src/server.js'}</pre>
            <button
              onClick={() => copy('cd "C:\\Projects Placements\\DPI-Modified\\Packet_analyzer\\backend"\nnode src/server.js')}
              className="absolute top-2 right-2 p-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="glass p-5 page-enter stagger-3">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <Info className="w-4 h-4" /> How Blocking Works
        </h2>
        <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <Globe className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Domain Blocking</span>
              <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Maps blocked domains to <code className="text-xs text-accent">127.0.0.1</code> in the hosts file. Both the bare domain and <code className="text-xs text-accent">www.</code> subdomain are blocked automatically.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <Wifi className="w-4 h-4 text-purple" />
            </div>
            <div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>IP / Port Blocking</span>
              <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Creates outbound Windows Firewall rules via <code className="text-xs text-accent">netsh advfirewall</code> to drop packets.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <FileSearch className="w-4 h-4 text-emerald" />
            </div>
            <div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>DPI Analysis</span>
              <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Inspects TLS SNI, HTTP Host headers, and DNS queries in .pcap captures to classify traffic and test rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, okText, failText }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ borderBottom: '1px solid var(--glass-border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{ok ? okText : failText}</span>
        {ok ? <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber shrink-0" />}
      </div>
    </div>
  );
}
