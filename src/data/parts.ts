// Typed access and category grouping for the HVAC Installation Parts, Line Sets & Add-On Accessories
// wholesale price directory (/parts/ and /parts/[category]/).
// Every price, SKU, and source link comes directly from the seed built by scripts/fetch-energystar-seed.mjs
// and scripts/fetch-accessories-seed.mjs.
import { ACCESSORIES, BENCHMARKS, LINE_SETS, SEED_DATE, median, type AccessoryCategorySlug } from './equipment';
import { remdbCost } from '../lib/audit';

export type PartCategorySlug = 'refrigerant-line-sets' | AccessoryCategorySlug;

export interface PartListing {
  category: PartCategorySlug;
  subGroup: string;
  label: string;
  title: string;
  sku: string | null;
  url: string;
  price: number;
  retailer: string;
  fetchedAt: string;
}

export interface PartSubGroupSummary {
  name: string;
  items: PartListing[];
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
}

export interface PartGuideLink {
  slug: string;
  title: string;
  summary: string;
}

export interface PartPrimarySource {
  label: string;
  url: string;
  note: string;
}

export interface PartCategoryDefinition {
  slug: PartCategorySlug;
  name: string;
  shortName: string;
  badge: string;
  summary: string;
  whatItDoes: string;
  whenNeededVsPadded: string[];
  auditChecklist: string[];
  auditorAdderNote: string;
  relatedGuides: PartGuideLink[];
  primarySources: PartPrimarySource[];
}

export interface PartCategoryWithStats extends PartCategoryDefinition {
  items: PartListing[];
  subGroups: PartSubGroupSummary[];
  count: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
}

function classifyLineSetSubGroup(label: string, url: string): string {
  if (/1\/4\s*x\s*1\/2|1-4-inch-and-1-2-inch/i.test(label + ' ' + url)) {
    return '1/4" × 1/2" Mini-Split Flared Copper Line Sets (15–50 ft)';
  }
  if (/3\/8\s*x\s*7\/8|3-8-ll-x-7-8|3-8-x-7-8/i.test(label + ' ' + url)) {
    return '3/8" × 7/8" Large-Tonnage Split Copper Line Sets (3.5–5 Ton, 15–50 ft)';
  }
  if (/pre-charged|r-454b|r454b|ez-connect/i.test(label + ' ' + url)) {
    return '3/8" × 3/4" Pre-Charged R-454B Quick-Connect Line Sets (15–50 ft)';
  }
  return '3/8" × 3/4" Standard Central Split Copper Line Sets (1.5–3 Ton, 15–50 ft)';
}

function classifyAccessorySubGroup(category: AccessoryCategorySlug, label: string): string {
  if (category === 'heat-strip-kits') {
    if (/\b5\s*kW\b/i.test(label)) return '5 kW Electric Heat Strip Kits (16,200–17,000 BTU/h · ~25–30A Circuit)';
    if (/\b(7\.5|8)\s*kW\b/i.test(label)) return '7.5–8 kW Electric Heat Strip Kits (23,800 BTU/h · ~40–45A Circuit)';
    if (/\b10\s*kW\b/i.test(label)) return '10 kW Electric Heat Strip Kits (34,000–34,100 BTU/h · ~50–60A Circuit)';
    if (/\b15\s*kW\b/i.test(label)) return '15 kW Electric Heat Strip Kits (51,000–51,150 BTU/h · Dual-Circuit)';
    return '20 kW Electric Heat Strip Kits (68,000–68,200 BTU/h · Dual-Circuit)';
  }
  if (category === 'pads-disconnects-whips') {
    if (/pad/i.test(label)) return 'Composite Outdoor Condenser Equipment Pads';
    if (/disconnect/i.test(label)) return 'Outdoor AC Pull-Out Disconnect Switch Boxes (30A & 60A)';
    if (/whip/i.test(label)) return 'Pre-Wired Liquid-Tight Electrical Whips (1/2" & 3/4", 8–12 AWG)';
    return '120/240V Single-Phase HVAC Surge Protectors';
  }
  if (category === 'condensate-pumps-drains') {
    if (/pump/i.test(label)) return 'Condensate Removal Pumps (15–20 ft Lift & Mini-Split Under-Mount)';
    if (/switch|safe-t/i.test(label)) return 'Primary & Secondary Drain Float Safety Switches (SS1 / SS3 / Clip-On)';
    return 'Auxiliary Secondary Condensate Drain Pans';
  }
  if (/cover|lineguard|sleeve/i.test(label)) return 'PVC Line-Set Cover Kits & Wall Penetration Sleeves';
  if (/stand|slab/i.test(label)) return 'Elevated Mini-Split Heat Pump Ground Stands';
  return 'Heavy-Duty Outdoor Condenser Wall Mounting Brackets';
}

