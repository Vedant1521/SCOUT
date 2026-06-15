import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, '../../data/users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findOrCreateUser({ googleId, email, name, picture }) {
  const users = readUsers();
  let user = users.find(u => u.googleId === googleId);

  if (user) {
    user.lastLogin = new Date().toISOString();
    user.email = email;
    user.name = name;
    user.picture = picture;
    writeUsers(users);
    return user;
  }

  user = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    googleId,
    email,
    name,
    picture,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function findUserById(id) {
  const users = readUsers();
  return users.find(u => u.id === id) || null;
}
