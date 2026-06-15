import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOSTS_PATH = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const BLOCK_MARKER = '# DPI-BLOCKER';
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

export class Blocker {
  constructor() {
    this._ensureDataDir();
  }

  _ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _getDomainVariants(d) {
    const variants = [d];
    if (!d.startsWith('www.')) {
      variants.push('www.' + d);
    } else {
      variants.push(d.replace('www.', ''));
    }
    return variants;
  }

  async blockDomain(domain) {
    const d = domain.toLowerCase().trim();
    try {
      let content = fs.readFileSync(HOSTS_PATH, 'utf8');
      const variants = this._getDomainVariants(d);
      const linesToAppend = [];
      for (const v of variants) {
        if (!content.split('\n').some(line => line.includes(` ${v} `) || line.endsWith(` ${v}`) || line.includes(`\t${v}`))) {
          linesToAppend.push(`127.0.0.1 ${v} ${BLOCK_MARKER}`);
          linesToAppend.push(`::1 ${v} ${BLOCK_MARKER}`);
        }
      }
      if (linesToAppend.length > 0) {
        fs.appendFileSync(HOSTS_PATH, '\r\n' + linesToAppend.join('\r\n') + '\r\n');
      }
      this._flushDns();
      return { success: true, domain: d };
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        return { success: false, error: 'Admin privileges required to modify hosts file', domain: d };
      }
      throw err;
    }
  }

  async unblockDomain(domain) {
    const d = domain.toLowerCase().trim();
    try {
      let content = fs.readFileSync(HOSTS_PATH, 'utf8');
      const variants = this._getDomainVariants(d);
      const lines = content.split('\n').filter(line => {
        const trimmed = line.trim();
        return !variants.some(v => trimmed.includes(` ${v} `) || trimmed.endsWith(` ${v}`) || trimmed.includes(`\t${v}`));
      });
      fs.writeFileSync(HOSTS_PATH, lines.join('\n'));
      this._flushDns();
      return { success: true, domain: d };
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        return { success: false, error: 'Admin privileges required to modify hosts file', domain: d };
      }
      throw err;
    }
  }

  async blockIp(ip) {
    const name = `DPI-Block-IP-${ip.replace(/[^a-fA-F0-9.]/g, '_')}`;
    try {
      execSync(
        `netsh advfirewall firewall add rule name="${name}" dir=out remoteip="${ip}" action=block`,
        { stdio: 'pipe', timeout: 10000 }
      );
      return { success: true, ip, name };
    } catch (err) {
      if (err.stderr?.includes('Access denied')) {
        return { success: false, error: 'Admin privileges required for firewall rules', ip };
      }
      if (err.stderr?.includes('already exists')) {
        return { success: true, ip, name, note: 'Rule already exists' };
      }
      throw err;
    }
  }

  async unblockIp(ip) {
    const name = `DPI-Block-IP-${ip.replace(/[^a-fA-F0-9.]/g, '_')}`;
    try {
      execSync(
        `netsh advfirewall firewall delete rule name="${name}"`,
        { stdio: 'pipe', timeout: 10000 }
      );
      return { success: true, ip };
    } catch (err) {
      if (err.stderr?.includes('Access denied')) {
        return { success: false, error: 'Admin privileges required for firewall rules', ip };
      }
      throw err;
    }
  }

  async blockPort(port) {
    const p = parseInt(port);
    try {
      execSync(
        `netsh advfirewall firewall add rule name="DPI-Block-TCP-${p}" dir=out protocol=tcp remoteport="${p}" action=block`,
        { stdio: 'pipe', timeout: 10000 }
      );
      execSync(
        `netsh advfirewall firewall add rule name="DPI-Block-UDP-${p}" dir=out protocol=udp remoteport="${p}" action=block`,
        { stdio: 'pipe', timeout: 10000 }
      );
      return { success: true, port: p };
    } catch (err) {
      if (err.stderr?.includes('Access denied')) {
        return { success: false, error: 'Admin privileges required for firewall rules', port: p };
      }
      return { success: true, port: p, note: 'Rule may already exist' };
    }
  }

  async unblockPort(port) {
    const p = parseInt(port);
    try {
      execSync(
        `netsh advfirewall firewall delete rule name="DPI-Block-TCP-${p}"`,
        { stdio: 'pipe', timeout: 10000 }
      );
      execSync(
        `netsh advfirewall firewall delete rule name="DPI-Block-UDP-${p}"`,
        { stdio: 'pipe', timeout: 10000 }
      );
      return { success: true, port: p };
    } catch (err) {
      if (err.stderr?.includes('Access denied')) {
        return { success: false, error: 'Admin privileges required for firewall rules', port: p };
      }
      throw err;
    }
  }

  async blockApp(name, programPath) {
    const safeName = `DPI-Block-App-${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    try {
      execSync(
        `netsh advfirewall firewall add rule name="${safeName}" dir=out program="${programPath}" action=block`,
        { stdio: 'pipe', timeout: 10000 }
      );
      return { success: true, app: name };
    } catch (err) {
      if (err.stderr?.includes('Access denied')) {
        return { success: false, error: 'Admin privileges required for firewall rules', app: name };
      }
      throw err;
    }
  }

  async unblockApp(name) {
    const safeName = `DPI-Block-App-${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    try {
      execSync(
        `netsh advfirewall firewall delete rule name="${safeName}"`,
        { stdio: 'pipe', timeout: 10000 }
      );
      return { success: true, app: name };
    } catch (err) {
      if (err.stderr?.includes('Access denied')) {
        return { success: false, error: 'Admin privileges required for firewall rules', app: name };
      }
      throw err;
    }
  }

  getStatus() {
    const status = {
      admin: false,
      hostsFile: false,
      firewall: false,
      blockedDomains: [],
      firewallRules: [],
    };
    try {
      fs.accessSync(HOSTS_PATH, fs.constants.W_OK);
      status.hostsFile = true;
    } catch { status.hostsFile = false; }
    try {
      execSync('netsh advfirewall show currentprofile', { stdio: 'pipe', timeout: 5000 });
      status.firewall = true;
    } catch { status.firewall = false; }
    status.admin = status.hostsFile || status.firewall;
    try {
      const content = fs.readFileSync(HOSTS_PATH, 'utf8');
      status.blockedDomains = content.split('\n')
        .filter(l => l.includes(BLOCK_MARKER))
        .map(l => {
          const parts = l.trim().split(/\s+/);
          return parts.length >= 2 ? parts[1] : null;
        })
        .filter(Boolean);
      status.blockedDomains = [...new Set(status.blockedDomains)];
    } catch {}
    try {
      const result = execSync(
        'netsh advfirewall firewall show rule name="DPI-Block-IP-" dir=out verbose',
        { stdio: 'pipe', timeout: 5000 }
      ).toString();
      const lines = result.split('\n');
      for (const line of lines) {
        const m = line.match(/Rule Name:\s+(.+)/);
        if (m) status.firewallRules.push(m[1].trim());
      }
    } catch {}
    return status;
  }

  _flushDns() {
    try {
      execSync('ipconfig /flushdns', { stdio: 'pipe', timeout: 10000 });
    } catch {}
  }
}

export default Blocker;
