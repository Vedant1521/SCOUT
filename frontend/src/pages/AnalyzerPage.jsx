import { useState } from 'react';
import { Shield, FileSearch, Loader2, BarChart3, X } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import Dashboard from '../components/Dashboard';
import { useToast } from '../components/Toast';
import { uploadPcap } from '../api/client';

export default function AnalyzerPage() {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState({ blockedIps: [], blockedApps: [], blockedDomains: [], blockedPorts: [] });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await uploadPcap(file, rules);
      setReport(result.report);
      addToast('Analysis complete', 'success');
    } catch (err) {
      setError(err.message);
      addToast('Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>DPI Packet Analyzer</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload a .pcap capture to analyze traffic and test blocking rules
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-5">
          <div className="glass p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <FileSearch className="w-4 h-4" /> Upload Capture
            </h2>
            <UploadZone onFileSelected={setFile} />
          </div>

          <div className="glass p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Test Blocking Rules</h2>
            <AnalyzerRuleBuilder rules={rules} onChange={setRules} />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><BarChart3 className="w-4 h-4" /> Analyze</>}
          </button>
        </div>

        <div className="md:col-span-2">
          {error && (
            <div className="glass p-4 mb-4 flex items-center gap-3" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <X className="w-4 h-4 text-rose shrink-0" />
              <span className="text-sm" style={{ color: '#f43f5e' }}>{error}</span>
            </div>
          )}
          {loading && (
            <div className="glass p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-accent" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Running DPI analysis…</p>
            </div>
          )}
          {report && <Dashboard report={report} />}
          {!report && !loading && !error && (
            <div className="glass p-14 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                <Shield className="w-8 h-8" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Drop a <span className="font-mono text-accent">.pcap</span> file and click Analyze
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyzerRuleBuilder({ rules, onChange }) {
  const [newDomain, setNewDomain] = useState('');
  const PRESET_APPS = ['YouTube', 'Facebook', 'TikTok', 'Twitter', 'Instagram', 'Netflix', 'Spotify', 'Discord', 'Telegram', 'Zoom'];

  function addDomain() {
    if (newDomain && !rules.blockedDomains.includes(newDomain)) {
      onChange({ ...rules, blockedDomains: [...rules.blockedDomains, newDomain] });
      setNewDomain('');
    }
  }

  function toggleApp(app) {
    const set = new Set(rules.blockedApps);
    set.has(app) ? set.delete(app) : set.add(app);
    onChange({ ...rules, blockedApps: [...set] });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs block mb-1.5" style={{ color: 'var(--text-muted)' }}>Blocked Domains</label>
        <div className="flex gap-2">
          <input
            className="input-glass flex-1"
            placeholder="tiktok.com"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDomain()}
          />
          <button onClick={addDomain} className="btn-primary px-3">+</button>
        </div>
        {rules.blockedDomains.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {rules.blockedDomains.map(d => (
              <span key={d} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                {d}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onChange({ ...rules, blockedDomains: rules.blockedDomains.filter(x => x !== d) })} />
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs block mb-1.5" style={{ color: 'var(--text-muted)' }}>Blocked Apps</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_APPS.map(app => (
            <button key={app} onClick={() => toggleApp(app)}
              className="text-xs px-2.5 py-1 rounded-full border transition-all duration-200"
              style={rules.blockedApps.includes(app) ? {
                background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e'
              } : {
                background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)'
              }}
            >{app}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
