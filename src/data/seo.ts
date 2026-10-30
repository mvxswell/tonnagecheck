// Click-through title/description overrides for pages already ranking near page 1 in Google Search Console
// (GSC sc-domain:tonnagechecker.com, Oct 24–30 2026). Each rewrite targets the queries GSC reports for that page.
// Every dollar figure is computed from the seeded listings / REMDB benchmark, never typed in.
import type { Brand } from './brands';
import type { System } from './equipment';
import { usd, fmtRange, type Range } from '../lib/facts';

type Meta = { title: string; description: string };

/** /brands/<slug>/ overrides. GSC: Mitsubishi gets "mitsubishi heating and cooling (units) cost/prices", "mitsubishi air prices". */
export function brandMeta(b: Brand, fair: Range): Meta | undefined {
  const span = `${usd(b.priceMin)}–${usd(b.priceMax)}`;
  const sizes = `${b.tonnages[0]}–${b.tonnages[b.tonnages.length - 1]} ton`;
  switch (b.slug) {
    case 'mitsubishi':
      return {
        title: `Mitsubishi Heating & Cooling Prices: ${span}`,
        description: `Mitsubishi heating and cooling unit costs: ${b.systems.length} systems listed ${span} (${sizes}) vs ${fmtRange(fair)} installed. Audit a Mitsubishi quote free.`,
      };
    case 'gree':
      return {
        title: `Gree Flexx & Livo Heat Pump Prices: ${span}`,
        description: `Gree heat pump prices: ${b.systems.length} Flexx and Livo systems listed ${span} (${sizes}) vs ${fmtRange(fair)} installed benchmark. Audit a Gree quote free.`,
      };
    case 'daikin':
      return {
        title: `Daikin Mini-Split Prices: ${span} Listed`,
        description: `Daikin mini-split prices: ${b.systems.length} Oterra, Aurora, Atmosphera and MXM systems listed ${span} (${sizes}) vs ${fmtRange(fair)} installed. Audit a quote free.`,
      };
  }
  return undefined;
}

/** /systems/<slug>/ overrides. GSC: the Gree 4-ton page's click came from the exact model-number query "fxu60hp230v1r32ao". */
export function systemMeta(s: System, low: number, fair: Range): Meta | undefined {
  if (s.slug === 'gree-4-ton-19-seer2-heat-pump-system-fxu60hp230v1r32ao') {
    const es = s.energyStar;
    return {
      title: `${s.brand} ${s.components[0]}: ${usd(low)} vs ${fmtRange(fair)}`,
      description: `${s.brand} ${s.components[0]} ${s.tons}-ton ${s.specs.seer2} SEER2 heat pump lists at ${usd(low)}${es ? ` (AHRI #${es.ahriReferenceNumber})` : ''} vs ${fmtRange(fair)} installed. Audit a quote with this model.`,
    };
  }
  return undefined;
}

/** Cross-link cluster: the near-page-1 guides link to each other and to the matching brand pages. */
export const NEAR_PAGE1_GUIDES: { slug: string; label: string; brand?: string }[] = [
  { slug: 'heat-pump-rebates-and-ahri-certificate-check', label: 'Heat pump rebates after 25C & how to check the AHRI certificate' },
  { slug: 'heat-pump-condenser-only-vs-full-system-replacement', label: 'Replace the condenser only or the full system?' },
  { slug: 'evaporator-coil-leak-replacement-cost-vs-full-system-swap', label: 'Evaporator coil leak: replace the coil or the whole system?' },
  { slug: 'independent-hvac-tech-vs-big-company', label: 'Independent HVAC tech vs big (often PE-owned) company' },
  { slug: 'bosch-ids-inverter-heat-pump-cost', label: 'Bosch IDS inverter heat pump cost', brand: 'Bosch' },
  { slug: 'mitsubishi-hyper-heat-cost', label: 'Mitsubishi Hyper-Heat (H2i) cost', brand: 'Mitsubishi' },
];
