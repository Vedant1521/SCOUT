import { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, Play, Lock, Save, X, Loader2, Shield, Square, CheckCircle2, Circle } from 'lucide-react';
import { getProfiles, createProfile, deleteProfile, activateProfile, deactivateProfile, getActiveProfile, saveCurrentAsProfile, getRules } from '../api/client';
import { useToast } from '../components/Toast';
import { SkeletonPage } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSaveCurrent, setShowSaveCurrent] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedRules, setSelectedRules] = useState([]);
  const { addToast } = useToast();

  async function load() {
    try {
      const [p, r, a] = await Promise.all([getProfiles(), getRules(), getActiveProfile()]);
      setProfiles(p);
      setRules(r);
      setActiveProfileId(a.activeProfileId);
    } catch {
      addToast('Failed to load profiles', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleActivate(profile) {
    setActivating(profile.id);
    try {
      const res = await activateProfile(profile.id);
      if (res.success) {
        setActiveProfileId(profile.id);
        addToast(`${profile.name} activated — ${res.appliedCount} rules applied`, 'success');
        load();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActivating(null);
    }
  }

  async function handleDeactivate(profile) {
    setDeactivating(profile.id);
    try {
      const res = await deactivateProfile(profile.id);
      if (res.success) {
        setActiveProfileId(null);
        addToast(`${profile.name} deactivated — ${res.removedCount} rules removed`, 'success');
        load();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeactivating(null);
    }
  }

  async function handleDelete() {
    try {
      await deleteProfile(confirm.id);
      addToast('Profile deleted', 'success');
      load();
    } catch (err) {
      addToast(err.message, 'error');
    }
    setConfirm(null);
  }

  async function handleCreate() {
    if (!newName.trim()) { addToast('Name required', 'error'); return; }
    const rulesDefs = selectedRules.map(id => {
      const r = rules.find(x => x.id === id);
      return r ? { type: r.type, value: r.value } : null;
    }).filter(Boolean);

    try {
      await createProfile(newName.trim(), newDesc.trim(), rulesDefs);
      addToast(`Profile "${newName.trim()}" created`, 'success');
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setSelectedRules([]);
      load();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleSaveCurrent() {
    if (!newName.trim()) { addToast('Name required', 'error'); return; }
    try {
      await saveCurrentAsProfile(newName.trim(), newDesc.trim());
      addToast(`Current rules saved as "${newName.trim()}"`, 'success');
      setShowSaveCurrent(false);
      setNewName('');
      setNewDesc('');
      load();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function toggleRuleSelection(id) {
    setSelectedRules(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6 max-w-4xl page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Rule Profiles</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Save and switch between blocking configurations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowSaveCurrent(true); setNewName(''); setNewDesc(''); }}
            className="inline-flex items-center gap-2 rounded-full text-sm font-medium h-9 px-4 transition-all border shadow-xs hover:bg-muted/50"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
          >
            <Save className="w-4 h-4" /> Save Current
          </button>
          <button
            onClick={() => { setShowCreate(true); setNewName(''); setNewDesc(''); setSelectedRules([]); }}
            className="inline-flex items-center gap-2 rounded-full text-sm font-medium h-9 px-4 transition-all bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Create Profile
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-xl p-5 space-y-4" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>New Profile</h2>
            <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
          </div>
          <input
            className="input-glass"
            placeholder="Profile name (e.g. Work Mode)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input
            className="input-glass"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Select rules to include:</p>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg p-2" style={{ background: 'var(--input-bg)' }}>
              {rules.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No rules exist yet. Add rules in the Blocking Rules tab first.</p>}
              {rules.map(r => (
                <label key={r.id} className="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={selectedRules.includes(r.id)}
                    onChange={() => toggleRuleSelection(r.id)}
                    className="accent-emerald-500"
                  />
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>[{r.type}]</span>
                  <span>{r.value}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Profile</button>
          </div>
        </div>
      )}

      {showSaveCurrent && (
        <div className="rounded-xl p-5 space-y-4" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Save Current Rules as Profile</h2>
            <button onClick={() => setShowSaveCurrent(false)} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {rules.filter(r => r.enabled).length} active rules will be saved to this profile.
          </p>
          <input
            className="input-glass"
            placeholder="Profile name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input
            className="input-glass"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowSaveCurrent(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSaveCurrent} className="btn-primary">Save Profile</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map(profile => {
          const isActive = activeProfileId === profile.id;
          return (
          <div
            key={profile.id}
            className="rounded-xl p-5 flex flex-col gap-3 transition-all"
            style={{
              border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--glass-border)',
              background: isActive ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass-bg)',
              boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.1)' : 'none',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-dim)' }}>
                  {isActive ? <CheckCircle2 className="w-4 h-4 text-emerald" /> : profile.builtin ? <Lock className="w-4 h-4 text-accent" /> : <Bookmark className="w-4 h-4 text-accent" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{profile.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {profile.builtin && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: '#10b981' }}>Built-in</span>}
                    {isActive && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>Active</span>}
                    {!isActive && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>Inactive</span>}
                  </div>
                </div>
              </div>
              {!profile.builtin && (
                <button
                  onClick={() => setConfirm({ id: profile.id, name: profile.name })}
                  className="p-1.5 rounded-md transition-colors hover:bg-muted/50"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{profile.description}</p>

            <div className="flex flex-wrap gap-1.5">
              {(profile.rules || []).slice(0, 6).map((r, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                  {r.value}
                </span>
              ))}
              {(profile.rules || []).length > 6 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                  +{(profile.rules || []).length - 6} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{(profile.rules || []).length} rules</span>
              {isActive ? (
                <button
                  onClick={() => handleDeactivate(profile)}
                  disabled={deactivating === profile.id}
                  className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium h-8 px-3 transition-all border border-amber-500/50 text-amber hover:bg-amber/10 disabled:opacity-50"
                >
                  {deactivating === profile.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(profile)}
                  disabled={activating === profile.id}
                  className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium h-8 px-3 transition-all bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                >
                  {activating === profile.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Activate
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {confirm && (
        <ConfirmDialog
          title="Delete Profile"
          message={`Are you sure you want to delete "${confirm.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
