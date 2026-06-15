import { useState } from 'react';
import { Plus, X, Shield, Globe, AppWindow, DoorOpen } from 'lucide-react';

const PRESET_APPS = ['YouTube', 'Facebook', 'TikTok', 'Twitter', 'Instagram', 'Netflix', 'Spotify', 'Discord', 'Telegram', 'Zoom'];

export default function RuleBuilder({ rules, onChange }) {
  const [newIp, setNewIp] = useState('');
  const [newDomain, setNewDomain] = useState('');

  function addIp() {
    if (newIp && !rules.blockedIps.includes(newIp)) {
      onChange({ ...rules, blockedIps: [...rules.blockedIps, newIp] });
      setNewIp('');
    }
  }

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

  function addPort(e) {
    const port = parseInt(e.target.value);
    if (!isNaN(port) && port > 0 && port < 65536 && !rules.blockedPorts.includes(port)) {
      onChange({ ...rules, blockedPorts: [...rules.blockedPorts, port] });
    }
    e.target.value = '';
  }

  return (
    <div className="space-y-5">
      {/* Blocked IPs */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"><Shield className="w-4 h-4" /> Blocked IPs</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {rules.blockedIps.map((ip) => (
            <span key={ip} className="inline-flex items-center gap-1 bg-red-900/40 text-red-300 text-xs px-2 py-1 rounded-full">
              {ip}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onChange({ ...rules, blockedIps: rules.blockedIps.filter(i => i !== ip) })} />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm" placeholder="192.168.1.50" value={newIp} onChange={e => setNewIp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIp()} />
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1.5" onClick={addIp}><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Blocked Apps */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"><AppWindow className="w-4 h-4" /> Blocked Apps</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_APPS.map((app) => (
            <button key={app} onClick={() => toggleApp(app)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              rules.blockedApps.includes(app) ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}>
              {app}
            </button>
          ))}
        </div>
      </div>

      {/* Blocked Domains */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"><Globe className="w-4 h-4" /> Blocked Domains</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {rules.blockedDomains.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 bg-red-900/40 text-red-300 text-xs px-2 py-1 rounded-full">
              {d}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onChange({ ...rules, blockedDomains: rules.blockedDomains.filter(x => x !== d) })} />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm" placeholder="tiktok.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDomain()} />
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1.5" onClick={addDomain}><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Blocked Ports */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"><DoorOpen className="w-4 h-4" /> Blocked Ports</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {rules.blockedPorts.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 bg-red-900/40 text-red-300 text-xs px-2 py-1 rounded-full">
              :{p}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onChange({ ...rules, blockedPorts: rules.blockedPorts.filter(x => x !== p) })} />
            </span>
          ))}
        </div>
        <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm" placeholder="Enter port number (e.g. 443) and press Enter" onKeyDown={e => e.key === 'Enter' && addPort(e)} />
      </div>
    </div>
  );
}
