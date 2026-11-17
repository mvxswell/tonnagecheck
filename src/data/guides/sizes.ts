// Combined 1.5–5 ton replacement-cost guide, published at the 3-ton URL (highest GSC impressions).
// Per-size unique prose is preserved in sizeSpecific(); step-up dollar deltas stay on /tonnage/ only.
import { lowestPrice, median, TONNAGES, type System } from '../equipment';
import { fairRange, systemsWhere, statsOf, adderRange, lineSet, usd, fmtRange, pct } from '../../lib/facts';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import { foldedModelMatchups, foldedTonnageSize, foldedInstalledBenchmarks } from './fold-comparisons';
import type { Guide } from './types';

const span = (xs: System[]) => (xs.length ? `${usd(Math.min(...xs.map(lowestPrice)))}–${usd(Math.max(...xs.map(lowestPrice)))}` : 'no listings yet');

function sizeSpecific(t: number): string {
  const here = systemsWhere({ tons: t });
  const brandsHere = [...new Set(here.map((s) => s.brand))];
  const counts = TONNAGES.map((x) => ({ t: x, n: systemsWhere({ tons: x }).length }));
  const most = counts.reduce((p, c) => (c.n > p.n ? c : p));
  switch (t) {
    case 2: {
      const mz = systemsWhere({ type: 'mini-split', tons: 2 });
      return `<h2 id="2-ton">2 tons: small homes, condos and the mini-split question</h2>
<p>Two tons usually means a smaller house, a condo, a finished basement or an addition. At this size the alternative many homeowners are offered is a ductless or multi-zone mini-split instead of a ducted system. In our data, 2-ton mini-split systems list at ${span(mz)} for the equipment${mz.length ? `, for example the ${sysLink(cheapest(mz))}` : ''}. Installation costs differ more than equipment: running line sets to several indoor heads is more labor than swapping a ducted unit, so compare the installed benchmarks below rather than the box prices. See our <a href="/guides/multi-zone-mini-split-cost/">multi-zone mini-split cost guide</a>.</p>
<p>If you have existing ductwork in decent condition, a ducted 2-ton heat pump replacement is usually the simpler like-for-like job. If the ducts are in a hot attic, leaky or undersized, the duct repair line can rival the equipment, and that is when a ductless option deserves a quote.</p>`;
    }
    case 2.5: {
      const two = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 2 }));
      const three = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 3 }));
      const mine = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 2.5 }));
      return `<h2 id="2-5-ton">2.5 tons: the in-between size that often gets rounded up</h2>
<p>A 2.5-ton system sits between the two most common sizes, and it is the size most often "rounded up" on a quote. Rounding up costs money twice: bigger equipment, and an installed price that scales with capacity. In our data the median listed ducted heat pump is ${usd(two.median)} at 2 tons, ${usd(mine.median)} at 2.5 tons and ${usd(three.median)} at 3 tons. The installed benchmark midpoint moves from ${usd(fairRange('central-heat-pump', 2.5).mid)} at 2.5 tons to ${usd(fairRange('central-heat-pump', 3).mid)} at 3 tons for standard efficiency.</p>
<p>If your load calculation lands between sizes, an inverter (variable-speed) unit can be the better answer than going up half a ton, because it throttles down at part load. Read <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage cost</a>.</p>`;
    }
    case 3:
      return `<h2 id="3-ton">3 tons: the most common replacement size</h2>
<p>${most.t === 3 ? 'Three tons is the size with the most listings in our data, which mirrors how common it is in replacements.' : 'Three tons is one of the most common replacement sizes.'} That is good news for you: every brand and contractor quotes it constantly, prices are easy to compare, and there is no excuse for vagueness. Brands with 3-ton listings in our data: ${brandsHere.map((b) => brandLink(b)).join(', ')}.</p>
<p>Because 3-ton quotes are so comparable, they are also where padding stands out. A standard-efficiency 3-ton ducted heat pump replacement benchmarks at ${rangeText(fairRange('central-heat-pump', 3))}. A quote well above the top of that range for a like-for-like swap needs line items that explain the difference.</p>
<p>Comparing brands at 3 tons? Our brand pages show the listed equipment next to the installed benchmark, for example <a href="/brands/trane/">what a new Trane HVAC system costs</a> by product line.</p>`;
    case 3.5: {
      return `<h2 id="3-5-ton">3.5 tons: fewer models, more upselling room</h2>
<p>Not every product line is built in a 3.5-ton size, so choices narrow. In our data, ${brandsHere.length} brands have 3.5-ton listings (${brandsHere.map((b) => brandLink(b)).join(', ')}). A narrower field gives a salesperson more room to steer you toward a premium line "because that's what comes in your size." Ask whether a 3-ton or 4-ton unit was considered, and for the load calculation that rules them out.</p>
<p>Systems of 3.5 tons and up often call for a larger suction line than smaller units. If the quote includes a new line set, it should say what size; if it reuses the old one, ask whether it was checked against the new unit's installation instructions.</p>`;
    }
    case 4:
      return `<h2 id="4-ton">4 tons: bigger homes, and the airflow the ducts must carry</h2>
<p>At 4 tons the system has to move a lot of air, and the existing ductwork is often the limiting factor. An undersized return or supply trunk makes a new 4-ton unit noisy and inefficient, and it is a legitimate reason for duct work to appear on a quote. It is also an easy upsell. Ask the contractor to measure total external static pressure on the existing system and show you the number; that tells you whether the ducts can carry the airflow before you pay for new ones. Our <a href="/guides/ductwork-replacement-cost-add-on/">ductwork add-on guide</a> explains how to price it.</p>
<p>Also ask why 4 tons and not 3.5. The <a href="/guides/3-ton-vs-4-ton-heat-pump-cost/">3-ton vs 4-ton guide</a> shows what the extra capacity costs.</p>`;
    case 5:
      return `<h2 id="5-ton">5 tons: the top of residential sizing</h2>
<p>Five tons is the top of the range for typical single-phase residential split systems, so a 5-ton quote usually means a large house or a large load. Two questions matter. First, would two smaller systems or a zoned system serve the house better? Large single systems can struggle to keep distant rooms or upper floors comfortable. Second, in cold climates, is the size set by the heating load? If so, a cold-climate unit's capacity at 5°F matters more than its nameplate tonnage. Cold-climate 5-ton listings in our data: ${systemsWhere({ tons: 5, coldClimate: true }).map((s) => sysLink(s)).join(', ') || 'none yet'}.</p>
<p>Because 5-ton equipment is the most expensive, it also carries the largest absolute markups. The same percentage padding costs you more here than at any other size.</p>`;
    default:
      return '';
  }
}


