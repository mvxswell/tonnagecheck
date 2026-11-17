// Compact, sourced tables folded from merged /compare/ and /tonnage/ pages into their target guides.
// Every figure comes from the same seed / REMDB functions the original pages used. No new numbers.
import { COMPARISONS } from '../comparisons';
import { COMPARE_MERGED } from '../prune';
import {
  lowestPrice,
  certifiedCapacity,
  type System,
  type SystemType,
  type Tier,
  SYSTEM_TYPE_LABEL,
  TIER_LABEL,
  SYSTEMS,
} from '../equipment';
import { fairRange, systemsWhere, usd, fmtRange, refrigerantOf, equipmentStats, statsOf } from '../../lib/facts';
import { asOf, remdbNote, sysLink, brandLink, systemsTable, rangeText, cheapest } from './helpers';

function entry(slug: string) {
  const c = COMPARISONS.find((x) => x.slug === slug);
  if (!c) throw new Error(`fold-comparisons: unknown comparison slug ${slug}`);
  return c;
}

function sideRow(label: string, href: string | undefined, count: number, equipMin: number, equipMax: number, equipMedian: number, seer2: string, refrigerants: string, fairLow: number, fairHigh: number) {
  const name = href ? `<a href="${href}">${label}</a>` : label;
  return `<tr><td>${name}${count ? ` <span class="small muted">(${count})</span>` : ''}</td><td class="r num">${usd(equipMin)}–${usd(equipMax)}</td><td class="r num">${usd(equipMedian)}</td><td class="r num">${seer2 || '—'}</td><td>${refrigerants || '—'}</td><td class="r num">${usd(fairLow)}–${usd(fairHigh)}</td></tr>`;
}

function capCell(s: System): string {
  const c = certifiedCapacity(s);
  if (!c) return '—';
  if (c.range) return `${c.range.minCapacity.toLocaleString('en-US')}–${c.range.maxCapacity.toLocaleString('en-US')} BTU/h (by indoor unit)`;
  return `${c.cap.toLocaleString('en-US')} BTU/h (≈${c.tonsApprox} ton)${c.under ? ` · <b>${c.pct}% of nominal</b>` : ''}`;
}

