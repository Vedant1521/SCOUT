import { useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import { getRules, addRule, toggleRule, deleteRule, getStatus } from '../api/client';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonPage } from '../components/Skeleton';

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
  const [search, setSearch] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newPort, setNewPort] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [r, s] = await Promise.all([getRules(), getStatus()]);
      setRules(r);
      setIsAdmin(s.admin);
    }
    catch { addToast('Failed to load rules', 'error'); }
    finally { setLoading(false); }
  }

  async function handleAdd(type, value) {
    if (!value.trim()) return;
    try {
      const res = await addRule(type, value);
      if (res.success) {
        addToast(`Blocked ${value}`, 'success');
        setNewDomain(''); setNewIp(''); setNewPort('');
        load();
      } else {
        addToast(res.error || 'Failed to add rule', 'error');
      }
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleToggle(id, current) {
    try {
      await toggleRule(id, !current);
      addToast(current ? 'Rule disabled' : 'Rule enabled', 'info');
      load();
    } catch { addToast('Failed to toggle rule', 'error'); }
  }

  function handleDeleteClick(rule) {
    setConfirm(rule);
  }

  async function handleConfirmDelete() {
    if (!confirm) return;
    try {
      await deleteRule(confirm.id);
      addToast(`Removed ${confirm.value}`, 'success');
      load();
    } catch { addToast('Failed to delete rule', 'error'); }
    setConfirm(null);
  }

  async function handlePreset(app) {
    const exists = rules.some(r => r.type === 'domain' && r.value === app.domain && r.enabled);
    if (exists) { addToast(`${app.name} is already blocked`, 'error'); return; }
    try {
      const res = await addRule('domain', app.domain, 'preset');
      if (res.success) { addToast(`Blocking ${app.name}`, 'success'); load(); }
      else addToast(res.error || 'Failed', 'error');
    } catch (err) { addToast(err.message, 'error'); }
  }

  if (loading) return <SkeletonPage />;

  const filtered = search
    ? rules.filter(r => r.value.toLowerCase().includes(search.toLowerCase()))
    : rules;

  const domainRules = filtered.filter(r => r.type === 'domain');
  const ipRules = filtered.filter(r => r.type === 'ip');
  const portRules = filtered.filter(r => r.type === 'port');

  return (
    <div className="space-y-6 max-w-4xl page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Blocking Rules</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage domains, IPs, and ports to block</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="glass p-3 flex items-center gap-3 border border-amber-500/30" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
          <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Not running as admin — re-blocked sites may still open due to browser DNS caching. Run <code className="text-xs text-accent">start.bat</code> as admin for full protection.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          className="input-glass pl-10 pr-10"
          placeholder="Search rules..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="glass p-5 page-enter stagger-1">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Quick Block — Popular Apps</h2>
        <div className="flex flex-wrap gap-2">
          {PRESET_APPS.map(app => {
            const blocked = rules.some(r => r.type === 'domain' && r.value === app.domain && r.enabled);
            return (
              <button
                key={app.name}
                onClick={() => handlePreset(app)}
                disabled={blocked}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  blocked ? 'cursor-default' : 'hover:scale-105'
                }`}
                style={blocked ? {
                  background: 'rgba(244, 63, 94, 0.15)',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e',
                } : {
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {blocked ? `${app.name} ✓` : `Block ${app.name}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Domains */}
      <div className="glass p-5 page-enter stagger-2">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Domain Blocking (Hosts File)</h2>
        <div className="flex gap-2 mb-4">
          <input
            className="input-glass flex-1"
            placeholder="example.com"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd('domain', newDomain)}
          />
          <button onClick={() => handleAdd('domain', newDomain)} className="btn-primary flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <RuleList rules={domainRules} onToggle={handleToggle} onDelete={handleDeleteClick} />
      </div>

      {/* IP + Port */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-5 page-enter stagger-3">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>IP Blocking (Firewall)</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="input-glass flex-1"
              placeholder="192.168.1.50"
              value={newIp}
              onChange={e => setNewIp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd('ip', newIp)}
            />
            <button onClick={() => handleAdd('ip', newIp)} className="btn-primary"><Plus className="w-4 h-4" /></button>
          </div>
          <RuleList rules={ipRules} onToggle={handleToggle} onDelete={handleDeleteClick} />
        </div>

        <div className="glass p-5 page-enter stagger-4">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Port Blocking (Firewall)</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="input-glass flex-1"
              placeholder="443"
              type="number"
              min="1"
              max="65535"
              value={newPort}
              onChange={e => setNewPort(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd('port', newPort)}
            />
            <button onClick={() => handleAdd('port', newPort)} className="btn-primary"><Plus className="w-4 h-4" /></button>
          </div>
          <RuleList rules={portRules} onToggle={handleToggle} onDelete={handleDeleteClick} />
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Delete Rule"
        message={`Remove "${confirm?.value}"? This will unblock it on your system.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function RuleList({ rules, onToggle, onDelete }) {
  if (rules.length === 0) return (
    <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No rules</p>
  );
  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto">
      {rules.map(rule => (
        <div
          key={rule.id}
          className="flex items-center justify-between py-2 px-3 rounded-lg glass-hover"
          style={{ opacity: rule.enabled ? 1 : 0.5 }}
        >
          <span className="text-sm font-mono" style={{ color: rule.enabled ? 'var(--text-primary)' : 'var(--text-muted)', textDecoration: rule.enabled ? 'none' : 'line-through' }}>
            {rule.value}
            {rule.category === 'ads' && <span className="text-xs ml-2 opacity-50">(ads)</span>}
            {rule.category === 'preset' && <span className="text-xs ml-2 opacity-50">(preset)</span>}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggle(rule.id, rule.enabled)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: rule.enabled ? '#10b981' : 'var(--text-muted)' }}
              title={rule.enabled ? 'Disable' : 'Enable'}
            >
              {rule.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={() => onDelete(rule)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
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
