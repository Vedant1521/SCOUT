import { useState } from 'react';
import { Shield, FileSearch, Loader2, BarChart3 } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import Dashboard from '../components/Dashboard';
import { uploadPcap } from '../api/client';

export default function AnalyzerPage() {
  const [file, setFile] = useState(null);
  const [rules, setRules] = useState({ blockedIps: [], blockedApps: [], blockedDomains: [], blockedPorts: [] });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await uploadPcap(file, rules);
      setReport(result.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold">DPI Packet Analyzer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a .pcap capture file to analyze traffic, detect applications, and test blocking rules
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
              <FileSearch className="w-4 h-4" /> Upload Capture
            </h2>
            <UploadZone onFileSelected={setFile} />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Test Blocking Rules</h2>
            <AnalyzerRuleBuilder rules={rules} onChange={setRules} />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><BarChart3 className="w-4 h-4" /> Analyze Packet Capture</>}
          </button>
        </div>

        <div className="md:col-span-2">
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 text-sm mb-4">{error}</div>
          )}
          {loading && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
              <p className="text-gray-400">Running DPI analysis on packet capture…</p>
            </div>
          )}
          {report && <Dashboard report={report} />}
          {!report && !loading && !error && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-14 text-center">
              <Shield className="w-14 h-14 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500 text-sm">
                Drop a <span className="font-mono text-indigo-400">.pcap</span> file and configure test rules, then click Analyze
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
        <label className="text-xs text-gray-500 block mb-1.5">Blocked Domains (test)</label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
            placeholder="tiktok.com"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDomain()}
          />
          <button onClick={addDomain} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 text-sm">+</button>
        </div>
        {rules.blockedDomains.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {rules.blockedDomains.map(d => (
              <span key={d} className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                {d}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onChange({ ...rules, blockedDomains: rules.blockedDomains.filter(x => x !== d) })} />
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1.5">Blocked Apps (test)</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_APPS.map(app => (
            <button key={app} onClick={() => toggleApp(app)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                rules.blockedApps.includes(app) ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >{app}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
