// System configuration & installation labor guides (#11–#14 from Issue #4).
// Every dollar figure is computed from src/lib/facts.ts, src/data/equipment.ts, or src/data/states.ts; non-price claims cite src/data/sources.ts.
import { lowestPrice, median, TONNAGES } from '../equipment';
import { fairRange, systemsWhere, equipmentStats, adderRange, newCircuitAdder, usd, fmtRange } from '../../lib/facts';
import { STATES, heatingCosts, EFFICIENCY } from '../states';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

export const INSTALLATION_GUIDES: Guide[] = [
  {
    slug: 'dual-fuel-heat-pump-gas-furnace-vs-cold-climate-heat-pump-cost',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3, 'high');
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Dual-Fuel Cost`;
    },
    h1: 'Dual-fuel (heat pump + gas furnace backup) vs all-electric cold-climate heat pump cost',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3, 'high');
      return `Dual-fuel heat pump + gas furnace vs cold-climate heat pumps (${usd(s.min)}–${usd(s.max)} 3-ton equipment, ${fmtRange(f)} high-tier installed) and state EIA fuel math.`;
    },
    updated: today,
    related: { tons: [2.5, 3, 4], brands: ['Mitsubishi', 'Bosch', 'Goodman', 'LG'], systems: { type: 'central-heat-pump', coldClimate: true } },
    audit: { systemType: 'central-heat-pump', tons: 3, tier: 'high' },
    body: () => {
      const hp3s = fairRange('central-heat-pump', 3, 'standard');
      const hp3h = fairRange('central-heat-pump', 3, 'high');
      const af3 = fairRange('ac-furnace', 3, 'standard');
      const af3h = fairRange('ac-furnace', 3, 'high');
      const panel = adderRange('panel200A');
      const circuit = newCircuitAdder();
      const cold = systemsWhere({ type: 'central-heat-pump', coldClimate: true });
      const sampleStates = ['MA', 'PA', 'OH', 'GA']
        .map((c) => STATES.find((s) => s.code === c && s.electricity && s.gas && s.gasHeatContentBtuPerCf))
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
      return `
<p>Homeowners in IECC Climate Zones 4 through 7 who currently heat with natural gas face one of the most consequential configuration choices in residential HVAC: install an all-electric cold-climate heat pump with an air handler, or configure a "dual-fuel" (hybrid) system that pairs an outdoor heat pump with a gas furnace and cased evaporator coil so the furnace takes over on the coldest winter nights. Here is how the equipment, installation benchmarks, electrical adders, and state EIA fuel economics compare (${asOf}).</p>

<h2>Installed benchmarks: all-electric heat pump vs furnace + coil configurations</h2>
<div class="tablewrap"><table><thead><tr><th>3-ton configuration</th><th class="r">Standard tier <span class="badge b-est">est.</span></th><th class="r">High-efficiency tier <span class="badge b-est">est.</span></th><th class="r">Listed 3-ton equipment (${asOf})</th></tr></thead><tbody>
<tr><td>${tonLink(3, 'Ducted central heat pump + air handler')}</td><td class="r num">${fmtRange(hp3s)} (mid ${usd(hp3s.mid)})</td><td class="r num">${fmtRange(hp3h)} (mid ${usd(hp3h.mid)})</td><td class="r num">${usd(equipmentStats('central-heat-pump', 3).min)}–${usd(equipmentStats('central-heat-pump', 3).max)}</td></tr>
<tr><td>${tonLink(3, 'Central AC + gas furnace + cased coil')}</td><td class="r num">${fmtRange(af3)} (mid ${usd(af3.mid)})</td><td class="r num">${fmtRange(af3h)} (mid ${usd(af3h.mid)})</td><td class="r num">${usd(equipmentStats('ac-furnace', 3).min)}–${usd(equipmentStats('ac-furnace', 3).max)}</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote} Rule #1 note: DOE REMDB models ducted heat pumps and central AC + gas furnaces separately rather than publishing a standalone dual-fuel regression; in hardware terms, a dual-fuel install substitutes a heat pump condenser for the straight-cool AC condenser atop the gas furnace and cased coil.</p>

