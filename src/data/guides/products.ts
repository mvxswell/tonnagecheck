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
    get title() { return `Bosch IDS Heat Pump Cost: ${usd(brandByName('Bosch')!.priceMin)}–${usd(brandByName('Bosch')!.priceMax)} Listed`; },
    h1: 'Bosch IDS inverter heat pump cost',
    get description() { return `What a Bosch IDS inverter heat pump should cost: equipment lists ${usd(brandByName('Bosch')!.priceMin)}–${usd(brandByName('Bosch')!.priceMax)} vs a ${fmtRange(fairRange('central-heat-pump', 3, 'high'))} 3-ton installed benchmark. Check your quote free.`; },
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
${(() => {
  // Full systems only: a condenser-only price against a full-system benchmark would overstate the non-equipment share.
  // Every row uses the high-efficiency tier stated above.
  const full = bosch.filter((x) => x.systemType !== 'heat-pump-only');
  return [...new Set(full.map((x) => x.tons))].sort((a, b) => a - b).map((t) => { const s = cheapest(full.filter((x) => x.tons === t)); const f = fairRange('central-heat-pump', t, 'high'); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${sysLink(s, usd(lowestPrice(s)))}</td><td class="r num">${fmtRange(f)}</td><td class="r num">${usd(f.mid - lowestPrice(s))}</td></tr>`; }).join('\n');
})()}
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
    // Plan A row 3 (GSC Oct 20–Nov 2: 40 impr, 1 click, pos 13.5; queries "mitsubishi heat pump cost",
    // "mitsubishi ducted heat pump cost", "mitsubishi hyper-heat h2i seer2 hspf2 ahri rating").
    get title() { return `Mitsubishi Heat Pump Cost (Hyper-Heat): ${usd(brandByName('Mitsubishi')!.priceMin)}–${usd(brandByName('Mitsubishi')!.priceMax)}`; },
    h1: 'Mitsubishi Hyper-Heat (H2i) heat pump cost',
    get description() { return `Mitsubishi Hyper-Heat heat pump cost: ducted and ductless systems list ${usd(brandByName('Mitsubishi')!.priceMin)}–${usd(brandByName('Mitsubishi')!.priceMax)} vs installed benchmarks. SEER2, HSPF2 and AHRI ratings.`; },
    updated: today,
    related: { brands: ['Mitsubishi'], tons: [2, 2.5, 3], systems: { brand: 'Mitsubishi' } },
    audit: { systemType: 'mini-split', tons: 2, tier: 'high', brand: 'Mitsubishi' },
    body: () => {
      const mb = brandByName('Mitsubishi')!;
      const mit = systemsWhere({ brand: 'Mitsubishi' });
      const h2i = mit.filter((s) => /h2i|hyper/i.test(s.title));
      const cold = mit.filter((s) => s.energyStar?.coldClimate);
      const rated = mit.filter((s) => s.energyStar);
      const otherCold = systemsWhere({ coldClimate: true }).filter((s) => s.brand !== 'Mitsubishi');
      const indoor = (s: (typeof mit)[number]) => s.components[1] ?? '';
      const groups = [
        { label: 'Ducted, M-Series', models: 'SUZ outdoor + SVZ air handler', xs: mit.filter((s) => s.components[0].startsWith('SUZ') && indoor(s).startsWith('SVZ')) },
        { label: 'Ducted, P-Series', models: 'PUZ outdoor + PVA air handler', xs: mit.filter((s) => s.components[0].startsWith('PUZ') && indoor(s).startsWith('PVA')) },
        { label: 'Ductless multi-zone', models: 'MXZ outdoor + MSZ wall units', xs: mit.filter((s) => s.components[0].startsWith('MXZ')) },
      ].filter((g) => g.xs.length);
      const ducted = groups.filter((g) => g.label.startsWith('Ducted')).flatMap((g) => g.xs);
      const ductless = groups.filter((g) => !g.label.startsWith('Ducted')).flatMap((g) => g.xs);
      const spanOf = (xs: typeof mit) => { const ps = xs.map(lowestPrice); return ps.length ? (Math.min(...ps) === Math.max(...ps) ? usd(ps[0]) : `${usd(Math.min(...ps))}–${usd(Math.max(...ps))}`) : '—'; };
      const tonsOf = (xs: typeof mit) => { const ts = [...new Set(xs.map((s) => s.tons))].sort((a, b) => a - b); return ts.length > 1 ? `${ts[0]}–${ts[ts.length - 1]} ton` : `${ts[0]} ton`; };
      // Heating capacity at -13°F from Mitsubishi Electric's M- and P-Series catalog (ME_RS_2762, 09/2025),
      // "M-Series heating capacity" and "P-Series heating capacity" tables, pp. 141–143, for the exact pairings we list.
      const catalogMinus13: Record<string, number> = {
        'SUZ-AA18NLHZ|SVZ-AP18NL': 12100,
        'SUZ-AK24NLHZ|SVZ-AP24NL': 17200,
        'SUZ-AK30NLHZ|SVZ-AP30NL': 21300,
        'SUZ-AK36NLHZ|SVZ-AP36NL': 30400,
        'PUZ-AK30NLHZ|PVA-AA30NL': 21000,
      };
      const m13 = (s: (typeof mit)[number]) => catalogMinus13[`${s.components[0]}|${indoor(s)}`];
      const btu = (n: number | null | undefined) => (n ? n.toLocaleString('en-US') : '—');
      const fair2 = fairRange('mini-split', 2, 'high');
      const fair3 = fairRange('mini-split', 3, 'high');
      return `
<div class="card answer" style="border-left:4px solid var(--acc);margin:14px 0">
<p><b>Short answer:</b> the ${mit.length} Mitsubishi heat pump systems with public prices list <b>${usd(mb.priceMin)}–${usd(mb.priceMax)}</b> for the equipment (${tonsOf(mit)}, ${asOf}). Ducted systems (air handler on your existing ducts) list ${spanOf(ducted)} and ductless multi-zone systems ${spanOf(ductless)}. Installed, a high-efficiency mini-split benchmarks at ${fmtRange(fair2)} for 2 tons and ${fmtRange(fair3)} for 3 tons (national DOE-lab estimate). ENERGY STAR certifies ${cold.length} of the ${mit.length} as cold climate.</p>
</div>
<p>Mitsubishi's Hyper-Heat (H2i) heat pumps are designed to keep heating in deep cold, and they are often quoted in cold climates as a furnace replacement. Here is what the Mitsubishi systems with public prices list for, how ducted and ductless setups compare, what the cold-weather ratings say model by model, and what installing them should cost.</p>

<h2>Mitsubishi listings we track</h2>
${systemsTable(mit, { showType: true, caption: `${mit.length} Mitsubishi systems; ${h2i.length} are H2i Hyper-Heat per their listing titles.` })}

<h2>Mitsubishi ducted vs ductless heat pump cost</h2>
<p>A ducted Mitsubishi system pairs an outdoor unit with an air handler that connects to your existing ducts, so it replaces a central system one for one. A ductless multi-zone system runs a line set from one outdoor unit to a wall unit in each room. The listings split like this:</p>
<div class="tablewrap"><table><thead><tr><th>Setup</th><th>Model families</th><th class="r">Systems</th><th class="r">Sizes</th><th class="r">Listed equipment</th><th class="r">Median</th></tr></thead><tbody>
${groups.map((g) => `<tr><td>${g.label}</td><td class="num">${g.models}</td><td class="r num">${g.xs.length}</td><td class="r">${tonsOf(g.xs)}</td><td class="r num">${spanOf(g.xs)}</td><td class="r num">${usd(median(g.xs.map(lowestPrice)))}</td></tr>`).join('\n')}
</tbody></table></div>
<p>Box prices are only part of the difference. A ducted swap reuses the existing supply and return ducts if they are sound; a multi-zone job adds a line set, condensate route and electrical run to every indoor head, so the number and size of heads on the quote matter as much as the outdoor unit. Our <a href="/guides/multi-zone-mini-split-cost/">multi-zone mini-split cost guide</a> covers how to price those extras.</p>

<h2>Ratings by model: SEER2, HSPF2, AHRI number and cold-weather output</h2>
<p>The numbers that matter in cold weather are the ENERGY STAR record's coefficient of performance (COP) at 5°F and how much of its 47°F heating capacity the system keeps at 5°F. ENERGY STAR's cold-climate designation requires a COP of at least 1.75 at 5°F and at least 70% capacity retention (${src('esCriteria', 'criteria')}). In the model number, an outdoor unit ending in <b>HZ</b> is the H2i Hyper-Heating version ("H = Base pan heater", "Z = H2i Hyper-Heating" in the model number reference of ${src('mitsuCatalog', "Mitsubishi's M- and P-Series catalog")}); our <a href="/decoder/mitsubishi/">Mitsubishi model number decoder</a> reads the rest.</p>
${rated.length ? `<div class="tablewrap"><table><thead><tr><th>Mitsubishi system</th><th class="r">AHRI #</th><th class="r">SEER2</th><th class="r">HSPF2</th><th class="r">COP at 5°F</th><th class="r">Heat at 5°F / 47°F (BTU/h)</th><th class="r">Kept at 5°F</th><th class="r">Catalog heat at −13°F</th></tr></thead><tbody>
${rated.map((s) => { const e = s.energyStar!; return `<tr><td>${sysLink(s, s.components[0].startsWith('MXZ') ? `${s.components[0]} multi-zone` : `${s.components[0]} + ${indoor(s)}`)}${e.coldClimate ? ' <span class="badge b-es">Cold climate</span>' : ''}</td><td class="r num">${e.ahriReferenceNumber}</td><td class="r num">${e.seer2}</td><td class="r num">${e.hspf2}</td><td class="r num">${e.copAt5F ?? '—'}</td><td class="r num">${btu(e.heatingCapacity5F)} / ${btu(e.heatingCapacity47F)}</td><td class="r num">${e.heatingCapacity5F && e.heatingCapacity47F ? pct(e.heatingCapacity5F / e.heatingCapacity47F) : '—'}</td><td class="r num">${btu(m13(s))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">SEER2, HSPF2, COP and 5°F/47°F capacities: each pairing's ${src('esApi', 'ENERGY STAR record')}, matched by AHRI reference number and re-checked Nov 5, 2026. Confirm any pairing in the ${src('ahri', 'AHRI Directory')} with the reference number. −13°F capacities: ${src('mitsuCatalog', 'Mitsubishi Electric M- and P-Series catalog')} heating capacity tables (pp. 141–143) for the same outdoor and indoor models; "—" means the catalog does not list that pairing at −13°F. ${mit.length - rated.length ? `${mit.length - rated.length} listed ${mit.length - rated.length === 1 ? 'system has' : 'systems have'} no matched ENERGY STAR record.` : ''}</p>` : '<p>None of the Mitsubishi listings in our data is matched to an ENERGY STAR record.</p>'}
${(() => {
  const ret = (x: (typeof mit)[number]) => x.energyStar!.heatingCapacity5F! / x.energyStar!.heatingCapacity47F!;
  const withCap = rated.filter((x) => x.energyStar!.heatingCapacity5F && x.energyStar!.heatingCapacity47F);
  const hz = withCap.filter((x) => x.components[0].endsWith('HZ'));
  const non = withCap.filter((x) => !x.components[0].endsWith('HZ')).sort((x, y) => ret(x) - ret(y));
  if (!hz.length || !non.length) return '';
  return `<p>The pattern in the records: every H2i (HZ) pairing here keeps at least ${pct(Math.min(...hz.map(ret)))} of its 47°F heating output at 5°F, while the non-HZ ${sysLink(non[0], non[0].components[0])} keeps ${pct(ret(non[0]))}. If you heat through real winters, ask for an HZ outdoor unit and its 5°F number, not just the SEER2.</p>`;
})()}
${otherCold.length ? `<p>Other brands with cold-climate certified pairings in our data include ${[...new Set(otherCold.map((s) => s.brand))].map((b) => brandLink(b)).join(', ')}. If cold-weather performance is the reason you were quoted Mitsubishi, compare those records before paying a brand premium; our <a href="/compare/bosch-vs-mitsubishi-heat-pump-cost/">Bosch vs Mitsubishi heat pump comparison</a> puts the two side by side.</p>` : ''}

<h2>Installed cost</h2>
<p>Mitsubishi's ducted H2i systems are mini-split heat pumps with a ducted air handler, so we benchmark them with REMDB's mini-split class at the high-efficiency tier:</p>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Lowest listed Mitsubishi</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
${[...new Set(mit.map((s) => s.tons))].sort((a, b) => a - b).map((t) => { const s = cheapest(mit.filter((x) => x.tons === t)); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${sysLink(s, usd(lowestPrice(s)))}</td><td class="r num">${fmtRange(fairRange('mini-split', t, 'high'))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Mitsubishi warranty: 5, 10 or 12 years</h2>
<p>Mitsubishi Electric Trane HVAC US's residential limited warranty (${src('mitsuWarranty', 'effective Oct. 15, 2026')}) covers the SUZ, PUZ and MXZ outdoor units and the SVZ, PVA and MSZ indoor units listed here, in three steps:</p>
<ul>
<li><b>Base:</b> 5 years on parts and 7 years on the compressor from installation.</li>
<li><b>Registered:</b> 10 years on parts and compressor if the system is in an owner-occupied home and registered within 90 days of installation (residents of California, Connecticut, Florida and Georgia get it without registering).</li>
<li><b>Diamond Contractor:</b> 12 years on parts and compressor if a Mitsubishi Diamond Contractor installs it and registers it within 90 days.</li>
</ul>
<p>The warranty does not include labor. If a quote promises "12 years," confirm the installer is a Diamond Contractor and that they will register the system; if it promises labor coverage, get the installer's own labor warranty in writing.</p>

<h2>Questions to ask on a Hyper-Heat quote</h2>
<ul>
<li>Is it H2i Hyper-Heat or a standard Mitsubishi line? Look for HZ at the end of the outdoor model number.</li>
<li>What is the AHRI reference number for this exact outdoor and indoor pairing, and what heating capacity does it list at 5°F?</li>
<li>What is the heating capacity at your local design temperature, and is backup heat planned?</li>
<li>For multi-zone systems: how many indoor heads, which sizes, and how long are the line sets?</li>
<li>Are you a Diamond Contractor, and who registers the system for the 10- or 12-year warranty?</li>
</ul>
<p>See all ${brandLink('Mitsubishi', 'Mitsubishi prices')}, the <a href="/compare/bosch-vs-mitsubishi-heat-pump-cost/">Bosch vs Mitsubishi cost comparison</a>, our <a href="/guides/multi-zone-mini-split-cost/">multi-zone mini-split guide</a>, and grade your quote in the ${auditLink({ type: 'mini-split', brand: 'Mitsubishi' })}.</p>`;
    },
  },
];
