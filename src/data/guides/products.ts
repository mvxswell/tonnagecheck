// Brand and product-line guides. Claims about a brand are limited to what its seeded listings and ENERGY STAR
// records show; where a product line the homeowner may be quoted is not in our data, the guide says so.
import { lowestPrice, median } from '../equipment';
import { brandByName } from '../brands';
import { fairRange, systemsWhere, usd, fmtRange, pct } from '../../lib/facts';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

export const PRODUCT_GUIDES: Guide[] = [
  {
    slug: 'goodman-vs-trane-vs-carrier-equipment-markup',
    get title() { return `${usd(brandByName('Goodman')!.priceMin)} Equip vs ${fmtRange(fairRange('central-heat-pump', 3))} Installed: Goodman vs Trane`; },
    h1: 'Goodman vs Trane vs Carrier: what the equipment costs and how much is markup',
    get description() { return `Goodman (${usd(brandByName('Goodman')!.priceMin)}+), Trane (${usd(brandByName('Trane')!.priceMin)}+) & Carrier equipment prices vs ${fmtRange(fairRange('central-heat-pump', 3))} 3-ton installed benchmarks.`; },
    updated: today,
    related: { brands: ['Goodman', 'Trane', 'Carrier'], tons: [3], systems: { brand: ['Goodman', 'Trane', 'Carrier'] } },
    audit: { systemType: 'central-heat-pump', tons: 3, brand: 'Trane' },
    body: () => {
      const sizes = [1.5, 2, 2.5, 3, 3.5, 4, 5];
      const g = brandByName('Goodman');
      const tr = brandByName('Trane');
      const ca = brandByName('Carrier');
      const rows = sizes.map((t) => {
        const gs = cheapest(systemsWhere({ brand: 'Goodman', type: 'central-heat-pump', tons: t }));
        const ts = cheapest(systemsWhere({ brand: 'Trane', type: 'central-heat-pump', tons: t }));
        return { t, gs, ts, f: fairRange('central-heat-pump', t) };
      }).filter((r) => r.gs || r.ts);
      const carrierMs = systemsWhere({ brand: 'Carrier' });
      const otherMs = systemsWhere({ type: 'mini-split', tons: carrierMs.map((s) => s.tons), multiZone: false }).filter((s) => s.brand !== 'Carrier');
      return `
<p>"Which brand?" is usually the first question a salesperson asks and the least important one for your wallet. The bigger driver of a quote is what the contractor adds on top of the equipment. This guide puts Goodman, Trane and Carrier listings side by side (${asOf}) and compares them with the installed benchmark for the same size.</p>

<h2>What the data covers, and what it doesn't</h2>
<p>We only publish prices we can link to. ${g ? `${brandLink('Goodman')}: ${g.systems.length} listings (${g.types.length} system types).` : ''} ${tr ? `${brandLink('Trane')}: ${tr.systems.length} listings, sold online under Trane's RunTru line.` : ''} ${ca ? `${brandLink('Carrier')}: ${ca.systems.length} listings, all ductless mini-splits. Carrier's ducted split systems are not sold through the online retailers we track, so we have no public price to compare a ducted Carrier quote against.` : ''} If your quote is for a Carrier or Bryant ducted system, use the like-for-like size and efficiency rows below and the ${auditLink({}, 'auditor')}; the installed benchmark does not depend on brand.</p>

<h2>Goodman vs Trane, ducted heat pumps, same size</h2>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Lowest Goodman</th><th class="r">Lowest Trane</th><th class="r">Installed benchmark (std.) <span class="badge b-est">est.</span></th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${tonLink(r.t, `${r.t} ton`)}</td><td class="r num">${r.gs ? `${sysLink(r.gs, usd(lowestPrice(r.gs)))} <span class="small muted">${r.gs.specs.seer2} SEER2</span>` : '—'}</td><td class="r num">${r.ts ? `${sysLink(r.ts, usd(lowestPrice(r.ts)))} <span class="small muted">${r.ts.specs.seer2} SEER2</span>` : '—'}</td><td class="r num">${fmtRange(r.f)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">Efficiency differs between some pairs, which explains part of the gap. ${remdbNote}</p>
${(() => {
  const both = rows.filter((r) => r.gs && r.ts);
  const gaps = both.map((r) => Math.abs(lowestPrice(r.gs!) - lowestPrice(r.ts!)));
  const nonEq = both.map((r) => r.f.mid - Math.max(lowestPrice(r.gs!), lowestPrice(r.ts!)));
  return both.length ? `<p>Two things stand out. First, at the ${both.length} sizes where both brands are listed, the gap between the cheapest Goodman and cheapest Trane is ${usd(Math.min(...gaps))} to ${usd(Math.max(...gaps))}, partly because of efficiency differences. Second, the installed benchmark midpoint sits ${usd(Math.min(...nonEq))} to ${usd(Math.max(...nonEq))} above even the pricier of the two. A quote that is thousands of dollars more for "the better brand" is mostly not paying for the brand.</p>` : '';
})()}

<h2>Where brand-name markup comes from</h2>
<ul>
<li><b>Dealer programs.</b> Brands that sell mostly through authorized dealers let those dealers price to the brand's reputation. That is a dealer margin, not an equipment cost.</li>
<li><b>Bundled warranties.</b> Extended labor warranties are real value, but ask what they cost separately and who honors them if the dealer is sold.</li>
<li><b>Tier menus.</b> Good-better-best menus anchor you to the middle option. Compare the model numbers, not the tier names.</li>
</ul>

${ca ? `<h2>Carrier ductless vs other brands' mini-splits</h2>
<p>For the sizes Carrier's mini-splits come in, here is how they list against other single-zone mini-splits in our data:</p>
${systemsTable([...carrierMs, ...otherMs].sort((x, y) => x.tons - y.tons || lowestPrice(x) - lowestPrice(y)), { showType: false })}
<p>Median listed price: Carrier ${usd(median(carrierMs.map(lowestPrice)))}, other brands at the same sizes ${otherMs.length ? usd(median(otherMs.map(lowestPrice))) : '—'}. SEER2 ratings differ widely, so compare efficiency alongside price.</p>` : ''}

<h2>How to use this with your quote</h2>
<ol>
<li>Find your size in the table and note the lowest listed price for the brand you were quoted.</li>
<li>Subtract it from your quote. That remainder is labor, materials, overhead and margin.</li>
<li>Compare the total with the benchmark range. A brand-name quote within the range is reasonable; one far above it is paying for something other than the equipment.</li>
</ol>
<p>Run it in the ${auditLink({ brand: 'Trane', tons: 3 })} (it highlights the brand you enter), or browse ${brandLink('Goodman', 'Goodman')}, ${brandLink('Trane', 'Trane')} and ${brandLink('Carrier', 'Carrier')} prices by size.</p>`;
    },
  },
  {
    slug: 'bosch-ids-inverter-heat-pump-cost',
    get title() { return `${usd(brandByName('Bosch')!.priceMin)} Equip vs ${fmtRange(fairRange('central-heat-pump', 3, 'high'))} Installed: Bosch IDS Cost`; },
    h1: 'Bosch IDS inverter heat pump cost',
    get description() { return `Bosch IDS inverter heat pumps list from ${usd(brandByName('Bosch')!.priceMin)} to ${usd(brandByName('Bosch')!.priceMax)} vs ${fmtRange(fairRange('central-heat-pump', 3, 'high'))} 3-ton installed benchmark.`; },
    updated: today,
    related: { brands: ['Bosch'], tons: [2, 3, 5], systems: { brand: 'Bosch' } },
    audit: { systemType: 'central-heat-pump', tons: 3, tier: 'high', brand: 'Bosch' },
    body: () => {
      const bosch = systemsWhere({ brand: 'Bosch' });
      const sizes = [...new Set(bosch.map((s) => s.tons))].sort((a, b) => a - b);
      const es = bosch.filter((s) => s.energyStar);
      const f3 = fairRange('central-heat-pump', 3, 'high');
      return `
<p>Bosch's IDS (Inverter Ducted Split) heat pumps are a common upgrade quote: a variable-speed inverter outdoor unit with a matched air handler, often pitched as a premium replacement for a standard heat pump or AC. This guide shows what the Bosch IDS systems with public prices actually list for (${asOf}) and what installing them should cost.</p>

<h2>Which IDS models we can price</h2>
<p>The Bosch IDS systems sold through the online retailers we track are listed as the <b>IDS Light</b> series. If your quote says "IDS 2.0," "IDS Premium" or another variant, the model numbers will differ from the ones below, and so may the price. Get the outdoor and air handler model numbers from the contractor and compare them on the AHRI certificate; do not assume an IDS Light price applies to a different line.</p>
${systemsTable(bosch, { caption: `${bosch.length} Bosch systems in our data, sizes ${sizes.join(', ')} tons.` })}
${es.length ? `<p>${es.length} of these pairings ${es.length === 1 ? 'is' : 'are'} in the ENERGY STAR database: ${es.map((s) => `${sysLink(s)} (${s.energyStar!.seer2} SEER2, ${s.energyStar!.hspf2} HSPF2, AHRI #${s.energyStar!.ahriReferenceNumber}${s.energyStar!.coldClimate ? ', cold climate' : ''})`).join('; ')}. For the others, ratings come from the listing.</p>` : ''}

<h2>Installed cost</h2>
<p>An inverter heat pump is benchmarked at the high-efficiency tier. For a 3-ton high-efficiency ducted heat pump the benchmark is ${rangeText(f3)}. By size:</p>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Lowest listed Bosch</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th><th class="r">Non-equipment at midpoint</th></tr></thead><tbody>
${sizes.map((t) => { const s = cheapest(bosch.filter((x) => x.tons === t)); const f = fairRange('central-heat-pump', t, s.tier); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${sysLink(s, usd(lowestPrice(s)))}</td><td class="r num">${fmtRange(f)}</td><td class="r num">${usd(f.mid - lowestPrice(s))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>What should be on a Bosch IDS quote</h2>
<ul>
<li>Outdoor unit and air handler model numbers, and the AHRI reference number for that pair.</li>
<li>Whether the existing line set is reused or replaced. Inverter systems are sensitive to line set condition and length; ask what the installation instructions require.</li>
<li>The thermostat or control the system needs. Some inverter systems work best with specific controls; if a proprietary control is required, it should be listed.</li>
<li>Electric backup heat (heat strips) size, if any, as its own line. See <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">panel and heat strip adders</a>.</li>
</ul>

<h2>Is the premium worth it?</h2>
<p>Inverter systems run at variable speed, which usually means better comfort and part-load efficiency. Whether that pays back depends on your climate and electricity prices. What you should not pay is a premium that is mostly dealer margin. Compare the listed Bosch price with the ${brandLink('Bosch', 'Bosch brand page')} and other inverter options in <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage cost</a>, then grade your quote in the ${auditLink({ brand: 'Bosch', tons: 3, tier: 'high' })}.</p>`;
    },
  },
  {
    slug: 'mitsubishi-hyper-heat-cost',
    get title() { return `${usd(brandByName('Mitsubishi')!.priceMin)} Equip vs ${fmtRange(fairRange('mini-split', 2, 'high'))} Installed: Mitsubishi H2i`; },
    h1: 'Mitsubishi Hyper-Heat (H2i) cost',
    get description() { return `Mitsubishi H2i Hyper-Heat heat pumps list from ${usd(brandByName('Mitsubishi')!.priceMin)} to ${usd(brandByName('Mitsubishi')!.priceMax)} vs ${fmtRange(fairRange('mini-split', 2, 'high'))} 2-ton installed benchmark.`; },
    updated: today,
    related: { brands: ['Mitsubishi'], tons: [2, 2.5, 3], systems: { brand: 'Mitsubishi' } },
    audit: { systemType: 'mini-split', tons: 2, tier: 'high', brand: 'Mitsubishi' },
    body: () => {
      const mit = systemsWhere({ brand: 'Mitsubishi' });
      const h2i = mit.filter((s) => /h2i|hyper/i.test(s.title));
      const cold = mit.filter((s) => s.energyStar?.coldClimate);
      const otherCold = systemsWhere({ coldClimate: true }).filter((s) => s.brand !== 'Mitsubishi');
      return `
<p>Mitsubishi's Hyper-Heat (H2i) heat pumps are designed to keep heating in deep cold, and they are often quoted in cold climates as a furnace replacement. Here is what the Mitsubishi systems with public prices list for (${asOf}), what their cold-weather ratings actually say, and what installing them should cost.</p>

<h2>Mitsubishi listings we track</h2>
${systemsTable(mit, { showType: true, caption: `${mit.length} Mitsubishi systems; ${h2i.length} are H2i Hyper-Heat per their listing titles.` })}

<h2>What "Hyper-Heat" means in numbers</h2>
<p>The useful numbers for cold weather are in the ENERGY STAR record: the coefficient of performance (COP) at 5°F, and how much of its 47°F heating capacity the unit keeps at 5°F. ENERGY STAR's cold-climate designation requires a COP of at least 1.75 at 5°F and at least 70% capacity retention (${src('esCriteria', 'criteria')}).</p>
${cold.length ? `<div class="tablewrap"><table><thead><tr><th>Mitsubishi system</th><th class="r">HSPF2</th><th class="r">COP at 5°F</th><th class="r">Capacity at 5°F vs 47°F</th><th class="r">Listed</th></tr></thead><tbody>
${cold.map((s) => `<tr><td>${sysLink(s)}</td><td class="r num">${s.energyStar!.hspf2}</td><td class="r num">${s.energyStar!.copAt5F ?? '—'}</td><td class="r num">${s.energyStar!.heatingCapacity5F && s.energyStar!.heatingCapacity47F ? pct(s.energyStar!.heatingCapacity5F / s.energyStar!.heatingCapacity47F) : '—'}</td><td class="r num">${usd(lowestPrice(s))}</td></tr>`).join('\n')}
</tbody></table></div>` : '<p>None of the Mitsubishi listings in our data is matched to an ENERGY STAR cold-climate record.</p>'}
${otherCold.length ? `<p>Other brands with cold-climate certified pairings in our data include ${[...new Set(otherCold.map((s) => s.brand))].map((b) => brandLink(b)).join(', ')}. If cold-weather performance is the reason you were quoted Mitsubishi, compare those records before paying a brand premium.</p>` : ''}

<h2>Installed cost</h2>
<p>Mitsubishi's ducted H2i systems are mini-split heat pumps with a ducted air handler, so we benchmark them with REMDB's mini-split class at the high-efficiency tier:</p>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Lowest listed Mitsubishi</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
${[...new Set(mit.map((s) => s.tons))].sort((a, b) => a - b).map((t) => { const s = cheapest(mit.filter((x) => x.tons === t)); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${sysLink(s, usd(lowestPrice(s)))}</td><td class="r num">${fmtRange(fairRange('mini-split', t, 'high'))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Questions to ask on a Hyper-Heat quote</h2>
<ul>
<li>Is it H2i Hyper-Heat or a standard Mitsubishi line? The titles differ by a few letters in the model number.</li>
<li>What is the heating capacity at your local design temperature, and is backup heat planned?</li>
<li>For multi-zone systems: how many indoor heads, which sizes, and how long are the line sets?</li>
<li>Is the contractor a Mitsubishi-authorized installer, and how does that affect the warranty?</li>
</ul>
<p>See all ${brandLink('Mitsubishi', 'Mitsubishi prices')}, our <a href="/guides/multi-zone-mini-split-cost/">multi-zone mini-split guide</a>, and grade your quote in the ${auditLink({ type: 'mini-split', brand: 'Mitsubishi' })}.</p>`;
    },
  },
];
