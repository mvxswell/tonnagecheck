#!/usr/bin/env node
// Submit the site's URLs to IndexNow (Bing, Yandex and others share submissions).
//
//   npm run build && npm run indexnow             dry run: lists what would be submitted
//   npm run build && npm run indexnow -- --submit  actually submits
//
// Reads every URL from dist/sitemap-*.xml and keeps only those that already return 200 on the live site, so
// running it before a deploy never announces pages that would 404. The key is the 32-hex-character .txt file
// in public/, which must also be live at https://<host>/<key>.txt.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUBMIT = process.argv.includes('--submit');
const keyFile = readdirSync(join(ROOT, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error('No IndexNow key file (32 hex chars + .txt) in public/.'); process.exit(1); }
const key = keyFile.replace('.txt', '');

const dist = join(ROOT, 'dist');
const urls = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))
  .flatMap((f) => [...readFileSync(join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
if (!urls.length) { console.error('No URLs in dist/sitemap-*.xml; run npm run build first.'); process.exit(1); }
const host = new URL(urls[0]).host;

const keyLive = await fetch(`https://${host}/${keyFile}`).then((r) => r.ok && r.text()).catch(() => false);
if (!keyLive || keyLive.trim() !== key) { console.error(`Key file is not live at https://${host}/${keyFile}; deploy it first.`); process.exit(1); }

const live = [];
const notLive = [];
for (let i = 0; i < urls.length; i += 8) {
  const batch = urls.slice(i, i + 8);
  const codes = await Promise.all(batch.map((u) => fetch(u, { method: 'HEAD', redirect: 'manual' }).then((r) => r.status).catch(() => 0)));
  batch.forEach((u, j) => (codes[j] === 200 ? live : notLive).push(u));
}
console.log(`${urls.length} sitemap URLs: ${live.length} live (200), ${notLive.length} not live yet.`);
if (notLive.length) console.log('Not live (skipped):\n  ' + notLive.slice(0, 50).join('\n  ') + (notLive.length > 50 ? `\n  ...and ${notLive.length - 50} more` : ''));
if (!live.length) process.exit(0);

if (!SUBMIT) { console.log(`Dry run. Re-run with --submit to send ${live.length} URLs to IndexNow for ${host}.`); process.exit(0); }
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList: live.slice(0, 10000) }),
});
console.log(`IndexNow responded ${res.status} ${res.statusText} for ${Math.min(live.length, 10000)} URLs.`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
