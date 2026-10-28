#!/usr/bin/env node
// Builds the TonnageCheck seed data from public sources only. Run with `npm run seed`.
//
//   scripts/seed-sources.json            curated listing URLs (HVACDirect, Alpine Home Air)
//   data.energystar.gov (Socrata API)    SEER2 / EER2 / HSPF2 / COP@5F / AHRI ref for certified heat pumps
//   remdb.nlr.gov/db.json                NREL/NLR REMDB installed-cost regressions (2023$)
//   fred.stlouisfed.org CPIAUCSL         CPI-U, used to restate REMDB 2023$ in current dollars
//
// Writes src/data/seed/equipment.seed.json and src/data/seed/benchmarks.seed.json.
// Rule: nothing here is typed by hand. If a listing cannot be fetched or parsed it is recorded under
// `failures` and left out; the build never invents a replacement number.
//
// Retailer pages are fetched with curl (shipped with Windows 10+, macOS and Linux) under an honest
// user agent, one request per second, only on paths the retailers' robots.txt allows.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'data', 'seed');
const UA = 'TonnageCheckSeed/1.0 (+https://tonnagechecker.com/about/)';
const ES = 'https://data.energystar.gov/resource';
const ES_ASHP = 'w7cv-9xjt'; // ENERGY STAR Certified Air-Source Heat Pumps (split, mini/multi-split, package)
const ES_CAC = 'tyr2-hhgu'; // ENERGY STAR Certified Central Air Conditioners
const REMDB_URL = 'https://remdb.nlr.gov/db.json';
const FRED_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL&cosd=2023-01-01';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) => execFileSync('curl', ['-sL', '--fail', '--max-time', '45', '-A', UA, url], { maxBuffer: 64 << 20 }).toString();
const getJson = (url) => JSON.parse(get(url));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&ndash;|&#8211;/g, '–').replace(/&nbsp;/g, ' ').trim();
const num = (s) => (s == null || s === '' || isNaN(parseFloat(String(s).replace(/,/g, ''))) ? null : parseFloat(String(s).replace(/,/g, '')));
const slugify = (s) => s.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- retailer parsing ----------

const normModel = (s) => String(s || '').toUpperCase().replace(/\*/g, '').replace(/-\d$/, '').replace(/[^A-Z0-9]/g, '');

// Product pages also carry spec tables for related/upsell products, so only read the tables whose
// SKU row is one of this listing's own components.
function componentSpecs(html, components) {
  const own = new Set(components.map(normModel));
  const out = {};
  for (const chunk of html.split('data-th="SKU">').slice(1)) {
    const sku = chunk.slice(0, chunk.indexOf('<'));
    if (!own.has(normModel(sku))) continue;
    for (const m of chunk.matchAll(/data-th="([^"]+)">([^<]+)</g)) if (!(m[1] in out)) out[m[1]] = decode(m[2]);
  }
  return out;
}

const BRANDS = ['Goodman', 'Trane', 'LG', 'Bosch', 'Gree', 'ACiQ', 'MRCOOL', 'Mitsubishi', 'Daikin', 'Carrier', 'Senville', 'Stealth', 'Amana', 'York', 'Rheem'];
function brandFrom(...texts) {
  for (const b of BRANDS) if (texts.some((t) => t && new RegExp(`(^|[^a-z])${b}([^a-z]|$)`, 'i').test(t))) return b;
  return null;
}

