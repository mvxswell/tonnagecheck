// Numbers that pages and guides quote in prose. All derived from the seed at build time, so a guide can never
// state a price the data does not support, and every figure updates when `npm run seed` runs.
import { auditPayload, SYSTEMS, BENCHMARKS, SEED_DATE, lowestPrice, median, type SystemType, type Tier } from '../data/equipment';
import { audit, usd, type Range } from './audit';

const payload = auditPayload();
const NO_SCOPE = { ductwork: false, ductworkAmount: 0, panel: false, lineSet: false, thermostat: false };

export function fairRange(systemType: SystemType, tons: number, tier: Tier = 'standard'): Range {
  return audit(payload, { systemType, tons, tier, quote: 10000, zip: '00000', scope: NO_SCOPE }).fair;
}

export function equipmentStats(systemType: SystemType, tons: number) {
  const xs = SYSTEMS.filter((s) => s.systemType === systemType && s.tons === tons);
  const prices = xs.map(lowestPrice);
  return { count: xs.length, min: prices.length ? Math.min(...prices) : null, max: prices.length ? Math.max(...prices) : null, median: prices.length ? median(prices) : null, systems: xs };
}

export const seedDateLabel = new Date(SEED_DATE).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const cpi = BENCHMARKS.cpi;
export const fmtRange = (r: Range) => `${usd(r.low)}–${usd(r.high)}`;
export { usd };
