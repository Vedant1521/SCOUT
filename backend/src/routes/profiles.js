import { Router } from 'express';
import { getProfiles, getProfile, createProfile, updateProfile, deleteProfile, getActiveProfileId, setActiveProfile, clearActiveProfile } from '../services/profileStore.js';
import { getRules, addRule, updateRule, deleteRule, addLog } from '../services/database.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    res.json(getProfiles());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active', (req, res) => {
  try {
    const id = getActiveProfileId();
    if (!id) return res.json({ activeProfileId: null });
    const profile = getProfile(id);
    res.json({ activeProfileId: id, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const profile = getProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, description, rules } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const profile = createProfile(name, description, rules);
    addLog({ action: 'create_profile', type: 'profile', value: name, status: 'success' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/save-current', (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const currentRules = getRules();
    const activeRules = currentRules
      .filter(r => r.enabled)
      .map(r => ({ type: r.type, value: r.value }));

    const profile = createProfile(name, description, activeRules);
    addLog({ action: 'save_profile', type: 'profile', value: name, status: `${activeRules.length} rules saved` });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = updateProfile(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Profile not found or is built-in' });
    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteProfile(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Profile not found or is built-in' });
    addLog({ action: 'delete_profile', type: 'profile', value: req.params.id, status: 'success' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/activate', async (req, res) => {
  try {
    const profile = getProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const currentRules = getRules();
    const enabledRules = currentRules.filter(r => r.enabled);

    for (const rule of enabledRules) {
      try {
        updateRule(rule.id, { enabled: false });
        req.app.locals.unapplyRule(rule);
      } catch {}
    }

    let appliedCount = 0;
    for (const ruleDef of profile.rules) {
      const existing = currentRules.find(r => r.type === ruleDef.type && r.value === ruleDef.value);
      if (existing) {
        if (!existing.enabled) {
          const updated = updateRule(existing.id, { enabled: true });
          if (updated) {
            try {
              req.app.locals.applyRule(updated);
              appliedCount++;
            } catch {}
          }
        } else {
          appliedCount++;
        }
      } else {
        const newRule = addRule(ruleDef.type, ruleDef.value, 'profile');
        if (newRule) {
          try {
            req.app.locals.applyRule(newRule);
            appliedCount++;
          } catch {}
        }
      }
    }

    setActiveProfile(req.params.id);
    addLog({ action: 'activate_profile', type: 'profile', value: profile.name, status: `${appliedCount} rules applied` });
    res.json({ success: true, profile, appliedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/deactivate', async (req, res) => {
  try {
    const profile = getProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const currentRules = getRules();
    const profileRuleValues = profile.rules.map(r => r.value);

    let removedCount = 0;
    for (const rule of currentRules) {
      if (rule.enabled && profileRuleValues.includes(rule.value)) {
        try {
          updateRule(rule.id, { enabled: false });
          req.app.locals.unapplyRule(rule);
          removedCount++;
        } catch {}
      }
    }

    clearActiveProfile();
    addLog({ action: 'deactivate_profile', type: 'profile', value: profile.name, status: `${removedCount} rules removed` });
    res.json({ success: true, profile, removedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
