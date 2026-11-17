// Compact, sourced tables folded from merged /compare/ and /tonnage/ pages into their target guides.
// Every figure comes from the same seed / REMDB functions the original pages used. No new numbers.
import { COMPARISONS } from '../comparisons';
import { COMPARE_MERGED } from '../prune';
import { lowestPrice, type System } from '../equipment';
import { fairRange, systemsWhere, usd, fmtRange, refrigerantOf, seedDateLabel } from '../../lib/facts';
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

/** Side-by-side summary (and exact models, when present) for one merged comparison. */
export function foldedMatchup(slug: string): string {
  const c = entry(slug);
  const { left, right } = c;
  const modelPair = c.modelLeft && c.modelRight;
  const pairTable = modelPair
    ? (() => {
        const rows = [c.modelLeft!, c.modelRight!].map((s) => {
          const es = s.energyStar;
          const best = s.prices.reduce((x, p) => (p.price < x.price ? p : x), s.prices[0]);
          return `<tr><td>${sysLink(s, `${s.brand} ${s.components.join(' + ')}`)}${s.energyStar ? ' <span class="badge b-es">ENERGY STAR</span>' : ''}</td><td class="r num">${s.tons}</td><td class="r num">${s.specs.seer2 ?? '—'}</td><td class="r num">${s.specs.hspf2 ?? '—'}</td><td>${refrigerantOf(s) ?? '—'}</td><td class="r num">${usd(lowestPrice(s))}</td><td>${es ? `AHRI #${es.ahriReferenceNumber}` : '—'}</td><td><a href="${best.url}" rel="nofollow noopener" target="_blank">${best.retailer}</a></td></tr>`;
        });
        return `<div class="tablewrap"><table><thead><tr><th>System</th><th class="r">Tons</th><th class="r">SEER2</th><th class="r">HSPF2</th><th>Refrigerant</th><th class="r">Listed</th><th>AHRI</th><th>Source</th></tr></thead><tbody>
${rows.join('\n')}
</tbody></table></div>`;
      })()
    : '';
  return `
<h3>${c.h1}</h3>
<p>${c.lead}</p>
<div class="tablewrap"><table><thead><tr><th></th><th class="r">Listed range</th><th class="r">Median listed</th><th class="r">SEER2</th><th>Refrigerant</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
${sideRow(left.label, left.href, left.count, left.equipMin, left.equipMax, left.equipMedian, left.seer2Span, left.refrigerants, left.fair.low, left.fair.high)}
${sideRow(right.label, right.href, right.count, right.equipMin, right.equipMax, right.equipMedian, right.seer2Span, right.refrigerants, right.fair.low, right.fair.high)}
</tbody></table></div>
${pairTable}
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

/** 1.5-ton listings and benchmarks, folded into the 2-ton size guide (there is no 1.5-ton guide). */
export function foldedTonnageSize(tons: number): string {
  const all = systemsWhere({ tons });
  const hp = systemsWhere({ type: 'central-heat-pump', tons });
  const acf = systemsWhere({ type: 'ac-furnace', tons });
  const ms = systemsWhere({ type: 'mini-split', tons });
  const f = fairRange('central-heat-pump', tons, 'standard');
  const fh = fairRange('central-heat-pump', tons, 'high');
  const span = (xs: System[]) => (xs.length ? `${usd(Math.min(...xs.map(lowestPrice)))}–${usd(Math.max(...xs.map(lowestPrice)))}` : 'no listings yet');
  const cheapestHp = hp.length ? cheapest(hp) : undefined;
  return `
<h2 id="1-5-ton">${tons}-ton equipment and installed cost</h2>
<p>There is no separate ${tons}-ton replacement-cost guide, so the listings and benchmarks that used to live on the ${tons}-ton size page are here. We track ${all.length} ${tons}-ton systems: ${hp.length} ducted heat pump systems (${span(hp)}), ${acf.length} AC + gas furnace systems (${span(acf)}) and ${ms.length} mini-splits (${span(ms)}).${cheapestHp ? ` Lowest listed ducted ${tons}-ton heat pump: ${sysLink(cheapestHp)} at ${usd(lowestPrice(cheapestHp))}.` : ''}</p>
<p>The standard-efficiency installed benchmark for a ${tons}-ton ducted heat pump is ${rangeText(f)}; high-efficiency is ${rangeText(fh)}. ${remdbNote}</p>
${systemsTable(all, { showType: true, caption: `Public online retail prices for ${tons}-ton equipment only, ${asOf}.` })}`;
}
