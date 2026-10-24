// The quote audit. Pure functions, run both at build time (tonnage pages) and in the browser (auditor).
//
// Where each number comes from:
//   equipment value   median listed price of matching systems in the seed (HVACDirect / Alpine Home Air)
//   fair installed    REMDB installed-cost regression (NREL/NLR, 2023$), restated with CPI-U from FRED
//   scope adders      REMDB 200A panel and smart thermostat; line set = its listed price
// Anything that is a modelling choice rather than a published number is marked `estimate: true` and
// explained in `method`, which the scorecard prints.
import type { AuditPayload, SystemType, Tier } from '../data/equipment';

export interface AuditInput {
  systemType: SystemType;
  tons: number;
  tier: Tier;
  quote: number;
  zip: string;
  scope: { ductwork: boolean; ductworkAmount: number; panel: boolean; lineSet: boolean; thermostat: boolean };
  furnaceBtu?: number; // AC + furnace only
  afue?: number; // percent, AC + furnace only
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type Status = 'Fair' | 'Overpriced' | 'Red Flag';
export interface Range { low: number; mid: number; high: number }
export interface Line { label: string; range: Range; estimate: boolean; method: string; sourceUrl: string }
export interface MatchedSystem { slug: string; brand: string; title: string; tons: number; seer2: number | null; price: number; retailer: string; url: string; energyStar: boolean }

export interface AuditResult {
  equipment: { value: number | null; matched: MatchedSystem[]; matchNote: string; lineSet: { price: number; url: string; label: string } | null };
  fair: Range;
  lines: Line[];
  seer2Used: number;
  seer2Note: string;
  gradedQuote: number;
  impliedMarkup: number | null;
  benchmarkLaborOverhead: number | null;
  overcharge: number;
  ratio: number;
  grade: Grade;
  status: Status;
  flags: string[];
  cpiNote: string;
}

type RemdbClass = AuditPayload['remdb'][keyof AuditPayload['remdb']];
const LEVELS = ['low', 'mid', 'high'] as const;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v);
const REMDB_URL = 'https://remdb.nlr.gov/';

/** The REMDB web app's own formula: multiplier × (x1·m1 + x2·m2 + b) + adder, retrofit install. */
export function remdbCost(cls: RemdbClass, m1?: number, m2?: number): Range {
  const c = cls as any;
  const out = {} as Range;
  for (const lvl of LEVELS) {
    const x1 = c.x1 ? c.x1[`coefficient_${lvl}`] * clamp(m1 ?? 0, c.x1.lower_bound, c.x1.upper_bound) : 0;
    const x2 = c.x2 ? c.x2[`coefficient_${lvl}`] * clamp(m2 ?? 0, c.x2.lower_bound, c.x2.upper_bound) : 0;
    const b = c.b ? c.b[`int_${lvl}`] : 0;
    out[lvl] = c.install.retrofit.multiplier * (x1 + x2 + b) + c.install.retrofit.adder;
  }
  return out;
}

const scale = (r: Range, f: number): Range => ({ low: r.low * f, mid: r.mid * f, high: r.high * f });
const add = (...rs: Range[]): Range => rs.reduce((a, r) => ({ low: a.low + r.low, mid: a.mid + r.mid, high: a.high + r.high }), { low: 0, mid: 0, high: 0 });
const flat = (v: number): Range => ({ low: v, mid: v, high: v });
const roundRange = (r: Range): Range => ({ low: round(r.low), mid: round(r.mid), high: round(r.high) });

export const TIER_DEFAULT_SEER2: Record<Tier, number> = { standard: 14.8, mid: 16.75, high: 19 }; // midpoints of the tier bands shown to the user
const SEER2_TO_SEER = 0.95; // SEER2 ≈ 0.95 × SEER for ducted split systems (M1 test procedure change); approximation

