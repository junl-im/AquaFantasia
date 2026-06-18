import dns from 'node:dns/promises';
import https from 'node:https';

const host = 'registry.npmjs.org';
const url = `https://${host}/-/ping`;
const timeoutMs = 15000;

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs, headers: { 'user-agent': 'AquaFantasia-CI-registry-check' } }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode ?? 0));
    });
    req.on('timeout', () => {
      req.destroy(new Error(`HTTPS timeout after ${timeoutMs}ms`));
    });
    req.on('error', reject);
  });
}

try {
  const lookup = await dns.lookup(host);
  console.log(`[ci:registry:check] DNS ${host} -> ${lookup.address} IPv${lookup.family}`);
  const status = await get(url);
  if (status < 200 || status >= 400) throw new Error(`Unexpected registry ping status ${status}`);
  console.log(`[ci:registry:check] ${url} reachable with HTTP ${status}`);
} catch (error) {
  const code = error?.code ? ` code=${error.code}` : '';
  console.error(`[ci:registry:check] Cannot reach public npm registry.${code}`);
  console.error('[ci:registry:check] This points to DNS/network/proxy access, not to package-lock registry contamination.');
  console.error(`[ci:registry:check] ${error?.message ?? error}`);
  process.exit(1);
}
