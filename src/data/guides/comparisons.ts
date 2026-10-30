// Side-by-side cost comparisons. Every number is computed from the seed and REMDB at build time.
import { lowestPrice, median, type System } from '../equipment';
import { fairRange, systemsWhere, isInverter, usd, fmtRange, pct } from '../../lib/facts';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

const med = (xs: System[]) => (xs.length ? usd(median(xs.map(lowestPrice))) : '—');

export const COMPARISON_GUIDES: Guide[] = [
  {
    slug: 'heat-pump-vs-ac-and-furnace-replacement-cost',
    get title() { return `${usd(lowestPrice(systemsWhere({ type: 'central-heat-pump', tons: 3 })[0]))} Equip vs ${fmtRange(fairRange('ac-furnace', 3))} Installed: HP vs AC+Furnace`; },
    h1: 'Heat pump vs AC + gas furnace: replacement cost compared',
    get description() { return `Compare heat pump (${fmtRange(fairRange('central-heat-pump', 3))}) vs AC + gas furnace (${fmtRange(fairRange('ac-furnace', 3))}) installed benchmarks and ${usd(lowestPrice(systemsWhere({ type: 'central-heat-pump', tons: 3 })[0]))}+ equipment by size.`; },
    updated: today,
    related: { tons: [2, 3, 4, 5], systems: { type: ['central-heat-pump', 'ac-furnace'], tons: [3, 4] } },
    audit: { systemType: 'ac-furnace', tons: 3 },
    body: () => {
      const sizes = [1.5, 2, 2.5, 3, 3.5, 4, 5];
      const rows = sizes.map((t) => ({ t, hp: fairRange('central-heat-pump', t), af: fairRange('ac-furnace', t), hpX: systemsWhere({ type: 'central-heat-pump', tons: t }), afX: systemsWhere({ type: 'ac-furnace', tons: t }) }));
      const r3 = rows.find((r) => r.t === 3)!;
      return `
<p>When an air conditioner and furnace both need replacing, the quote often comes in two flavors: a like-for-like AC plus gas furnace, or a heat pump that does both jobs. Here is how they compare on installed cost and listed equipment price at each size (${asOf}), and what changes the math.</p>

<h2>Installed benchmarks side by side</h2>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Heat pump, installed <span class="badge b-est">est.</span></th><th class="r">AC + furnace, installed <span class="badge b-est">est.</span></th><th class="r">Listed HP equipment (median)</th><th class="r">Listed AC + furnace (median)</th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${tonLink(r.t, `${r.t} ton`)}</td><td class="r num">${usd(r.hp.mid)}<br><span class="small muted">${fmtRange(r.hp)}</span></td><td class="r num">${usd(r.af.mid)}<br><span class="small muted">${fmtRange(r.af)}</span></td><td class="r num">${med(r.hpX)} <span class="small muted">(${r.hpX.length})</span></td><td class="r num">${med(r.afX)} <span class="small muted">(${r.afX.length})</span></td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">Standard efficiency. The AC + furnace benchmark assumes an 80,000 BTU/h, 80% AFUE furnace; change it in the auditor. ${remdbNote}</p>
<p>At 3 tons the heat pump benchmark midpoint is ${usd(r3.hp.mid)} and the AC + furnace midpoint is ${usd(r3.af.mid)}. Which comes out cheaper installed depends on size and efficiency, and the gap is usually smaller than the spread between contractors' quotes for either.</p>

<h2>What changes the comparison</h2>
<ul>
<li><b>Gas line and venting.</b> Replacing a furnace with a furnace reuses the gas line and venting. Going all-electric removes them, but may add electrical work. See <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">panel and heat strip adders</a>.</li>
<li><b>Backup heat.</b> In cold climates a heat pump either needs electric backup heat strips or a cold-climate unit, or pairs with the existing furnace as a dual-fuel system.</li>
<li><b>Rebates.</b> Income-qualified HEAR (HEEHR) rebates cover heat pumps, up to $8,000 under ${src('hearStatute', '42 U.S.C. § 18795a')}, but not central AC or gas furnaces. Since DOE Program Notice 26-2 (${src('doePn262', 'May 2026')}) they also no longer pay for this exact switch: replacing a gas furnace with a heat pump is fuel switching, which the program dropped. They now cover upgrading existing electric heating or cooling to more efficient electric equipment, so a HEAR rebate should not appear on a gas-to-heat-pump quote. The federal 25C credit ended for anything placed in service after Dec. 31, 2025 (${src('irsObbba', 'IRS')}). Details in our <a href="/guides/heat-pump-tax-credit-and-rebate-stacking-2026/">2026 rebate guide</a>.</li>
<li><b>Operating cost.</b> This depends on your electricity and gas prices and climate, which a quote comparison cannot settle. Ask the contractor for an operating cost estimate with the assumptions written down.</li>
</ul>

<h2>Lowest listed systems at 3 tons</h2>
${systemsTable([...r3.hpX.slice(0, 4), ...r3.afX.slice(0, 3)], { showType: true })}

<h2>How to compare two quotes fairly</h2>
<ol>
<li>Make sure both quotes are for the same size, from a load calculation.</li>
<li>Compare each to its own benchmark in the ${auditLink({ type: 'ac-furnace', tons: 3 }, 'auditor')}: run the AC + furnace quote as "Central AC + gas furnace" and the heat pump quote as "Central heat pump."</li>
<li>List the add-ons separately: electrical, gas, venting, ductwork, backup heat.</li>
<li>Subtract only rebates you have been approved for.</li>
</ol>`;
    },
  },
  {
    slug: 'multi-zone-mini-split-cost',
    get title() { const mz = systemsWhere({ type: 'mini-split', multiZone: true }); return `${usd(lowestPrice(cheapest(mz)))} Equip vs ${fmtRange(fairRange('mini-split', 2, 'high'))} Installed: Multi-Zone Cost`; },
    h1: 'Multi-zone mini-split cost',
    get description() { const mz = systemsWhere({ type: 'mini-split', multiZone: true }); return `Multi-zone mini-split heat pumps list from ${usd(lowestPrice(cheapest(mz)))} to ${usd(Math.max(...mz.map(lowestPrice)))} vs ${fmtRange(fairRange('mini-split', 2, 'high'))} 2-ton installed benchmark.`; },
    updated: today,
    get related() { return { brands: [...new Set(systemsWhere({ type: 'mini-split', multiZone: true }).map((x) => x.brand))], tons: [1.5, 2, 3], systems: { type: 'mini-split' as const, multiZone: true } }; },
    audit: { systemType: 'mini-split', tons: 2, tier: 'high' },
    body: () => {
      const mz = systemsWhere({ type: 'mini-split', multiZone: true });
      const sz = systemsWhere({ type: 'mini-split', multiZone: false });
      const sizes = [...new Set(mz.map((s) => s.tons))].sort((a, b) => a - b);
      const byZones = [2, 3, 4].map((z) => ({ z, xs: mz.filter((s) => s.zones === z) }));
      return `
<p>Multi-zone mini-splits put one outdoor unit on two to four (or more) indoor heads, each controlling its own room. They are a common quote for houses without ductwork, additions and finished spaces. The equipment is easy to price; the installation is where multi-zone quotes vary most. Here is what the multi-zone systems in our data list for (${asOf}) and what installing them should cost.</p>

<h2>Listed multi-zone systems</h2>
${systemsTable(mz, { showType: true, caption: `${mz.length} multi-zone systems. Prices include the outdoor unit and the indoor heads listed in each package.` })}
<div class="tablewrap"><table><thead><tr><th>Zones</th><th class="r">Systems</th><th class="r">Median listed</th><th class="r">Range</th></tr></thead><tbody>
${byZones.filter((x) => x.xs.length).map((x) => `<tr><td>${x.z}-zone</td><td class="r num">${x.xs.length}</td><td class="r num">${med(x.xs)}</td><td class="r num">${usd(Math.min(...x.xs.map(lowestPrice)))}–${usd(Math.max(...x.xs.map(lowestPrice)))}</td></tr>`).join('\n')}
</tbody></table></div>
<p>Brands with multi-zone listings: ${[...new Set(mz.map((s) => s.brand))].map((b) => brandLink(b)).join(', ')}. For comparison, single-zone mini-splits in our data list at a median of ${med(sz)}.</p>

<h2>Installed benchmark</h2>
<p>REMDB has a separate cost model for multi-zone ductless heat pumps. At the high-efficiency tier, which most multi-zone systems fall into:</p>
<div class="tablewrap"><table><thead><tr><th>Total capacity</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th><th class="r">Lowest listed multi-zone</th></tr></thead><tbody>
${sizes.map((t) => { const s = cheapest(mz.filter((x) => x.tons === t)); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${rangeText(fairRange('mini-split', t, 'high'))}</td><td class="r num">${sysLink(s, usd(lowestPrice(s)))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote} Up to 1.5 tons the benchmark uses REMDB's single-zone class.</p>

<h2>What drives a multi-zone quote</h2>
<ul>
<li><b>Number and type of heads.</b> Wall-mounted heads are usually the least expensive to install; ceiling cassettes and ducted heads take more work.</li>
<li><b>Line set runs.</b> Each head needs its own refrigerant lines, drain and communication wire back to the outdoor unit. Long or hidden runs through walls and floors add labor.</li>
<li><b>Condensate.</b> Heads on interior walls may need condensate pumps.</li>
<li><b>Electrical.</b> Usually one circuit for the outdoor unit; see <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">panel adders</a> if a panel upgrade appears.</li>
<li><b>Head sizing.</b> Heads should be sized to each room's load. A quote with every head the same size, regardless of room, suggests no room-by-room calculation.</li>
</ul>

<h2>Multi-zone vs ducted</h2>
<p>If the house already has decent ductwork, a ducted heat pump is usually the simpler replacement; compare the ${tonLink(2, '2-ton')} and ${tonLink(3, '3-ton')} pages. Multi-zone shines where there are no ducts or where rooms need separate control. Cold-climate ratings vary a lot between mini-split lines; check COP at 5°F on each system page and see the <a href="/guides/mitsubishi-hyper-heat-cost/">Mitsubishi Hyper-Heat guide</a>.</p>
<p>Grade a multi-zone quote in the ${auditLink({ type: 'mini-split', tons: 2, tier: 'high' })} (choose "Mini-split heat pump").</p>`;
    },
  },
  {
    slug: 'heat-pump-condenser-only-vs-full-system-replacement',
    get title() { return `Condenser Only vs Full System: ${fmtRange(fairRange('heat-pump-only', 3))} Installed`; },
    h1: 'Heat pump condenser only vs full system replacement',
    get description() { const c = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 3 })); return `Replace just the outdoor unit or the whole system? 3-ton heat pump condensers list from ${usd(lowestPrice(c))} (${fmtRange(fairRange('heat-pump-only', 3))} installed) vs ${fmtRange(fairRange('central-heat-pump', 3))} full system.`; },
    updated: today,
    get related() { return { brands: [...new Set(systemsWhere({ type: 'heat-pump-only' }).map((x) => x.brand))], tons: [3, 4, 5], systems: { type: 'heat-pump-only' as const } }; },
    audit: { systemType: 'heat-pump-only', tons: 3 },
    body: () => {
      const cond = systemsWhere({ type: 'heat-pump-only' });
      const sizes = [...new Set(cond.map((s) => s.tons))].sort((a, b) => a - b);
      return `
<p>When an outdoor heat pump unit fails, the quote often offers two paths: replace just the outdoor condenser, or replace the whole system including the indoor coil or air handler. The condenser-only price is lower up front, but it only works if the new outdoor unit is properly matched to the indoor side. Here is how the prices compare in our data (${asOf}).</p>

<h2>Condenser vs full system, same size</h2>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Lowest listed condenser</th><th class="r">Lowest listed full system</th><th class="r">Condenser swap installed <span class="badge b-est">est.</span></th><th class="r">Full system installed <span class="badge b-est">est.</span></th></tr></thead><tbody>
${sizes.map((t) => { const c = cheapest(cond.filter((s) => s.tons === t)); const f = cheapest(systemsWhere({ type: 'central-heat-pump', tons: t })); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${sysLink(c, usd(lowestPrice(c)))}</td><td class="r num">${f ? sysLink(f, usd(lowestPrice(f))) : '—'}</td><td class="r num">${fmtRange(fairRange('heat-pump-only', t))}</td><td class="r num">${fmtRange(fairRange('central-heat-pump', t))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">REMDB has no outdoor-unit-only class, so the condenser-swap range is anchored on the median listed condenser price using REMDB's stated installed-to-retail ratio (1.5×, up to 2× in some markets); it is an estimate. The full-system range is REMDB's ducted heat pump replacement model. ${remdbNote}</p>
${cond.some((s) => s.prices.length > 1) ? `<p>Several condensers are listed at two retailers, which gives you a quick check on the equipment price: ${cond.filter((s) => s.prices.length > 1).map((s) => `${sysLink(s)} ${s.prices.map((p) => `${p.retailer} ${usd(p.price)}`).join(' / ')}`).join('; ')}.</p>` : ''}

<h2>Why the indoor match decides it</h2>
<p>A split heat pump's SEER2 and HSPF2 ratings belong to a specific outdoor unit paired with a specific indoor coil or air handler, certified by AHRI. Put a new outdoor unit on an old coil that is not a certified match and the rating may not apply, efficiency can suffer, and rebates that depend on the rating will not pay out. If the new unit uses a different refrigerant from the old one, the old coil usually is not compatible at all; see the <a href="/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/">refrigerant transition guide</a>.</p>
<p>Ask the contractor for the AHRI certificate showing the new outdoor unit with your existing indoor model. If they cannot produce one, the condenser-only option is not a like-for-like repair.</p>

<h2>When condenser-only makes sense</h2>
<ul>
<li>The indoor coil or air handler is relatively new, in good condition, and an AHRI-certified match for the new outdoor unit.</li>
<li>The refrigerant is the same, or the manufacturer explicitly approves the combination.</li>
<li>The line set is in good condition and sized for the new unit.</li>
</ul>

<h2>When a full system is the better buy</h2>
<ul>
<li>The indoor side is old, mismatched or on the old refrigerant.</li>
<li>You want rebate eligibility, which usually requires a certified pairing.</li>
<li>The size was wrong to begin with; see <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J sizing</a>.</li>
</ul>
<p>Grade either option in the ${auditLink({ type: 'heat-pump-only', tons: 3 })}: choose "Heat pump only" for a condenser swap or "Central heat pump" for a full system. The ${cond.length} condensers we track are from ${[...new Set(cond.map((s) => s.brand))].map((b) => brandLink(b)).join(', ')}.</p>`;
    },
  },
  {
    slug: 'inverter-vs-single-stage-heat-pump-cost',
    get title() { return `${usd(lowestPrice(systemsWhere({ type: 'central-heat-pump', tons: 3 })[0]))} Equip vs ${fmtRange(fairRange('central-heat-pump', 3, 'mid'))} Installed: Inverter Cost`; },
    h1: 'Inverter vs single-stage heat pump: what the upgrade costs',
    get description() { return `Variable-speed inverter vs single-stage heat pump prices (${usd(lowestPrice(systemsWhere({ type: 'central-heat-pump', tons: 3 })[0]))}+ 3-ton equipment vs ${fmtRange(fairRange('central-heat-pump', 3, 'mid'))} mid-tier installed).`; },
    updated: today,
    related: { tons: [2, 3, 4], systems: { type: 'central-heat-pump', staging: 'inverter' } },
    audit: { systemType: 'central-heat-pump', tons: 3, tier: 'mid' },
    body: () => {
      const sizes = [1.5, 2, 2.5, 3, 3.5, 4, 5];
      const rows = sizes.map((t) => ({ t, inv: systemsWhere({ type: 'central-heat-pump', tons: t, staging: 'inverter' }), fix: systemsWhere({ type: 'central-heat-pump', tons: t, staging: 'fixed' }) })).filter((r) => r.inv.length || r.fix.length);
      const inv = systemsWhere({ type: 'central-heat-pump', staging: 'inverter' });
      const fix = systemsWhere({ type: 'central-heat-pump', staging: 'fixed' });
      const coldInv = inv.filter((s) => s.energyStar?.coldClimate);
      return `
<p>"Variable-speed" or "inverter" is the most common upgrade line on a heat pump quote. Instead of running at one or two fixed speeds, an inverter compressor ramps up and down to match the load. Here is what that costs in listed equipment price and installed benchmark (${asOf}), and when it is worth paying for.</p>

<h2>Listed price: inverter vs fixed-speed, same size</h2>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Inverter, median listed</th><th class="r">Single/two-stage, median listed</th><th class="r">Difference</th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${tonLink(r.t, `${r.t} ton`)}</td><td class="r num">${med(r.inv)} <span class="small muted">(${r.inv.length})</span></td><td class="r num">${med(r.fix)} <span class="small muted">(${r.fix.length})</span></td><td class="r num">${r.inv.length && r.fix.length ? usd(median(r.inv.map(lowestPrice)) - median(r.fix.map(lowestPrice))) : '—'}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">Ducted heat pump systems. "Inverter" means the ENERGY STAR record lists a continuously variable compressor, or the listing says variable-speed or inverter. Brand mix differs by size, so the difference is a rough guide. A negative difference means the inverter systems listed at that size happen to be cheaper.</p>
<p>Across all sizes, ${inv.length} inverter systems list at a median of ${med(inv)} and ${fix.length} fixed-speed systems at ${med(fix)}. Some inverter lines from value brands list below fixed-speed systems from premium brands, so "inverter" alone does not explain a large price difference on a quote.</p>

<h2>Installed benchmark gap</h2>
<p>REMDB's cost model scales with efficiency, and inverter units generally carry higher SEER2 ratings. At 3 tons: standard tier ${rangeText(fairRange('central-heat-pump', 3, 'standard'))}; mid tier ${rangeText(fairRange('central-heat-pump', 3, 'mid'))}; high tier ${rangeText(fairRange('central-heat-pump', 3, 'high'))}. ${remdbNote}</p>

<h2>What you get for the money</h2>
<ul>
<li><b>Part-load efficiency and comfort:</b> longer, slower run cycles mean steadier temperatures and better dehumidification.</li>
<li><b>Cold-weather capacity:</b> many cold-climate heat pumps are inverter units.${coldInv.length ? ` Cold-climate inverter systems in our data include ${coldInv.slice(0, 5).map((s) => sysLink(s)).join(', ')}.` : ''}</li>
<li><b>Sizing tolerance:</b> an inverter can throttle down if the load calculation lands between sizes, which can avoid stepping up a size. See <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J sizing</a>.</li>
</ul>

<h2>What to check on an inverter quote</h2>
<ul>
<li>The SEER2, EER2 and HSPF2 on the AHRI certificate for the exact pair. Inverter ratings vary a lot between product lines.</li>
<li>Whether a specific thermostat or control is required to get full variable-speed operation, and whether it is included.</li>
<li>The price difference from the fixed-speed option on the same quote. Compare it with the listed difference above.</li>
</ul>
<p>Related: <a href="/guides/bosch-ids-inverter-heat-pump-cost/">Bosch IDS inverter cost</a>, <a href="/guides/mitsubishi-hyper-heat-cost/">Mitsubishi Hyper-Heat</a>, and ${brandLink('LG', 'LG')}, ${brandLink('Trane', 'Trane')} and ${brandLink('Gree', 'Gree')} prices. Grade your quote in the ${auditLink({ tons: 3, tier: 'mid' })}.</p>`;
    },
  },
];
