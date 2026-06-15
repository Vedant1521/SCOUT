const API = '/api';

function getToken() {
  return localStorage.getItem('dpi-token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export function getStatus() {
  return request('/status');
}

export function getRules() {
  return request('/rules');
}

export function addRule(type, value, category) {
  return request('/rules', {
    method: 'POST',
    body: JSON.stringify({ type, value, category }),
  });
}

export function toggleRule(id, enabled) {
  return request(`/rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}

export function deleteRule(id) {
  return request(`/rules/${id}`, { method: 'DELETE' });
}

export function getLogs(limit) {
  return request(`/logs${limit ? `?limit=${limit}` : ''}`);
}

export function uploadPcap(file, rules) {
  const token = getToken();
  const form = new FormData();
  form.append('pcap', file);
  form.append('blockedIps', JSON.stringify(rules.blockedIps || []));
  form.append('blockedApps', JSON.stringify(rules.blockedApps || []));
  form.append('blockedDomains', JSON.stringify(rules.blockedDomains || []));
  form.append('blockedPorts', JSON.stringify(rules.blockedPorts || []));

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetch(`${API}/upload`, { method: 'POST', body: form, headers }).then(async res => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  });
}

export function getReports() {
  return request('/reports');
}

export function getReport(id) {
  return request(`/reports/${id}`);
}

export function getProfiles() {
  return request('/profiles');
}

export function getProfile(id) {
  return request(`/profiles/${id}`);
}

export function createProfile(name, description, rules) {
  return request('/profiles', {
    method: 'POST',
    body: JSON.stringify({ name, description, rules }),
  });
}

export function updateProfile(id, updates) {
  return request(`/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function deleteProfile(id) {
  return request(`/profiles/${id}`, { method: 'DELETE' });
}

export function activateProfile(id) {
  return request(`/profiles/${id}/activate`, { method: 'POST' });
}

export function deactivateProfile(id) {
  return request(`/profiles/${id}/deactivate`, { method: 'POST' });
}

export function getActiveProfile() {
  return request('/profiles/active');
}

export function saveCurrentAsProfile(name, description) {
  return request('/profiles/save-current', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}
