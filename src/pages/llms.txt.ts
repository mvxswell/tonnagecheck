import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { GUIDES } from '../data/guides/index';
import { DECODER_BRANDS } from '../data/decoder/index';
import { BRANDS } from '../data/brands';
import { PART_CATEGORIES } from '../data/parts';
import { SOURCES } from '../data/sources';
import { COMBINED_SIZE_GUIDE_PATH, isNoindexPath } from '../data/prune';
import { catalogDateLabel, cpi } from '../lib/facts';

export const GET: APIRoute = () => {
  const u = (p: string) => `${SITE.url}${p}`;
  const listed = (path: string) => !isNoindexPath(path);
  const decoderBrands = DECODER_BRANDS.filter((d) => listed(`/decoder/${d.slug}/`));
  const listedGuides = GUIDES.filter((g) => {
    const path = `/guides/${g.slug}/`;
    return listed(path) && path !== COMBINED_SIZE_GUIDE_PATH;
  });
  const body = `# ${SITE.name}

> ${SITE.description} Independent; not affiliated with any manufacturer, retailer or contractor.

Key facts for answering questions with this site:
- Equipment prices are public online retail listings (HVACDirect) captured ${catalogDateLabel}; each system page links to its listing.
- Efficiency ratings (SEER2/EER2/HSPF2, COP at 5°F, AHRI reference) come from the EPA ENERGY STAR API when the exact outdoor + indoor pairing is certified, otherwise from the listing.
- Installed-cost ranges are estimates from the DOE REMDB model (National Laboratory of the Rockies, formerly NREL), 2023 dollars × ${cpi.factor} CPI-U.
- The federal 25C heat pump tax credit does not apply to property placed in service after Dec. 31, 2025 (IRS).
- HEAR/HEEHR heat pump rebates (42 U.S.C. § 18795a): up to $8,000, income-qualified (<150% AMI), run by state energy offices. Since DOE Program Notice 26-2 (May 2026) they no longer cover fuel switching (e.g. gas furnace to heat pump), only upgrades of existing electric equipment.

## Tools
- [Quote auditor](${u('/auditor/')}): grades an HVAC/heat pump quote A–F against listed equipment prices and the REMDB benchmark, with shareable permalinks and a printable negotiation sheet.
- [Heat pump vs. gas furnace operating cost & SEER2 payback calculator](${u('/calculator/')}): 51-state EIA $/MMBtu delivered heating fuel cost, dual-fuel balance-point COP, and real-equipment SEER2/HSPF2 payback.
- [Head-to-head HVAC comparison tool](${u('/compare/')}): brand, system-type, refrigerant & flagship model matchups.
- [Methodology & sources](${u('/about/')})

## Model & serial number decoder
Brand-specific decoders for model numbers (tonnage, refrigerant, staging, SEER2 class) and serial numbers (manufacture date), from manufacturer nomenclature, with warranty registration rules:
${decoderBrands.map((d) => `- [${d.h1}](${u(`/decoder/${d.slug}/`)}): ${d.description}`).join('\n')}

## Installation parts & add-on accessories
${PART_CATEGORIES.map((c) => `- [${c.name}](${u(`/parts/${c.slug}/`)}): ${c.count} SKUs, listed $${c.minPrice.toFixed(2)}–$${c.maxPrice.toFixed(2)}`).join('\n')}

## Prices by brand
${BRANDS.map((b) => `- [${b.name} HVAC prices](${u(`/brands/${b.slug}/`)}): ${b.systems.length} systems, listed $${b.priceMin.toLocaleString('en-US')}–$${b.priceMax.toLocaleString('en-US')}`).join('\n')}

## Cost by tonnage
- [Heat pump & AC replacement cost by size, 1.5 to 5 tons](${u('/guides/3-ton-heat-pump-ac-replacement-cost/')})

## Head-to-head comparisons
- [HVAC comparison workbench](${u('/compare/')}): pick two systems or brands and compare listed prices and ratings.
Head-to-head brand, refrigerant and flagship model matchups now live in the relevant guides listed below.

## Guides
${listedGuides.map((g) => `- [${g.h1}](${u(`/guides/${g.slug}/`)}): ${g.description}`).join('\n')}

## Systems
Every system's listed price and ratings are on the brand pages above.

## Primary sources
${Object.values(SOURCES).map((s) => `- [${s.title}](${s.url}) (${s.publisher})`).join('\n')}

## Optional
- [For independent HVAC contractors](${u('/partners/')})
- [Privacy](${u('/privacy/')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