function parseHvacDirect(html, url) {
  const meta = (p) => (html.match(new RegExp(`<meta property="${p}" content="([^"]*)"`)) || [])[1];
  const h1 = (html.match(/<h1[^>]*class="page-title"[^>]*>\s*<span[^>]*>([^<]+)<\/span>/i) || [])[1];
  const title = decode(meta('og:title') || h1 || '');
  const price = num(meta('product:price:amount'));
  const skuRaw = (html.match(/"sku":"([^"]+)"/) || [])[1];
  // HVACDirect appends "-1", "-2" to duplicate listings of the same model; drop that so the model matches elsewhere
  const components = skuRaw ? skuRaw.replace(/\\\//g, '/').split(/\s*\/\s*/).map((s) => s.trim().replace(/-\d$/, '')).filter(Boolean) : [];
  const ahri = (html.match(/href="([^"]*AHRI[^"]*\.pdf)"/i) || [])[1];
  const spec = componentSpecs(html, components);
  const brand = brandFrom(title, url, spec['Manufacturer'], spec['Brand/Manufacturer']);
  let tons = num((title.match(/(\d+(?:\.\d+)?)\s*Ton/i) || [])[1]);
  if (!tons) { const btu = num((title.match(/([\d,]{4,7})\s*BTU/i) || [])[1]); if (btu) tons = Math.round((btu / 12000) * 2) / 2; }
  const titleSeer2 = num((title.match(/(\d+(?:\.\d+)?)\s*SEER2/i) || [])[1]);
  const afue = num((title.match(/(\d+)%\s*AFUE/i) || title.match(/\s(\d{2})%\s/) || [])[1]);
  const furnaceBtu = num((title.match(/AFUE\s+([\d,]+)\s*BTU/i) || title.match(/\d+%\s+([\d,]+)\s*BTU/i) || [])[1]);
  const zoneWord = { single: 1, dual: 2, tri: 3, quad: 4 };
  const zm = title.match(/(\d)[\s-]*Zone/i) || title.match(/\b(Single|Dual|Tri|Quad)[\s-]*Zone/i);
  const zones = zm ? (zoneWord[zm[1].toLowerCase()] ?? num(zm[1])) : null;
  return {
    title, url, price, components, brand,
    tons, afue, furnaceBtu, zones,
    ahriCertificateUrl: ahri ? new URL(ahri, url).href : null,
    retailerSpecs: {
      seer2: num(spec['SEER2']) ?? titleSeer2,
      eer2: num(spec['EER2']),
      hspf2: num(spec['HSPF2']),
      refrigerant: spec['Refrigerant'] || null,
      stages: spec['Condenser Stages'] || spec['Compressor Stages'] || null,
      titleSeer2,
    },
  };
}

function parseAlpine(html, url) {
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (j['@type'] === 'Product' && j.offers?.price) {
        return { url, title: decode(j.name || ''), price: num(j.offers.price), mpn: j.mpn || j.model || null, sku: j.sku || null };
      }
    } catch { /* not JSON we need */ }
  }
  return null;
}

// ---------- ENERGY STAR ----------

// ENERGY STAR lists models with wildcard suffixes (e.g. GLZS5BA3610A*), so match on the model as a prefix.
function esQuery(dataset, outdoor) {
  const where = encodeURIComponent(`upper(model_number) like '${outdoor.toUpperCase().replace(/'/g, "''")}%'`);
  const api = `${ES}/${dataset}.json?$where=${where}&$limit=200`;
  try { return { api, rows: getJson(api) }; } catch { return { api, rows: [] }; }
}

function pickEsRow(rows, components, retailerSeer2) {
  if (!rows.length) return null;
  const norm = (s) => String(s || '').toUpperCase().replace(/\*/g, '').replace(/[^A-Z0-9]/g, '');
  const others = components.slice(1).map(norm);
  // 1) indoor model matches one of the listed components (prefix match tolerates suffix letters)
  for (const r of rows) {
    const ind = norm(r.indoor_unit_model_number);
    const furn = norm(r.furnace_model_number);
    if (others.some((o) => o && ((ind && (ind.startsWith(o.slice(0, 9)) || o.startsWith(ind.slice(0, 9)))) || (furn && furn.startsWith(o.slice(0, 9)))))) {
      return { row: r, matchedOn: 'outdoor + indoor model' };
    }
  }
  // 2) same SEER2 as the retailer lists
  if (retailerSeer2) {
    const r = rows.find((x) => Math.abs(num(x.seer2_btu_wh) - retailerSeer2) < 0.05);
    if (r) return { row: r, matchedOn: 'outdoor model + listed SEER2' };
  }
  return null; // outdoor-only matches can span very different ratings; do not guess
}

// ---------- main ----------

const sources = JSON.parse(readFileSync(join(ROOT, 'scripts', 'seed-sources.json'), 'utf8'));
const fetchedAt = new Date().toISOString();
const systems = [];
const failures = [];
const warnings = []; // kept in the seed but worth a human look

