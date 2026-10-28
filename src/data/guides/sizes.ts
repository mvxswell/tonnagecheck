// Six size-specific replacement-cost guides. Shared structure, but every table and figure is computed for
// that size from the seed and REMDB, and each has its own size-specific section.
import { lowestPrice, median, TONNAGES, type System } from '../equipment';
import { BRANDS } from '../brands';
import { fairRange, systemsWhere, statsOf, adderRange, lineSet, usd, fmtRange, pct } from '../../lib/facts';
import { roughTonnage } from '../../lib/audit';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, benchmarkTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

const word = (t: number) => (t === 2.5 ? '2.5' : t === 3.5 ? '3.5' : String(t));
const slugOf = (t: number) => `${String(t).replace('.', '-')}-ton-heat-pump-ac-replacement-cost`;
const span = (xs: System[]) => (xs.length ? `${usd(Math.min(...xs.map(lowestPrice)))}–${usd(Math.max(...xs.map(lowestPrice)))}` : 'no listings yet');

function sizeSpecific(t: number): string {
  const here = systemsWhere({ tons: t });
  const brandsHere = [...new Set(here.map((s) => s.brand))];
  const counts = TONNAGES.map((x) => ({ t: x, n: systemsWhere({ tons: x }).length }));
  const most = counts.reduce((p, c) => (c.n > p.n ? c : p));
  switch (t) {
    case 2: {
      const mz = systemsWhere({ type: 'mini-split', tons: 2 });
      return `<h2>2 tons: small homes, condos and the mini-split question</h2>
<p>Two tons usually means a smaller house, a condo, a finished basement or an addition. At this size the alternative many homeowners are offered is a ductless or multi-zone mini-split instead of a ducted system. In our data, 2-ton mini-split systems list at ${span(mz)} for the equipment${mz.length ? `, for example the ${sysLink(cheapest(mz))}` : ''}. Installation costs differ more than equipment: running line sets to several indoor heads is more labor than swapping a ducted unit, so compare the installed benchmarks below rather than the box prices. See our <a href="/guides/multi-zone-mini-split-cost/">multi-zone mini-split cost guide</a>.</p>
<p>If you have existing ductwork in decent condition, a ducted 2-ton heat pump replacement is usually the simpler like-for-like job. If the ducts are in a hot attic, leaky or undersized, the duct repair line can rival the equipment, and that is when a ductless option deserves a quote.</p>`;
    }
    case 2.5: {
      const two = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 2 }));
      const three = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 3 }));
      const mine = statsOf(systemsWhere({ type: 'central-heat-pump', tons: 2.5 }));
      return `<h2>2.5 tons: the in-between size that often gets rounded up</h2>
<p>A 2.5-ton system sits between the two most common sizes, and it is the size most often "rounded up" on a quote. Rounding up costs money twice: bigger equipment, and an installed price that scales with capacity. In our data the median listed ducted heat pump is ${usd(two.median)} at 2 tons, ${usd(mine.median)} at 2.5 tons and ${usd(three.median)} at 3 tons. The installed benchmark midpoint moves from ${usd(fairRange('central-heat-pump', 2.5).mid)} at 2.5 tons to ${usd(fairRange('central-heat-pump', 3).mid)} at 3 tons for standard efficiency.</p>
<p>If your load calculation lands between sizes, an inverter (variable-speed) unit can be the better answer than going up half a ton, because it throttles down at part load. Read <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage cost</a>.</p>`;
    }
    case 3:
      return `<h2>3 tons: the most common replacement size</h2>
<p>${most.t === 3 ? 'Three tons is the size with the most listings in our data, which mirrors how common it is in replacements.' : 'Three tons is one of the most common replacement sizes.'} That is good news for you: every brand and contractor quotes it constantly, prices are easy to compare, and there is no excuse for vagueness. Brands with 3-ton listings in our data: ${brandsHere.map((b) => brandLink(b)).join(', ')}.</p>
<p>Because 3-ton quotes are so comparable, they are also where padding stands out. A standard-efficiency 3-ton ducted heat pump replacement benchmarks at ${rangeText(fairRange('central-heat-pump', 3))}. A quote well above the top of that range for a like-for-like swap needs line items that explain the difference.</p>`;
    case 3.5: {
      return `<h2>3.5 tons: fewer models, more upselling room</h2>
<p>Not every product line is built in a 3.5-ton size, so choices narrow. In our data, ${brandsHere.length} brands have 3.5-ton listings (${brandsHere.map((b) => brandLink(b)).join(', ')}). A narrower field gives a salesperson more room to steer you toward a premium line "because that's what comes in your size." Ask whether a 3-ton or 4-ton unit was considered, and for the load calculation that rules them out.</p>
<p>Systems of 3.5 tons and up often call for a larger suction line than smaller units. If the quote includes a new line set, it should say what size; if it reuses the old one, ask whether it was checked against the new unit's installation instructions.</p>`;
    }
    case 4:
      return `<h2>4 tons: bigger homes, and the airflow the ducts must carry</h2>
<p>At 4 tons the system has to move a lot of air, and the existing ductwork is often the limiting factor. An undersized return or supply trunk makes a new 4-ton unit noisy and inefficient, and it is a legitimate reason for duct work to appear on a quote. It is also an easy upsell. Ask the contractor to measure total external static pressure on the existing system and show you the number; that tells you whether the ducts can carry the airflow before you pay for new ones. Our <a href="/guides/ductwork-replacement-cost-add-on/">ductwork add-on guide</a> explains how to price it.</p>
<p>Also ask why 4 tons and not 3.5. The <a href="/guides/3-ton-vs-4-ton-heat-pump-cost/">3-ton vs 4-ton guide</a> shows what the extra capacity costs.</p>`;
    case 5:
      return `<h2>5 tons: the top of residential sizing</h2>
<p>Five tons is the top of the range for typical single-phase residential split systems, so a 5-ton quote usually means a large house or a large load. Two questions matter. First, would two smaller systems or a zoned system serve the house better? Large single systems can struggle to keep distant rooms or upper floors comfortable. Second, in cold climates, is the size set by the heating load? If so, a cold-climate unit's capacity at 5°F matters more than its nameplate tonnage. Cold-climate 5-ton listings in our data: ${systemsWhere({ tons: 5, coldClimate: true }).map((s) => sysLink(s)).join(', ') || 'none yet'}.</p>
<p>Because 5-ton equipment is the most expensive, it also carries the largest absolute markups. The same percentage padding costs you more here than at any other size.</p>`;
    default:
      return '';
  }
}

