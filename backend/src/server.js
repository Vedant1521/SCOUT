import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Blocker } from './services/blocker.js';
import { getRules, addRule, updateRule, deleteRule, getLogs, addLog } from './services/database.js';
import analyzeRouter from './routes/analyze.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const blocker = new Blocker();

app.use(cors());
app.use(express.json());

app.use('/api', analyzeRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', async (req, res) => {
  try {
    const status = blocker.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rules', (req, res) => {
  try {
    res.json(getRules());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rules', async (req, res) => {
  try {
    const { type, value, category } = req.body;
    if (!type || !value) return res.status(400).json({ error: 'type and value required' });
    if (!['domain', 'ip', 'port', 'app'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const rule = addRule(type, value, category || 'custom');
    await applyRule(rule);
    addLog({ action: 'add', type, value, status: 'applied' });
    res.json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rules/:id', async (req, res) => {
  try {
    const { enabled } = req.body;
    const updated = updateRule(req.params.id, { enabled });
    if (!updated) return res.status(404).json({ error: 'Rule not found' });
    if (enabled) {
      await applyRule(updated);
    } else {
      await unapplyRule(updated);
    }
    res.json({ success: true, rule: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rules/:id', async (req, res) => {
  try {
    const rules = getRules();
    const rule = rules.find(r => r.id === req.params.id);
    if (rule) {
      await unapplyRule(rule);
      deleteRule(req.params.id);
      addLog({ action: 'delete', type: rule.type, value: rule.value, status: 'removed' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/block/test', async (req, res) => {
  try {
    const { type, value } = req.body;
    let result;
    switch (type) {
      case 'domain': result = await blocker.blockDomain(value); break;
      case 'ip': result = await blocker.blockIp(value); break;
      case 'port': result = await blocker.blockPort(value); break;
      default: return res.status(400).json({ error: 'Invalid type' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    res.json(getLogs(limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function applyRule(rule) {
  if (!rule.enabled) return;
  switch (rule.type) {
    case 'domain': await blocker.blockDomain(rule.value); break;
    case 'ip': await blocker.blockIp(rule.value); break;
    case 'port': await blocker.blockPort(rule.value); break;
  }
}

async function unapplyRule(rule) {
  switch (rule.type) {
    case 'domain': await blocker.unblockDomain(rule.value); break;
    case 'ip': await blocker.unblockIp(rule.value); break;
    case 'port': await blocker.unblockPort(rule.value); break;
  }
}

app.listen(PORT, () => {
  console.log(`DPI Blocker backend running on http://localhost:${PORT}`);
  console.log(`Blocking API: /api/rules, /api/status, /api/logs`);
  console.log(`Analysis API: /api/upload, /api/reports`);
});
