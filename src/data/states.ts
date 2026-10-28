// State pages. Everything comes from states.seed.json (EIA, PNNL, Census, NASEO; see scripts/fetch-state-seed.mjs)
// and the equipment seed. The only constants here are unit conversions.
import seed from './seed/states.seed.json';
import { SYSTEMS, median } from './equipment';

export interface StateRecord {
  code: string;
  name: string;
  slug: string;
  complete: boolean;
  missing: string[];
  electricity: { centsPerKwh: number; priorCentsPerKwh: number | null; period: string | null } | null;
  gas: { dollarsPerMcf: number; year: string | null; priorDollarsPerMcf: number | null } | null;
  gasHeatContentBtuPerCf: { value: number; year: string | null } | null;
  climate: { zones: Record<string, number>; countiesListed: number; censusCounties: number; coverage: number; notListed: string[] };
  energyOffice: { naseoProfile: string | null; website: string | null };
}

export const STATES = (seed.states as unknown as StateRecord[]).slice().sort((a, b) => a.name.localeCompare(b.name));
export const STATE_SOURCES = seed.sources;
export const STATE_SEED_DATE: string = seed.generatedAt;
export const stateBySlug = (slug: string) => STATES.find((s) => s.slug === slug);
export const stateByCode = (code: string) => STATES.find((s) => s.code === code);

const KWH_PER_MMBTU = 1e6 / 3412.14; // 1 kWh = 3,412.14 Btu
const BTU_PER_WH = 3.41214; // HSPF2 is Btu per Wh, so seasonal COP = HSPF2 / 3.412

/** Heating efficiency inputs, taken from the equipment seed so they track the systems we actually list. */
const hp = SYSTEMS.filter((s) => s.systemType === 'central-heat-pump' && s.specs.hspf2 != null);
const cold = hp.filter((s) => s.energyStar?.coldClimate);
const afues = [...new Set(SYSTEMS.map((s) => s.afue).filter((x): x is number => x != null))].sort((a, b) => a - b);
export const EFFICIENCY = {
  hspf2Median: median(hp.map((s) => s.specs.hspf2!)),
  hspf2Count: hp.length,
  coldHspf2Median: cold.length ? median(cold.map((s) => s.specs.hspf2!)) : null,
  coldCount: cold.length,
  afueLow: afues[0] ?? null,
  afueHigh: afues[afues.length - 1] ?? null,
};

export interface HeatCost { label: string; dollarsPerMMBtu: number; method: string }

/** Fuel cost per million Btu of heat delivered to the house. An estimate: real bills depend on climate, ducts and use. */
export function heatingCosts(s: StateRecord): HeatCost[] {
  const out: HeatCost[] = [];
  if (s.electricity) {
    const perKwh = s.electricity.centsPerKwh / 100;
    const cop = EFFICIENCY.hspf2Median / BTU_PER_WH;
    out.push({ label: `Heat pump, ${EFFICIENCY.hspf2Median} HSPF2 (median of ${EFFICIENCY.hspf2Count} listed ducted heat pumps)`, dollarsPerMMBtu: (perKwh * KWH_PER_MMBTU) / cop, method: `${s.electricity.centsPerKwh}¢/kWh × 293.07 kWh/MMBtu ÷ seasonal COP ${cop.toFixed(2)} (HSPF2 ÷ 3.412)` });
    if (EFFICIENCY.coldHspf2Median) {
      const c2 = EFFICIENCY.coldHspf2Median / BTU_PER_WH;
      out.push({ label: `Cold-climate heat pump, ${EFFICIENCY.coldHspf2Median} HSPF2 (median of ${EFFICIENCY.coldCount} ENERGY STAR cold-climate pairings)`, dollarsPerMMBtu: (perKwh * KWH_PER_MMBTU) / c2, method: `${s.electricity.centsPerKwh}¢/kWh × 293.07 kWh/MMBtu ÷ seasonal COP ${c2.toFixed(2)}` });
    }
    out.push({ label: 'Electric resistance heat (furnace or baseboard, 100% efficient)', dollarsPerMMBtu: perKwh * KWH_PER_MMBTU, method: `${s.electricity.centsPerKwh}¢/kWh × 293.07 kWh/MMBtu` });
  }
  if (s.gas && s.gasHeatContentBtuPerCf) {
    const mmbtuPerMcf = (s.gasHeatContentBtuPerCf.value * 1000) / 1e6;
    for (const afue of [EFFICIENCY.afueLow, EFFICIENCY.afueHigh].filter((x): x is number => x != null)) {
      out.push({ label: `Gas furnace, ${afue}% AFUE`, dollarsPerMMBtu: s.gas.dollarsPerMcf / mmbtuPerMcf / (afue / 100), method: `$${s.gas.dollarsPerMcf}/Mcf ÷ ${mmbtuPerMcf.toFixed(3)} MMBtu/Mcf (EIA heat content) ÷ ${afue}% AFUE` });
    }
  }
  return out.sort((a, b) => a.dollarsPerMMBtu - b.dollarsPerMMBtu);
}

/** Climate summary from the PNNL county list. Zone numbers are IECC 2021 climate zones. */
export function climateSummary(s: StateRecord) {
  const entries = Object.entries(s.climate.zones).sort((a, b) => parseInt(a[0]) - parseInt(b[0]) || a[0].localeCompare(b[0]));
  const total = s.climate.countiesListed || 1;
  const zoneNum = (k: string) => parseInt(k, 10);
  const coldCounties = entries.filter(([k]) => zoneNum(k) >= 4).reduce((n, [, v]) => n + v, 0);
  const veryColdCounties = entries.filter(([k]) => zoneNum(k) >= 5).reduce((n, [, v]) => n + v, 0);
  const coldShare = coldCounties / total;
  const kind: 'heating' | 'mixed' | 'cooling' = coldShare >= 0.5 ? 'heating' : coldShare > 0 ? 'mixed' : 'cooling';
  return { entries, coldCounties, veryColdCounties, coldShare, kind, zoneList: entries.map(([k]) => k).join(', ') };
}

/** Listed systems worth comparing for this climate: cold-climate pairings, or the highest EER2 for hot climates. */
export function recommendedSystems(kind: 'heating' | 'mixed' | 'cooling') {
  const coldSys = SYSTEMS.filter((s) => s.energyStar?.coldClimate).sort((a, b) => (b.energyStar!.copAt5F ?? 0) - (a.energyStar!.copAt5F ?? 0));
  const eer = SYSTEMS.filter((s) => s.specs.eer2 != null && s.systemType !== 'heat-pump-only').sort((a, b) => b.specs.eer2! - a.specs.eer2!);
  return { cold: kind === 'cooling' ? [] : coldSys.slice(0, 6), cooling: kind === 'heating' ? [] : eer.slice(0, 6) };
}