/** Side-by-side summary (and exact models, when present) for one merged comparison. */
export function foldedMatchup(slug: string): string {
  const c = entry(slug);
  const { left, right } = c;
  const modelPair = !!(c.modelLeft && c.modelRight);
  const pair = modelPair ? [c.modelLeft!, c.modelRight!] : [];
  const caps = pair.map(certifiedCapacity);
  const anyUnder = caps.some((x) => x?.under);
  const heading = anyUnder && pair.length
    ? `${pair[0].brand} ${pair[0].components[0]} vs ${pair[1].brand} ${pair[1].components[0]} (sold as ${pair[0].tons}-ton)`
    : c.h1;
  const underNotes = pair.flatMap((s) => {
    const cap = certifiedCapacity(s);
    if (!cap?.under) return [];
    return [
      `the ${sysLink(s, `${s.brand} ${s.components.join(' + ')}`)} is certified at <b>${cap.cap.toLocaleString('en-US')} BTU/h</b> of cooling (AHRI #${s.energyStar!.ahriReferenceNumber}), about ${Math.round((cap.cap / 12000) * 10) / 10} tons, versus the ${cap.nominal.toLocaleString('en-US')} BTU/h a ${s.tons}-ton label implies`,
    ];
  });
  const pairTable = modelPair
    ? (() => {
        const rows = pair.map((s) => {
          const es = s.energyStar;
          const best = s.prices.reduce((x, p) => (p.price < x.price ? p : x), s.prices[0]);
          return `<tr><td>${sysLink(s, `${s.brand} ${s.components.join(' + ')}`)}${s.energyStar ? ' <span class="badge b-es">ENERGY STAR</span>' : ''}</td><td class="r num">${s.tons}</td><td class="r num">${capCell(s)}</td><td class="r num">${s.specs.seer2 ?? '—'}</td><td class="r num">${s.specs.hspf2 ?? '—'}</td><td>${refrigerantOf(s) ?? '—'}</td><td class="r num">${usd(lowestPrice(s))}</td><td>${es ? `AHRI #${es.ahriReferenceNumber}` : '—'}</td><td><a href="${best.url}" rel="nofollow noopener" target="_blank">${best.retailer}</a></td></tr>`;
        });
        return `<div class="tablewrap"><table><thead><tr><th>System</th><th class="r">Tons (label)</th><th class="r">Certified cooling (AHRI)</th><th class="r">SEER2</th><th class="r">HSPF2</th><th>Refrigerant</th><th class="r">Listed</th><th>AHRI</th><th>Source</th></tr></thead><tbody>
${rows.join('\n')}
</tbody></table></div>`;
      })()
    : '';
  const caveat = underNotes.length
    ? `<p class="note"><b>Below its nominal size:</b> ${underNotes.join('; ')}. The price comparison above is between systems sold as ${pair[0].tons}-ton, not between equal capacities. Compare quotes on the certified capacity of the exact pairing on the AHRI certificate, not on the label.</p>`
    : '';
  return `
<h3 id="${slug}">${heading}</h3>
<p>${c.lead}</p>
<div class="tablewrap"><table><thead><tr><th></th><th class="r">Listed range</th><th class="r">Median listed</th><th class="r">SEER2</th><th>Refrigerant</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
${sideRow(left.label, left.href, left.count, left.equipMin, left.equipMax, left.equipMedian, left.seer2Span, left.refrigerants, left.fair.low, left.fair.high)}
${sideRow(right.label, right.href, right.count, right.equipMin, right.equipMax, right.equipMedian, right.seer2Span, right.refrigerants, right.fair.low, right.fair.high)}
</tbody></table></div>
${pairTable}
${caveat}
<p class="small muted">Figures computed from our catalog (${asOf}). ${remdbNote}</p>`;
}

/** All merged model-vs-model matchups at a given size, for the size guides. */
export function foldedModelMatchups(tons: number): string {
  const slugs = Object.keys(COMPARE_MERGED).filter((slug) => {
    const c = COMPARISONS.find((x) => x.slug === slug);
    return c?.category === 'model' && c.relatedTonnages.includes(tons);
  });
  if (!slugs.length) return '';
  return `
<h2>Flagship model matchups at ${tons} tons</h2>
<p>These exact outdoor + indoor pairings previously had their own /compare/ pages. The numbers below are the same listed prices, ratings and AHRI records (${asOf}).</p>
${slugs.map((s) => foldedMatchup(s)).join('\n')}`;
}

/**
 * The per-type installed-cost table that lived on each /tonnage/{size}/ page:
 * REMDB standard / mid / high for ducted heat pump, mini-split and AC + furnace,
 * plus the condenser-only (heat pump only) estimate.
 */
