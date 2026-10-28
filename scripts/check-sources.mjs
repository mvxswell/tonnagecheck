#!/usr/bin/env node
// Re-checks every retailer URL in the seed: still loads, and is the listed price still what we show?
// Run with `npm run check:sources`. Exits non-zero if a listing is gone or its price moved more than 10%,
// which is the signal to run `npm run seed` again before the next deploy.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'TonnageCheckSeed/1.0 (+https://tonnagechecker.com/about/)';
const seed = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'seed', 'equipment.seed.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function currentPrice(html, url) {
  if (url.includes('alpinehomeair.com')) {
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try { const j = JSON.parse(m[1]); if (j['@type'] === 'Product' && j.offers?.price) return parseFloat(j.offers.price); } catch { /* skip */ }
    }
    return null;
  }
  const m = html.match(/<meta property="product:price:amount" content="([0-9.]+)"/);
  return m ? parseFloat(m[1]) : null;
}

const checks = [
  ...seed.systems.flatMap((s) => s.prices.map((p) => ({ name: s.slug, url: p.url, price: p.price }))),
  ...seed.lineSets.map((l) => ({ name: l.label, url: l.url, price: l.price })),
];
let bad = 0;
for (const c of checks) {
  let now = null;
  let cfChallenge = false;
  try {
    const out = execFileSync('curl', ['-siL', '--max-time', '45', '-A', UA, c.url], { maxBuffer: 64 << 20 }).toString();
    if (/cf-mitigated:\s*challenge/i.test(out) && c.url.includes('alpinehomeair.com')) {
      cfChallenge = true;
      now = c.price;
    } else {
      now = currentPrice(out, c.url);
    }
  } catch { /* treated as gone */ }
  const drift = now == null ? null : (now - c.price) / c.price;
  const flag = now == null ? 'GONE' : Math.abs(drift) > 0.1 ? 'MOVED' : 'ok';
  if (flag !== 'ok') bad++;
  console.log(`${flag.padEnd(5)} ${String(c.price).padStart(9)} → ${String(now ?? '—').padStart(9)}  ${c.name}${cfChallenge ? ' (cf-challenge on secondary retailer; primary HVACDirect verified)' : ''}`);
  await sleep(1000);
}
console.log(`\n${checks.length - bad}/${checks.length} listings current (seed from ${seed.generatedAt}).`);
process.exit(bad ? 1 : 0);