export const ALL_PART_LISTINGS: PartListing[] = [
  ...LINE_SETS.map((ls) => ({
    category: 'refrigerant-line-sets' as const,
    subGroup: classifyLineSetSubGroup(ls.label, ls.url),
    label: ls.label,
    title: ls.title,
    sku: ls.sku ?? null,
    url: ls.url,
    price: ls.price,
    retailer: ls.retailer,
    fetchedAt: ls.fetchedAt,
  })),
  ...ACCESSORIES.map((acc) => ({
    category: acc.category,
    subGroup: classifyAccessorySubGroup(acc.category, acc.label),
    label: acc.label,
    title: acc.title,
    sku: acc.sku,
    url: acc.url,
    price: acc.price,
    retailer: acc.retailer,
    fetchedAt: acc.fetchedAt,
  })),
];

const cpiFactor = BENCHMARKS.cpi.factor;
const panelRange = remdbCost(BENCHMARKS.remdb.classes.panel200A as any);
export const REMDB_PANEL_200A_CPI = {
  low: Math.round(panelRange.low * cpiFactor),
  mid: Math.round(panelRange.mid * cpiFactor),
  high: Math.round(panelRange.high * cpiFactor),
};
const tstatRange = remdbCost(BENCHMARKS.remdb.classes.smartThermostat as any);
export const REMDB_SMART_TSTAT_CPI = {
  low: Math.round(tstatRange.low * cpiFactor),
  mid: Math.round(tstatRange.mid * cpiFactor),
  high: Math.round(tstatRange.high * cpiFactor),
};
const ashpBase = remdbCost(BENCHMARKS.remdb.classes.ashpDucted as any, 3, 16);
const ashpCircuit = remdbCost(BENCHMARKS.remdb.classes.ashpDuctedNewCircuit as any, 3, 16);
export const REMDB_NEW_CIRCUIT_DELTA_CPI = {
  low: Math.round((ashpCircuit.low - ashpBase.low) * cpiFactor),
  mid: Math.round((ashpCircuit.mid - ashpBase.mid) * cpiFactor),
  high: Math.round((ashpCircuit.high - ashpBase.high) * cpiFactor),
};

