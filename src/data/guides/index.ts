// All buyer guides. Each file computes its figures from the seed at build time; see helpers.ts.
import { CORE_GUIDES } from './core';
import { SIZE_GUIDES } from './sizes';
import { PRODUCT_GUIDES } from './products';
import { PRICING_GUIDES } from './pricing';
import { TECHNICAL_GUIDES } from './technical';
import { COMPARISON_GUIDES } from './comparisons';
import { ADDON_GUIDES } from './addons';
import { DIAGNOSTIC_GUIDES } from './diagnostics';
import { INSTALLATION_GUIDES } from './installation';
import { SALES_TACTICS_GUIDES } from './sales-tactics';
import type { Guide } from './types';

export type { Guide };

// Cross-link and auditor settings for the original five guides, which predate the `related` field.
const CORE_META: Record<string, Pick<Guide, 'related' | 'audit'>> = {
  'how-to-tell-if-hvac-quote-is-ripoff': { related: { tons: [3], systems: { type: 'central-heat-pump', tons: 3 } }, audit: { systemType: 'central-heat-pump', tons: 3 } },
  '3-ton-vs-4-ton-heat-pump-cost': { related: { tons: [3, 4], brands: ['Goodman', 'Trane', 'LG'], systems: { type: 'central-heat-pump', tons: [3, 4] } }, audit: { systemType: 'central-heat-pump', tons: 3 } },
  'wholesale-hvac-equipment-cost-vs-installed-price': { related: { tons: [2, 3, 4, 5], systems: { type: 'central-heat-pump', tons: 3 } }, audit: { systemType: 'central-heat-pump', tons: 3 } },
  'independent-hvac-tech-vs-big-company': { related: { tons: [3], systems: { type: 'central-heat-pump', tons: 3 } }, audit: { systemType: 'central-heat-pump', tons: 3 } },
  'heat-pump-rebates-and-ahri-certificate-check': { related: { systems: { energyStar: true, coldClimate: true } }, audit: { systemType: 'central-heat-pump', tons: 3, tier: 'high' } },
};

export const GUIDES: Guide[] = [
  ...CORE_GUIDES.map((g) => Object.assign(g, CORE_META[g.slug] ?? {})),
  ...SIZE_GUIDES,
  ...PRODUCT_GUIDES,
  ...PRICING_GUIDES,
  ...TECHNICAL_GUIDES,
  ...COMPARISON_GUIDES,
  ...ADDON_GUIDES,
  ...DIAGNOSTIC_GUIDES,
  ...INSTALLATION_GUIDES,
  ...SALES_TACTICS_GUIDES,
];