export function findEquipment(data: AuditPayload, type: SystemType, tons: number, tier: Tier) {
  const ofType = data.systems.filter((s) => s.type === type);
  let pool = ofType.filter((s) => s.tons === tons && s.tier === tier);
  let note = `${pool.length} listed ${pool.length === 1 ? 'system' : 'systems'} at exactly ${tons} tons in this tier.`;
  if (!pool.length) {
    pool = ofType.filter((s) => s.tons === tons);
    note = pool.length ? `No listing in this exact tier; using the ${pool.length} listed ${tons}-ton ${pool.length === 1 ? 'system' : 'systems'} of this type.` : '';
  }
  if (!pool.length && ofType.length) {
    const nearest = ofType.reduce((a, s) => (Math.abs(s.tons - tons) < Math.abs(a - tons) ? s.tons : a), ofType[0].tons);
    pool = ofType.filter((s) => s.tons === nearest);
    note = `No ${tons}-ton listing of this type in our data yet; showing the nearest size (${nearest} ton). Treat the equipment value as a rough guide.`;
  }
  const matched: MatchedSystem[] = pool.map((s) => {
    const best = s.prices.reduce((a, p) => (p.p < a.p ? p : a), s.prices[0]);
    return { slug: s.slug, brand: s.brand, title: s.title, tons: s.tons, seer2: s.seer2, price: best.p, retailer: best.r, url: best.u, energyStar: s.energyStar };
  }).sort((a, b) => a.price - b.price);
  const prices = matched.map((m) => m.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const value = prices.length ? (prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2) : null;
  const exact = pool.length > 0 && pool[0].tons === tons;
  return { value, matched, note, exact, sameTier: exact && pool.every((s) => s.tier === tier) };
}

export function gradeFor(ratio: number, fair: Range): Grade {
  if (ratio <= 1.0) return 'A';
  if (ratio <= 1.15) return 'B';
  if (ratio <= 1.3) return 'C';
  if (ratio <= Math.max(fair.high / fair.mid, 1.31)) return 'D';
  return 'F';
}

export function audit(data: AuditPayload, input: AuditInput): AuditResult {
  const cpi = data.cpi.factor;
  const eq = findEquipment(data, input.systemType, input.tons, input.tier);
  const flags: string[] = [];
  const lines: Line[] = [];

  // Efficiency used in the cost model: median SEER2 of matched listings, else the tier midpoint.
  const seers = eq.matched.map((m) => m.seer2).filter((s): s is number => s != null);
  const seer2Used = seers.length && eq.sameTier ? seers.sort((a, b) => a - b)[Math.floor(seers.length / 2)] : TIER_DEFAULT_SEER2[input.tier];
  const seer2Note = seers.length && eq.sameTier ? 'median SEER2 of the matched listings' : 'midpoint of the efficiency tier you picked';
  const seer1 = seer2Used / SEER2_TO_SEER;
  const r = data.remdb;
  const cpiNote = `REMDB publishes 2023 dollars; we multiply by ${cpi.toFixed(4)} (CPI-U ${data.cpi.base.slice(0, 7)} → ${data.cpi.latest.slice(0, 7)}).`;

  let base: Range;
  if (input.systemType === 'central-heat-pump') {
    base = scale(remdbCost(r.ashpDucted, input.tons, seer1), cpi);
    lines.push({ label: 'Ducted heat pump, installed (replacement)', range: base, estimate: true, method: `REMDB "Air Source Heat Pump – Centrally ducted" retrofit regression at ${input.tons} tons and ${seer1.toFixed(1)} SEER (≈ ${seer2Used} SEER2 ÷ 0.95). ${cpiNote}`, sourceUrl: REMDB_URL });
  } else if (input.systemType === 'mini-split') {
    const cls = input.tons <= 1.5 ? r.miniSplitSingle : r.miniSplitMulti;
    base = scale(remdbCost(cls, input.tons, seer1), cpi);
    lines.push({ label: `Ductless mini-split, installed (${input.tons <= 1.5 ? 'single-zone' : 'multi-zone'})`, range: base, estimate: true, method: `REMDB "Air Source Heat Pump – Non-ducted, ${input.tons <= 1.5 ? 'single' : 'multi'}-zone" regression at ${input.tons} tons and ${seer1.toFixed(1)} SEER. ${cpiNote}`, sourceUrl: REMDB_URL });
  } else if (input.systemType === 'ac-furnace') {
    const btu = input.furnaceBtu ?? 80000;
    const afue = (input.afue ?? 80) / 100;
    const ac = scale(remdbCost(r.centralAc, input.tons, seer1), cpi);
    const furnace = scale(remdbCost(r.gasFurnace, btu, afue), cpi);
    base = add(ac, furnace);
    lines.push({ label: 'Central AC, installed', range: ac, estimate: true, method: `REMDB "Air Conditioner – Centrally ducted" regression at ${input.tons} tons and ${seer1.toFixed(1)} SEER. ${cpiNote}`, sourceUrl: REMDB_URL });
    lines.push({ label: `Gas furnace, installed (${(btu / 1000).toFixed(0)}k BTU/h, ${Math.round(afue * 100)}% AFUE)`, range: furnace, estimate: true, method: `REMDB "Furnaces – Gas Furnace" regression at your furnace size and AFUE. ${cpiNote}`, sourceUrl: REMDB_URL });
  } else {
    // Outdoor-unit-only swap: REMDB has no class for it, so anchor on the listed condenser price. REMDB's heat
    // pump notes assume installed ≈ 1.5 × retail and say Massachusetts program data suggests up to 2 × in some
    // markets; we take the midpoint (1.75 ×) and REMDB's ±40% range, flooring the low end at the equipment price.
    const equip = eq.value ?? 0;
    base = { low: Math.max(equip, equip * 1.5 * 0.6), mid: equip * 1.75, high: equip * 2 * 1.4 };
    lines.push({ label: 'Heat pump condenser swap, installed', range: base, estimate: true, method: 'REMDB has no outdoor-unit-only class. Its heat pump notes assume installed cost ≈ 1.5 × retail equipment cost, "as high as 2" in some markets. We use the midpoint (1.75 ×) on the median listed condenser price, apply REMDB\'s ±40% range to the 1.5 × and 2 × ends, and floor the low end at the equipment price.', sourceUrl: REMDB_URL });
  }

  let fair = base;
  if (input.scope.panel) {
    const p = scale(remdbCost(r.panel200A), cpi);
    fair = add(fair, p);
    lines.push({ label: '200A electrical panel upgrade', range: p, estimate: true, method: `REMDB "Electric Panel – 200A" (REMDB rates its source quality "No Clear Sources"; treat as rough). ${cpiNote}`, sourceUrl: REMDB_URL });
  }
  if (input.scope.thermostat) {
    const t = scale(remdbCost(r.smartThermostat), cpi);
    fair = add(fair, t);
    lines.push({ label: 'Smart thermostat, installed', range: t, estimate: true, method: `REMDB "Thermostat – Smart". ${cpiNote}`, sourceUrl: REMDB_URL });
  }
  let lineSet: AuditResult['equipment']['lineSet'] = null;
  if (input.scope.lineSet && data.lineSet) {
    lineSet = { price: data.lineSet.price, url: data.lineSet.url, label: data.lineSet.label };
    fair = add(fair, flat(data.lineSet.price));
    lines.push({ label: `New line set (material: ${data.lineSet.label})`, range: flat(data.lineSet.price), estimate: false, method: 'Listed price of the line set. Brazing and evacuation labor are already inside the system benchmark.', sourceUrl: data.lineSet.url });
    if (input.tons >= 3.5) flags.push('Systems of 3.5 tons and up usually need a 7/8" suction line; the line set price shown is for 3/8" × 3/4", so expect a little more.');
  }

  const ductAmt = input.scope.ductwork ? Math.max(0, input.scope.ductworkAmount || 0) : 0;
  const gradedQuote = Math.max(0, input.quote - ductAmt);
  if (input.scope.ductwork && !ductAmt) flags.push('Ductwork is in scope but not itemized. No public benchmark covers duct replacement, so the grade below includes it and may overstate the overcharge. Ask the contractor to price ductwork as its own line.');
  if (ductAmt) flags.push(`We set aside the $${ductAmt.toLocaleString('en-US')} ductwork line and graded the remaining $${gradedQuote.toLocaleString('en-US')}. Ductwork is not benchmarked.`);

  const equipValue = eq.value != null ? eq.value + (lineSet?.price ?? 0) : null;
  fair = roundRange(fair);
  const ratio = gradedQuote / fair.mid;
  const grade = gradeFor(ratio, fair);
  let status: Status = grade === 'A' || grade === 'B' ? 'Fair' : grade === 'F' ? 'Red Flag' : 'Overpriced';
  if (gradedQuote < fair.low) {
    status = 'Red Flag';
    flags.push('This quote is below the low end of the benchmark. That can be a genuinely good price, but also check that permits, a new coil or air handler, refrigerant, haul-away and the exact model are all in writing.');
  }
  if (equipValue != null && gradedQuote < equipValue) flags.push('The quote is less than the listed online price of comparable equipment. Confirm the brand, model and tonnage on the quote.');
  if (input.systemType === 'heat-pump-only') flags.push('Replacing only the outdoor unit means the indoor coil must still be an AHRI-matched pair with it, or the rated SEER2/HSPF2 (and any rebate) may not apply. Ask for the AHRI certificate.');

  return {
    equipment: { value: equipValue != null ? round(equipValue) : null, matched: eq.matched, matchNote: eq.note, lineSet },
    fair, lines: lines.map((l) => ({ ...l, range: roundRange(l.range) })), seer2Used, seer2Note,
    gradedQuote,
    impliedMarkup: equipValue != null ? round(gradedQuote - equipValue) : null,
    benchmarkLaborOverhead: equipValue != null ? round(fair.mid - equipValue) : null,
    overcharge: round(Math.max(0, gradedQuote - fair.mid)),
    ratio, grade, status, flags, cpiNote,
  };
}

/** Rule-of-thumb sizing range for the helper. Not a load calculation; the UI says so. */
export function roughTonnage(sqft: number) {
  // 400–600 sq ft per ton is the commonly quoted contractor rule of thumb; a Manual J load calculation is the real answer.
  const lo = clamp(Math.round((sqft / 600) * 2) / 2, 1.5, 5);
  const hi = clamp(Math.round((sqft / 400) * 2) / 2, 1.5, 5);
  return { lo, hi };
}

export const usd = (n: number | null | undefined) => (n == null || !isFinite(n) ? '—' : `$${Math.round(n).toLocaleString('en-US')}`);
