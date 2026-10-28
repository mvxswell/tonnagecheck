// Head-to-head HVAC brand, tonnage, system-type, refrigerant, staging, and model comparisons (/compare/[slug]/).
// Every price, efficiency rating, AHRI reference number, and benchmark range is computed dynamically from
// src/data/equipment.ts, src/data/brands.ts, and src/lib/facts.ts; non-price facts cite src/data/sources.ts.
import { SYSTEMS, TONNAGES, SYSTEM_TYPE_LABEL, TIER_LABEL, tonSlug, lowestPrice, median, type System, type SystemType, type Tier } from './equipment';
import { BRANDS, brandByName, brandSlug } from './brands';
import { SOURCES } from './sources';
type SourceKey = keyof typeof SOURCES;
import { fairRange, systemsWhere, statsOf, refrigerantOf, isInverter, seedDateLabel, cpi, usd, fmtRange, pct, type Range } from '../lib/facts';

export type CompareCategory = 'brand' | 'tonnage' | 'type' | 'model';

export interface CompareSideSummary {
  label: string;
  sublabel: string;
  href?: string;
  count: number;
  equipMin: number;
  equipMax: number;
  equipMedian: number;
  fair: Range;
  markupMid: number;
  seer2Span: string;
  hspf2Span: string;
  refrigerants: string;
  staging: string;
  energyStarCount: number;
  coldClimateCount: number;
  sampleSystem: System;
}

export interface CompareEntry {
  slug: string;
  category: CompareCategory;
  shortLabel: string;
  title: string;
  h1: string;
  description: string;
  lead: string;
  left: CompareSideSummary;
  right: CompareSideSummary;
  auditDefaults: { systemType: SystemType; tons: number; tier: Tier; brand?: string };
  conciergeBrandModel: string;
  relatedBrands: string[];
  relatedTonnages: number[];
  systemsLeft: System[];
  systemsRight: System[];
  modelLeft?: System;
  modelRight?: System;
  bodyHtml: string;
}

const src = (k: SourceKey, text?: string) => {
  const s = SOURCES[k];
  return `<a href="${s.url}" rel="noopener" target="_blank">${text ?? s.title}</a>`;
};
const tonLink = (t: number, text?: string) => `<a href="/tonnage/${tonSlug(t)}/">${text ?? `${t}-ton`}</a>`;
const brandLink = (b: string, text?: string) => `<a href="/brands/${brandSlug(b)}/">${text ?? b}</a>`;
const sysLink = (s: System, text?: string) => `<a href="/systems/${s.slug}/">${text ?? `${s.brand} ${s.tons}-ton ${s.components[0]}`}</a>`;
const remdbNote = `Installed ranges are ${src('remdb', 'DOE REMDB')} (National Laboratory of the Rockies) regressions restated from ${cpi.baseMonth} to ${cpi.latestMonth} dollars (×${cpi.factor} ${src('fredCpi', 'BLS CPI-U')}).`;

function summarizeSystems(label: string, sublabel: string, xs: System[], href?: string, defaultType: SystemType = 'central-heat-pump', defaultTons = 3, defaultTier: Tier = 'standard'): CompareSideSummary {
  const sorted = [...xs].sort((a, b) => lowestPrice(a) - lowestPrice(b));
  const prices = sorted.map(lowestPrice);
  const equipMin = Math.min(...prices);
  const equipMax = Math.max(...prices);
  const equipMedian = Math.round(median(prices));
  const fairs = sorted.map((s) => fairRange(s.systemType, s.tons, s.tier));
  const fair: Range = fairs.length
    ? { low: Math.min(...fairs.map((r) => r.low)), mid: Math.round(median(fairs.map((r) => r.mid))), high: Math.max(...fairs.map((r) => r.high)) }
    : fairRange(defaultType, defaultTons, defaultTier);
  const seers = sorted.map((s) => s.specs.seer2).filter((v): v is number => v != null);
  const hspfs = sorted.map((s) => s.specs.hspf2).filter((v): v is number => v != null);
  const refs = [...new Set(sorted.map(refrigerantOf).filter((v): v is string => Boolean(v)))];
  const invCount = sorted.filter(isInverter).length;
  const fixedCount = sorted.length - invCount;
  const staging = invCount && fixedCount ? `${invCount} inverter / ${fixedCount} fixed-stage` : invCount ? 'Variable-speed inverter' : 'Single / two-stage';
  return {
    label,
    sublabel,
    href,
    count: sorted.length,
    equipMin,
    equipMax,
    equipMedian,
    fair,
    markupMid: fair.mid - equipMedian,
    seer2Span: seers.length ? (Math.min(...seers) === Math.max(...seers) ? `${seers[0]} SEER2` : `${Math.min(...seers)}–${Math.max(...seers)} SEER2`) : '—',
    hspf2Span: hspfs.length ? (Math.min(...hspfs) === Math.max(...hspfs) ? `${hspfs[0]} HSPF2` : `${Math.min(...hspfs)}–${Math.max(...hspfs)} HSPF2`) : '—',
    refrigerants: refs.length ? refs.join(', ') : 'Listed on unit',
    staging,
    energyStarCount: sorted.filter((s) => s.energyStar).length,
    coldClimateCount: sorted.filter((s) => s.energyStar?.coldClimate).length,
    sampleSystem: sorted[0],
  };
}