const CATEGORY_DEFINITIONS: PartCategoryDefinition[] = [
  {
    slug: 'refrigerant-line-sets',
    name: 'Copper Refrigerant Line Sets (15–50 ft)',
    shortName: 'Refrigerant Line Sets',
    badge: 'Line Sets · 1/4"×1/2", 3/8"×3/4" & 3/8"×7/8"',
    summary: 'Live wholesale prices for insulated copper refrigerant line sets across 15 ft, 25 ft, 30 ft, 35 ft, and 50 ft lengths — covering mini-split 1/4" × 1/2" sets, standard 1.5–3 ton 3/8" × 3/4" sets, R-454B pre-charged sets, and 3.5–5 ton 3/8" × 7/8" suction lines.',
    whatItDoes: 'A refrigerant line set consists of two seamless copper tubes — a smaller high-pressure liquid line (typically 1/4" or 3/8" OD) and a larger insulated low-pressure suction/vapor line (1/2", 3/4", or 7/8" OD) — that carry refrigerant between the outdoor condenser/heat pump and the indoor evaporator coil or air handler.',
    whenNeededVsPadded: [
      'When replacement IS required: The existing copper tubing is pinched/kinked, runs underground in a corroded chase, had a compressor burnout that contaminated the oil, or is undersized for a new 3.5–5 ton heat pump that specifies a 7/8" suction line.',
      'When flushing is sufficient: If an accessible 3/8" × 3/4" copper line set is structurally sound, pressure-tested with dry nitrogen, and within the new OEM installation manual diameter table, flushing with an Rx11-flush solvent and pulling a <500-micron decay-verified vacuum is standard practice — including when transitioning from R-410A (POE oil) to R-454B or R-32 (POE oil).',
      'How to audit the line item: In our Quote Auditor, checking "New copper line set" adds the verified 30 ft 3/8" × 3/4" copper material cost ($289) because brazing, nitrogen purge, and triple evacuation labor are already inside the NREL/NLR REMDB base installation regression.',
    ],
    auditChecklist: [
      'Confirm the exact liquid and suction outer diameters (e.g., 3/8" × 3/4" vs 3/8" × 7/8") and measured run length in feet on the written proposal.',
      'Ask whether the line set runs through an open basement/attic joist bay or requires cutting and patching finished drywall or exterior soffits.',
      'Verify that dry nitrogen purge during brazing and a digital micron-gauge evacuation below 500 microns are written into the commissioning checklist.',
    ],
    auditorAdderNote: 'In the TonnageCheck Quote Auditor, checking "New copper line set" adds the live 30 ft 3/8" × 3/4" line-set material price ($289) on top of the REMDB retrofit benchmark (which already includes brazing and evacuation labor).',
    relatedGuides: [
      {
        slug: 'hvac-line-set-flush-vs-copper-line-set-replacement-cost',
        title: 'HVAC Line Set Flush vs New Copper Line Set Cost',
        summary: 'Compare chemical Rx11 flushing vs pulling new 15–50 ft copper tubing during R-410A to R-454B/R-32 changeouts.',
      },
      {
        slug: 'r454b-vs-r32-vs-r410a-refrigerant-transition-guide',
        title: 'R-454B vs R-32 vs R-410A Refrigerant Transition Guide',
        summary: 'POE oil compatibility, A2L mitigation sensors, and line-set sizing rules under the 2025/2026 EPA AIM Act transition.',
      },
      {
        slug: 'hvac-vacuum-micron-decay-test-nitrogen-purge-checklist',
        title: 'HVAC Vacuum Micron Decay Test & Nitrogen Purge Checklist',
        summary: 'Why flowing nitrogen while brazing and pulling below 500 microns matters more than swapping clean copper.',
      },
    ],
    primarySources: [
      {
        label: 'NREL / NLR REMDB Retrofit Cost Methodology',
        url: 'https://remdb.nlr.gov/',
        note: 'Base ducted heat pump and central AC retrofit regressions include standard brazing and evacuation labor.',
      },
      {
        label: 'EPA AIM Act Technology Transitions (R-454B & R-32)',
        url: 'https://www.epa.gov/climate-hfcs-reduction/technology-transitions',
        note: 'Federal GWP <= 700 refrigerant transition timelines and A2L installation requirements.',
      },
    ],
  },
  {
    slug: 'heat-strip-kits',
    name: 'Electric Heat Strip Kits (5 kW–20 kW Aux Heat)',
    shortName: 'Electric Heat Strip Kits',
    badge: 'Aux Heat · 5 kW, 7.5–8 kW, 10 kW, 15 kW & 20 kW',
    summary: 'Verified online retail prices for 5 kW, 7.5–8 kW, 10 kW, 15 kW, and 20 kW electric resistance heater coil kits (16,200 to 68,200 BTU/h) for Goodman and ACiQ air handlers, with circuit amperage and REMDB electrical-circuit cost context.',
    whatItDoes: 'An electric heat strip kit (auxiliary/emergency heat coil) slides into the air handler supply plenum to provide resistance backup heat during defrost cycles or extreme cold snaps when a heat pump’s compressor output drops below the building heat loss.',
    whenNeededVsPadded: [
      'When 5 kW–10 kW is all you need: If your air handler already has a dedicated 240V 30A–60A circuit, swapping in a new plug-and-play 5 kW, 8 kW, or 10 kW heat strip kit during an air handler changeout takes 15–20 minutes and uses a hardware kit that lists for $112–$256.',
      'Why oversized 15 kW–20 kW strips trigger panel adders: A 15 kW kit (~51,000 BTU/h) or 20 kW kit (~68,000 BTU/h) requires dual 240V breakers (often 60A + 30A or dual 60A). Automatically quoting a 15–20 kW strip without a Manual J heat-loss calculation is the #1 reason contractors claim you need a 200A panel upgrade.',
      'REMDB new-circuit & panel benchmarks: In the NREL/NLR REMDB dataset, adding a new 240V heat-pump circuit adds a CPI-restated median of $' + REMDB_NEW_CIRCUIT_DELTA_CPI.mid.toLocaleString('en-US') + ' ($' + REMDB_NEW_CIRCUIT_DELTA_CPI.low.toLocaleString('en-US') + '–$' + REMDB_NEW_CIRCUIT_DELTA_CPI.high.toLocaleString('en-US') + '), while a full 200A electric panel upgrade has a CPI-restated REMDB benchmark of $' + REMDB_PANEL_200A_CPI.mid.toLocaleString('en-US') + ' ($' + REMDB_PANEL_200A_CPI.low.toLocaleString('en-US') + '–$' + REMDB_PANEL_200A_CPI.high.toLocaleString('en-US') + ').',
    ],
    auditChecklist: [
      'Check the kW rating on your existing air handler nameplate and the breaker size in your main electrical panel before approving a new circuit run.',
      'Ask for the ACCA Manual J design heating load at your local 99% outdoor design temperature and compare it against the heat pump’s AHRI capacity at 17°F and 5°F.',
      'Verify that the thermostat is configured with an outdoor lockout temperature (balance point) so auxiliary heat strips do not energize during mild 40°F+ weather.',
    ],
    auditorAdderNote: 'In the TonnageCheck Quote Auditor, toggling "200A electrical panel upgrade" adds the CPI-restated NREL REMDB 200A panel benchmark ($' + REMDB_PANEL_200A_CPI.low.toLocaleString('en-US') + '–$' + REMDB_PANEL_200A_CPI.high.toLocaleString('en-US') + ', median $' + REMDB_PANEL_200A_CPI.mid.toLocaleString('en-US') + ').',
    relatedGuides: [
      {
        slug: 'electric-heat-strip-aux-heat-5kw-10kw-15kw-cost',
        title: 'Electric Heat Strip (5 kW, 10 kW, 15 kW) Aux Heat Cost Guide',
        summary: 'Compare 5 kW–20 kW heater coil hardware prices, breaker amperage requirements, and how to stop aux-heat bill spikes.',
      },
      {
        slug: '200a-panel-upgrade-and-heat-strip-adders',
        title: '200A Panel Upgrade & Heat Strip Adders on Heat Pump Quotes',
        summary: 'When a 200A panel upgrade is genuinely required vs when right-sizing the heat strip avoids a $2,800+ electrical adder.',
      },
      {
        slug: 'cold-climate-heat-pump-buying-guide-5f-cop',
        title: 'Cold-Climate Heat Pump Guide: COP at 5°F & Capacity Ratios',
        summary: 'How ENERGY STAR Cold Climate heat pumps maintain 70%+ capacity at 5°F and reduce reliance on resistance heat strips.',
      },
    ],
    primarySources: [
      {
        label: 'NREL / NLR REMDB Electrical & ASHP Circuit Classes',
        url: 'https://remdb.nlr.gov/',
        note: 'Publishes both "Centrally ducted, with new circuit" and "Electric Panel – 200A" cost distributions.',
      },
      {
        label: 'ENERGY STAR Cold Climate Heat Pump Specification v6.1',
        url: 'https://www.energystar.gov/products/air_source_heat_pumps',
        note: 'Defines 5°F COP >= 1.75 and 5°F/47°F heating capacity ratio >= 70% verification.',
      },
    ],
  },
  {
    slug: 'pads-disconnects-whips',
    name: 'Condenser Pads, Disconnect Boxes, Whips & Surge Protectors',
    shortName: 'Pads, Disconnects, Whips & Surge',
    badge: 'Outdoor Electrical & Mounting · Pads, 30A/60A Disconnects, Whips & SPD',
    summary: 'Verified wholesale hardware prices for DiversiTech E-Lite composite condenser pads, 30A and 60A fused/non-fused outdoor pull-out disconnect switches, pre-wired 1/2" and 3/4" liquid-tight whips, and 120/240V HVAC surge protectors.',
    whatItDoes: 'Every outdoor condenser or heat pump sets on a level equipment pad and connects to house power through a weatherproof outdoor disconnect box, a 6-foot flexible liquid-tight electrical whip, and (frequently on inverter systems) a Type 1/Type 2 240V surge protective device (SPD).',
    whenNeededVsPadded: [
      'What the hardware actually costs: A complete outdoor mounting and electrical trim package — composite pad ($103.73–$141.00), 60A disconnect box ($43.95–$50.99), and 6 ft pre-wired whip ($20.89–$38.99) — totals roughly $169 to $231 in public online hardware.',
      'Why "Code Upgrade Packages" are a common padding tactic: Many turnkey replacement proposals include these items in the base installation scope, while high-pressure sales templates break them out as a $900–$1,800 "Outdoor Electrical & Code Package" even when reusing the existing branch circuit.',
      'Inverter surge protector math: A 120/240V single-phase 100,000A HVAC surge protector lists at $148.00 and lands directly on the outdoor disconnect lugs in 15 minutes while the technician is already wiring the whip.',
    ],
    auditChecklist: [
      'Ask the contractor whether a new composite pad, disconnect box, and liquid-tight whip are already included in the base condenser installation price.',
      'If an HVAC surge protector is quoted above $300–$400 as an add-on, ask for the exact SKU, joule/amp rating, and connected-equipment warranty terms.',
      'Check that the outdoor pad is sized for the new unit footprint (many 3–5 ton inverter heat pumps require a 36" × 36" or 36" × 48" pad rather than an older 24" × 24" AC slab).',
    ],
    auditorAdderNote: 'Standard condenser pad, disconnect box, and whip trim hardware ($169–$231 combined material cost) is normally part of a turnkey replacement; only a full circuit pull or 200A panel upgrade is broken out as an electrical scope adder in REMDB.',
    relatedGuides: [
      {
        slug: 'condenser-pad-disconnect-box-whip-surge-protector-add-ons',
        title: 'Condenser Pad, Disconnect Box, Whip & Surge Protector Add-On Costs',
        summary: 'Line-by-line breakdown of outdoor mounting and electrical trim hardware vs padded "code compliance" bundles.',
      },
      {
        slug: 'hvac-contractor-red-flags-12-quote-tactics',
        title: '12 HVAC Contractor Quote Red Flags & Padding Tactics',
        summary: 'How to spot bundled accessory packs, unitemized "code upgrades," and artificial same-day discounts.',
      },
      {
        slug: 'hvac-permit-inspection-manual-j-code-requirements',
        title: 'HVAC Permit, Inspection & Code Requirements Guide',
        summary: 'What mechanical and electrical inspectors actually check on outdoor disconnects, working clearances, and pads.',
      },
    ],
    primarySources: [
      {
        label: 'NREL / NLR REMDB Space Conditioning Retrofit Scope',
        url: 'https://remdb.nlr.gov/',
        note: 'Standard retrofit regressions cover complete outdoor unit placement and reconnection on existing circuits.',
      },
    ],
  },
  {
    slug: 'condensate-pumps-drains',
    name: 'Condensate Pumps, Float Switches & Auxiliary Drain Pans',
    shortName: 'Condensate Pumps & Drain Safety',
    badge: 'Water Protection · 15–20 ft Pumps, SS1/SS3 Float Switches & Drain Pans',
    summary: 'Live wholesale prices for 15 ft and 20 ft lift condensate removal pumps, Aspen mini-split under-mount pumps, RectorSeal Safe-T-Switch SS1/SS3 and Beckett float switches, and secondary attic drain pans.',
    whatItDoes: 'During cooling and dehumidification, an evaporator coil condenses gallons of water per day. Drain pans, float safety switches, and condensate pumps collect and discharge that water safely — and automatically cut 24V thermostat power if a drain line clogs before water overflows onto ceilings or floors.',
    whenNeededVsPadded: [
      'Float switch hardware vs quote markups: A Beckett clip-on float switch ($22.95) or RectorSeal Safe-T-Switch SS1/SS3 ($29.95–$38.49) splices into the 24V R or Y thermostat wire at the air handler in 10 minutes. Quotes charging $250–$450 for a single float switch are charging 7×–12× the part cost.',
      'Basement & crawlspace condensate pumps: Standard 15–20 ft lift condensate removal pumps list at $49.95–$98.00 (including models with 20 ft of vinyl tubing). Mini-split under-mount pumps (such as the Aspen Mini White) list at $332.16 because of their ultra-quiet compact sensor/pump assembly.',
      'Attic secondary drain pans: When an air handler sits above a finished ceiling, code requires a secondary auxiliary drain pan ($99.95–$143.00 hardware cost) plus an auxiliary pan float switch or secondary drain line.',
    ],
    auditChecklist: [
      'For any attic or upper-floor air handler, confirm that a new secondary drain pan and a 24V float safety switch are included in writing.',
      'If a basement system uses a condensate pump, check whether the pump’s built-in overflow safety switch is wired to break the 24V circuit if the pump fails.',
      'Ask whether the primary 3/4" PVC condensate line includes a cleanout tee and trap sized per the air handler manufacturer’s negative/positive pressure instructions.',
    ],
    auditorAdderNote: 'Primary drain connection and standard float safety switches ($22.95–$38.49 hardware) belong inside the base installation scope; compare any separate "water protection package" line item directly against the verified SKUs below.',
    relatedGuides: [
      {
        slug: 'condensate-pump-float-switch-secondary-drain-pan-quote',
        title: 'Condensate Pump, Float Switch & Secondary Drain Pan Quote Guide',
        summary: 'When code requires an auxiliary drain pan and SS1/SS3 float switch, and how to audit $400–$900 drain add-ons.',
      },
      {
        slug: 'heat-pump-vs-central-ac-and-gas-furnace-cost',
        title: 'Heat Pump vs Central AC + Gas Furnace Installed Cost',
        summary: 'Compare air handler vs furnace + cased coil configurations, including attic vs basement drain requirements.',
      },
    ],
    primarySources: [
      {
        label: 'NREL / NLR REMDB Space Conditioning Database',
        url: 'https://remdb.nlr.gov/',
        note: 'Federal residential retrofit cost benchmark reference.',
      },
    ],
  },
  {
    slug: 'mini-split-brackets-covers',
    name: 'Mini-Split Wall Brackets, Ground Stands & Line-Hide Covers',
    shortName: 'Mini-Split Brackets, Stands & Covers',
    badge: 'Ductless Accessories · 4.5" PVC Line Covers, Wall Brackets & Snow Stands',
    summary: 'Verified wholesale prices for 4.5" PVC exterior line-set cover kits, RectorSeal and DiversiTech Quick-Sling outdoor wall mounting brackets, elevated cold-climate heat pump ground stands, and wall penetration sleeves.',
    whatItDoes: 'Ductless and multi-zone mini-split installations often run insulated copper line sets, condensate tubing, and communication wire along an exterior wall inside UV-resistant PVC line-hide ducting, and mount the outdoor heat pump on an elevated wall bracket or snow stand above winter drift level.',
    whenNeededVsPadded: [
      'Exterior PVC line-set cover kits: A complete 4.5" × 12 ft PVC line-hide kit with elbows, wall inlet cap, and couplings (MRCOOL LineGuard or generic 4.5" kit) lists at $132.00–$149.00. Beware of per-zone "line cover adders" charging $500–$900 per head on short straight runs.',
      'Wall brackets vs snow stands: In cold climates, heat pumps must sit above average snow depth so defrost water can drain freely. Standard 300–500 lb wall brackets list at $116.44–$222.52, Senville ground stands list at $94.99, and heavy-duty DiversiTech Quick-Sling stands/brackets list at $349.95.',
      'Wall penetration sleeves: A RectorSeal NFP-75 wall sleeve lists at $24.95 and protects the line set and flare insulation where it passes through brick, siding, or framing.',
    ],
    auditChecklist: [
      'Confirm whether exterior PVC line-hide covers (and what color/length) are included in your mini-split quote or billed extra per foot.',
      'In snow-belt states, verify that the outdoor unit is mounted on a 12"+ elevated snow stand or wall bracket rather than sitting flat at grade where defrost ice can build up.',
      'On wood-frame walls, ask whether a wall bracket will transmit low-frequency compressor vibration into bedrooms — an elevated ground stand on a pad isolates vibration better.',
    ],
    auditorAdderNote: 'In the TonnageCheck Quote Auditor, single-zone (<=1.5T) and multi-zone (>=2T) mini-split installations are graded against the NREL/NLR REMDB non-ducted heat pump regressions.',
    relatedGuides: [
      {
        slug: 'multi-zone-mini-split-cost',
        title: 'Multi-Zone Ductless Mini-Split Cost Guide (2, 3 & 4 Zones)',
        summary: 'How indoor head count, branch boxes, line-set lengths, and line-hide covers affect installed mini-split pricing.',
      },
      {
        slug: 'single-zone-mini-split-cost-12000-18000-24000-btu',
        title: 'Single-Zone Mini-Split Cost Guide (9k, 12k, 18k & 24k BTU)',
        summary: 'Equipment vs installed cost breakdown for single-room ductless heat pumps.',
      },
      {
        slug: 'cold-climate-heat-pump-buying-guide-5f-cop',
        title: 'Cold-Climate Heat Pump Guide: 5°F COP & Defrost Drainage',
        summary: 'Why snow-stand clearance and defrost drainage matter on cold-climate heat pumps.',
      },
    ],
    primarySources: [
      {
        label: 'NREL / NLR REMDB Non-Ducted Mini-Split Benchmarks',
        url: 'https://remdb.nlr.gov/',
        note: 'Publishes single-zone and multi-zone non-ducted heat pump retrofit regressions.',
      },
    ],
  },
];

