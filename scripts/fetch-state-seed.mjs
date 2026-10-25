#!/usr/bin/env node
// Builds src/data/seed/states.seed.json from public sources only. Run with `npm run seed:states`.
//
//   EIA Electric Power Monthly Table 5.6.B   residential electricity price by state, year to date (cents/kWh)
//   EIA natural gas residential price         annual residential price by state ($/Mcf)
//   EIA natural gas heat content              Btu per cubic foot delivered to consumers, by state
//   PNNL-33270 (DOE Building America)         IECC 2021 climate zone of every county
//   Census 2020 national county list          to measure how completely PNNL covers each state
//   NASEO state energy office directory       each state energy office's website, checked live
//
// Nothing is typed in. A state whose data is incomplete is written with `complete: false` and the missing
// pieces listed; the site renders it noindex and keeps it out of the sitemap.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'TonnageCheckSeed/1.0 (+https://tonnagechecker.com/about/)';
const SRC = {
  electricity: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b',
  gas: 'https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_dmcf_a.htm',
  heatContent: 'https://www.eia.gov/dnav/ng/ng_cons_heat_a_EPG0_VGTH_btucf_a.htm',
  climatePdf: 'https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-33270.pdf',
  climatePage: 'https://www.pnnl.gov/publications/guide-determining-climate-zone-county-building-america-and-iecc-2021-updates',
  counties: 'https://www2.census.gov/geo/docs/reference/codes2020/national_county2020.txt',
  naseo: 'https://www.naseo.org/state-energy-offices',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) => execFileSync('curl', ['-sL', '--fail', '--max-time', '90', '-A', UA, url], { maxBuffer: 64 << 20 }).toString();
const num = (s) => { const n = parseFloat(String(s ?? '').replace(/,/g, '')); return Number.isFinite(n) ? n : null; };
const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const fetchedAt = new Date().toISOString();

// ---------- Census: the 50 states + DC and their counties ----------
const censusRows = get(SRC.counties).trim().split(/\r?\n/).slice(1).map((l) => l.split('|'));
const codes = [...new Set(censusRows.map((r) => r[0]))].filter((c) => !['PR', 'AS', 'GU', 'MP', 'UM', 'VI'].includes(c));
const censusCounties = Object.fromEntries(codes.map((c) => [c, censusRows.filter((r) => r[0] === c).map((r) => r[4])]));

// ---------- NASEO: names, codes and office websites ----------
const naseoList = get(SRC.naseo);
const naseo = {};
for (const m of naseoList.matchAll(/href="\/state\?State=([A-Z]{2})">([^<]+)</g)) naseo[m[1]] = { name: clean(m[2]), profile: `https://www.naseo.org/state?State=${m[1]}` };
const nameToCode = Object.fromEntries(Object.entries(naseo).map(([c, v]) => [v.name.toLowerCase(), c]));
nameToCode['district of columbia'] = 'DC';

// ---------- EIA tables ----------
function eiaGrapherRows(html) {
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => clean(c[1])));
}
const elecHtml = get(SRC.electricity);
const elecRows = eiaGrapherRows(elecHtml);
const elecHead = elecRows.find((r) => r[0]?.startsWith('Census Division'));
const elecPeriod = elecHead?.[1] ?? null; // e.g. "August 2026 YTD"
const elecPrior = elecHead?.[2] ?? null;
const electricity = {};
for (const r of elecRows) { const c = nameToCode[r[0]?.toLowerCase()]; if (c && num(r[1]) != null) electricity[c] = { centsPerKwh: num(r[1]), priorCentsPerKwh: num(r[2]) }; }
const usElec = elecRows.find((r) => r[0] === 'U.S. Total');

function dnavByArea(html) {
  const years = [...html.matchAll(/<th class="Series5">(\d{4})/g)].map((m) => m[1]);
  const out = {};
  for (const part of html.split('class="DataStub1">').slice(1)) {
    const name = clean(part.slice(0, part.indexOf('</td>')));
    const vals = [...part.split('DataStub1')[0].matchAll(/class="(?:DataB|Current2)">([^<]*)</g)].map((m) => num(m[1]));
    out[name] = vals;
  }
  return { years, out };
}
const gasT = dnavByArea(get(SRC.gas));
const heatT = dnavByArea(get(SRC.heatContent));
const lastVal = (vals) => { for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return { v: vals[i], i }; return null; };

