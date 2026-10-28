#!/usr/bin/env node
// Fetches all lineSets and accessories in scripts/seed-sources.json from HVACDirect and updates
// src/data/seed/equipment.seed.json without inventing or hand-editing any prices.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED_PATH = join(ROOT, 'src', 'data', 'seed', 'equipment.seed.json');
const SOURCES_PATH = join(ROOT, 'scripts', 'seed-sources.json');
const UA = 'TonnageCheckSeed/1.0 (+https://tonnagechecker.com/about/)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) => execFileSync('curl', ['-sL', '--fail', '--max-time', '45', '-A', UA, url], { maxBuffer: 64 << 20 }).toString();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&ndash;|&#8211;/g, '–').replace(/&nbsp;/g, ' ').trim();
const num = (s) => (s == null || s === '' || isNaN(parseFloat(String(s).replace(/,/g, ''))) ? null : parseFloat(String(s).replace(/,/g, '')));

function parsePart(html, url) {
  const meta = (p) => (html.match(new RegExp(`<meta property="${p}" content="([^"]*)"`)) || [])[1];
  const h1 = (html.match(/<h1[^>]*class="page-title"[^>]*>\s*<span[^>]*>([^<]+)<\/span>/i) || [])[1];
  const title = decode(meta('og:title') || h1 || '');
  const price = num(meta('product:price:amount'));
  const skuRaw = (html.match(/"sku":"([^"]+)"/) || [])[1];
  const sku = skuRaw ? skuRaw.replace(/\\\//g, '/').split(/\s*\/\s*/)[0].trim() : null;
  return { title, url, price, sku };
}

const sources = JSON.parse(readFileSync(SOURCES_PATH, 'utf8'));
const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'));
const fetchedAt = new Date().toISOString();

const lineSets = [];
for (const ls of sources.lineSets || []) {
  process.stdout.write(`- [lineSet] ${ls.label} ... `);
  try {
    const p = parsePart(get(ls.url), ls.url);
    if (p.price) {
      lineSets.push({ label: ls.label, title: p.title || ls.label, sku: p.sku, url: ls.url, price: p.price, retailer: 'HVACDirect', fetchedAt });
      console.log(`$${p.price} (SKU: ${p.sku})`);
    } else {
      console.log('NO PRICE');
    }
  } catch (e) {
    console.log(`FAIL: ${e.message.split('\n')[0]}`);
  }
  await sleep(500);
}

const accessories = [];
for (const acc of sources.accessories || []) {
  process.stdout.write(`- [${acc.category}] ${acc.label} ... `);
  try {
    const p = parsePart(get(acc.url), acc.url);
    if (p.price) {
      accessories.push({ category: acc.category, label: acc.label, title: acc.title || p.title || acc.label, sku: p.sku, url: acc.url, price: p.price, retailer: 'HVACDirect', fetchedAt });
      console.log(`$${p.price} (SKU: ${p.sku})`);
    } else {
      console.log('NO PRICE');
    }
  } catch (e) {
    console.log(`FAIL: ${e.message.split('\n')[0]}`);
  }
  await sleep(500);
}

seed.lineSets = lineSets;
seed.accessories = accessories;
writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + '\n');
console.log(`\nUpdated equipment.seed.json with ${lineSets.length} lineSets and ${accessories.length} accessories.`);
