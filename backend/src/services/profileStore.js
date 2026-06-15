import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_FILE = path.join(__dirname, '../../data/profiles.json');

function ensureFile() {
  const dir = path.dirname(PROFILES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, '[]');
}

function read() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function write(data) {
  ensureFile();
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return `profile_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const BUILTIN_PROFILES = [
  {
    id: 'builtin-work',
    name: 'Work Mode',
    description: 'Block social media and distractions during work hours',
    rules: [
      { type: 'domain', value: 'youtube.com' },
      { type: 'domain', value: 'facebook.com' },
      { type: 'domain', value: 'tiktok.com' },
      { type: 'domain', value: 'instagram.com' },
      { type: 'domain', value: 'x.com' },
      { type: 'domain', value: 'reddit.com' },
      { type: 'domain', value: 'netflix.com' },
    ],
    builtin: true,
  },
  {
    id: 'builtin-gaming',
    name: 'Gaming Mode',
    description: 'Keep game ports open, block background updaters',
    rules: [
      { type: 'domain', value: 'windowsupdate.microsoft.com' },
      { type: 'domain', value: 'update.microsoft.com' },
      { type: 'domain', value: 'download.microsoft.com' },
      { type: 'domain', value: 'cdn.steampowered.com' },
      { type: 'domain', value: 'store.epicgames.com' },
    ],
    builtin: true,
  },
  {
    id: 'builtin-kidsafe',
    name: 'Kid Safe',
    description: 'Block adult content and social media for children',
    rules: [
      { type: 'domain', value: 'youtube.com' },
      { type: 'domain', value: 'tiktok.com' },
      { type: 'domain', value: 'instagram.com' },
      { type: 'domain', value: 'snapchat.com' },
      { type: 'domain', value: 'discord.com' },
      { type: 'domain', value: 'twitch.tv' },
    ],
    builtin: true,
  },
  {
    id: 'builtin-minimal',
    name: 'Minimal',
    description: 'Only block known ad trackers',
    rules: [
      { type: 'domain', value: 'googlesyndication.com' },
      { type: 'domain', value: 'doubleclick.net' },
    ],
    builtin: true,
  },
];

function seedIfEmpty() {
  const profiles = read();
  if (profiles.length === 0) {
    write(BUILTIN_PROFILES.map(p => ({
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })));
  }
}

let activeProfileId = null;

export function getActiveProfileId() {
  return activeProfileId;
}

export function setActiveProfile(id) {
  activeProfileId = id;
}

export function clearActiveProfile() {
  activeProfileId = null;
}

export function getProfiles() {
  seedIfEmpty();
  return read();
}

export function getProfile(id) {
  const profiles = read();
  return profiles.find(p => p.id === id) || null;
}

export function createProfile(name, description, rules) {
  const profiles = read();
  const profile = {
    id: generateId(),
    name,
    description: description || '',
    rules: rules || [],
    builtin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  profiles.push(profile);
  write(profiles);
  return profile;
}

export function updateProfile(id, updates) {
  const profiles = read();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx === -1) return null;
  if (profiles[idx].builtin) return null;
  profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
  write(profiles);
  return profiles[idx];
}

export function deleteProfile(id) {
  const profiles = read();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx === -1) return false;
  if (profiles[idx].builtin) return false;
  profiles.splice(idx, 1);
  write(profiles);
  return true;
}