export const PART_CATEGORIES: PartCategoryWithStats[] = CATEGORY_DEFINITIONS.map((def) => {
  const items = ALL_PART_LISTINGS.filter((item) => item.category === def.slug);
  const prices = items.map((i) => i.price);
  const subGroupNames = Array.from(new Set(items.map((i) => i.subGroup)));
  const subGroups: PartSubGroupSummary[] = subGroupNames.map((name) => {
    const subItems = items.filter((i) => i.subGroup === name).sort((a, b) => a.price - b.price);
    const subPrices = subItems.map((i) => i.price);
    return {
      name,
      items: subItems,
      minPrice: Math.min(...subPrices),
      maxPrice: Math.max(...subPrices),
      medianPrice: median(subPrices),
    };
  });
  return {
    ...def,
    items,
    subGroups,
    count: items.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    medianPrice: median(prices),
  };
});

export const PART_CATALOG_STATS = {
  seedDate: SEED_DATE,
  totalParts: ALL_PART_LISTINGS.length,
  categoryCount: PART_CATEGORIES.length,
  minPrice: Math.min(...ALL_PART_LISTINGS.map((p) => p.price)),
  maxPrice: Math.max(...ALL_PART_LISTINGS.map((p) => p.price)),
  medianPrice: median(ALL_PART_LISTINGS.map((p) => p.price)),
};

export function getPartCategory(slug: string): PartCategoryWithStats | undefined {
  return PART_CATEGORIES.find((c) => c.slug === slug);
}