<h2>Why electrical capacity often tips the upfront quote</h2>
<ul>
<li><b>Dual-fuel avoids electric backup heat strips:</b> Because the gas furnace provides backup and emergency heat below the switchover temperature, the indoor unit is a 120V gas furnace rather than a 240V air handler with 10 kW–15 kW electric heat strips. The outdoor heat pump reuses the existing 240V air-conditioner circuit, avoiding a ${usd(circuit)} new-circuit run or a ${fmtRange(panel)} 200A panel upgrade (${src('remdb', 'REMDB')}). See our <a href="/guides/electric-heat-strip-aux-heat-5kw-10kw-15kw-cost/">electric heat strip sizing guide</a>.</li>
<li><b>All-electric eliminates the gas furnace, flue, and monthly gas customer charge:</b> Replacing the furnace with an air handler removes combustion venting and carbon monoxide risk (${src('cpscCo', 'CPSC')}). Modern cold-climate heat pumps certified under ${src('esCriteria', 'ENERGY STAR Cold Climate criteria')} deliver ≥ 70% of rated capacity at 5°F with a COP ≥ 1.75 (${src('bascColdClimate', 'DOE/PNNL Cold Climate Guide')}).</li>
</ul>

<h2>Economic balance point: heat pump vs gas furnace by state EIA prices</h2>
<p>Using live U.S. Energy Information Administration residential electricity (${src('eiaElectricity', 'EIA Table 5.6.B')}) and natural gas (${src('eiaGas', 'EIA Natural Gas')}, ${src('eiaHeatContent', 'heat content')}) rates from our <a href="/states/">state pages</a>, here is the delivered cost per million BTU of heat across four states with different utility rate ratios:</p>
<div class="tablewrap"><table><thead><tr><th>State</th><th class="r">Electricity (¢/kWh)</th><th class="r">Natural gas ($/Mcf)</th><th class="r">Cold-climate HP (${EFFICIENCY.coldHspf2Median} HSPF2)</th><th class="r">Gas furnace (${EFFICIENCY.afueLow}% / ${EFFICIENCY.afueHigh}% AFUE)</th></tr></thead><tbody>
${sampleStates.map((st) => {
  const hc = heatingCosts(st);
  const cchp = hc.find((x) => x.label.startsWith('Cold-climate')) ?? hc.find((x) => x.label.startsWith('Heat pump,'))!;
  const gas80 = hc.find((x) => x.label.includes(`${EFFICIENCY.afueLow}%`));
  const gas96 = hc.find((x) => x.label.includes(`${EFFICIENCY.afueHigh}%`));
  return `<tr><td><a href="/states/${st.slug}/">${st.name}</a></td><td class="r num">${st.electricity!.centsPerKwh}¢</td><td class="r num">$${st.gas!.dollarsPerMcf}</td><td class="r num">${usd(cchp.dollarsPerMMBtu)}/MMBtu</td><td class="r num">${gas80 ? usd(gas80.dollarsPerMMBtu) : '—'} / ${gas96 ? usd(gas96.dollarsPerMMBtu) : '—'}</td></tr>`;
}).join('\n')}
</tbody></table></div>
<p>In states with high electric rates and moderate gas prices, a dual-fuel thermostat can run the heat pump during mild and moderate weather (when the heat pump's COP is highest) and switch over to the gas furnace during deep cold snaps when the heat pump's COP drops toward 1.75–2.0.</p>

<h2>2026 rebate rule check: DOE Program Notice 26-2</h2>
<p>Be careful with contractor rebate promises on gas-to-electric quotes: under DOE Program Notice 26-2 (${src('doePn262', 'May 2026')}), federal HEEHRA/HEAR rebates (${src('hearStatute', '42 U.S.C. § 18795a')}) no longer cover fuel-switching from natural gas, propane, or oil to a heat pump, and the federal Section 25C tax credit expired after December 31, 2025 (${src('irsObbba', 'IRS')}). State and utility rebates still vary by utility; check your state on our <a href="/states/">state pages</a> and our <a href="/guides/heat-pump-tax-credit-and-rebate-stacking-2026/">2026 rebate guide</a>.</p>

<h2>Listed cold-climate heat pumps from ${brandLink('Mitsubishi')}, ${brandLink('Bosch')}, ${brandLink('LG')}, and ${brandLink('Goodman')} (${asOf})</h2>
${systemsTable(cold.slice(0, 6))}
<p>Grade either a heat pump quote or an AC + furnace quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3, tier: 'high' }, 'TonnageCheck quote auditor')}.</p>`;
    },
  },
  {
    slug: '14-3-seer2-vs-16-seer2-vs-18-seer2-heat-pump-payback-math',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: SEER2 Payback`;
    },
    h1: '14.3 SEER2 baseline vs 16 SEER2 vs 18+ SEER2 heat pump cost and payback math',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `Compare 14.3, 16, and 18+ SEER2 heat pump benchmarks (${fmtRange(f)} at 3 tons) and ${usd(s.min)}–${usd(s.max)} equipment prices to calculate SEER2 payback.`;
    },
    updated: today,
    related: { tons: [2, 3, 4, 5], brands: ['Goodman', 'Trane', 'Bosch', 'LG'], systems: { type: 'central-heat-pump', tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3, tier: 'mid' },
    body: () => {
      const sizes = [2, 3, 4, 5];
      const tiers = sizes.map((t) => {
        const std = fairRange('central-heat-pump', t, 'standard');
        const mid = fairRange('central-heat-pump', t, 'mid');
        const high = fairRange('central-heat-pump', t, 'high');
        const eqStd = systemsWhere({ type: 'central-heat-pump', tons: t, tier: 'standard' });
        const eqMid = systemsWhere({ type: 'central-heat-pump', tons: t, tier: 'mid' });
        const eqHigh = systemsWhere({ type: 'central-heat-pump', tons: t, tier: 'high' });
        return { t, std, mid, high, eqStd, eqMid, eqHigh };
      });
      const r3 = tiers.find((x) => x.t === 3)!;
      const coolingPct16 = ((1 - 14.3 / 16) * 100).toFixed(1);
      const coolingPct18 = ((1 - 14.3 / 18) * 100).toFixed(1);
      return `
<p>Contractor proposals almost always present three columns—"Bronze (14.3 SEER2)," "Silver (16 SEER2)," and "Gold / Platinum (18+ SEER2)"—with large price jumps between each column. Sales software often promises that the top tier "pays for itself in energy savings," without showing the underlying math or how much of the price jump is pure contractor margin rather than equipment cost. Here is the exact equipment and installed-benchmark spread across efficiency tiers in our catalog (${asOf}), plus the formula to check your own payback.</p>

<h2>Installed benchmark and listed equipment price by efficiency tier</h2>
<p>In our data, systems are grouped into three efficiency tiers based on SEER2 (${src('remdb', 'DOE REMDB')} regressions for Standard, Medium, and High efficiency):</p>
<ul>
<li><b>Standard tier (under 15.2 SEER2, including 14.3 SEER2 baseline):</b> Base single- or two-stage systems below the ENERGY STAR threshold.</li>
<li><b>Mid tier (15.2 to 16.9 SEER2):</b> Meets the ${src('esCriteria', 'ENERGY STAR')} split-system cooling threshold (≥ 15.2 SEER2, ≥ 7.8 HSPF2, ≥ 11.0 EER2).</li>
<li><b>High tier (17.0+ SEER2, including 18+ SEER2 inverter lines):</b> Variable-speed inverter systems with the widest modulation range.</li>
</ul>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Standard (&lt;15.2 SEER2) <span class="badge b-est">est.</span></th><th class="r">Mid (15.2–16.9 SEER2) <span class="badge b-est">est.</span></th><th class="r">High (17+ SEER2) <span class="badge b-est">est.</span></th><th class="r">Mid-to-Std step</th><th class="r">High-to-Std step</th></tr></thead><tbody>
${tiers.map((r) => `<tr><td>${tonLink(r.t, `${r.t} ton`)}</td><td class="r num">${usd(r.std.mid)}<br><span class="small muted">${fmtRange(r.std)}</span></td><td class="r num">${usd(r.mid.mid)}<br><span class="small muted">${fmtRange(r.mid)}</span></td><td class="r num">${usd(r.high.mid)}<br><span class="small muted">${fmtRange(r.high)}</span></td><td class="r num">+${usd(r.mid.mid - r.std.mid)}</td><td class="r num">+${usd(r.high.mid - r.std.mid)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>What happens to listed equipment prices across tiers at 3 tons</h2>
<p>At 3 tons, stepping from the standard-tier REMDB benchmark midpoint (${usd(r3.std.mid)}) to the mid tier (${usd(r3.mid.mid)}) adds <b>${usd(r3.mid.mid - r3.std.mid)}</b>, and stepping from standard to high tier (${usd(r3.high.mid)}) adds <b>${usd(r3.high.mid - r3.std.mid)}</b>. In our live retailer seed (${asOf}):</p>
<ul>
<li><b>Standard tier 3-ton ducted heat pumps (${r3.eqStd.length} listed):</b> ${r3.eqStd.map((s) => `${sysLink(s)} (${s.specs.seer2} SEER2, ${usd(lowestPrice(s))})`).join(', ')}.</li>
<li><b>Mid tier 3-ton ducted heat pumps (${r3.eqMid.length} listed):</b> ${r3.eqMid.map((s) => `${sysLink(s)} (${s.specs.seer2} SEER2, ${usd(lowestPrice(s))})`).join(', ')}.</li>
<li><b>High tier 3-ton ducted heat pumps (${r3.eqHigh.length} listed):</b> lowest ${sysLink(cheapest(r3.eqHigh))} (${cheapest(r3.eqHigh).specs.seer2} SEER2, ${usd(lowestPrice(cheapest(r3.eqHigh)))}) up to ${usd(Math.max(...r3.eqHigh.map(lowestPrice)))}.</li>
</ul>
<p>Notice that value-brand inverter systems in the 16–18+ SEER2 range from ${brandLink('ACiQ')}, ${brandLink('MRCOOL')}, ${brandLink('Gree')}, and ${brandLink('Trane')} list at prices overlapping or even below lower-SEER2 systems from other brands. If a contractor charges two or three times the ${usd(r3.high.mid - r3.std.mid)} REMDB high-vs-standard gap to move from a 14.3 SEER2 quote to an 18 SEER2 quote, you are paying for tiered price-book margin, not factory hardware cost.</p>

<h2>The exact cooling and heating percentage savings math</h2>
<p>Because SEER2 is measured in BTU of cooling per watt-hour of electricity, the percentage reduction in cooling electricity from SEER2<sub>A</sub> to SEER2<sub>B</sub> is simply <code>1 − (SEER2<sub>A</sub> ÷ SEER2<sub>B</sub>)</code>:</p>
<ul>
<li><b>14.3 SEER2 → 16.0 SEER2:</b> uses <code>1 − (14.3 ÷ 16.0) = ${coolingPct16}%</code> less cooling electricity for the same cooling load.</li>
<li><b>14.3 SEER2 → 18.0 SEER2:</b> uses <code>1 − (14.3 ÷ 18.0) = ${coolingPct18}%</code> less cooling electricity for the same cooling load.</li>
<li><b>Heating (HSPF2):</b> The same formula applies to HSPF2 in heating mode (<code>1 − HSPF2<sub>low</sub> ÷ HSPF2<sub>high</sub></code>), plus high-tier cold-climate inverters avoid expensive electric heat-strip hours in winter. Check your state's exact $/MMBtu heating cost at our median ${EFFICIENCY.hspf2Median} HSPF2 vs ${EFFICIENCY.coldHspf2Median} HSPF2 cold-climate rating on our <a href="/states/">state pages</a>.</li>
</ul>

<h2>When stepping up to 16 or 18+ SEER2 actually pays back</h2>
<ol>
<li><b>When an ENERGY STAR or utility rebate bridges the upfront gap:</b> Many utility rebates (${src('esRebateFinder', 'ENERGY STAR Rebate Finder')}, ${src('dsire', 'DSIRE')}) require ≥ 15.2 SEER2 / ≥ 7.8 HSPF2 (${src('esCriteria', 'ENERGY STAR criteria')}) or Cold Climate certification (≥ 8.1 HSPF2). If a utility rebate covers a large chunk of the ${usd(r3.mid.mid - r3.std.mid)}–${usd(r3.high.mid - r3.std.mid)} benchmark step, the higher tier wins immediately.</li>
<li><b>In high-electricity-rate or long-season states:</b> Compare your state's EIA ¢/kWh rate on <a href="/states/">/states/</a>.</li>
<li><b>For comfort and humidity control:</b> See our <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage heat pump guide</a> and grade all three tiers of your contractor's quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3, tier: 'mid' }, 'TonnageCheck quote auditor')}.</li>
</ol>`;
    },
  },
  {
    slug: 'attic-vs-crawlspace-vs-closet-air-handler-installation-cost',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Attic vs Closet`;
    },
    h1: 'Attic vs crawlspace vs closet air handler installation: what legitimately adds labor',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `How attic, crawlspace, and closet air handler installs shift a 3-ton quote inside the ${fmtRange(f)} DOE benchmark (${usd(s.min)}–${usd(s.max)} equipment).`;
    },
    updated: today,
    related: { tons: [2.5, 3, 3.5, 4], brands: ['Goodman', 'Trane', 'Mitsubishi', 'Bosch'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const f25 = fairRange('central-heat-pump', 2.5);
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      const s3 = equipmentStats('central-heat-pump', 3);
      return `
<p>Two neighbors can buy the exact same 3-ton heat pump—whose hardware lists between ${usd(s3.min)} and ${usd(s3.max)} in our catalog (${asOf})—and receive legitimately different installation quotes because one air handler stands upright in an open walk-out basement while the other is suspended horizontally in a 120°F attic above a narrow pull-down ladder. That real physical difference is why the U.S. Department of Energy's ${src('remdb', 'REMDB')} benchmark publishes a 20th-to-80th-percentile range rather than a single flat number. Here is how to tell whether an attic, crawlspace, or utility-closet labor adder is justified or inflated.</p>

<h2>The 20th–80th percentile installed range by tonnage</h2>
<div class="tablewrap"><table><thead><tr><th>System size</th><th class="r">20th percentile (straightforward access)</th><th class="r">50th percentile (midpoint)</th><th class="r">80th percentile (complex access / high-cost market)</th><th class="r">Listed equipment (${asOf})</th></tr></thead><tbody>
<tr><td>${tonLink(2.5, '2.5 ton')}</td><td class="r num">${usd(f25.low)}</td><td class="r num">${usd(f25.mid)}</td><td class="r num">${usd(f25.high)}</td><td class="r num">${usd(equipmentStats('central-heat-pump', 2.5).min)}–${usd(equipmentStats('central-heat-pump', 2.5).max)}</td></tr>
<tr><td>${tonLink(3, '3 ton')}</td><td class="r num">${usd(f3.low)}</td><td class="r num">${usd(f3.mid)}</td><td class="r num">${usd(f3.high)}</td><td class="r num">${usd(s3.min)}–${usd(s3.max)}</td></tr>
<tr><td>${tonLink(4, '4 ton')}</td><td class="r num">${usd(f4.low)}</td><td class="r num">${usd(f4.mid)}</td><td class="r num">${usd(f4.high)}</td><td class="r num">${usd(equipmentStats('central-heat-pump', 4).min)}–${usd(equipmentStats('central-heat-pump', 4).max)}</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>What actually changes across the four indoor unit locations</h2>
<h3>1. Open basement or garage (vertical upflow / downflow)</h3>
<ul>
<li><b>Access & rigging:</b> Two installers can wheel the old furnace or air handler out on a hand truck and set the new vertical cabinet in place without disassembling framing.</li>
<li><b>Condensate & plenums:</b> Drain lines run straight to a floor drain or utility sink; sheet-metal supply and return plenums are reachable from all four sides. Quotes in this setting with no ductwork or electrical upgrades should sit near the lower half of the ${fmtRange(f3)} 3-ton benchmark.</li>
</ul>

<h3>2. Attic horizontal installation</h3>
<ul>
<li><b>Scuttle / pull-down stair clearance:</b> Many modern high-SEER2 air handlers—especially variable-speed cabinets from ${brandLink('Bosch')}, ${brandLink('Trane')}, ${brandLink('Goodman')}, and ${brandLink('Mitsubishi')}—have wider cabinets than 15-year-old R-22 or early R-410A units. If the cabinet exceeds the rough framing of a 22.5" × 54" attic pull-down stair, the crew may have to temporarily unbolt the stair frame, remove the blower/coil doors, or widen the scuttle opening.</li>
<li><b>Suspension, secondary drain pan, and float switches:</b> An attic air handler must sit over a full-length secondary emergency drain pan on vibration isolators or threaded trapeze rods, with primary and secondary overflow float switches wired to cut off the condenser. See our <a href="/guides/condensate-pump-float-switch-secondary-drain-pan-quote/">condensate pump, float switch, and secondary drain pan guide</a>.</li>
<li><b>Heat and duct sealing:</b> Working in an unconditioned attic takes more crew hours, and every supply and return boot connection in an unconditioned attic must be sealed with mastic and insulated so you do not lose capacity to the roof space.</li>
</ul>

<h3>3. Tight crawlspace (horizontal)</h3>
<ul>
<li><b>Moisture, clearance, and flood elevation:</b> Crawlspace units must be hung from floor joists or set on blocks above ground moisture, with insulated ductwork protected from vapor and critters.</li>
<li><b>Access hatch dimensions:</b> Measure your crawlspace foundation door before the estimator leaves. If the new horizontal air handler fits through the existing hatch and hangs from existing threaded rod hangers, "crawlspace excavation/modification" fees should not appear on the quote.</li>
</ul>

<h3>4. Interior hall or condo utility closet</h3>
<ul>
<li><b>Return-air path and door louvers:</b> Closet installations frequently suffer from high external static pressure because the return plenum under the platform is cramped. See <a href="/guides/asbestos-old-flex-duct-removal-and-return-air-drop-sizing/">return-air drop sizing</a>.</li>
<li><b>A2L refrigerant sensor rules in tight closets:</b> Newer R-454B and R-32 indoor coils (${src('epaTechTransitions', 'EPA Technology Transitions')}) include or require factory A2L leak-detection dissipation controls that turn on the indoor blower if refrigerant is detected in an enclosed closet.</li>
</ul>

<h2>How to verify an access or location surcharge</h2>
<p>Ask the contractor to write the exact cabinet dimensions (height × width × depth) of the quoted indoor air handler on the proposal and measure your attic hatch, closet doorway, or crawlspace opening together. Compare 3-ton equipment like ${sysLink(cheapest(s3.systems))} (${usd(s3.min)}) and enter your quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} to see where it lands inside ${rangeText(f3)}.</p>`;
    },
  },
  {
    slug: 'rooftop-package-unit-vs-split-system-hvac-replacement-cost',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Package Units`;
    },
    h1: 'Rooftop or ground package unit vs split system HVAC replacement cost',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `Rooftop and ground packaged HVAC quotes vs ${fmtRange(f)} 3-ton split benchmarks (${usd(s.min)}–${usd(s.max)} equipment): crane fees, roof curbs & ducts.`;
    },
    updated: today,
    related: { tons: [3, 4, 5], brands: ['Goodman', 'Trane', 'Carrier', 'Bosch'], systems: { type: 'central-heat-pump', tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      const f5 = fairRange('central-heat-pump', 5);
      const s3 = equipmentStats('central-heat-pump', 3);
      const s4 = equipmentStats('central-heat-pump', 4);
      const s5 = equipmentStats('central-heat-pump', 5);
      return `
<p>In the Southwest, parts of California, and many mobile, manufactured, or crawlspace homes across the South, the entire heating and cooling system—compressor, condenser coil, evaporator coil, and indoor blower (plus electric heat strips or a gas burner)—lives inside one outdoor cabinet called a <b>packaged unit</b> (or "package unit"), mounted either on a pitched/flat roof curb or on a ground pad outside the foundation wall. Because our live catalog tracks split systems, here is how packaged-unit installations differ from split systems in labor and hardware, and how to use our split-system benchmarks (${asOf}) to audit a package-unit replacement quote.</p>

<h2>Rule #1 transparency: how our split benchmarks bound a package-unit quote</h2>
<p>Under Rule #1, we state clearly what our datasets cover: the 65 systems in our current retailer seed and the DOE ${src('remdb', 'REMDB')} regressions used by our auditor are for <b>split systems</b> (separate outdoor condenser and indoor air handler/furnace). However, because a packaged unit eliminates the entire indoor cabinet swap and all field refrigerant brazing, split-system benchmarks provide a powerful upper-bound sanity check:</p>
<div class="tablewrap"><table><thead><tr><th>Tonnage</th><th class="r">Split heat pump listed equipment (${asOf})</th><th class="r">Split heat pump installed benchmark <span class="badge b-est">est.</span></th><th class="r">Split AC + furnace installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3 ton')}</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (med ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td><td class="r num">${fmtRange(fairRange('ac-furnace', 3))}</td></tr>
<tr><td>${tonLink(4, '4 ton')}</td><td class="r num">${usd(s4.min)}–${usd(s4.max)} (med ${usd(s4.median)})</td><td class="r num">${fmtRange(f4)} (mid ${usd(f4.mid)})</td><td class="r num">${fmtRange(fairRange('ac-furnace', 4))}</td></tr>
<tr><td>${tonLink(5, '5 ton')}</td><td class="r num">${usd(s5.min)}–${usd(s5.max)} (med ${usd(s5.median)})</td><td class="r num">${fmtRange(f5)} (mid ${usd(f5.mid)})</td><td class="r num">${fmtRange(fairRange('ac-furnace', 5))}</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Why a ground-set package unit takes LESS labor than a split system</h2>
<p>Unlike a split system from ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Carrier')}, or ${brandLink('Bosch')}—where technicians must work in two locations, braze copper line sets, pressure-test with nitrogen, pull a deep vacuum, and weigh in refrigerant—a packaged heat pump or gas/electric pack comes <b>factory-sealed and factory-charged</b>:</p>
<ul>
<li><b>No copper line set or indoor coil brazing:</b> The refrigerant loop never opens in the field.</li>
<li><b>Single outdoor location:</b> On a ground-pad package unit connected to crawlspace supply and return trunks via a sheet-metal concentric or side-by-side transition, the crew disconnects power, gas (if dual-fuel/gas pack), thermostat wire, and the two duct collars, slides the new cabinet into place, seals the duct transition, and commissions airflow.</li>
<li>If a contractor quotes a ground-set package replacement above the midpoint of our two-piece split-system benchmark (${usd(f3.mid)} at 3 tons, ${usd(f4.mid)} at 4 tons), ask why a single-cabinet swap with zero refrigerant piping is priced higher than a two-piece split installation.</li>
</ul>

<h2>What legitimately adds cost on a ROOFTOP package unit</h2>
<p>When the packaged unit sits on the roof (common in Arizona, Nevada, New Mexico, and flat-roof urban homes), three legitimate line items appear that do not exist on ground-set units:</p>
<ol>
<li><b>Crane or boom-truck lift and street permit:</b> Lifting a 300- to 500-pound old package unit off the roof and setting the new unit requires a crane operator (and sometimes municipal right-of-way cones or permits if parked on a busy street). Always require the crane fee to be itemized as its own line so you can see the actual lift charge.</li>
<li><b>Roof curb adapter or pitch pan / flashing:</b> If the new package unit's bottom supply/return footprint matches the existing roof curb or downshot concentric duct drop, it sets directly onto the curb with new gasket tape. If you switch brands or cabinet footprints, a sheet-metal curb adapter and watertight roof flashing are needed so the roof does not leak.</li>
<li><b>Exposed rooftop elbow / transition insulation:</b> On horizontal rooftop installations where sheet-metal elbows enter the roof jack, deteriorated exterior insulation or rusted elbows let attic heat pour directly into the supply air.</li>
</ol>

<h2>Why you should rarely convert between a package unit and a split system</h2>
<p>Converting a rooftop or ground-pad package system into an attic split system (or vice versa) requires re-routing main supply and return trunk plenums, running new copper refrigerant lines, and pulling new indoor power circuits. Unless you are already gut-renovating the roofline or ductwork, replacing like-for-like (package for package, or split for split) avoids thousands of dollars in structural and duct modifications. Verify your sizing and efficiency requirements using ${src('ahri', 'AHRI')} and ${src('esCriteria', 'ENERGY STAR criteria')}, see <a href="/guides/ductwork-replacement-cost-add-on/">ductwork add-ons</a>, compare 3-ton split systems starting at ${sysLink(cheapest(s3.systems))} (${usd(s3.min)}), and use the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} as a split-system benchmark reference.</p>`;
    },
  },
];
