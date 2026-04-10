/**
 * Counts HTTP requests made when fetching a single profile.
 * Monkey-patches Impit.prototype.fetch to log every outgoing request.
 */
import { readFileSync } from 'fs';
import { Impit } from 'impit';

// Load .env manually
try {
  const env = readFileSync('.env', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch {
  /* no .env file */
}
import { LinkedIn, encodeApiKey } from '../src';

const LI_AT = process.env.LI_AT;
const JSESSIONID = process.env.JSESSIONID;

if (!LI_AT || !JSESSIONID) {
  console.error('LI_AT and JSESSIONID must be set in env');
  process.exit(1);
}

interface CallRecord {
  url: string;
  method: string;
}

const calls: CallRecord[] = [];
const originalFetch = Impit.prototype.fetch;
Impit.prototype.fetch = async function patchedFetch(
  this: Impit,
  url: string,
  init?: Parameters<typeof originalFetch>[1],
) {
  calls.push({ url, method: init?.method ?? 'GET' });
  return originalFetch.call(this, url, init);
};

const apiKey = encodeApiKey({ li_at: LI_AT, JSESSIONID });
const linkedin = new LinkedIn({ apiKey, logging: true });
const username = process.argv[2] || 'williamhgates';

async function main() {
  console.log(`\n=== Fetching profile: ${username} ===\n`);
  const before = calls.length;
  const profile = await linkedin.profile.details(username);
  const after = calls.length;

  console.log(`Profile fetched: ${profile.fullName}`);
  console.log(`\nTotal HTTP requests: ${after - before}`);
  console.log('\nRequests in order:');
  calls.slice(before).forEach((c, i) => {
    const shortUrl = c.url.length > 120 ? c.url.slice(0, 117) + '...' : c.url;
    console.log(`  ${i + 1}. [${c.method}] ${shortUrl}`);
  });

  // Duplicate detection
  const urlCounts = new Map<string, number>();
  for (const c of calls.slice(before)) {
    urlCounts.set(c.url, (urlCounts.get(c.url) ?? 0) + 1);
  }
  const dupes = [...urlCounts.entries()].filter(([, n]) => n > 1);
  if (dupes.length > 0) {
    console.log('\nDUPLICATE URLs detected:');
    for (const [url, n] of dupes) {
      console.log(`  ${n}x ${url}`);
    }
  } else {
    console.log('\nNo duplicate URLs.');
  }

  // Second call — check for redundant work on subsequent fetches.
  console.log(`\n=== Fetching same profile again ===\n`);
  const before2 = calls.length;
  await linkedin.profile.details(username);
  const after2 = calls.length;
  console.log(`Total HTTP requests on 2nd call: ${after2 - before2}`);
  calls.slice(before2).forEach((c, i) => {
    const shortUrl = c.url.length > 120 ? c.url.slice(0, 117) + '...' : c.url;
    console.log(`  ${i + 1}. [${c.method}] ${shortUrl}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