// ---------- PNNL county climate zones ----------
const pdfBuf = execFileSync('curl', ['-sL', '--fail', '--max-time', '180', '-A', UA, SRC.climatePdf], { maxBuffer: 64 << 20 });
const pdf = await getDocument({ data: new Uint8Array(pdfBuf), verbosity: 0 }).promise;
let text = '';
for (let i = 1; i <= pdf.numPages; i++) text += (await (await pdf.getPage(i)).getTextContent()).items.map((x) => x.str).join(' ') + ' ';
text = text.replace(/\s+/g, ' ').replace(/‐/g, '-').replace(/ - humid/g, ' - Humid').replace(/ - dry/g, ' - Dry').replace(/Very cold/g, 'Very Cold').replace(/ cold /g, ' Cold ');
const BA = String.raw`(?:Hot - Humid|Mixed - Humid|Hot - Dry|Mixed - Dry|Very Cold|Cold|Subarctic|Marine)`;
const rowRe = new RegExp(String.raw`\b([A-Z]{2}) ((?:(?!\b[A-Z]{2} )[^→])+?) (` + BA + String.raw`(?: → ` + BA + String.raw`)?) (\d(?: → \d)?)(?: ((?:A|B|C|NONE)(?: → (?:A|B|C|NONE))?))?(?= |$)`, 'g');
const after = (x) => (x ? x.split(' → ').pop() : 'NONE'); // 2021 update shown as "old → new"
const rows = [...text.matchAll(rowRe)].map((m) => ({ st: m[1], county: m[2].trim(), ba: after(m[3]), zone: Number(after(m[4])), moisture: after(m[5]) }));

// Source-typo correction, logged: the table lists each state's counties as one alphabetical block, so a short
// run labelled X inside state Y's block (shorter than both neighbours, alphabetically in sequence) belongs to Y.
const climateFixes = [];
const runs = [];
for (const r of rows) { const L = runs[runs.length - 1]; if (L && L.st === r.st) L.rows.push(r); else runs.push({ st: r.st, rows: [r] }); }
const cmp = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
for (let i = 1; i < runs.length - 1; i++) {
  const [p, c, n] = [runs[i - 1], runs[i], runs[i + 1]];
  if (p.st === n.st && c.st !== p.st && c.rows.length < p.rows.length && c.rows.length < n.rows.length &&
      cmp(p.rows[p.rows.length - 1].county, c.rows[0].county) <= 0 && cmp(c.rows[c.rows.length - 1].county, n.rows[0].county) <= 0) {
    for (const r of c.rows) { climateFixes.push(`${r.county}: labelled ${r.st} in the source, inside the ${p.st} block; counted as ${p.st}`); r.st = p.st; }
  }
}
const climateByState = {};
const duplicates = [];
for (const r of rows) {
  const m = (climateByState[r.st] ??= new Map());
  if (m.has(r.county)) duplicates.push(`${r.st} ${r.county}`);
  m.set(r.county, r);
}

const normCounty = (s) => s.toLowerCase().replace(/\(city\)/, 'city').replace(/\b(county|parish|borough|census area|municipality|city and borough)\b/g, '')
  .replace(/^st\.? /, 'saint ').replace(/ st\.? /, ' saint ').replace(/[^a-z]/g, '');

