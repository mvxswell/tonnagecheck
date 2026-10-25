// Brand hubs. Everything here is derived from the seed (SYSTEMS) and the REMDB benchmark; nothing is typed in.
// A brand gets a page only if at least one live listing for it survived `npm run seed`.
import { SYSTEMS, TONNAGES, lowestPrice, median, type System, type SystemType } from './equipment';
import { fairRange, type Range } from '../lib/facts';

export interface TonRow { tons: number; type: SystemType; count: number; min: number; max: number; fair: Range }
export interface Brand {
  name: string;
  slug: string;
  systems: System[];
  types: SystemType[];
  tonnages: number[];
  priceMin: number;
  priceMax: number;
  priceMedian: number;
  seer2Min: number | null;
  seer2Max: number | null;
  hspf2Max: number | null;
  energyStarCount: number;
  coldClimateCount: number;
  rows: TonRow[];
}

export const brandSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function build(name: string, systems: System[]): Brand {
  const prices = systems.map(lowestPrice);
  const seers = systems.map((s) => s.specs.seer2).filter((x): x is number => x != null);
  const hspfs = systems.map((s) => s.specs.hspf2).filter((x): x is number => x != null);
  const TYPES: SystemType[] = ['central-heat-pump', 'mini-split', 'ac-furnace', 'heat-pump-only'];
  const rows: TonRow[] = TONNAGES.flatMap((t) => TYPES.flatMap((type) => {
    const xs = systems.filter((s) => s.tons === t && s.systemType === type);
    if (!xs.length) return [];
    const ps = xs.map(lowestPrice);
    // Benchmark span for this brand at this size: lowest low to highest high across the brand's own systems,
    // each evaluated at its own type and efficiency tier.
    const fr = xs.map((s) => fairRange(s.systemType, s.tons, s.tier));
    return [{
      tons: t, type, count: xs.length, min: Math.min(...ps), max: Math.max(...ps),
      fair: { low: Math.min(...fr.map((r) => r.low)), mid: median(fr.map((r) => r.mid)), high: Math.max(...fr.map((r) => r.high)) },
    }];
  }));
  return {
    name, slug: brandSlug(name), systems,
    types: [...new Set(systems.map((s) => s.systemType))],
    tonnages: [...new Set(systems.map((s) => s.tons))].sort((a, b) => a - b),
    priceMin: Math.min(...prices), priceMax: Math.max(...prices), priceMedian: median(prices),
    seer2Min: seers.length ? Math.min(...seers) : null, seer2Max: seers.length ? Math.max(...seers) : null,
    hspf2Max: hspfs.length ? Math.max(...hspfs) : null,
    energyStarCount: systems.filter((s) => s.energyStar).length,
    coldClimateCount: systems.filter((s) => s.energyStar?.coldClimate).length,
    rows,
  };
}

const byName = new Map<string, System[]>();
for (const s of SYSTEMS) byName.set(s.brand, [...(byName.get(s.brand) ?? []), s]);

export const BRANDS: Brand[] = [...byName.entries()]
  .map(([n, xs]) => build(n, xs.sort((a, b) => a.tons - b.tons || lowestPrice(a) - lowestPrice(b))))
  .sort((a, b) => b.systems.length - a.systems.length || a.name.localeCompare(b.name));

export const brandByName = (name: string) => BRANDS.find((b) => b.name.toLowerCase() === name.toLowerCase());
