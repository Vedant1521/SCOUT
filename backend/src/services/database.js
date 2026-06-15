import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

class JsonStore {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, filename);
    this._ensure();
  }

  _ensure() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf8');
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  getAll() {
    return this.read();
  }

  getById(id) {
    return this.read().find(item => item.id === id) || null;
  }

  insert(item) {
    const data = this.read();
    data.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...item, createdAt: new Date().toISOString() });
    this.write(data);
    return data[data.length - 1];
  }

  update(id, updates) {
    const data = this.read();
    const idx = data.findIndex(item => item.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
    this.write(data);
    return data[idx];
  }

  delete(id) {
    const data = this.read();
    const idx = data.findIndex(item => item.id === id);
    if (idx === -1) return false;
    data.splice(idx, 1);
    this.write(data);
    return true;
  }
}

const rulesStore = new JsonStore('rules.json');
const logStore = new JsonStore('block-log.json');

export { rulesStore, logStore };

export function getRules() {
  const rules = rulesStore.getAll();
  if (rules.length === 0) {
    const defaults = [
      { id: 'default-domains', type: 'domain', value: 'doubleclick.net', enabled: true, category: 'ads' },
      { id: 'default-ads', type: 'domain', value: 'googlesyndication.com', enabled: true, category: 'ads' },
    ];
    for (const d of defaults) rulesStore.insert(d);
    return rulesStore.getAll();
  }
  return rules;
}

export function addRule(type, value, category = 'custom') {
  return rulesStore.insert({ type, value: value.toLowerCase().trim(), enabled: true, category });
}

export function updateRule(id, updates) {
  return rulesStore.update(id, updates);
}

export function deleteRule(id) {
  return rulesStore.delete(id);
}

export function getLogs(limit = 100) {
  const logs = logStore.getAll();
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}

export function addLog(entry) {
  return logStore.insert({ ...entry, timestamp: new Date().toISOString() });
}
