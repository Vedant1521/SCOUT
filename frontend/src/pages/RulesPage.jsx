import { useState, useEffect } from 'react';
import { Plus, X, ToggleLeft, ToggleRight, Trash2, Loader2 } from 'lucide-react';
import { getRules, addRule, toggleRule, deleteRule } from '../api/client';

const PRESET_APPS = [
  { name: 'YouTube', domain: 'youtube.com' },
  { name: 'Facebook', domain: 'facebook.com' },
  { name: 'TikTok', domain: 'tiktok.com' },
  { name: 'Twitter/X', domain: 'x.com' },
  { name: 'Instagram', domain: 'instagram.com' },
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'Discord', domain: 'discord.com' },
  { name: 'Telegram', domain: 'telegram.org' },
  { name: 'Zoom', domain: 'zoom.us' },
  { name: 'Reddit', domain: 'reddit.com' },
  { name: 'Twitch', domain: 'twitch.tv' },
];

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newPort, setNewPort] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await getRules();
      setRules(r);
    } catch {} finally { setLoading(false); }
  }

  function showMsg(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAdd(type, value) {
    if (!value.trim()) return;
    try {
      const res = await addRule(type, value);
      if (res.success) {
        showMsg(`Blocked ${value}`);
        setNewDomain(''); setNewIp(''); setNewPort('');
        load();
      } else {
        showMsg(res.error || 'Failed to add rule', 'error');
      }
    } catch (err) {
      showMsg(err.message, 'error');
    }
  }

  async function handleToggle(id, current) {
    try {
      await toggleRule(id, !current);
      load();
    } catch {}
  }

  async function handleDelete(id, value) {
    try {
      await deleteRule(id);
      showMsg(`Removed ${value}`);
      load();
    } catch {}
  }

  async function handlePreset(app) {
    try {
      const exists = rules.some(r => r.type === 'domain' && r.value === app.domain && r.enabled);
      if (exists) {
        showMsg(`${app.name} is already blocked`, 'error');
        return;
      }
      const res = await addRule('domain', app.domain, 'preset');
      if (res.success) {
        showMsg(`Blocking ${app.name}`);
        load();
      } else {
        showMsg(res.error || 'Failed to block (needs admin)', 'error');
      }
    } catch (err) {
      showMsg(err.message, 'error');
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );

  const domainRules = rules.filter(r => r.type === 'domain');
  const ipRules = rules.filter(r => r.type === 'ip');
  const portRules = rules.filter(r => r.type === 'port');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold">Blocking Rules</h1>
        <p className="text-sm text-gray-500 mt-1">Manage domains, IPs, and ports to block on this device</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm ${
          message.type === 'error'
            ? 'bg-red-900/30 border border-red-800 text-red-300'
            : 'bg-green-900/30 border border-green-800 text-green-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">Quick Block — Popular Apps</h2>
        <div className="flex flex-wrap gap-2">
          {PRESET_APPS.map(app => {
            const blocked = domainRules.some(r => r.value === app.domain && r.enabled);
            return (
              <button
                key={app.name}
                onClick={() => handlePreset(app)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  blocked
                    ? 'bg-red-900/40 border-red-700 text-red-300 cursor-default'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
                disabled={blocked}
              >
                {blocked ? `${app.name} (Blocked)` : `Block ${app.name}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">Domain Blocking (via Hosts File)</h2>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            placeholder="example.com"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd('domain', newDomain)}
          />
          <button
            onClick={() => handleAdd('domain', newDomain)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <RuleList rules={domainRules} onToggle={handleToggle} onDelete={handleDelete} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">IP Blocking (via Firewall)</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              placeholder="192.168.1.50"
              value={newIp}
              onChange={e => setNewIp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd('ip', newIp)}
            />
            <button
              onClick={() => handleAdd('ip', newIp)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <RuleList rules={ipRules} onToggle={handleToggle} onDelete={handleDelete} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">Port Blocking (via Firewall)</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              placeholder="443"
              type="number"
              value={newPort}
              onChange={e => setNewPort(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd('port', newPort)}
            />
            <button
              onClick={() => handleAdd('port', newPort)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <RuleList rules={portRules} onToggle={handleToggle} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

function RuleList({ rules, onToggle, onDelete }) {
  if (rules.length === 0) return <p className="text-gray-500 text-sm py-4 text-center">No rules yet</p>;
  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto">
      {rules.map(rule => (
        <div
          key={rule.id}
          className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
            rule.enabled ? 'bg-gray-800/50' : 'bg-gray-800/20 opacity-50'
          }`}
        >
          <span className={rule.enabled ? 'text-gray-200' : 'text-gray-500 line-through'}>
            {rule.value}
            {rule.category === 'ads' && <span className="text-xs text-gray-500 ml-2">(ads)</span>}
            {rule.category === 'preset' && <span className="text-xs text-gray-500 ml-2">(preset)</span>}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(rule.id, rule.enabled)}
              className={`p-1 rounded transition-colors ${
                rule.enabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'
              }`}
              title={rule.enabled ? 'Disable' : 'Enable'}
            >
              {rule.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(rule.id, rule.value)}
              className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
