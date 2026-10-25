// Typed access to the seed built by scripts/fetch-energystar-seed.mjs. Nothing in this file adds numbers;
// it only reshapes what the seed recorded from HVACDirect, Alpine Home Air and data.energystar.gov.
import seed from './seed/equipment.seed.json';
import bench from './seed/benchmarks.seed.json';

export type SystemType = 'central-heat-pump' | 'mini-split' | 'ac-furnace' | 'heat-pump-only';
export type Tier = 'standard' | 'mid' | 'high';

export interface PricePoint {
  retailer: string;
  url: string;
  price: number;
  fetchedAt: string;
}

export interface EnergyStarMatch {
  dataset: string;
  apiUrl: string;
  matchedOn: string;
  ahriReferenceNumber: string | null;
  outdoorModel: string;
  indoorModel: string | null;
  furnaceModel: string | null;
  seer2: number | null;
  eer2: number | null;
  hspf2: number | null;
  copAt5F: number | null;
  heatingCapacity5F: number | null;
  heatingCapacity47F: number | null;
  coolingCapacity: number | null;
  outdoorBrand: string | null;
  coldClimate: boolean;
  mostEfficient: boolean;
  dateCertified: string | null;
  refrigerant: string | null;
  compressorStaging: string | null;
}

export interface System {
  slug: string;
  systemType: SystemType;
  brand: string;
  title: string;
  tons: number;
  tier: Tier;
  components: string[];
  zones: number | null;
  afue: number | null;
  furnaceBtu: number | null;
  specs: {
    seer2: number | null;
    eer2: number | null;
    hspf2: number | null;
    source: 'energystar' | 'retailer';
    refrigerant: string | null;
    stages: string | null;
  };
  energyStar: EnergyStarMatch | null;
  energyStarQuery: string | null;
  ahriCertificateUrl: string | null;
  prices: PricePoint[];
}

export interface LineSet { label: string; title: string; url: string; price: number; retailer: string; fetchedAt: string }

export const SEED_DATE: string = seed.generatedAt;
export const SYSTEMS = seed.systems as System[];
export const LINE_SETS = seed.lineSets as LineSet[];
export const BENCHMARKS = bench;

export const SYSTEM_TYPE_LABEL: Record<SystemType, string> = {
  'central-heat-pump': 'Central heat pump (ducted split)',
  'mini-split': 'Mini-split heat pump',
  'ac-furnace': 'Central AC + gas furnace',
  'heat-pump-only': 'Heat pump only (outdoor unit swap)',
};

export const TIER_LABEL: Record<Tier, string> = {
  standard: 'Standard (≈14.3–15.2 SEER2)',
  mid: 'Mid-tier inverter (≈16–17.5 SEER2)',
  high: 'High-efficiency / cold-climate (18+ SEER2)',
};

export const TONNAGES = [1.5, 2, 2.5, 3, 3.5, 4, 5] as const;
export const tonSlug = (t: number) => `${String(t).replace('.', '-')}-ton`;
export const tonLabel = (t: number) => `${t} ton`;

export const lowestPrice = (s: System) => Math.min(...s.prices.map((p) => p.price));
export const median = (xs: number[]) => {
  if (!xs.length) return NaN;
  const a = [...xs].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

export const systemsFor = (tons: number) => SYSTEMS.filter((s) => s.tons === tons);

/** "Below the ENERGY STAR minimum" is a fact we can state from the published criteria (15.2 SEER2 for splits). */
export const belowEnergyStarMinimum = (s: System) => s.specs.seer2 != null && s.specs.seer2 < 15.2 && s.systemType !== 'ac-furnace';

/** Compact copy of the seed for the in-browser auditor (keeps the page payload small). */
export function auditPayload() {
  return {
    seedDate: SEED_DATE,
    systems: SYSTEMS.map((s) => ({
      slug: s.slug, type: s.systemType, brand: s.brand, title: s.title, tons: s.tons, tier: s.tier,
      seer2: s.specs.seer2, energyStar: !!s.energyStar,
      prices: s.prices.map((p) => ({ r: p.retailer, u: p.url, p: p.price })),
    })),
    lineSet: LINE_SETS[0] ? { label: LINE_SETS[0].label, url: LINE_SETS[0].url, price: LINE_SETS[0].price } : null,
    remdb: BENCHMARKS.remdb.classes,
    cpi: { factor: BENCHMARKS.cpi.factor, base: BENCHMARKS.cpi.baseMonth, latest: BENCHMARKS.cpi.latestMonth },
  };
}
export type AuditPayload = ReturnType<typeof auditPayload>;
