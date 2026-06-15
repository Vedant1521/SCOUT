import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOSTS_PATH = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const BLOCK_MARKER = '# DPI-BLOCKER';
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

const DOH_RESOLVERS = [
  { ip: '1.1.1.1', name: 'DPI-Block-DoH-Cloudflare-1' },
  { ip: '1.0.0.1', name: 'DPI-Block-DoH-Cloudflare-2' },
  { ip: '8.8.8.8', name: 'DPI-Block-DoH-Google-1' },
  { ip: '8.8.4.4', name: 'DPI-Block-DoH-Google-2' },
  { ip: '9.9.9.9', name: 'DPI-Block-DoH-Quad9-1' },
  { ip: '149.112.112.112', name: 'DPI-Block-DoH-Quad9-2' },
  { ip: '208.67.222.222', name: 'DPI-Block-DoH-OpenDNS-1' },
  { ip: '208.67.220.220', name: 'DPI-Block-DoH-OpenDNS-2' },
];

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

  async _resolveDomainIps(domain) {
    const ips = [];
    try {
      let out = '';
      try {
        out = execSync(`nslookup ${domain}`, { encoding: 'utf8', timeout: 5000 });
      } catch (e) {
        out = (e.stdout || '').toString();
      }
      const lines = out.split(/\r?\n/);
      let pastName = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('name:')) {
          pastName = true;
          continue;
        }
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) {
          ips.push(trimmed);
          continue;
        }
        if (pastName && trimmed.toLowerCase().startsWith('address:')) {
          const ip = trimmed.split(':').slice(1).join(':').trim();
          if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
            ips.push(ip);
          }
        }
      }
    } catch {}
    return [...new Set(ips)];
  }

  async _blockDomainIps(domain, action) {
    const ips = await this._resolveDomainIps(domain);
    const safeName = domain.replace(/[^a-zA-Z0-9]/g, '_');
    let adminRequired = false;
    for (const ip of ips) {
      try {
        if (action === 'add') {
          const ruleName = `DPI-Block-Domain-${safeName}-${ip.replace(/\./g, '_')}`;
          const result = execSync(
            `netsh advfirewall firewall add rule name="${ruleName}" dir=out remoteip="${ip}" action=block`,
            { timeout: 10000 }
          );
          const out = result.toString();
          if (out.includes('Access denied') || out.includes('requires elevation')) {
            adminRequired = true;
          }
        } else {
          const ruleName = `DPI-Block-Domain-${safeName}-${ip.replace(/\./g, '_')}`;
          execSync(
            `netsh advfirewall firewall delete rule name="${ruleName}"`,
            { timeout: 10000 }
          );
        }
      } catch (err) {
        const out = (err.stdout?.toString() || '') + (err.stderr?.toString() || '') + (err.message || '');
        if (out.includes('Access denied') || out.includes('requires elevation') || out.includes('elevation')) {
          adminRequired = true;
        }
      }
    }
    return { ips, adminRequired };
  }

  async blockDomain(domain) {
    const d = domain.toLowerCase().trim();
    try {
      let content = fs.readFileSync(HOSTS_PATH, 'utf8');
      const variants = this._getDomainVariants(d);
      const lines = content.split(/\r?\n/);
      const linesToAppend = [];
      for (const v of variants) {
        if (!lines.some(line => line.includes(` ${v} `) || line.endsWith(` ${v}`) || line.includes(`\t${v}`))) {
          linesToAppend.push(`127.0.0.1 ${v} ${BLOCK_MARKER}`);
          linesToAppend.push(`::1 ${v} ${BLOCK_MARKER}`);
        }
      }
      if (linesToAppend.length > 0) {
        fs.appendFileSync(HOSTS_PATH, '\r\n' + linesToAppend.join('\r\n') + '\r\n');
      }
      this._flushDns();
      const fw = await this._blockDomainIps(d, 'add');
      if (!fw.adminRequired) this._blockDoH();
      return { success: true, domain: d, firewall: !fw.adminRequired, resolvedIps: fw.ips };
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
      const lines = content.split(/\r?\n/).filter(line => {
        return !variants.some(v => line.includes(` ${v} `) || line.endsWith(` ${v}`) || line.includes(`\t${v}`));
      });
      fs.writeFileSync(HOSTS_PATH, lines.join('\r\n'));
      this._flushDns();
      await this._blockDomainIps(d, 'remove');
      const remaining = lines.filter(l => l.includes(BLOCK_MARKER));
      if (remaining.length === 0) this._unblockDoH();
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
      execSync('net session', { stdio: 'pipe', timeout: 5000 });
      status.admin = true;
    } catch { status.admin = false; }
    if (status.admin) {
      try {
        execSync('netsh advfirewall show currentprofile', { stdio: 'pipe', timeout: 5000 });
        status.firewall = true;
      } catch { status.firewall = false; }
    } else {
      status.firewall = false;
    }
    try {
      const content = fs.readFileSync(HOSTS_PATH, 'utf8');
      status.blockedDomains = content.split(/\r?\n/)
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
    try {
      execSync('nbtstat -R', { stdio: 'pipe', timeout: 5000 });
    } catch {}
    try {
      execSync('nbtstat -RR', { stdio: 'pipe', timeout: 5000 });
    } catch {}
    try {
      execSync('netsh int ip delete arpcache', { stdio: 'pipe', timeout: 5000 });
    } catch {}
    try {
      execSync('netsh interface ip delete arpcache', { stdio: 'pipe', timeout: 5000 });
    } catch {}
  }

  _blockDoH() {
    for (const r of DOH_RESOLVERS) {
      try {
        execSync(
          `netsh advfirewall firewall add rule name="${r.name}" dir=out remoteip="${r.ip}" action=block`,
          { timeout: 5000 }
        );
      } catch {}
    }
  }

  _unblockDoH() {
    for (const r of DOH_RESOLVERS) {
      try {
        execSync(
          `netsh advfirewall firewall delete rule name="${r.name}"`,
          { timeout: 5000 }
        );
      } catch {}
    }
  }
}

export default Blocker;