function buildBrandComparison(
  slug: string,
  brandAName: string,
  brandBName: string,
  shortSuffix: string,
  h1: string,
  filterType?: SystemType,
): CompareEntry {
  const bA = brandByName(brandAName)!;
  const bB = brandByName(brandBName)!;
  const xsA = filterType ? bA.systems.filter((s) => s.systemType === filterType) : bA.systems;
  const xsB = filterType ? bB.systems.filter((s) => s.systemType === filterType) : bB.systems;
  const useA = xsA.length ? xsA : bA.systems;
  const useB = xsB.length ? xsB : bB.systems;

  const left = summarizeSystems(bA.name, `${useA.length} seeded systems`, useA, `/brands/${bA.slug}/`);
  const right = summarizeSystems(bB.name, `${useB.length} seeded systems`, useB, `/brands/${bB.slug}/`);
  const title = `${usd(left.equipMin)} vs ${usd(right.equipMin)} Equip: ${bA.name} vs ${bB.name} ${shortSuffix}`.trim();
  const description = `${bA.name} (${usd(left.equipMin)}–${usd(left.equipMax)}, ${left.seer2Span}) vs ${bB.name} (${usd(right.equipMin)}–${usd(right.equipMax)}, ${right.seer2Span}) equipment & ${fmtRange(left.fair)} installed cost.`;
  const sharedTons = TONNAGES.filter((t) => useA.some((s) => s.tons === t) && useB.some((s) => s.tons === t));
  const overlapRows = (sharedTons.length ? sharedTons : TONNAGES.filter((t) => useA.some((s) => s.tons === t) || useB.some((s) => s.tons === t))).map((t) => {
    const aT = useA.filter((s) => s.tons === t);
    const bT = useB.filter((s) => s.tons === t);
    const aMin = aT.length ? Math.min(...aT.map(lowestPrice)) : null;
    const bMin = bT.length ? Math.min(...bT.map(lowestPrice)) : null;
    const fair = fairRange(filterType ?? 'central-heat-pump', t, 'standard');
    return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${aMin != null ? usd(aMin) : '—'}</td><td class="r num">${bMin != null ? usd(bMin) : '—'}</td><td class="r num">${aMin != null && bMin != null ? (aMin === bMin ? '$0' : `${aMin < bMin ? `${bA.name} −` : `${bB.name} −`}${usd(Math.abs(aMin - bMin))}`) : '—'}</td><td class="r num">${fmtRange(fair)}</td></tr>`;
  }).join('\n');

  const diffMed = Math.abs(left.equipMedian - right.equipMedian);
  const cheaperMedBrand = left.equipMedian <= right.equipMedian ? bA.name : bB.name;

  const bodyHtml = `
<h2>Equipment price &amp; contractor markup spread: ${bA.name} vs ${bB.name}</h2>
<p>Across our verified distributor catalog captured ${seedDateLabel} (${src('hvacdirect', 'HVACDirect')}, ${src('alpine', 'Alpine Home Air')}), ${brandLink(bA.name)} lists ${left.count} systems from <b>${usd(left.equipMin)} to ${usd(left.equipMax)}</b> (median <b>${usd(left.equipMedian)}</b>), while ${brandLink(bB.name)} lists ${right.count} systems from <b>${usd(right.equipMin)} to ${usd(right.equipMax)}</b> (median <b>${usd(right.equipMedian)}</b>). That puts ${cheaperMedBrand}'s median listed hardware price <b>${usd(diffMed)} lower</b> before installation labor is added.</p>
<p>When a contractor quotes both brands, compare the gap on your proposal against the actual hardware gap by tonnage below:</p>
<div class="tablewrap"><table><thead><tr><th>System size</th><th class="r">${bA.name} lowest listed</th><th class="r">${bB.name} lowest listed</th><th class="r">Hardware difference</th><th class="r">DOE installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
${overlapRows}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Efficiency, compressor staging &amp; refrigerant comparison</h2>
<ul>
<li><b>${bA.name} efficiency &amp; staging:</b> ${left.seer2Span}${left.hspf2Span !== '—' ? ` (${left.hspf2Span})` : ''}; ${left.staging}; ${left.energyStarCount} of ${left.count} pairings matched in the ${src('esApi', 'EPA ENERGY STAR database')} (${left.coldClimateCount} Cold Climate certified). Refrigerants: <b>${left.refrigerants}</b>. Lowest-priced entry: ${sysLink(left.sampleSystem)} (${usd(lowestPrice(left.sampleSystem))}).</li>
<li><b>${bB.name} efficiency &amp; staging:</b> ${right.seer2Span}${right.hspf2Span !== '—' ? ` (${right.hspf2Span})` : ''}; ${right.staging}; ${right.energyStarCount} of ${right.count} pairings matched in ${src('esApi', 'ENERGY STAR')} (${right.coldClimateCount} Cold Climate certified). Refrigerants: <b>${right.refrigerants}</b>. Lowest-priced entry: ${sysLink(right.sampleSystem)} (${usd(lowestPrice(right.sampleSystem))}).</li>
</ul>
<p>Under the EPA's AIM Act Technology Transitions rule (${src('epaTechTransitions', 'EPA HFC restrictions')}), residential systems have transitioned from R-410A (GWP 2,088) to lower-GWP A2L refrigerants—primarily <b>R-32</b> (GWP 675) and <b>R-454B</b> (GWP 466). Both meet the federal 700-GWP limit; neither requires paying an inflated "new refrigerant surcharge" beyond normal installation procedures.</p>

<h2>Warranty, AHRI verification &amp; 2026 rebate rules</h2>
<p>Standard residential factory parts coverage across major manufacturers provides 10-year limited parts protection when registered within 60–90 days of installation, while labor coverage depends on the installing contractor. Always verify the exact outdoor + indoor model pairing on the ${src('ahri', 'AHRI Directory')} before signing—swapping a matched air handler or coil for a generic cabinet can drop SEER2/HSPF2 below utility rebate thresholds (${src('esCriteria', 'ENERGY STAR criteria')}). Note that the federal Section 25C tax credit expired after December 31, 2025 (${src('irsObbba', 'IRS')}), and under ${src('doePn262', 'DOE Program Notice 26-2')} (May 2026) federal HEAR/HEEHRA rebates no longer fund gas-to-electric fuel switching. Check state-specific utility incentives on our <a href="/states/">state energy &amp; rebate pages</a>.</p>`;

  const primaryType = filterType ?? (useA[0]?.systemType ?? 'central-heat-pump');
  const primaryTons = sharedTons.includes(3) ? 3 : (sharedTons[0] ?? useA[0]?.tons ?? 3);

  return {
    slug,
    category: 'brand',
    shortLabel: `${bA.name} vs ${bB.name}`,
    title,
    h1,
    description,
    lead: `Side-by-side comparison of ${bA.name} (${left.count} listings, ${usd(left.equipMin)}–${usd(left.equipMax)}) and ${bB.name} (${right.count} listings, ${usd(right.equipMin)}–${usd(right.equipMax)}) equipment prices, DOE REMDB installed benchmarks, SEER2/HSPF2 ratings, and contractor markup spread as of ${seedDateLabel}.`,
    left,
    right,
    auditDefaults: { systemType: primaryType, tons: primaryTons, tier: 'mid', brand: bA.name },
    conciergeBrandModel: `${bA.name} vs ${bB.name} (${primaryTons} ton)`,
    relatedBrands: [bA.name, bB.name],
    relatedTonnages: sharedTons.length ? sharedTons : [2, 3, 4],
    systemsLeft: useA,
    systemsRight: useB,
    bodyHtml,
  };
}

function buildTonnageComparison(tonsA: number, tonsB: number): CompareEntry {
  const slug = `${tonSlug(tonsA)}-vs-${tonSlug(tonsB)}-heat-pump-cost`;
  const xsA = systemsWhere({ type: 'central-heat-pump', tons: tonsA });
  const xsB = systemsWhere({ type: 'central-heat-pump', tons: tonsB });
  const allA = systemsWhere({ tons: tonsA });
  const allB = systemsWhere({ tons: tonsB });
  const left = summarizeSystems(`${tonsA}-Ton Heat Pump`, `${(tonsA * 12000).toLocaleString('en-US')} BTU/h`, xsA.length ? xsA : allA, `/tonnage/${tonSlug(tonsA)}/`, 'central-heat-pump', tonsA);
  const right = summarizeSystems(`${tonsB}-Ton Heat Pump`, `${(tonsB * 12000).toLocaleString('en-US')} BTU/h`, xsB.length ? xsB : allB, `/tonnage/${tonSlug(tonsB)}/`, 'central-heat-pump', tonsB);
  const fairAStd = fairRange('central-heat-pump', tonsA, 'standard');
  const fairBStd = fairRange('central-heat-pump', tonsB, 'standard');
  const fairAMid = fairRange('central-heat-pump', tonsA, 'mid');
  const fairBMid = fairRange('central-heat-pump', tonsB, 'mid');
  const fairAHigh = fairRange('central-heat-pump', tonsA, 'high');
  const fairBHigh = fairRange('central-heat-pump', tonsB, 'high');
  left.fair = fairAStd;
  right.fair = fairBStd;
  left.markupMid = fairAStd.mid - left.equipMedian;
  right.markupMid = fairBStd.mid - right.equipMedian;

  const title = `${usd(left.equipMin)} vs ${usd(right.equipMin)} Equip: ${tonsA}T vs ${tonsB}T Heat Pump`;
  const h1 = `${tonsA}-ton vs ${tonsB}-ton heat pump cost: equipment price, installed benchmark & sizing`;
  const description = `${tonsA}-ton (${usd(left.equipMin)}–${usd(left.equipMax)} equip, ${fmtRange(fairAStd)} installed) vs ${tonsB}-ton (${usd(right.equipMin)}–${usd(right.equipMax)} equip, ${fmtRange(fairBStd)} installed) heat pump cost.`;

  const btuDiff = (tonsB - tonsA) * 12000;
  const cfmA = tonsA * 400;
  const cfmB = tonsB * 400;
  const midStepStd = fairBStd.mid - fairAStd.mid;
  const midStepHigh = fairBHigh.mid - fairAHigh.mid;

  const bodyHtml = `
<h2>Equipment &amp; DOE installed benchmark step: ${tonsA} ton vs ${tonsB} ton</h2>
<p>Stepping from a ${tonLink(tonsA, `${tonsA}-ton`)} (${(tonsA * 12000).toLocaleString('en-US')} BTU/h) to a ${tonLink(tonsB, `${tonsB}-ton`)} (${(tonsB * 12000).toLocaleString('en-US')} BTU/h) central heat pump adds <b>${btuDiff.toLocaleString('en-US')} BTU/h</b> of nominal capacity and increases required indoor return/supply airflow from <b>${cfmA.toLocaleString('en-US')} CFM to ${cfmB.toLocaleString('en-US')} CFM</b> (at 400 CFM per ton). In the U.S. Department of Energy's ${src('remdb', 'REMDB')} benchmark, that half-ton or full-ton step adds <b>${usd(midStepStd)}</b> to the standard-efficiency installed midpoint (${usd(fairAStd.mid)} → ${usd(fairBStd.mid)}) and <b>${usd(midStepHigh)}</b> at the high-efficiency tier (${usd(fairAHigh.mid)} → ${usd(fairBHigh.mid)}):</p>
<div class="tablewrap"><table><thead><tr><th>Efficiency tier</th><th class="r">${tonsA}-ton benchmark <span class="badge b-est">est.</span></th><th class="r">${tonsB}-ton benchmark <span class="badge b-est">est.</span></th><th class="r">Midpoint step</th></tr></thead><tbody>
<tr><td>Standard (&lt;15.2 SEER2)</td><td class="r num">${fmtRange(fairAStd)} (mid ${usd(fairAStd.mid)})</td><td class="r num">${fmtRange(fairBStd)} (mid ${usd(fairBStd.mid)})</td><td class="r num">+${usd(fairBStd.mid - fairAStd.mid)}</td></tr>
<tr><td>Mid-tier (15.2–16.9 SEER2)</td><td class="r num">${fmtRange(fairAMid)} (mid ${usd(fairAMid.mid)})</td><td class="r num">${fmtRange(fairBMid)} (mid ${usd(fairBMid.mid)})</td><td class="r num">+${usd(fairBMid.mid - fairAMid.mid)}</td></tr>
<tr><td>High-tier (17+ SEER2)</td><td class="r num">${fmtRange(fairAHigh)} (mid ${usd(fairAHigh.mid)})</td><td class="r num">${fmtRange(fairBHigh)} (mid ${usd(fairBHigh.mid)})</td><td class="r num">+${usd(fairBHigh.mid - fairAHigh.mid)}</td></tr>
<tr><td>Listed ducted heat pump hardware (${seedDateLabel})</td><td class="r num">${usd(left.equipMin)}–${usd(left.equipMax)} (med ${usd(left.equipMedian)})</td><td class="r num">${usd(right.equipMin)}–${usd(right.equipMax)} (med ${usd(right.equipMedian)})</td><td class="r num">${right.equipMedian >= left.equipMedian ? '+' : '−'}${usd(Math.abs(right.equipMedian - left.equipMedian))} med</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Why guessing between ${tonsA} and ${tonsB} tons without a Manual J load calculation backfires</h2>
<ul>
<li><b>Airflow and static pressure (${cfmA.toLocaleString('en-US')} vs ${cfmB.toLocaleString('en-US')} CFM):</b> If your existing return drop and supply trunks were sized for ${tonsA} tons (${cfmA.toLocaleString('en-US')} CFM) and a contractor drops in a ${tonsB}-ton unit (${cfmB.toLocaleString('en-US')} CFM) "just to be safe," external static pressure rises sharply, making vents noisy and overworking the ECM indoor blower motor. See our <a href="/guides/asbestos-old-flex-duct-removal-and-return-air-drop-sizing/">return-air drop sizing guide</a>.</li>
<li><b>Short-cycling and poor summer dehumidification:</b> Single-stage and two-stage condensers remove latent moisture only after running continuously for several minutes. Oversizing by ${btuDiff.toLocaleString('en-US')} BTU/h satisfies the sensible thermostat setting too quickly in humid weather, leaving indoor air clammy (${src('bascColdClimate', 'DOE/PNNL sizing guidance')}).</li>
<li><b>How to settle conflicting contractor bids:</b> If one contractor quotes ${tonsA} tons (such as ${sysLink(left.sampleSystem)}) and another quotes ${tonsB} tons (such as ${sysLink(right.sampleSystem)}), ask both for their room-by-room ACCA Manual J printout and compare brands across ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, and ${brandLink('LG')}. Read our <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J vs rule-of-thumb sizing guide</a>.</li>
</ul>`;

  return {
    slug,
    category: 'tonnage',
    shortLabel: `${tonsA} Ton vs ${tonsB} Ton`,
    title,
    h1,
    description,
    lead: `Direct cost and capacity comparison between ${tonsA}-ton (${(tonsA * 12000).toLocaleString('en-US')} BTU/h) and ${tonsB}-ton (${(tonsB * 12000).toLocaleString('en-US')} BTU/h) heat pump systems: listed distributor prices (${seedDateLabel}), DOE REMDB installed ranges across all three efficiency tiers, and duct CFM requirements.`,
    left,
    right,
    auditDefaults: { systemType: 'central-heat-pump', tons: tonsB, tier: 'standard' },
    conciergeBrandModel: `${tonsA} ton vs ${tonsB} ton heat pump`,
    relatedBrands: ['Goodman', 'Trane', 'Bosch', 'LG'],
    relatedTonnages: [tonsA, tonsB],
    systemsLeft: allA,
    systemsRight: allB,
    bodyHtml,
  };
}

function buildSystemTypeComparison(
  slug: string,
  tons: number,
  typeA: SystemType,
  typeB: SystemType,
  shortSuffix: string,
  h1: string,
): CompareEntry {
  const xsA = systemsWhere({ type: typeA, tons });
  const xsB = systemsWhere({ type: typeB, tons });
  const fallbackA = xsA.length ? xsA : systemsWhere({ type: typeA });
  const fallbackB = xsB.length ? xsB : systemsWhere({ type: typeB });
  const fairA = fairRange(typeA, tons, 'standard');
  const fairB = fairRange(typeB, tons, 'standard');
  const fairAHigh = fairRange(typeA, tons, 'high');
  const fairBHigh = fairRange(typeB, tons, 'high');
  const left = summarizeSystems(`${tons}-Ton ${SYSTEM_TYPE_LABEL[typeA].split(' (')[0]}`, `${(tons * 12000).toLocaleString('en-US')} BTU/h`, fallbackA, `/tonnage/${tonSlug(tons)}/`, typeA, tons);
  const right = summarizeSystems(`${tons}-Ton ${SYSTEM_TYPE_LABEL[typeB].split(' (')[0]}`, `${(tons * 12000).toLocaleString('en-US')} BTU/h`, fallbackB, `/tonnage/${tonSlug(tons)}/`, typeB, tons);
  left.fair = fairA;
  right.fair = fairB;
  left.markupMid = fairA.mid - left.equipMedian;
  right.markupMid = fairB.mid - right.equipMedian;

  const title = `${usd(left.equipMin)} vs ${usd(right.equipMin)} Equip: ${shortSuffix}`;
  const description = `Compare ${tons}-ton ${SYSTEM_TYPE_LABEL[typeA].toLowerCase()} (${usd(left.equipMin)}–${usd(left.equipMax)} equip, ${fmtRange(fairA)} installed) vs ${SYSTEM_TYPE_LABEL[typeB].toLowerCase()} (${fmtRange(fairB)} installed).`;

  const bodyHtml = `
<h2>${tons}-ton ${SYSTEM_TYPE_LABEL[typeA]} vs ${SYSTEM_TYPE_LABEL[typeB]}: equipment &amp; installed benchmarks</h2>
<p>At ${tonLink(tons, `${tons} tons`)} (${(tons * 12000).toLocaleString('en-US')} BTU/h), homeowners comparing a <b>${SYSTEM_TYPE_LABEL[typeA].toLowerCase()}</b> against a <b>${SYSTEM_TYPE_LABEL[typeB].toLowerCase()}</b> see two distinct hardware and labor profiles in our seed data (${seedDateLabel}) and the DOE ${src('remdb', 'REMDB')} cost regressions:</p>
<div class="tablewrap"><table><thead><tr><th>Metric (${tons}-ton nominal capacity)</th><th class="r">${SYSTEM_TYPE_LABEL[typeA]}</th><th class="r">${SYSTEM_TYPE_LABEL[typeB]}</th></tr></thead><tbody>
<tr><td>Listed equipment range (${seedDateLabel})</td><td class="r num">${usd(left.equipMin)}–${usd(left.equipMax)} (med ${usd(left.equipMedian)})</td><td class="r num">${usd(right.equipMin)}–${usd(right.equipMax)} (med ${usd(right.equipMedian)})</td></tr>
<tr><td>Standard-tier installed benchmark <span class="badge b-est">est.</span></td><td class="r num">${fmtRange(fairA)} (mid ${usd(fairA.mid)})</td><td class="r num">${fmtRange(fairB)} (mid ${usd(fairB.mid)})</td></tr>
<tr><td>High-efficiency installed benchmark <span class="badge b-est">est.</span></td><td class="r num">${fmtRange(fairAHigh)} (mid ${usd(fairAHigh.mid)})</td><td class="r num">${fmtRange(fairBHigh)} (mid ${usd(fairBHigh.mid)})</td></tr>
<tr><td>Efficiency span in seed</td><td class="r num">${left.seer2Span}</td><td class="r num">${right.seer2Span}</td></tr>
<tr><td>Sample listed system</td><td class="r">${sysLink(left.sampleSystem)} (${usd(lowestPrice(left.sampleSystem))})</td><td class="r">${sysLink(right.sampleSystem)} (${usd(lowestPrice(right.sampleSystem))})</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Key installation, fuel &amp; 2026 rebate considerations</h2>
<ul>
<li><b>Electrical &amp; duct scope:</b> A ducted central heat pump uses a 240V indoor air handler (often with auxiliary heat strips; see <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">200A panel &amp; heat strip adders</a>), whereas a central AC + gas furnace reuses an existing 120V furnace circuit and gas flue, and a ductless mini-split routes insulated copper line sets directly to indoor wall or ceiling heads without duct losses.</li>
<li><b>Operating cost by state utility rates:</b> Whether an all-electric heat pump or a gas furnace costs less per million BTU of winter heat depends on your state's EIA residential ¢/kWh electricity rate vs $/Mcf natural gas price (${src('eiaElectricity', 'EIA electricity')}, ${src('eiaGas', 'EIA natural gas')}). Check your state on our <a href="/states/">state heat pump cost &amp; energy pages</a>.</li>
<li><b>2026 federal tax credit &amp; HEAR rules:</b> The federal 25C tax credit ended after Dec. 31, 2025 (${src('irsObbba', 'IRS')}), and under ${src('doePn262', 'DOE Program Notice 26-2')} (May 2026), income-qualified HEAR rebates no longer subsidize switching from natural gas or propane to a heat pump. Compare brands across ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, ${brandLink('Mitsubishi')}, and ${brandLink('Daikin')}.</li>
</ul>`;

  return {
    slug,
    category: 'type',
    shortLabel: `${tons}T ${typeA === 'central-heat-pump' ? 'Heat Pump' : typeA} vs ${typeB === 'ac-furnace' ? 'AC+Furnace' : 'Mini-Split'}`,
    title,
    h1,
    description,
    lead: `Head-to-head comparison of ${tons}-ton ${SYSTEM_TYPE_LABEL[typeA].toLowerCase()} vs ${SYSTEM_TYPE_LABEL[typeB].toLowerCase()} equipment prices (${seedDateLabel}) and DOE national-lab installed replacement benchmarks.`,
    left,
    right,
    auditDefaults: { systemType: typeA, tons, tier: 'standard' },
    conciergeBrandModel: `${tons}-ton ${SYSTEM_TYPE_LABEL[typeA]} vs ${SYSTEM_TYPE_LABEL[typeB]}`,
    relatedBrands: ['Goodman', 'Trane', 'Mitsubishi', 'Daikin', 'Bosch'],
    relatedTonnages: [tons],
    systemsLeft: fallbackA,
    systemsRight: fallbackB,
    bodyHtml,
  };
}

function buildRefrigerantComparison(): CompareEntry {
  const r32 = SYSTEMS.filter((s) => refrigerantOf(s) === 'R-32');
  const r454b = SYSTEMS.filter((s) => refrigerantOf(s) === 'R-454B');
  const left = summarizeSystems('R-32 Systems (GWP 675)', `${r32.length} seeded systems`, r32, '/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/');
  const right = summarizeSystems('R-454B Systems (GWP 466)', `${r454b.length} seeded systems`, r454b, '/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/');
  const f3 = fairRange('central-heat-pump', 3, 'standard');
  left.fair = f3;
  right.fair = f3;
  left.markupMid = f3.mid - left.equipMedian;
  right.markupMid = f3.mid - right.equipMedian;

  const r32Brands = [...new Set(r32.map((s) => s.brand))];
  const r454bBrands = [...new Set(r454b.map((s) => s.brand))];

  const title = `${usd(left.equipMin)} vs ${usd(right.equipMin)} Equip: R-32 vs R-454B Heat Pumps`;
  const h1 = 'R-32 vs R-454B heat pump systems compared: brands, GWP, prices & quote markups';
  const description = `Compare ${r32.length} R-32 (${usd(left.equipMin)}–${usd(left.equipMax)}) vs ${r454b.length} R-454B (${usd(right.equipMin)}–${usd(right.equipMax)}) heat pump & AC systems against ${fmtRange(f3)} 3T installed benchmarks.`;

  const bodyHtml = `
<h2>Which brands use R-32 vs R-454B in our ${SYSTEMS.length}-system catalog?</h2>
<p>Under the EPA's AIM Act Technology Transitions rule (${src('epaTechTransitions', 'EPA HFC restrictions')}), residential split and packaged HVAC systems manufactured from January 1, 2025 must use refrigerants with a Global Warming Potential (GWP) below 700, replacing legacy R-410A (GWP 2,088). Manufacturers split into two ASHRAE A2L refrigerant camps across our catalog (${seedDateLabel}):</p>
<ul>
<li><b>R-32 (single-component HFC, GWP 675 — ${r32.length} systems listed from ${usd(left.equipMin)} to ${usd(left.equipMax)}, median ${usd(left.equipMedian)}):</b> Used by ${r32Brands.map((b) => brandLink(b)).join(', ')}. Because R-32 is a single-component refrigerant rather than a blend, it has zero temperature glide and can be topped off in either liquid or vapor state without fractionation. Sample system: ${sysLink(left.sampleSystem)} (${usd(lowestPrice(left.sampleSystem))}).</li>
<li><b>R-454B (zeotropic blend of 68.9% R-32 and 31.1% R-1234yf, GWP 466 — ${r454b.length} systems listed from ${usd(right.equipMin)} to ${usd(right.equipMax)}, median ${usd(right.equipMedian)}):</b> Used by ${r454bBrands.map((b) => brandLink(b)).join(', ')}. Sample system: ${sysLink(right.sampleSystem)} (${usd(lowestPrice(right.sampleSystem))}).</li>
</ul>

<h2>3-ton head-to-head price check: R-32 vs R-454B</h2>
<p>Some contractors pitch a steep "A2L sensor and R-454B/R-32 compliance surcharge" on replacement quotes. Yet our live 3-ton ducted heat pump data (${tonLink(3, '3-ton hub')}) shows that R-32 and R-454B equipment lists across the exact same price band against the ${fmtRange(f3)} DOE ${src('remdb', 'REMDB')} installed benchmark. Read our full <a href="/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/">R-410A vs R-454B vs R-32 refrigerant transition guide</a> and <a href="/guides/hvac-line-set-flush-vs-copper-line-set-replacement-cost/">copper line set flush vs replacement guide</a>.</p>`;

  return {
    slug: 'r32-vs-r454b-heat-pump-systems-compared',
    category: 'type',
    shortLabel: 'R-32 vs R-454B Systems',
    title,
    h1,
    description,
    lead: `Side-by-side comparison of all ${r32.length} R-32 systems and ${r454b.length} R-454B systems in our catalog (${seedDateLabel}): which brands use each A2L refrigerant, listed hardware prices, GWP ratings, and how to spot inflated refrigerant-transition surcharges.`,
    left,
    right,
    auditDefaults: { systemType: 'central-heat-pump', tons: 3, tier: 'mid' },
    conciergeBrandModel: 'R-32 vs R-454B 3-ton heat pump',
    relatedBrands: ['Goodman', 'Daikin', 'Trane', 'Bosch', 'Mitsubishi', 'LG', 'Gree'],
    relatedTonnages: [2, 3, 4, 5],
    systemsLeft: r32,
    systemsRight: r454b,
    bodyHtml,
  };
}

function buildStagingComparison(tons: number): CompareEntry {
  const slug = `single-stage-vs-inverter-${tonSlug(tons)}-heat-pump-cost`;
  const fixed = systemsWhere({ type: 'central-heat-pump', tons, staging: 'fixed' });
  const inv = systemsWhere({ type: 'central-heat-pump', tons, staging: 'inverter' });
  const fairStd = fairRange('central-heat-pump', tons, 'standard');
  const fairHigh = fairRange('central-heat-pump', tons, 'high');
  const left = summarizeSystems(`${tons}-Ton Single / Two-Stage`, `${fixed.length} fixed-stage systems`, fixed, `/tonnage/${tonSlug(tons)}/`, 'central-heat-pump', tons, 'standard');
  const right = summarizeSystems(`${tons}-Ton Inverter (Variable)`, `${inv.length} inverter systems`, inv, `/tonnage/${tonSlug(tons)}/`, 'central-heat-pump', tons, 'high');
  left.fair = fairStd;
  right.fair = fairHigh;
  left.markupMid = fairStd.mid - left.equipMedian;
  right.markupMid = fairHigh.mid - right.equipMedian;

  const title = `${usd(left.equipMin)} vs ${usd(right.equipMin)} Equip: ${tons}T Fixed vs Inverter`;
  const h1 = `Single-stage / two-stage vs inverter ${tons}-ton heat pump cost (${seedDateLabel})`;
  const description = `${tons}-ton fixed-stage (${usd(left.equipMin)}–${usd(left.equipMax)} equip, ${fmtRange(fairStd)} installed) vs inverter (${usd(right.equipMin)}–${usd(right.equipMax)} equip, ${fmtRange(fairHigh)} installed) heat pumps.`;

  const benchDiff = fairHigh.mid - fairStd.mid;
  const equipMedDiff = right.equipMedian - left.equipMedian;

  const bodyHtml = `
<h2>${tons}-ton fixed-stage vs variable-speed inverter: hardware &amp; installed spread</h2>
<p>At ${tonLink(tons, `${tons} tons`)} (${(tons * 12000).toLocaleString('en-US')} BTU/h), our catalog (${seedDateLabel}) lists <b>${fixed.length} fixed-speed (single- or two-stage)</b> ducted heat pumps from <b>${usd(left.equipMin)} to ${usd(left.equipMax)}</b> (median <b>${usd(left.equipMedian)}</b>) and <b>${inv.length} variable-speed inverter</b> ducted heat pumps from <b>${usd(right.equipMin)} to ${usd(right.equipMax)}</b> (median <b>${usd(right.equipMedian)}</b>):</p>
<div class="tablewrap"><table><thead><tr><th>${tons}-ton comparison metric</th><th class="r">Single / two-stage (${fixed.length})</th><th class="r">Variable-speed inverter (${inv.length})</th><th class="r">Difference</th></tr></thead><tbody>
<tr><td>Lowest listed equipment (${seedDateLabel})</td><td class="r num">${usd(left.equipMin)} (${sysLink(left.sampleSystem, left.sampleSystem.brand)})</td><td class="r num">${usd(right.equipMin)} (${sysLink(right.sampleSystem, right.sampleSystem.brand)})</td><td class="r num">${right.equipMin >= left.equipMin ? '+' : '−'}${usd(Math.abs(right.equipMin - left.equipMin))}</td></tr>
<tr><td>Median listed equipment</td><td class="r num">${usd(left.equipMedian)}</td><td class="r num">${usd(right.equipMedian)}</td><td class="r num">${equipMedDiff >= 0 ? '+' : '−'}${usd(Math.abs(equipMedDiff))}</td></tr>
<tr><td>DOE REMDB installed benchmark <span class="badge b-est">est.</span></td><td class="r num">${fmtRange(fairStd)} (mid ${usd(fairStd.mid)})</td><td class="r num">${fmtRange(fairHigh)} (mid ${usd(fairHigh.mid)})</td><td class="r num">+${usd(benchDiff)} mid</td></tr>
<tr><td>SEER2 / HSPF2 range</td><td class="r num">${left.seer2Span} / ${left.hspf2Span}</td><td class="r num">${right.seer2Span} / ${right.hspf2Span}</td><td class="r num">${right.coldClimateCount} Cold Climate</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Why contractors mark up ${tons}-ton inverter tiers far beyond the hardware difference</h2>
<p>In DOE's national-lab cost model, moving from a standard-tier ${tons}-ton heat pump (${usd(fairStd.mid)} midpoint) to a high-efficiency inverter tier (${usd(fairHigh.mid)} midpoint) adds <b>${usd(benchDiff)}</b> installed. Even more revealing, non-communicating 24V inverter systems from ${brandLink('ACiQ')}, ${brandLink('MRCOOL')}, ${brandLink('Gree')}, ${brandLink('Trane')}, and ${brandLink('Bosch')} modulate compressor speed automatically using coil suction pressure without requiring a proprietary communicating thermostat—meaning installation labor is virtually identical to a single-stage swap. See our <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage cost guide</a> and <a href="/guides/14-3-seer2-vs-16-seer2-vs-18-seer2-heat-pump-payback-math/">SEER2 payback math guide</a>.</p>`;

  return {
    slug,
    category: 'tonnage',
    shortLabel: `${tons}T Fixed vs Inverter`,
    title,
    h1,
    description,
    lead: `At ${tons} tons, how much extra does a variable-speed inverter heat pump actually cost at the distributor vs on a contractor's "Good / Better / Best" quote sheet? Here is the exact hardware and DOE REMDB spread across all ${fixed.length + inv.length} ${tons}-ton ducted heat pumps (${seedDateLabel}).`,
    left,
    right,
    auditDefaults: { systemType: 'central-heat-pump', tons, tier: 'high' },
    conciergeBrandModel: `${tons}-ton single-stage vs inverter heat pump`,
    relatedBrands: ['Goodman', 'Trane', 'Bosch', 'Gree', 'LG', 'ACiQ', 'MRCOOL'],
    relatedTonnages: [tons],
    systemsLeft: fixed,
    systemsRight: inv,
    bodyHtml,
  };
}

function buildModelComparison(
  slug: string,
  slugA: string,
  slugB: string,
  shortTitleSuffix: string,
): CompareEntry {
  const sA = SYSTEMS.find((s) => s.slug === slugA)!;
  const sB = SYSTEMS.find((s) => s.slug === slugB)!;
  const pA = lowestPrice(sA);
  const pB = lowestPrice(sB);
  const fA = fairRange(sA.systemType, sA.tons, sA.tier);
  const fB = fairRange(sB.systemType, sB.tons, sB.tier);
  const left = summarizeSystems(`${sA.brand} ${sA.components[0]}`, `${sA.tons}-ton · ${sA.specs.seer2 ?? '?'} SEER2`, [sA], `/systems/${sA.slug}/`, sA.systemType, sA.tons, sA.tier);
  const right = summarizeSystems(`${sB.brand} ${sB.components[0]}`, `${sB.tons}-ton · ${sB.specs.seer2 ?? '?'} SEER2`, [sB], `/systems/${sB.slug}/`, sB.systemType, sB.tons, sB.tier);

  const title = `${usd(pA)} vs ${usd(pB)} Equip: ${shortTitleSuffix}`;
  const h1 = `${sA.brand} ${sA.components[0]} vs ${sB.brand} ${sB.components[0]} (${sA.tons}-ton comparison)`;
  const description = `${sA.brand} ${sA.components[0]} (${usd(pA)}, ${sA.specs.seer2} SEER2) vs ${sB.brand} ${sB.components[0]} (${usd(pB)}, ${sB.specs.seer2} SEER2): ${sA.tons}T specs & ${fmtRange(fA)} installed cost.`;

  const priceDiff = Math.abs(pA - pB);
  const cheaperSys = pA <= pB ? sA : sB;
  const pricierSys = pA <= pB ? sB : sA;

  const bodyHtml = `
<h2>Direct model-vs-model spec &amp; price sheet (${seedDateLabel})</h2>
<p>This head-to-head comparison pairs two verified ${tonLink(sA.tons, `${sA.tons}-ton`)} systems from our catalog: the ${sysLink(sA, `${sA.brand} ${sA.components.join(' + ')}`)} listed at <b>${usd(pA)}</b> (${src(sA.prices[0].retailer.toLowerCase().includes('alpine') ? 'alpine' : 'hvacdirect', sA.prices[0].retailer)}) and the ${sysLink(sB, `${sB.brand} ${sB.components.join(' + ')}`)} listed at <b>${usd(pB)}</b> (${src(sB.prices[0].retailer.toLowerCase().includes('alpine') ? 'alpine' : 'hvacdirect', sB.prices[0].retailer)}). In public online distributor pricing, ${cheaperSys.brand}'s ${cheaperSys.components[0]} lists <b>${usd(priceDiff)} lower</b> (${pct(priceDiff / lowestPrice(pricierSys))} less) than ${pricierSys.brand}'s ${pricierSys.components[0]}:</p>
<div class="tablewrap"><table><thead><tr><th>Specification</th><th class="r">${sA.brand} ${sA.components[0]}</th><th class="r">${sB.brand} ${sB.components[0]}</th></tr></thead><tbody>
<tr><td>Full model pairing</td><td class="r num"><a href="/systems/${sA.slug}/">${sA.components.join(' + ')}</a></td><td class="r num"><a href="/systems/${sB.slug}/">${sB.components.join(' + ')}</a></td></tr>
<tr><td>Public listed equipment price (${seedDateLabel})</td><td class="r num"><b>${usd(pA)}</b> (<a href="${sA.prices[0].url}" rel="nofollow noopener" target="_blank">${sA.prices[0].retailer}</a>)</td><td class="r num"><b>${usd(pB)}</b> (<a href="${sB.prices[0].url}" rel="nofollow noopener" target="_blank">${sB.prices[0].retailer}</a>)</td></tr>
<tr><td>DOE installed benchmark (${TIER_LABEL[sA.tier].split(' (')[0]} / ${TIER_LABEL[sB.tier].split(' (')[0]}) <span class="badge b-est">est.</span></td><td class="r num">${fmtRange(fA)} (mid ${usd(fA.mid)})</td><td class="r num">${fmtRange(fB)} (mid ${usd(fB.mid)})</td></tr>
<tr><td>Non-equipment share at benchmark midpoint</td><td class="r num">${usd(fA.mid - pA)} (${pct((fA.mid - pA) / fA.mid)})</td><td class="r num">${usd(fB.mid - pB)} (${pct((fB.mid - pB) / fB.mid)})</td></tr>
<tr><td>Nominal capacity</td><td class="r num">${sA.tons} ton (${(sA.tons * 12000).toLocaleString('en-US')} BTU/h)</td><td class="r num">${sB.tons} ton (${(sB.tons * 12000).toLocaleString('en-US')} BTU/h)</td></tr>
<tr><td>SEER2 / EER2 / HSPF2</td><td class="r num">${sA.specs.seer2 ?? '—'} / ${sA.specs.eer2 ?? '—'} / ${sA.specs.hspf2 ?? '—'}</td><td class="r num">${sB.specs.seer2 ?? '—'} / ${sB.specs.eer2 ?? '—'} / ${sB.specs.hspf2 ?? '—'}</td></tr>
<tr><td>Compressor staging</td><td class="r">${sA.energyStar?.compressorStaging ?? sA.specs.stages ?? (isInverter(sA) ? 'Variable-speed inverter' : 'Fixed stage')}</td><td class="r">${sB.energyStar?.compressorStaging ?? sB.specs.stages ?? (isInverter(sB) ? 'Variable-speed inverter' : 'Fixed stage')}</td></tr>
<tr><td>Refrigerant</td><td class="r">${sA.energyStar?.refrigerant ?? refrigerantOf(sA) ?? '—'}</td><td class="r">${sB.energyStar?.refrigerant ?? refrigerantOf(sB) ?? '—'}</td></tr>
<tr><td>COP at 5°F / Heating 5°F capacity</td><td class="r num">${sA.energyStar?.copAt5F ?? '—'} / ${sA.energyStar?.heatingCapacity5F ? `${sA.energyStar.heatingCapacity5F.toLocaleString('en-US')} BTU/h` : '—'}</td><td class="r num">${sB.energyStar?.copAt5F ?? '—'} / ${sB.energyStar?.heatingCapacity5F ? `${sB.energyStar.heatingCapacity5F.toLocaleString('en-US')} BTU/h` : '—'}</td></tr>
<tr><td>ENERGY STAR / Cold Climate</td><td class="r">${sA.energyStar ? `Yes${sA.energyStar.coldClimate ? ' · Cold Climate' : ''}` : 'Listing rating'}</td><td class="r">${sB.energyStar ? `Yes${sB.energyStar.coldClimate ? ' · Cold Climate' : ''}` : 'Listing rating'}</td></tr>
<tr><td>AHRI reference #</td><td class="r num">${sA.energyStar?.ahriReferenceNumber ? `<a href="${SOURCES.ahri.url}" rel="noopener" target="_blank">${sA.energyStar.ahriReferenceNumber}</a>` : 'Ask contractor'}</td><td class="r num">${sB.energyStar?.ahriReferenceNumber ? `<a href="${SOURCES.ahri.url}" rel="noopener" target="_blank">${sB.energyStar.ahriReferenceNumber}</a>` : 'Ask contractor'}</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>How to use this model comparison when negotiating your quote</h2>
<ol>
<li><b>Compare the hardware delta (${usd(priceDiff)}) against your contractor's tier jump:</b> If a contractor offers both ${brandLink(sA.brand)} and ${brandLink(sB.brand)} at ${sA.tons} tons and charges thousands more than the ${usd(priceDiff)} hardware difference between ${sA.components[0]} and ${sB.components[0]}, ask for an itemized equipment vs labor breakdown.</li>
<li><b>Verify the exact indoor unit on the AHRI certificate:</b> Efficiency ratings (${sA.specs.seer2} SEER2 vs ${sB.specs.seer2} SEER2) apply only when the outdoor condenser is paired with its certified indoor coil or air handler (${src('ahri', 'AHRI Directory')}). Read our <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">AHRI certificate &amp; rebate check guide</a>.</li>
</ol>`;

  const otherSameTon = SYSTEMS.filter((s) => s.tons === sA.tons && s.slug !== sA.slug && s.slug !== sB.slug);

  return {
    slug,
    category: 'model',
    shortLabel: `${sA.brand} ${sA.components[0]} vs ${sB.brand} ${sB.components[0]}`,
    title,
    h1,
    description,
    lead: `Exact model-number comparison between the ${sA.tons}-ton ${sA.brand} ${sA.components.join(' + ')} (${usd(pA)} listed, ${sA.specs.seer2} SEER2) and ${sB.brand} ${sB.components.join(' + ')} (${usd(pB)} listed, ${sB.specs.seer2} SEER2), with DOE REMDB installed benchmarks and AHRI / ENERGY STAR records.`,
    left,
    right,
    auditDefaults: { systemType: sA.systemType, tons: sA.tons, tier: sA.tier, brand: sA.brand },
    conciergeBrandModel: `${sA.brand} ${sA.components[0]} vs ${sB.brand} ${sB.components[0]}`,
    relatedBrands: [...new Set([sA.brand, sB.brand])],
    relatedTonnages: [...new Set([sA.tons, sB.tons])],
    systemsLeft: [sA, ...otherSameTon.slice(0, 3)],
    systemsRight: [sB, ...otherSameTon.slice(3, 6)],
    modelLeft: sA,
    modelRight: sB,
    bodyHtml,
  };
}

export const COMPARISONS: CompareEntry[] = [
  // 14 Brand-vs-Brand Matchups
  buildBrandComparison('goodman-vs-trane-heat-pump-cost', 'Goodman', 'Trane', 'HVAC', 'Goodman vs Trane heat pump & AC cost: equipment prices vs installed quotes'),
  buildBrandComparison('bosch-vs-mitsubishi-heat-pump-cost', 'Bosch', 'Mitsubishi', 'Cost', 'Bosch IDS vs Mitsubishi Hyper-Heat cost: equipment vs installed quotes'),
  buildBrandComparison('bosch-vs-gree-flexx-heat-pump-cost', 'Bosch', 'Gree', 'Heat Pumps', 'Bosch IDS vs Gree Flexx heat pump cost: inverter specs & prices'),
  buildBrandComparison('goodman-vs-bosch-heat-pump-cost', 'Goodman', 'Bosch', 'Heat Pumps', 'Goodman vs Bosch IDS heat pump cost: fixed-stage vs inverter pricing'),
  buildBrandComparison('trane-vs-bosch-heat-pump-cost', 'Trane', 'Bosch', 'Heat Pumps', 'Trane vs Bosch heat pump cost: equipment prices, SEER2 & installed quotes'),
  buildBrandComparison('daikin-vs-mitsubishi-mini-split-cost', 'Daikin', 'Mitsubishi', 'Mini-Split', 'Daikin vs Mitsubishi mini-split heat pump cost: R-32 vs R-454B & cold-climate specs', 'mini-split'),
  buildBrandComparison('carrier-vs-mitsubishi-mini-split-cost', 'Carrier', 'Mitsubishi', 'Mini-Split', 'Carrier vs Mitsubishi mini-split heat pump cost: equipment & installed benchmarks', 'mini-split'),
  buildBrandComparison('lg-vs-mitsubishi-heat-pump-cost', 'LG', 'Mitsubishi', 'Cost', 'LG RED vs Mitsubishi Hyper-Heat cost: cold-climate heat pump comparison'),
  buildBrandComparison('lg-vs-trane-heat-pump-cost', 'LG', 'Trane', 'Heat Pumps', 'LG vs Trane heat pump cost: R-32 inverter vs R-454B system pricing'),
  buildBrandComparison('mrcool-vs-gree-heat-pump-cost', 'MRCOOL', 'Gree', 'Heat Pumps', 'MRCOOL vs Gree Flexx heat pump cost: equipment prices & installed benchmarks'),
  buildBrandComparison('aciq-vs-mrcool-heat-pump-cost', 'ACiQ', 'MRCOOL', 'Heat Pumps', 'ACiQ vs MRCOOL inverter heat pump cost: distributor prices vs installed quotes'),
  buildBrandComparison('goodman-vs-daikin-cost', 'Goodman', 'Daikin', 'HVAC', 'Goodman vs Daikin HVAC cost: shared R-32 parent company, equipment & quotes'),
  buildBrandComparison('goodman-vs-mrcool-heat-pump-cost', 'Goodman', 'MRCOOL', 'Heat Pumps', 'Goodman vs MRCOOL central heat pump cost: equipment & installed comparison'),
  buildBrandComparison('trane-vs-goodman-ac-furnace-cost', 'Trane', 'Goodman', 'AC+Furnace', 'Trane vs Goodman central AC + gas furnace cost: equipment & installed ranges', 'ac-furnace'),

  // 6 Adjacent Tonnage Matchups
  buildTonnageComparison(1.5, 2),
  buildTonnageComparison(2, 2.5),
  buildTonnageComparison(2.5, 3),
  buildTonnageComparison(3, 3.5),
  buildTonnageComparison(3.5, 4),
  buildTonnageComparison(4, 5),

  // 8 System-Type, Refrigerant & Staging Matchups
  buildSystemTypeComparison('2-ton-heat-pump-vs-mini-split-cost', 2, 'central-heat-pump', 'mini-split', '2T Ducted vs Mini-Split', '2-ton ducted central heat pump vs 2-ton mini-split cost'),
  buildSystemTypeComparison('3-ton-heat-pump-vs-ac-furnace-cost', 3, 'central-heat-pump', 'ac-furnace', '3T HP vs AC+Furnace', '3-ton central heat pump vs 3-ton AC + gas furnace replacement cost'),
  buildSystemTypeComparison('4-ton-heat-pump-vs-ac-furnace-cost', 4, 'central-heat-pump', 'ac-furnace', '4T HP vs AC+Furnace', '4-ton central heat pump vs 4-ton AC + gas furnace replacement cost'),
  buildSystemTypeComparison('5-ton-heat-pump-vs-ac-furnace-cost', 5, 'central-heat-pump', 'ac-furnace', '5T HP vs AC+Furnace', '5-ton central heat pump vs 5-ton AC + gas furnace replacement cost'),
  buildRefrigerantComparison(),
  buildStagingComparison(3),
  buildStagingComparison(4),
  buildStagingComparison(5),

  // 6 Direct Model-vs-Model Flagship Matchups
  buildModelComparison(
    'bosch-bovb-36rxb-vs-trane-a5hl5036a-3-ton',
    'bosch-3-ton-20-seer2-heat-pump-system-bovb-36rxb-m15s',
    'trane-3-ton-16-seer2-heat-pump-system-a5hl5036a1000a',
    'Bosch 3T vs Trane 3T',
  ),
  buildModelComparison(
    'goodman-glzt7ca3610-vs-bosch-bovb-36rxb-3-ton',
    'goodman-3-ton-17-2-seer2-heat-pump-system-glzt7ca3610',
    'bosch-3-ton-20-seer2-heat-pump-system-bovb-36rxb-m15s',
    'Goodman 3T vs Bosch 3T',
  ),
  buildModelComparison(
    'gree-fxu36hp-vs-mrcool-central-36-3-ton',
    'gree-3-ton-18-2-seer2-heat-pump-system-fxu36hp230v1r32ao',
    'mrcool-3-ton-17-4-seer2-heat-pump-system-central-36-hp-c-230b00-o',
    'Gree 3T vs MRCOOL 3T',
  ),
  buildModelComparison(
    'mitsubishi-suz-ak24nlhz-vs-daikin-rxm24wvju9-2-ton',
    'mitsubishi-2-ton-18-6-seer2-mini-split-suz-ak24nlhz',
    'daikin-2-ton-22-seer2-mini-split-rxm24wvju9',
    'Mitsubishi 2T vs Daikin 2T',
  ),
  buildModelComparison(
    'goodman-glzs4ba4810-vs-trane-a5hl5048a-4-ton',
    'goodman-4-ton-15-2-seer2-heat-pump-system-glzs4ba4810',
    'trane-4-ton-16-seer2-heat-pump-system-a5hl5048a1000a',
    'Goodman 4T vs Trane 4T',
  ),
  buildModelComparison(
    'goodman-glzs5ba6010-vs-bosch-bovb-60rxb-5-ton',
    'goodman-5-ton-16-seer2-heat-pump-system-glzs5ba6010',
    'bosch-5-ton-17-seer2-heat-pump-system-bovb-60rxb-m15s',
    'Goodman 5T vs Bosch 5T',
  ),
];

export const comparisonsForBrand = (brandName: string) =>
  COMPARISONS.filter((c) => c.relatedBrands.some((b) => b.toLowerCase() === brandName.toLowerCase()));

export const comparisonsForTonnage = (tons: number) =>
  COMPARISONS.filter((c) => c.relatedTonnages.includes(tons));

export const comparisonsForSystem = (sysSlug: string, brand: string, tons: number) => {
  const exact = COMPARISONS.filter((c) => c.modelLeft?.slug === sysSlug || c.modelRight?.slug === sysSlug);
  const byBrandOrTon = COMPARISONS.filter(
    (c) => !exact.includes(c) && (c.relatedBrands.includes(brand) || c.relatedTonnages.includes(tons)),
  );
  return [...exact, ...byBrandOrTon].slice(0, 6);
};