for (const src of sources.systems) {
  process.stdout.write(`- ${src.url.slice(22, 90)} ... `);
  let p;
  try { p = parseHvacDirect(get(src.url), src.url); } catch (e) { failures.push({ url: src.url, reason: `fetch failed: ${e.message.split('\n')[0]}` }); console.log('FETCH FAIL'); continue; }
  await sleep(1000);
  if (!p.price || !p.title || !p.tons || !p.components.length) { failures.push({ url: src.url, reason: 'could not parse price/title/tonnage/model' }); console.log('PARSE FAIL'); continue; }

  const outdoor = p.components[0];
  let es = null;
  let esApi = null;
  for (const ds of src.systemType === 'ac-furnace' ? [ES_CAC] : [ES_ASHP]) {
    const q = esQuery(ds, outdoor);
    esApi = q.api;
    const pick = pickEsRow(q.rows, p.components, p.retailerSpecs.seer2);
    if (pick) {
      const r = pick.row;
      es = {
        dataset: ds,
        apiUrl: `${ES}/${ds}.json?energy_star_model_identifier=${encodeURIComponent(r.energy_star_model_identifier)}`,
        matchedOn: pick.matchedOn,
        ahriReferenceNumber: r.ahri_reference_number || null,
        outdoorModel: r.model_number,
        indoorModel: r.indoor_unit_model_number || null,
        furnaceModel: r.furnace_model_number || null,
        seer2: num(r.seer2_btu_wh), eer2: num(r.eer2_btu_wh), hspf2: num(r.hspf2_btu_wh),
        copAt5F: num(r.cop_at_5_f),
        heatingCapacity5F: num(r.heating_capacity_at_5_f_btu_h),
        heatingCapacity47F: num(r.heating_capacity_at_47_f_btu_h),
        coolingCapacity: num(r.cooling_capacity_btu_h),
        outdoorBrand: r.outdoor_unit_brand_name || null,
        coldClimate: r.cold_climate === 'Yes',
        mostEfficient: r.meets_most_efficient_criteria === 'Yes',
        dateCertified: r.date_certified ? r.date_certified.slice(0, 10) : null,
        refrigerant: r.refrigerant_with_gwp || null,
        compressorStaging: r.compressor_staging || null,
      };
    }
  }

  let alpine = null;
  if (src.alpineUrl) {
    try {
      const a = parseAlpine(get(src.alpineUrl), src.alpineUrl);
      // only keep it if the Alpine page is for the same outdoor model
      if (a && [a.title, a.mpn, a.sku, src.alpineUrl].some((s) => s && s.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(outdoor.toUpperCase().replace(/[^A-Z0-9]/g, '')))) alpine = { ...a, fetchedAt };
      else failures.push({ url: src.alpineUrl, reason: 'Alpine page did not match outdoor model; not used' });
    } catch (e) { failures.push({ url: src.alpineUrl, reason: `Alpine fetch failed: ${e.message.split('\n')[0]}` }); }
    await sleep(1000);
  }

  const seer2 = es?.seer2 ?? p.retailerSpecs.seer2;
  if (!es && p.retailerSpecs.titleSeer2 && p.retailerSpecs.seer2 && Math.abs(p.retailerSpecs.titleSeer2 - p.retailerSpecs.seer2) > 0.05) {
    warnings.push({ url: src.url, reason: `listing title says ${p.retailerSpecs.titleSeer2} SEER2 but spec table says ${p.retailerSpecs.seer2}; kept spec table, check by hand` });
  }
  const tier = es?.coldClimate || (seer2 ?? 0) >= 18 ? 'high' : (seer2 ?? 0) >= 16 ? 'mid' : 'standard';
  const brand = brandFrom(es?.outdoorBrand) || p.brand;
  if (!brand) { failures.push({ url: src.url, reason: 'brand not identifiable from title, URL or ENERGY STAR record' }); console.log('  (dropped: no brand)'); continue; }
  const slug = slugify(`${brand} ${p.tons} ton ${seer2 ?? ''} seer2 ${src.systemType === 'ac-furnace' ? 'ac furnace' : src.systemType === 'mini-split' ? 'mini split' : src.systemType === 'heat-pump-only' ? 'heat pump condenser' : 'heat pump system'} ${outdoor}`);
  systems.push({
    slug,
    systemType: src.systemType,
    brand,
    title: p.title,
    tons: p.tons,
    tier,
    components: p.components,
    zones: src.systemType === 'mini-split' ? p.zones : null,
    afue: src.systemType === 'ac-furnace' ? p.afue : null,
    furnaceBtu: src.systemType === 'ac-furnace' ? p.furnaceBtu : null,
    specs: {
      seer2, eer2: es?.eer2 ?? p.retailerSpecs.eer2, hspf2: es?.hspf2 ?? p.retailerSpecs.hspf2,
      source: es ? 'energystar' : 'retailer',
      refrigerant: p.retailerSpecs.refrigerant, stages: p.retailerSpecs.stages,
    },
    energyStar: es,
    energyStarQuery: esApi,
    ahriCertificateUrl: p.ahriCertificateUrl,
    prices: [
      { retailer: 'HVACDirect', url: p.url, price: p.price, fetchedAt },
      ...(alpine ? [{ retailer: 'Alpine Home Air', url: alpine.url, price: alpine.price, fetchedAt }] : []),
    ],
  });
  console.log(`$${p.price} ${p.tons}T SEER2 ${seer2 ?? '?'} ES:${es ? es.matchedOn : 'no match'}${alpine ? ` Alpine $${alpine.price}` : ''}`);
}

