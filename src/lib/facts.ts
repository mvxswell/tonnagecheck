// Numbers that pages and guides quote in prose. All derived from the seed at build time, so a guide can never
// state a price the data does not support, and every figure updates when `npm run seed` runs.
import { auditPayload, SYSTEMS, BENCHMARKS, SEED_DATE, lowestPrice, median, type System, type SystemType, type Tier } from '../data/equipment';
import { audit, remdbCost, usd, type Range } from './audit';

export type { Range };
const payload = auditPayload();
const NO_SCOPE = { ductwork: false, ductworkAmount: 0, panel: false, lineSet: false, thermostat: false };

export function fairRange(systemType: SystemType, tons: number, tier: Tier = 'standard'): Range {
  return audit(payload, { systemType, tons, tier, quote: 10000, zip: '00000', scope: NO_SCOPE }).fair;
}

export function equipmentStats(systemType: SystemType, tons: number) {
  return statsOf(SYSTEMS.filter((s) => s.systemType === systemType && s.tons === tons));
}

export interface Where { type?: SystemType | SystemType[]; tons?: number | number[]; brand?: string | string[]; tier?: Tier; minSeer2?: number; energyStar?: boolean; coldClimate?: boolean; multiZone?: boolean; staging?: 'inverter' | 'fixed' }
const asArr = <T,>(v: T | T[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);
const isInverter = (s: System) => /variable|continuously|inverter/i.test(`${s.energyStar?.compressorStaging ?? ''} ${s.specs.stages ?? ''} ${s.title}`);

/** Seeded systems matching every given condition. */
export function systemsWhere(w: Where = {}): System[] {
  const types = asArr(w.type), tons = asArr(w.tons), brands = asArr(w.brand)?.map((b) => b.toLowerCase());
  return SYSTEMS.filter((s) =>
    (!types || types.includes(s.systemType)) && (!tons || tons.includes(s.tons)) && (!brands || brands.includes(s.brand.toLowerCase())) &&
    (!w.tier || s.tier === w.tier) && (w.minSeer2 == null || (s.specs.seer2 ?? 0) >= w.minSeer2) &&
    (w.energyStar == null || !!s.energyStar === w.energyStar) && (w.coldClimate == null || !!s.energyStar?.coldClimate === w.coldClimate) &&
    (w.multiZone == null || ((s.zones ?? 1) > 1) === w.multiZone) &&
    (!w.staging || isInverter(s) === (w.staging === 'inverter')),
  ).sort((a, b) => lowestPrice(a) - lowestPrice(b));
}

export function statsOf(xs: System[]) {
  const prices = xs.map(lowestPrice);
  return { count: xs.length, min: prices.length ? Math.min(...prices) : null, max: prices.length ? Math.max(...prices) : null, median: prices.length ? median(prices) : null, systems: xs };
}

/** REMDB installed cost for one adder class, in today's dollars. */
export function adderRange(cls: 'panel200A' | 'smartThermostat'): Range {
  const r = remdbCost(payload.remdb[cls]);
  const f = payload.cpi.factor;
  return { low: Math.round(r.low * f), mid: Math.round(r.mid * f), high: Math.round(r.high * f) };
}

/** REMDB prices a ducted heat pump "with new circuit" separately; the difference is its new-240V-circuit cost. */
export function newCircuitAdder(): number {
  const a = remdbCost(payload.remdb.ashpDuctedNewCircuit, 3, 16).mid;
  const b = remdbCost(payload.remdb.ashpDucted, 3, 16).mid;
  return Math.round((a - b) * payload.cpi.factor);
}

/** Refrigerant name and GWP as published in ENERGY STAR records, e.g. "R-32 (GWP:675 | Lower GWP)". */
export function refrigerantGwp(): { name: string; gwp: number }[] {
  const seen = new Map<string, number>();
  for (const s of SYSTEMS) {
    const m = s.energyStar?.refrigerant?.match(/^(R-?\d+[A-Z]?)\s*\(GWP:\s*(\d+)/i);
    if (m) seen.set(m[1].toUpperCase().replace(/^R(\d)/, 'R-$1'), Number(m[2]));
  }
  return [...seen.entries()].map(([name, gwp]) => ({ name, gwp })).sort((x, y) => x.gwp - y.gwp);
}

/** Normalized refrigerant for a system ("R-32", "R-454B", "R-410A") from ENERGY STAR or the listing. */
export function refrigerantOf(s: System): string | null {
  const raw = s.energyStar?.refrigerant ?? s.specs.refrigerant ?? (s.title.match(/R-?(32|454B|410A)\b/i)?.[0] ?? null);
  const m = raw?.match(/R-?\s?(32|454B|410A)/i);
  return m ? `R-${m[1].toUpperCase()}` : null;
}

export const lineSet = payload.lineSet;
export const seedDateLabel = new Date(SEED_DATE).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const cpi = BENCHMARKS.cpi;
export const fmtRange = (r: Range) => `${usd(r.low)}–${usd(r.high)}`;
export const pct = (n: number) => `${Math.round(n * 100)}%`;
export { usd, isInverter };