function sizeGuide(t: number): Guide {
  const w = word(t);
  return {
    slug: slugOf(t),
    get title() { const eq = statsOf(systemsWhere({ type: 'central-heat-pump', tons: t })); const f = fairRange('central-heat-pump', t); return `${usd(eq.min)} Equip vs ${fmtRange(f)} Installed: ${w}-Ton Guide`; },
    h1: `${w}-ton heat pump & AC replacement cost, line by line`,
    get description() { const eq = statsOf(systemsWhere({ type: 'central-heat-pump', tons: t })); const f = fairRange('central-heat-pump', t); return `${w}-ton heat pump & AC replacement cost: ${usd(eq.min)}–${usd(eq.max)} listed equipment by brand vs ${fmtRange(f)} DOE installed benchmark.`; },
    updated: today,
    related: { tons: [t], systems: { tons: t } },
    audit: { systemType: 'central-heat-pump', tons: t },
    body: () => {
      const all = systemsWhere({ tons: t });
      const hp = systemsWhere({ type: 'central-heat-pump', tons: t });
      const acf = systemsWhere({ type: 'ac-furnace', tons: t });
      const ms = systemsWhere({ type: 'mini-split', tons: t });
      const hpMed = hp.length ? median(hp.map(lowestPrice)) : null;
      const f = fairRange('central-heat-pump', t, 'standard');
      const fh = fairRange('central-heat-pump', t, 'high');
      const panel = adderRange('panel200A');
      const stat = adderRange('smartThermostat');
      const { lo, hi } = roughTonnage(t * 500);
      const below = TONNAGES[TONNAGES.indexOf(t as (typeof TONNAGES)[number]) - 1];
      const above = TONNAGES[TONNAGES.indexOf(t as (typeof TONNAGES)[number]) + 1];
      const perBrand = BRANDS.map((b) => ({ b, s: cheapest(b.systems.filter((s) => s.tons === t && s.systemType === 'central-heat-pump')) })).filter((x) => x.s);
      return `
<p>A ${w}-ton system moves ${(t * 12000).toLocaleString('en-US')} BTU per hour. If you are holding a ${w}-ton quote, this page gives you the three numbers to check it against: what ${w}-ton equipment actually lists for, what a Department of Energy national-lab benchmark says installation should cost, and what each common add-on is worth. Every figure is computed from our data (${asOf}), and it updates when the data does.</p>

<h2>What ${w}-ton equipment lists for</h2>
<p>We track ${all.length} ${w}-ton systems with public prices: ${hp.length} ducted heat pump systems (${span(hp)}), ${acf.length} AC + gas furnace systems (${span(acf)}) and ${ms.length} mini-splits (${span(ms)}).${perBrand.length ? ` Lowest listed ducted ${w}-ton heat pump by brand: ${perBrand.map((x) => `${brandLink(x.b.name)} ${sysLink(x.s, usd(lowestPrice(x.s)))}`).join(', ')}.` : ''}</p>
${systemsTable(all, { showType: true, caption: 'Public online retail prices for the equipment only. Contractors usually buy from distributors at unpublished, typically lower prices.' })}

<h2>What a ${w}-ton replacement should cost installed</h2>
<p>For a standard-efficiency ${w}-ton ducted heat pump replacement, the benchmark is ${rangeText(f)}. A high-efficiency or cold-climate unit runs ${rangeText(fh)}. ${remdbNote}</p>
${benchmarkTable('central-heat-pump', [t])}
${t >= 1.5 ? benchmarkTable('ac-furnace', [t], ['standard', 'mid']) : ''}

<h2>Line by line: where a ${w}-ton quote's money goes</h2>
<div class="tablewrap"><table><thead><tr><th>Line</th><th class="r">Typical value</th><th>Source</th></tr></thead><tbody>
<tr><td>Ducted heat pump equipment (median listed, ${w} ton)</td><td class="r num">${usd(hpMed)}</td><td>Listings above</td></tr>
${lineSet ? `<tr><td>New line set, material (${lineSet.label})</td><td class="r num">${usd(lineSet.price)}</td><td><a href="${lineSet.url}" rel="nofollow noopener" target="_blank">Listing</a></td></tr>` : ''}
<tr><td>Smart thermostat, installed</td><td class="r num">${fmtRange(stat)}</td><td>${src('remdb', 'REMDB')} <span class="badge b-est">est.</span></td></tr>
<tr><td>200A electrical panel upgrade (only if needed)</td><td class="r num">${fmtRange(panel)}</td><td>${src('remdb', 'REMDB')} <span class="badge b-est">est.</span></td></tr>
<tr><td>Labor, materials, permit, overhead and margin at the benchmark midpoint</td><td class="r num">${hpMed != null ? usd(f.mid - hpMed) : '—'}</td><td>Benchmark minus equipment</td></tr>
<tr><td><b>Installed benchmark, standard efficiency</b></td><td class="r num"><b>${usd(f.mid)}</b></td><td>${src('remdb', 'REMDB')} <span class="badge b-est">est.</span></td></tr>
</tbody></table></div>
<p>${hpMed != null ? `At the midpoint, equipment is about ${pct(hpMed / f.mid)} of a fairly priced ${w}-ton install.` : ''} If your quote's non-equipment portion is far above the row above, ask for it itemized. Panel and thermostat lines should only appear if the work is actually needed; a 200A panel is not part of a routine like-for-like replacement.</p>

${sizeSpecific(t)}

<h2>Is ${w} tons actually right for your house?</h2>
<p>A common contractor rule of thumb is 400–600 square feet per ton, which would put ${w} tons at roughly ${(t * 400).toLocaleString('en-US')}–${(t * 600).toLocaleString('en-US')} sq ft (a ${(t * 500).toLocaleString('en-US')} sq ft house works out to ${lo === hi ? `${lo}` : `${lo}–${hi}`} tons). Treat that as a sanity check only. The real answer is an ACCA Manual J load calculation, which accounts for insulation, windows, air leakage and your local design temperatures. See <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J vs rule of thumb</a>.</p>
<p>Size matters for price: the standard-efficiency benchmark midpoint is ${below ? `${usd(fairRange('central-heat-pump', below).mid)} at ${tonLink(below)}, ` : ''}${usd(f.mid)} at ${w} tons${above ? ` and ${usd(fairRange('central-heat-pump', above).mid)} at ${tonLink(above)}` : ''}.</p>

<h2>Red flags in a ${w}-ton quote</h2>
<ul>
<li>No model numbers for the outdoor unit and the indoor coil or air handler.</li>
<li>${w} tons chosen by matching the old unit, with no load calculation.</li>
<li>A total well above ${usd(f.high)}, the top of the standard-efficiency benchmark, for a simple swap.</li>
<li>A federal tax credit subtracted for a 2026 install. The IRS ended 25C for property placed in service after Dec. 31, 2025 (${src('irsObbba', 'IRS')}).</li>
<li>Panel, duct or "system upgrade" lines without measurements or explanation.</li>
</ul>
<p>Run your exact numbers through the ${auditLink({ tons: t })}, browse every ${tonLink(t, `${w}-ton listing`)}, or request a second quote from an independent master tech below.</p>`;
    },
  };
}

export const SIZE_GUIDES: Guide[] = [2, 2.5, 3, 3.5, 4, 5].map(sizeGuide);