const lineSets = [];
for (const ls of sources.lineSets || []) {
  try {
    const p = parseHvacDirect(get(ls.url), ls.url);
    if (p.price) lineSets.push({ label: ls.label, title: p.title || ls.label, sku: p.components[0] || null, url: ls.url, price: p.price, retailer: 'HVACDirect', fetchedAt });
    else failures.push({ url: ls.url, reason: 'line set price not found' });
  } catch (e) { failures.push({ url: ls.url, reason: `fetch failed: ${e.message.split('\n')[0]}` }); }
  await sleep(1000);
}

const accessories = [];
for (const acc of sources.accessories || []) {
  try {
    const p = parseHvacDirect(get(acc.url), acc.url);
    if (p.price) accessories.push({ category: acc.category, label: acc.label, title: p.title || acc.label, sku: p.components[0] || null, url: acc.url, price: p.price, retailer: 'HVACDirect', fetchedAt });
    else failures.push({ url: acc.url, reason: 'accessory price not found' });
  } catch (e) { failures.push({ url: acc.url, reason: `fetch failed: ${e.message.split('\n')[0]}` }); }
  await sleep(1000);
}

// ---------- REMDB benchmarks ----------
const remdb = getJson(REMDB_URL);
const sc = remdb['Space Conditioning'];
const pickClass = (group, cls) => {
  const c = structuredClone(group.classes[cls]);
  const meta = c.meta || {};
  delete c.meta;
  return { ...c, units: group.units, dataSources: meta.data_sources || [], notes: meta.notes || '', qualitativeRank: meta.qualitative_rank || '' };
};
const benchmarks = {
  remdb: {
    source: 'National Residential Efficiency Measures Database (REMDB), National Laboratory of the Rockies (formerly NREL)',
    url: 'https://remdb.nlr.gov/',
    dataUrl: REMDB_URL,
    fetchedAt,
    dollarYear: 2023,
    formula: 'installed cost = multiplier × (x1 × metric1 + x2 × metric2 + b) + adder (retrofit), evaluated at low / mid / high coefficients — the same calculation the REMDB web app performs',
    classes: {
      ashpDucted: pickClass(sc['Air Source Heat Pump'], 'Centrally ducted'),
      ashpDuctedNewCircuit: pickClass(sc['Air Source Heat Pump'], 'Centrally ducted, with new circuit'),
      miniSplitSingle: pickClass(sc['Air Source Heat Pump'], 'Non-ducted, single-zone'),
      miniSplitMulti: pickClass(sc['Air Source Heat Pump'], 'Non-ducted, multi-zone'),
      centralAc: pickClass(sc['Air Conditioner'], 'Centrally ducted'),
      gasFurnace: pickClass(sc['Furnaces'], 'Gas Furnace'),
      smartThermostat: pickClass(sc['Thermostat'], 'Smart'),
      panel200A: pickClass(remdb['Electrical']['Electric Panel'], '200A'),
    },
  },
};

// CPI-U (seasonally adjusted) from FRED, to restate REMDB's 2023 dollars
const csv = get(FRED_URL).trim().split(/\r?\n/).slice(1).map((l) => l.split(',')).filter(([, v]) => v && v !== '.');
const base = csv.find(([d]) => d === '2023-12-01');
const latest = csv[csv.length - 1];
benchmarks.cpi = {
  series: 'CPIAUCSL (CPI-U, all items, seasonally adjusted)',
  source: 'U.S. Bureau of Labor Statistics via FRED, Federal Reserve Bank of St. Louis',
  url: 'https://fred.stlouisfed.org/series/CPIAUCSL',
  baseMonth: base[0], baseValue: num(base[1]),
  latestMonth: latest[0], latestValue: num(latest[1]),
  factor: Math.round((num(latest[1]) / num(base[1])) * 10000) / 10000,
  fetchedAt,
};

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'equipment.seed.json'), JSON.stringify({ generatedAt: fetchedAt, systems, lineSets, accessories, failures, warnings }, null, 2) + '\n');
writeFileSync(join(OUT, 'benchmarks.seed.json'), JSON.stringify({ generatedAt: fetchedAt, ...benchmarks }, null, 2) + '\n');
console.log(`\n${systems.length} systems, ${lineSets.length} line sets, ${accessories.length} accessories, ${failures.length} failures. CPI factor ${benchmarks.cpi.factor} (${base[0]} → ${latest[0]}).`);
if (failures.length) console.log("failures:", failures);
if (warnings.length) console.log("warnings:", warnings);