export const SIZE_GUIDES: Guide[] = [
  {
    slug: '3-ton-heat-pump-ac-replacement-cost',
    get title() {
      const eq = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 3 }));
      const f = fairRange('central-heat-pump', 3);
      return `${usd(eq.min)}–${usd(eq.max)} Equip vs ${fmtRange(f)} Installed, by Size`;
    },
    h1: 'Heat pump & AC replacement cost by size, 1.5 to 5 tons',
    get description() {
      const eq = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 3 }));
      const f = fairRange('central-heat-pump', 3);
      return `Listed heat pump & AC equipment and DOE installed benchmarks from 1.5 to 5 tons. 3-ton ducted systems list ${usd(eq.min)}–${usd(eq.max)} vs ${fmtRange(f)} installed.`;
    },
    updated: today,
    related: { tons: [1.5, 2, 2.5, 3, 3.5, 4, 5], systems: { type: 'central-heat-pump' } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const sizes = [1.5, 2, 2.5, 3, 3.5, 4, 5];
      const rows = sizes.map((t) => {
        const hp = systemsWhere({ type: 'central-heat-pump', tons: t });
        const acf = systemsWhere({ type: 'ac-furnace', tons: t });
        const ms = systemsWhere({ type: 'mini-split', tons: t });
        const hpS = statsOf(hp);
        const acfS = statsOf(acf);
        const msS = statsOf(ms);
        const f = fairRange('central-heat-pump', t, 'standard');
        const fh = fairRange('central-heat-pump', t, 'high');
        return { t, hp, acf, ms, hpS, acfS, msS, f, fh };
      });
      const r3 = rows.find((r) => r.t === 3)!;
      const hpMed3 = r3.hpS.median;
      const panel = adderRange('panel200A');
      const stat = adderRange('smartThermostat');
      const cell = (s: { count: number; min: number | null; max: number | null; median: number | null }) =>
        s.count ? `${usd(s.median)} <span class="small muted">${usd(s.min)}–${usd(s.max)} (${s.count})</span>` : '—';
      const sections = rows.map((r) => {
        const extra = r.t === 1.5 ? foldedTonnageSize(1.5) : sizeSpecific(r.t);
        const benches = r.t === 1.5 ? '' : foldedInstalledBenchmarks(r.t);
        const matchups = foldedModelMatchups(r.t);
        const listings = r.t === 1.5 ? '' : systemsTable(
          [...r.hp, ...r.acf, ...r.ms],
          { showType: true, caption: `${r.t}-ton public online retail prices, equipment only (${asOf}).` },
        );
        return `${extra}
${benches}
${listings}
${matchups}`;
      }).join('\n');
      return `
<p>This page is the size-by-size replacement-cost guide for 1.5 through 5 tons. We kept the 3-ton URL because 3 tons is the most common replacement size and had the most search impressions; the other per-size guides now redirect here. Every figure is computed from our catalog (${asOf}) or the DOE REMDB installed-cost benchmark.</p>

<h2>Listed equipment and installed benchmarks, every size</h2>
<p>Each row is one nominal size (12,000 BTU/h per ton). Listed columns are public online retail prices for the equipment only; the installed columns are national-lab regressions, not a quote. ${remdbNote}</p>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Ducted heat pump, listed (median, range, count)</th><th class="r">AC + furnace, listed</th><th class="r">Mini-split, listed</th><th class="r">Installed, standard <span class="badge b-est">est.</span></th><th class="r">Installed, high-eff. <span class="badge b-est">est.</span></th></tr></thead><tbody>
${rows.map((r) => `<tr><td><a href="#${String(r.t).replace('.', '-')}-ton"><b>${r.t} ton</b></a> <span class="small muted">${(r.t * 12000).toLocaleString('en-US')} BTU/h</span></td><td class="r num">${cell(r.hpS)}</td><td class="r num">${cell(r.acfS)}</td><td class="r num">${cell(r.msS)}</td><td class="r num">${usd(r.f.mid)}<br><span class="small muted">${fmtRange(r.f)}</span></td><td class="r num">${usd(r.fh.mid)}<br><span class="small muted">${fmtRange(r.fh)}</span></td></tr>`).join('\n')}
</tbody></table></div>

<h2>Line by line at 3 tons, the most common size</h2>
<p>Use this as a template for reading any size of quote. At the standard-efficiency midpoint, the median listed 3-ton ducted heat pump is ${usd(hpMed3)} and the installed benchmark midpoint is ${usd(r3.f.mid)}, so equipment is about ${hpMed3 != null ? pct(hpMed3 / r3.f.mid) : '—'} of a fairly priced install. The gap is labor, materials, permit, overhead and margin.</p>
<div class="tablewrap"><table><thead><tr><th>Line</th><th class="r">Typical value</th><th>Source</th></tr></thead><tbody>
<tr><td>Ducted heat pump equipment (median listed, 3 ton)</td><td class="r num">${usd(hpMed3)}</td><td>Listings below</td></tr>
${lineSet ? `<tr><td>New line set, material (${lineSet.label})</td><td class="r num">${usd(lineSet.price)}</td><td><a href="${lineSet.url}" rel="nofollow noopener" target="_blank">Listing</a></td></tr>` : ''}
<tr><td>Smart thermostat, installed</td><td class="r num">${fmtRange(stat)}</td><td>${src('remdb', 'REMDB')} <span class="badge b-est">est.</span></td></tr>
<tr><td>200A electrical panel upgrade (only if needed)</td><td class="r num">${fmtRange(panel)}</td><td>${src('remdb', 'REMDB')} <span class="badge b-est">est.</span></td></tr>
<tr><td>Labor, materials, permit, overhead and margin at the benchmark midpoint</td><td class="r num">${hpMed3 != null ? usd(r3.f.mid - hpMed3) : '—'}</td><td>Benchmark minus equipment</td></tr>
<tr><td><b>Installed benchmark, standard efficiency, 3 ton</b></td><td class="r num"><b>${usd(r3.f.mid)}</b></td><td>${src('remdb', 'REMDB')} <span class="badge b-est">est.</span></td></tr>
</tbody></table></div>
<p>Panel and thermostat lines should only appear if the work is actually needed. A 200A panel is not part of a routine like-for-like replacement. The jump from one size to the next, in dollars, is on the <a href="/tonnage/">tonnage index</a>.</p>

${sections}

<h2>Is this the right size for your house?</h2>
<p>A common contractor rule of thumb is 400–600 square feet per ton. Treat that as a sanity check only. The real answer is an ACCA Manual J load calculation, which accounts for insulation, windows, air leakage and your local design temperatures. See <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J vs rule of thumb</a>. If two contractors quote different tonnages for the same house, ask both to show their Manual J.</p>

<h2>Red flags in a size-specific quote</h2>
<ul>
<li>No model numbers for the outdoor unit and the indoor coil or air handler.</li>
<li>Tonnage chosen by matching the old unit, with no load calculation.</li>
<li>A total well above the top of the standard-efficiency benchmark for a simple swap.</li>
<li>A federal tax credit subtracted for a 2026 install. The IRS ended 25C for property placed in service after Dec. 31, 2025 (${src('irsObbba', 'IRS')}).</li>
<li>Panel, duct or "system upgrade" lines without measurements or explanation.</li>
</ul>
<p>Run your exact numbers through the ${auditLink({ tons: 3 })}, or request a second quote from an independent master tech on the <a href="/partners/">partners page</a>.</p>`;
    },
  },
];
