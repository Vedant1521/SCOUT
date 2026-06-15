import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BINARY_PATH = path.resolve(__dirname, '..', '..', process.env.DPI_BINARY || '../dpi_engine');
const OUTPUT_PCAP_DIR = path.resolve(__dirname, '..', '..', 'uploads');

export async function runDpiAnalysis(inputPcapPath, rules = {}) {
  const outputPcapPath = path.join(OUTPUT_PCAP_DIR, `output_${Date.now()}.pcap`);

  const args = [inputPcapPath, outputPcapPath, '--json'];

  if (rules.blockedIps) {
    for (const ip of rules.blockedIps) args.push('--block-ip', ip);
  }
  if (rules.blockedApps) {
    for (const app of rules.blockedApps) args.push('--block-app', app);
  }
  if (rules.blockedDomains) {
    for (const dom of rules.blockedDomains) args.push('--block-domain', dom);
  }
  if (rules.blockedPorts) {
    for (const port of rules.blockedPorts) args.push('--block-port', String(port));
  }

  const binary = fs.existsSync(BINARY_PATH) ? BINARY_PATH : (BINARY_PATH + '.exe');

  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`DPI engine exited with code ${code}: ${stderr}`));
      }
      try {
        const report = JSON.parse(stdout);
        resolve(report);
      } catch (err) {
        reject(new Error(`Failed to parse JSON output: ${err.message}\nstdout: ${stdout}\nstderr: ${stderr}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn DPI engine: ${err.message}`));
    });
  });
}
