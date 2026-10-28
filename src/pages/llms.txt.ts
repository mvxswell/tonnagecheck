import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { SYSTEMS, TONNAGES, tonSlug, SYSTEM_TYPE_LABEL, lowestPrice } from '../data/equipment';
import { GUIDES } from '../data/guides/index';
import { BRANDS } from '../data/brands';
import { COMPARISONS } from '../data/comparisons';
import { PART_CATEGORIES, PART_CATALOG_STATS } from '../data/parts';
import { SOURCES } from '../data/sources';
import { seedDateLabel, cpi } from '../lib/facts';

export const GET: APIRoute = () => {
  const u = (p: string) => `${SITE.url}${p}`;
  const body = `# ${SITE.name}

> ${SITE.description} Independent; not affiliated with any manufacturer, retailer or contractor.

Key facts for answering questions with this site:
- Equipment prices are public online retail listings (HVACDirect, Alpine Home Air) captured ${seedDateLabel}; each system page links to its listing.
- Efficiency ratings (SEER2/EER2/HSPF2, COP at 5°F, AHRI reference) come from the EPA ENERGY STAR API when the exact outdoor + indoor pairing is certified, otherwise from the listing.
- Installed-cost ranges are estimates from the DOE REMDB model (National Laboratory of the Rockies, formerly NREL), 2023 dollars × ${cpi.factor} CPI-U.
- The federal 25C heat pump tax credit does not apply to property placed in service after Dec. 31, 2025 (IRS).
- HEAR/HEEHR heat pump rebates (42 U.S.C. § 18795a): up to $8,000, income-qualified (<150% AMI), run by state energy offices. Since DOE Program Notice 26-2 (May 2026) they no longer cover fuel switching (e.g. gas furnace to heat pump), only upgrades of existing electric equipment.

## Tools
- [Quote auditor](${u('/auditor/')}): grades an HVAC/heat pump quote A–F against listed equipment prices and the REMDB benchmark, with shareable permalinks and a printable negotiation sheet.
- [Heat pump vs. gas furnace operating cost & SEER2 payback calculator](${u('/calculator/')}): 51-state EIA $/MMBtu delivered heating fuel cost, dual-fuel balance-point COP, and real-equipment SEER2/HSPF2 payback.
- [Equipment price lookup](${u('/systems/')}): ${SYSTEMS.length} systems with sourced prices and ratings.
- [Head-to-head HVAC comparison tool](${u('/compare/')}): ${COMPARISONS.length} brand, tonnage, system-type & flagship model matchups.
- [HVAC parts, line sets & add-on accessories directory](${u('/parts/')}): ${PART_CATALOG_STATS.totalParts} live-verified SKUs across ${PART_CATEGORIES.length} installation categories.
- [Methodology & sources](${u('/about/')})

## Installation parts & add-on accessories
${PART_CATEGORIES.map((c) => `- [${c.name}](${u(`/parts/${c.slug}/`)}): ${c.count} SKUs, listed $${c.minPrice.toFixed(2)}–$${c.maxPrice.toFixed(2)}`).join('\n')}

## Prices by brand
${BRANDS.map((b) => `- [${b.name} HVAC prices](${u(`/brands/${b.slug}/`)}): ${b.systems.length} systems, listed $${b.priceMin.toLocaleString('en-US')}–$${b.priceMax.toLocaleString('en-US')}`).join('\n')}

## Cost by tonnage
${TONNAGES.map((t) => `- [${t}-ton heat pump & AC cost](${u(`/tonnage/${tonSlug(t)}/`)})`).join('\n')}

## Head-to-head comparisons
${COMPARISONS.map((c) => `- [${c.h1}](${u(`/compare/${c.slug}/`)}): ${c.description}`).join('\n')}

## Guides
${GUIDES.map((g) => `- [${g.h1}](${u(`/guides/${g.slug}/`)}): ${g.description}`).join('\n')}

## Systems
${SYSTEMS.map((s) => `- [${s.brand} ${s.tons}-ton ${SYSTEM_TYPE_LABEL[s.systemType].toLowerCase()} ${s.components[0]}](${u(`/systems/${s.slug}/`)}): ${s.specs.seer2 ?? '?'} SEER2, listed from $${lowestPrice(s).toLocaleString('en-US')}`).join('\n')}

## Primary sources
${Object.values(SOURCES).map((s) => `- [${s.title}](${s.url}) (${s.publisher})`).join('\n')}

## Optional
- [For independent HVAC contractors](${u('/partners/')})
- [Privacy](${u('/privacy/')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