export function foldedInstalledBenchmarks(tons: number): string {
  const types: SystemType[] = ['central-heat-pump', 'mini-split', 'ac-furnace', 'heat-pump-only'];
  const tiers: Tier[] = ['standard', 'mid', 'high'];
  const rows = types.map((ty) => ({
    ty,
    stats: equipmentStats(ty, tons),
    ranges: tiers.map((ti) => fairRange(ty, tons, ti)),
  }));
  const listed = (s: { count: number; min: number | null; max: number | null }) =>
    s.count ? (s.min === s.max ? usd(s.min) : `${usd(s.min)}–${usd(s.max)}`) : '—';
  return `
<h3>Installed-cost benchmark by system type and efficiency</h3>
<p class="small muted">REMDB replacement-cost regressions, restated from 2023 dollars with CPI-U. National averages; high-cost metros run above them. Ductwork, extra permits and panel work are not included. <a href="/about/#benchmarks">Method</a>. "Heat pump only" assumes the outdoor unit alone is replaced; its range is anchored on listed condenser prices, not REMDB, and is an estimate. AC + furnace assumes an 80,000 BTU/h, 80% AFUE furnace.</p>
<div class="tablewrap"><table><thead><tr><th>System type</th>${tiers.map((t) => `<th class="r">${TIER_LABEL[t].split(' (')[0]}</th>`).join('')}<th class="r">Listed equipment</th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${SYSTEM_TYPE_LABEL[r.ty]}</td>${r.ranges.map((x) => `<td class="r num">${usd(x.mid)}<br /><span class="small muted">${fmtRange(x)}</span></td>`).join('')}<td class="r num">${listed(r.stats)}</td></tr>`).join('\n')}
</tbody></table></div>`;
}

/** 1.5-ton listings and benchmarks, folded into the combined size guide (there is no 1.5-ton guide). */
export function foldedTonnageSize(tons: number): string {
  const all = systemsWhere({ tons });
  const hp = systemsWhere({ type: 'central-heat-pump', tons });
  const acf = systemsWhere({ type: 'ac-furnace', tons });
  const ms = systemsWhere({ type: 'mini-split', tons });
  const cond = systemsWhere({ type: 'heat-pump-only', tons });
  const f = fairRange('central-heat-pump', tons, 'standard');
  const fh = fairRange('central-heat-pump', tons, 'high');
  const span = (xs: System[]) => (xs.length ? `${usd(Math.min(...xs.map(lowestPrice)))}–${usd(Math.max(...xs.map(lowestPrice)))}` : 'no listings yet');
  const cheapestHp = hp.length ? cheapest(hp) : undefined;
  const parts = [
    `${hp.length} ducted heat pump systems (${span(hp)})`,
    `${acf.length} AC + gas furnace systems (${span(acf)})`,
    `${ms.length} mini-splits (${span(ms)})`,
    cond.length ? `${cond.length} condenser-only unit${cond.length === 1 ? '' : 's'} (${span(cond)})` : '',
  ].filter(Boolean);
  const last = parts.pop()!;
  const list = parts.length ? `${parts.join(', ')} and ${last}` : last;
  return `
<h2 id="1-5-ton">${tons}-ton equipment and installed cost</h2>
<p>There is no separate ${tons}-ton replacement-cost guide, so the listings and the installed-cost-by-system-type benchmarks that used to live on the ${tons}-ton size page are here. We track ${all.length} ${tons}-ton systems: ${list}.${cheapestHp ? ` Lowest listed ducted ${tons}-ton heat pump: ${sysLink(cheapestHp)} at ${usd(lowestPrice(cheapestHp))}.` : ''}</p>
<p>The standard-efficiency installed benchmark for a ${tons}-ton ducted heat pump is ${rangeText(f)}; high-efficiency is ${rangeText(fh)}.</p>
${foldedInstalledBenchmarks(tons)}
${systemsTable(all, { showType: true, caption: `Public online retail prices for ${tons}-ton equipment only, ${asOf}.` })}`;
}

/** Brand lists from the retired R-32 vs R-454B compare page, using ENERGY STAR's GWP for R-454B (470). */
export function foldedRefrigerantBrandLists(): string {
  const r32 = SYSTEMS.filter((s) => refrigerantOf(s) === 'R-32');
  const r454b = SYSTEMS.filter((s) => refrigerantOf(s) === 'R-454B');
  const r32S = statsOf(r32);
  const r454bS = statsOf(r454b);
  const r32Brands = [...new Set(r32.map((s) => s.brand))];
  const r454bBrands = [...new Set(r454b.map((s) => s.brand))];
  return `
<ul>
<li><b>R-32 (GWP 675 — ${r32.length} systems listed from ${usd(r32S.min)} to ${usd(r32S.max)}, median ${usd(r32S.median)}):</b> Used by ${r32Brands.map((b) => brandLink(b)).join(', ')}.</li>
<li><b>R-454B (GWP 470, as published in the ENERGY STAR records we cite — ${r454b.length} systems listed from ${usd(r454bS.min)} to ${usd(r454bS.max)}, median ${usd(r454bS.median)}):</b> Used by ${r454bBrands.map((b) => brandLink(b)).join(', ')}. Legacy R-410A is listed in those records at GWP 2,088.</li>
</ul>`;
}
