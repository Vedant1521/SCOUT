const API = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
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
  const form = new FormData();
  form.append('pcap', file);
  form.append('blockedIps', JSON.stringify(rules.blockedIps || []));
  form.append('blockedApps', JSON.stringify(rules.blockedApps || []));
  form.append('blockedDomains', JSON.stringify(rules.blockedDomains || []));
  form.append('blockedPorts', JSON.stringify(rules.blockedPorts || []));
  return fetch(`${API}/upload`, { method: 'POST', body: form }).then(async res => {
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