// ---------- assemble ----------
const states = [];
for (const code of codes.sort()) {
  const name = naseo[code]?.name ?? (code === 'DC' ? 'District of Columbia' : null);
  if (!name) continue;
  const missing = [];
  const e = electricity[code] ?? null;
  if (!e) missing.push('EIA residential electricity price');
  const g = lastVal(gasT.out[name] ?? []);
  const gPrev = g && g.i > 0 ? (gasT.out[name] ?? [])[g.i - 1] : null;
  if (!g) missing.push('EIA residential natural gas price');
  const h = lastVal(heatT.out[name] ?? []);
  if (!h) missing.push('EIA natural gas heat content');

  const listed = [...(climateByState[code]?.values() ?? [])];
  const census = censusCounties[code] ?? [];
  const listedNorm = new Set(listed.map((r) => normCounty(r.county)));
  const notListed = census.filter((c) => !listedNorm.has(normCounty(c)));
  const coverage = census.length ? (census.length - notListed.length) / census.length : 0;
  if (!listed.length) missing.push('PNNL county climate zones');
  else if (coverage < 0.95) missing.push(`PNNL lists ${census.length - notListed.length} of ${census.length} Census 2020 counties`);
  const zones = {};
  for (const r of listed) { const k = `${r.zone}${r.moisture === 'NONE' ? '' : r.moisture}`; zones[k] = (zones[k] ?? 0) + 1; }

  // State energy office: NASEO profile -> office website, which must load (2xx) to be used.
  let office = null;
  if (naseo[code]) {
    try {
      const prof = get(naseo[code].profile);
      // The office website sits in the profile's address block as <a href='...' target='_blank'>.
      const link = [...prof.matchAll(/<a href='(https?:\/\/[^']+)' target='_blank'>/g)].map((m) => m[1]).find((u) => !/naseo\.org/i.test(u));
      // Some government firewalls reject user agents without "Mozilla"; the retry still identifies TonnageCheck.
      const UA2 = 'Mozilla/5.0 (compatible; TonnageCheckSeed/1.0; +https://tonnagechecker.com/about/)';
      const once = (u, ua) => {
        try {
          const [code, ...rest] = execFileSync('curl', ['-sL', '-o', process.platform === 'win32' ? 'NUL' : '/dev/null', '--max-time', '45', '-A', ua, '-w', '%{http_code} %{url_effective}', u]).toString().trim().split(' ');
          return { status: Number(code), finalUrl: rest.join(' ') };
        } catch { return { status: 0, finalUrl: u }; }
      };
      const check = (u) => { const a = once(u, UA); if (a.status >= 200 && a.status < 300) return a; const b = once(u, UA2); return b.status >= 200 && b.status < 300 ? { ...b, via: 'mozilla-compatible UA' } : a; };
      if (link) {
        let r = check(link);
        let usedRoot = false;
        // NASEO's deep link can go stale; the same official domain's home page is the fallback, if it loads.
        if (!(r.status >= 200 && r.status < 300)) { const root = new URL(link).origin + '/'; const rr = check(root); if (rr.status >= 200 && rr.status < 300) { r = rr; usedRoot = true; } }
        office = { listed: link, status: r.status, finalUrl: r.finalUrl, usedDomainRoot: usedRoot };
      }
    } catch { /* profile unreachable */ }
    await sleep(800);
  }
  const officeOk = office && office.status >= 200 && office.status < 300;
  if (!officeOk) missing.push(office ? `state energy office link from NASEO returns ${office.status}` : 'state energy office link');

  states.push({
    code, name, slug: name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''),
    complete: missing.length === 0, missing,
    electricity: e ? { ...e, period: elecPrior ? `${elecPeriod} (prior: ${elecPrior})` : elecPeriod } : null,
    gas: g ? { dollarsPerMcf: g.v, year: gasT.years[g.i] ?? null, priorDollarsPerMcf: gPrev ?? null } : null,
    gasHeatContentBtuPerCf: h ? { value: h.v, year: heatT.years[h.i] ?? null } : null,
    climate: { zones, countiesListed: listed.length, censusCounties: census.length, coverage: Math.round(coverage * 1000) / 1000, notListed },
    energyOffice: { naseoProfile: naseo[code]?.profile ?? null, website: officeOk ? office.finalUrl : null, checked: office },
  });
  process.stdout.write(`${code} ${missing.length ? 'INCOMPLETE ' + missing.join('; ') : 'ok'}\n`);
}

const out = {
  generatedAt: fetchedAt,
  sources: {
    electricity: { url: SRC.electricity, table: 'EIA Electric Power Monthly Table 5.6.B, residential sector', period: elecPeriod, usCentsPerKwh: num(usElec?.[1]) },
    gas: { url: SRC.gas, table: 'EIA Price of Natural Gas Delivered to Residential Consumers (annual)', years: gasT.years },
    heatContent: { url: SRC.heatContent, table: 'EIA Heat Content of Natural Gas Delivered to Consumers (annual)' },
    climate: { url: SRC.climatePage, pdf: SRC.climatePdf, title: 'Guide to Determining Climate Zone by County: Building America and IECC 2021 Updates (PNNL-33270)', corrections: climateFixes, duplicatesDropped: duplicates },
    counties: { url: SRC.counties, title: 'Census Bureau 2020 national county list' },
    energyOffices: { url: SRC.naseo, title: 'NASEO State Energy Offices directory' },
  },
  states,
};
mkdirSync(join(ROOT, 'src', 'data', 'seed'), { recursive: true });
writeFileSync(join(ROOT, 'src', 'data', 'seed', 'states.seed.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`\n${states.length} states, ${states.filter((s) => s.complete).length} complete. Climate fixes: ${climateFixes.length}, duplicates dropped: ${duplicates.length}.`);
