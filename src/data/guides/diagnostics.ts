// Diagnostic & repair-vs-replace scare-tactic guides (#7–#10 from Issue #4).
// Every dollar figure is computed from src/lib/facts.ts or src/data/equipment.ts; non-price claims cite src/data/sources.ts.
import { lowestPrice, median, TONNAGES } from '../equipment';
import { fairRange, systemsWhere, equipmentStats, refrigerantOf, usd, fmtRange } from '../../lib/facts';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

export const DIAGNOSTIC_GUIDES: Guide[] = [
  {
    slug: 'cracked-heat-exchanger-scare-tactic-how-to-verify',
    get title() {
      const s = equipmentStats('ac-furnace', 3);
      const f = fairRange('ac-furnace', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Heat Exchanger`;
    },
    h1: 'The "cracked heat exchanger" scare tactic: how to verify before paying for a full replacement',
    get description() {
      const s = equipmentStats('ac-furnace', 3);
      const f = fairRange('ac-furnace', 3);
      return `Verify a cracked heat exchanger claim before paying ${fmtRange(f)} installed (${usd(s.min)}+ 3-ton AC + furnace equipment): CO ppm, camera tests & OEM warranties.`;
    },
    updated: today,
    related: { tons: [3, 4, 5], brands: ['Goodman', 'Trane'], systems: { type: 'ac-furnace', tons: [3, 4] } },
    audit: { systemType: 'ac-furnace', tons: 3 },
    body: () => {
      const af3 = fairRange('ac-furnace', 3);
      const af4 = fairRange('ac-furnace', 4);
      const hp3 = fairRange('central-heat-pump', 3);
      const afSys = systemsWhere({ type: 'ac-furnace' });
      return `
<p>A genuinely cracked gas furnace heat exchanger can leak combustion gases—including carbon monoxide (CO)—into the household supply air, which is why the U.S. Consumer Product Safety Commission urges annual inspection of fuel-burning heating appliances and working CO alarms on every level of the home (${src('cpscCo', 'CPSC: Carbon Monoxide Information Center')}). Because homeowners rightly take carbon monoxide seriously, a "red-tagged cracked heat exchanger" during a cheap seasonal tune-up is also the oldest high-pressure sales script in residential HVAC. Before you sign an emergency replacement contract on the spot, here is how to verify whether the crack is real, check whether the part is still under a 20-year or lifetime OEM warranty, and benchmark the replacement quote (${asOf}).</p>

<h2>What a full replacement actually benchmarks at (${asOf})</h2>
<p>When a tech shuts off your gas valve and hands over an emergency replacement quote, the number is often far above the DOE national-lab benchmark because you have no time to shop. Here are the real numbers in our catalog:</p>
<div class="tablewrap"><table><thead><tr><th>System type & size</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton central AC + gas furnace')}</td><td class="r num">${usd(equipmentStats('ac-furnace', 3).min)}–${usd(equipmentStats('ac-furnace', 3).max)}</td><td class="r num">${fmtRange(af3)} (mid ${usd(af3.mid)})</td></tr>
<tr><td>${tonLink(4, '4-ton central AC + gas furnace')}</td><td class="r num">${usd(equipmentStats('ac-furnace', 4).min)}–${usd(equipmentStats('ac-furnace', 4).max)}</td><td class="r num">${fmtRange(af4)} (mid ${usd(af4.mid)})</td></tr>
<tr><td>${tonLink(3, '3-ton central heat pump')} (all-electric alternative)</td><td class="r num">${usd(equipmentStats('central-heat-pump', 3).min)}–${usd(equipmentStats('central-heat-pump', 3).max)}</td><td class="r num">${fmtRange(hp3)} (mid ${usd(hp3.mid)})</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
${afSys.length ? `<h3>Listed AC + gas furnace packages in our seed</h3>${systemsTable(afSys.slice(0, 5), { showType: true })}` : ''}

<h2>Four objective tests that prove a heat exchanger is actually cracked</h2>
<p>A legitimate technician who finds a compromised heat exchanger will gladly show you physical and instrument evidence on your own furnace—not a stock photo on an iPad:</p>
<ol>
<li><b>Live borescope / inspection camera video with your serial number in frame:</b> Ask the tech to start recording on the inspection camera outside the furnace cabinet showing your furnace's rating plate (model and serial number), then feed the scope into the heat exchanger cell in one continuous uncut shot so you can see the open split, hole, or separated crimp ring yourself. Surface rust scales on aluminized steel are not a through-wall crack.</li>
<li><b>Combustion analyzer CO reading in the supply plenum AND flue:</b> A calibrated digital combustion analyzer measures carbon monoxide in parts per million (ppm) in the undiluted flue gas and in the supply air stream after the blower turns on. Ask for the printed or photographed analyzer strip showing ambient CO vs supply-plenum CO and stack CO/O2 readings.</li>
<li><b>Flame rollout or blower-transition disturbance:</b> When the indoor blower starts, positive static pressure pushing through an open breach into the heat exchanger cell will visibly push, flicker, or roll the burner flames out of the burner assembly, or trip the manual-reset flame rollout safety switch.</li>
<li><b>Chemical smoke or mirror test at the breach:</b> On an accessible cell or clamshell seam, technicians can demonstrate air movement across the crack when the blower engages.</li>
</ol>

<h2>Check the manufacturer's 20-year or lifetime heat exchanger warranty first</h2>
<p>Even when a heat exchanger is genuinely cracked, most major furnace brands—including ${brandLink('Goodman')}, ${brandLink('Trane')}, and ${brandLink('Carrier')}—carry a 20-year or limited lifetime parts warranty on the heat exchanger alone, separate from the 5- or 10-year general parts warranty (${src('ftcWarranty', 'FTC Warranty Law guide')}). If your furnace is 8 to 15 years old, the heat exchanger assembly itself may be covered for $0 in OEM part cost, leaving you to decide between paying an independent shop for the labor swap versus putting that money toward a new system.</p>

<h2>What to do if a tech "red-tags" your furnace during a tune-up</h2>
<ul>
<li><b>Never sign a replacement contract the same hour:</b> Even in winter, portable UL-listed space heaters can keep pipes from freezing for 24–48 hours while you call an independent, non-commission HVAC mechanic for a second diagnostic inspection. And if you do sign an in-home contract under pressure, remember the FTC Cooling-Off Rule gives you 3 business days to cancel most in-home sales (${src('ftcCoolingOff', '16 CFR Part 429')}).</li>
<li><b>Compare repair, AC + furnace, and heat pump options:</b> Read our <a href="/guides/heat-pump-vs-ac-and-furnace-replacement-cost/">heat pump vs AC + gas furnace replacement cost guide</a> and grade any replacement quote in the ${auditLink({ systemType: 'ac-furnace', tons: 3 }, 'TonnageCheck quote auditor')}.</li>
</ul>`;
    },
  },
  {
    slug: 'capacitor-contactor-blower-motor-failure-vs-full-hvac-replacement',
    get title() {
      const c3 = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 3 }));
      const f3 = fairRange('central-heat-pump', 3);
      return `${usd(lowestPrice(c3))} Condenser vs ${fmtRange(f3)} Installed: Capacitors`;
    },
    h1: 'Capacitor, contactor or blower motor failure vs a full HVAC replacement push',
    get description() {
      const c3 = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 3 }));
      const f3 = fairRange('central-heat-pump', 3);
      return `When a capacitor, contactor, or ECM blower fails, turnover techs push ${fmtRange(f3)} replacements. Compare against ${usd(lowestPrice(c3))} condenser & system costs.`;
    },
    updated: today,
    related: { tons: [3, 4, 5], brands: ['Goodman', 'Trane', 'LG'], systems: { type: 'heat-pump-only', tons: [3, 4, 5] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const c3 = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 3 }));
      const c4 = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 4 }));
      const f3 = fairRange('central-heat-pump', 3);
      const fc3 = fairRange('heat-pump-only', 3);
      const s3 = equipmentStats('central-heat-pump', 3);
      return `
<p>On the first hot week of summer, the most common reason an outdoor air conditioner or heat pump hums without starting—or blows warm air indoors—is not a dead compressor. It is a failed dual-run capacitor, a pitted 24-volt contactor, or a failed indoor blower motor module. At private-equity roll-up shops that pay technicians commission on "turnovers" (turning a service call into a replacement lead for a comfort advisor), those routine wear-part failures are routinely used to pitch a full ${rangeText(f3)} system replacement. Here is how to tell a wear-part failure from a catastrophic failure, and what the actual replacement hardware lists for (${asOf}).</p>

<h2>Rule #1 and the scale of equipment vs full-system quotes</h2>
<p>Under Rule #1, we do not publish made-up flat-rate repair averages for capacitors, contactors, or motors because neither DOE's ${src('remdb', 'REMDB')} nor our matched-system seed tracks individual service parts. What we do track is the exact listed price of complete outdoor condensers and full matched systems, which puts any inflated repair quote into immediate perspective:</p>
<div class="tablewrap"><table><thead><tr><th>Option (3-ton & 4-ton examples)</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
${c3 ? `<tr><td>3-ton outdoor heat pump condenser only: ${sysLink(c3)} (${brandLink(c3.brand)})</td><td class="r num">${usd(lowestPrice(c3))}</td><td class="r num">${fmtRange(fc3)} (mid ${usd(fc3.mid)})</td></tr>` : ''}
${c4 ? `<tr><td>4-ton outdoor heat pump condenser only: ${sysLink(c4)} (${brandLink(c4.brand)})</td><td class="r num">${usd(lowestPrice(c4))}</td><td class="r num">${fmtRange(fairRange('heat-pump-only', 4))}</td></tr>` : ''}
<tr><td>${tonLink(3, '3-ton full matched heat pump system')} (${s3.count} systems)</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
<p>When a brand-new 3-ton ${brandLink('Goodman')} outdoor heat pump condenser lists for ${c3 ? usd(lowestPrice(c3)) : usd(s3.min)} in our catalog, a flat-rate service quote that demands thousands of dollars to replace a single electrical component—conveniently accompanied by an offer to "apply today's repair cost toward a brand-new system"—is designed to steer you out of a repair and into a replacement sale. See our <a href="/guides/flat-rate-price-books-and-pe-hvac-rollups/">flat-rate price books and PE HVAC roll-ups guide</a>.</p>

<h2>How to verify which electrical component failed</h2>
<ul>
<li><b>Dual-run capacitor ("weak" or swollen capacitor):</b> The run capacitor stores a phase-shifted electrical charge to start and run the compressor and outdoor fan motor. It is rated in microfarads (µF, such as 45/5 µF ±5% or ±6%). Ask the technician to show you the live microfarad reading on a digital capacitance meter with the wires disconnected—or show you a physically domed/leaking top. A capacitor does not touch the sealed refrigerant circuit; replacing it does not require EPA Section 608 refrigerant recovery (${src('epaSection608', 'EPA Section 608')}).</li>
<li><b>24V contactor:</b> The contactor is an electromechanical relay in the outdoor unit pulled closed by 24 volts from the thermostat. Ants, spiders, or carbon pitting on the silver contacts can prevent 240V power from reaching the compressor, or weld the points shut so the outdoor fan never turns off. Like a capacitor, it is an external electrical switch on the control panel.</li>
<li><b>PSC vs ECM indoor blower motor:</b> Older furnaces and air handlers use a single-capacitor PSC motor; newer high-efficiency units use an electronically commutated motor (ECM) with an attached electronic control module. Before paying for an entire ECM motor + module replacement, ask the tech to verify with a multimeter or ECM tester whether the 24V/120V/240V speed-tap signal from the control board is present, whether the failure is only the removable end-bell module, and whether high static pressure from undersized return ductwork caused the module to overheat.</li>
</ul>

<h2>Check the OEM parts warranty before approving any motor or compressor repair</h2>
<p>Registered residential HVAC equipment from ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('LG')}, ${brandLink('Bosch')}, and ${brandLink('Carrier')} typically carries a 10-year manufacturer parts warranty to the original registered homeowner (${src('ftcWarranty', 'FTC Warranty Law')}). Even unregistered units usually carry a 5-year base warranty from manufacture or installation date. Have the technician look up your indoor or outdoor serial number on the distributor warranty portal before quoting retail part prices.</p>

<h2>When replacing makes more sense than repairing</h2>
<ol>
<li>The sealed refrigerant system itself has failed (a grounded compressor winding or a corroded coil) out of warranty, and the indoor coil is also past a decade old. Compare <a href="/guides/heat-pump-condenser-only-vs-full-system-replacement/">condenser-only vs full system replacement</a>.</li>
<li>If you decide to get replacement bids, run them through the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} and compare with an <a href="/guides/independent-hvac-tech-vs-big-company/">independent HVAC tech</a>.</li>
</ol>`;
    },
  },
  {
    slug: 'txv-thermal-expansion-valve-vs-piston-replacement-quote',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: TXV vs Piston`;
    },
    h1: 'TXV (thermal expansion valve) vs piston metering device replacement quotes',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `Diagnose a stuck TXV vs low refrigerant, check AHRI TXV rules, and compare repair quotes to ${usd(s.min)}–${usd(s.max)} 3-ton equipment (${fmtRange(f)} installed).`;
    },
    updated: today,
    related: { tons: [2.5, 3, 4], brands: ['Goodman', 'Trane', 'Bosch', 'Mitsubishi'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      const f3h = fairRange('central-heat-pump', 3, 'high');
      const gSys = systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Goodman' });
      const bSys = systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Bosch' });
      return `
<p>Every split air conditioner and heat pump needs a metering device at the indoor coil to drop high-pressure liquid refrigerant down to a cold, low-pressure spray that absorbs heat from your house. Depending on the system tier, that metering device is a fixed-orifice piston, a mechanical thermal expansion valve (TXV), or a stepper-motor electronic expansion valve (EEV). "Your TXV is stuck—you should just replace the whole system" is a frequent diagnostic claim on mid-life systems, while "TXV upgrade kit" often appears as a mysterious surcharge on new replacement quotes. Here is how to audit both scenarios against our live equipment data (${asOf}).</p>

<h2>Cost context: matched indoor/outdoor systems in our catalog</h2>
<p>Because opening the sealed refrigerant loop to braze in a replacement TXV requires EPA Section 608 refrigerant recovery, nitrogen purge, filter-drier replacement, and deep evacuation (${src('epaSection608', 'EPA Section 608')}), labor makes up most of a standalone TXV repair bill. Under Rule #1 we do not invent standalone part repair averages, so compare any repair or upgrade quote directly against complete matched systems:</p>
<div class="tablewrap"><table><thead><tr><th>3-ton benchmark / matched system</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton central heat pump (standard tier)')}</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td></tr>
<tr><td>${tonLink(3, '3-ton central heat pump (high tier)')}</td><td class="r num">${usd(s3.min)}–${usd(s3.max)}</td><td class="r num">${fmtRange(f3h)} (mid ${usd(f3h.mid)})</td></tr>
${gSys.map((s) => `<tr><td>${sysLink(s)} (${brandLink(s.brand)}, ${s.specs.seer2} SEER2)</td><td class="r num">${usd(lowestPrice(s))}</td><td class="r num">${fmtRange(fairRange(s.systemType, s.tons, s.tier))}</td></tr>`).join('\n')}
${bSys.slice(0, 1).map((s) => `<tr><td>${sysLink(s)} (${brandLink(s.brand)}, ${s.specs.seer2} SEER2)</td><td class="r num">${usd(lowestPrice(s))}</td><td class="r num">${fmtRange(fairRange(s.systemType, s.tons, s.tier))}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Piston vs TXV vs EEV: what each metering device does</h2>
<ul>
<li><b>Fixed-orifice piston (flowrater):</b> A precision-drilled brass orifice with no moving parts. It cannot fail mechanically, which makes it rugged, but because the hole size is fixed, it only meters optimally at one narrow indoor/outdoor temperature condition.</li>
<li><b>Thermal Expansion Valve (TXV):</b> Uses a temperature-sensing bulb strapped to the suction line (plus an equalizer tube) to modulate a spring-loaded pin, maintaining constant superheat across changing outdoor temperatures. Almost all systems rated for ${src('esCriteria', 'ENERGY STAR')} (≥ 15.2 SEER2, ≥ 7.8 HSPF2) require a TXV or EEV on the AHRI-certified indoor coil (${src('ahri', 'AHRI Directory')}) to achieve their published SEER2 and EER2 ratings.</li>
<li><b>Electronic Expansion Valve (EEV):</b> Controlled by a digital circuit board and thermistors, standard on ductless mini-splits and many high-tier variable-speed inverter air handlers from ${brandLink('Mitsubishi')}, ${brandLink('Daikin')}, and ${brandLink('LG')}.</li>
</ul>

<h2>How to verify a "bad TXV" diagnosis before paying for a replacement</h2>
<p>In the field, a dirty indoor coil, a kinked line set, a clogged liquid-line filter-drier, or a poorly insulated sensing bulb often gets misdiagnosed as a bad TXV. Before accepting a TXV replacement or a new-system pitch, ask the technician for four numbers:</p>
<ol>
<li><b>Subcooling AND superheat together:</b> A starved evaporator coil caused by a genuinely restricted TXV shows <i>low</i> suction pressure and <i>high</i> superheat alongside normal-to-high liquid subcooling. If both subcooling and suction pressure are low, the system is simply low on refrigerant (a leak), not suffering from a stuck TXV.</li>
<li><b>Temperature drop across the liquid-line filter-drier:</b> If the copper line is noticeably cooler on the outlet side of the filter-drier than the inlet (more than a 2°F–3°F drop), the filter-drier is restricted, starving the TXV.</li>
<li><b>Sensing bulb contact and insulation:</b> If the TXV sensing bulb came loose from the suction line or lost its insulation tape in a hot attic, the valve opens too wide and floods the coil. Re-strapping and insulating the bulb fixes it without opening the refrigerant lines.</li>
<li><b>Factory warranty status:</b> On a system under 10 years old, the TXV is a covered internal component under most OEM parts warranties.</li>
</ol>

<h2>Why "TXV upgrade" should not be a surprise adder on a new system quote</h2>
<p>Look at the component model numbers on our system pages (such as ${gSys[0] ? sysLink(gSys[0]) : tonLink(3)}): factory-matched air handlers and cased coils denoted with a TXV suffix already include the factory-installed expansion valve inside the listed equipment price (${usd(s3.min)}–${usd(s3.max)} at 3 tons). If a contractor adds a separate TXV charge on a new matched system quote, check the indoor model number on the ${src('ahri', 'AHRI certificate')}—the valve is almost always factory-installed in the coil cabinet. Grade your quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')}.</p>`;
    },
  },
  {
    slug: 'evaporator-coil-leak-replacement-cost-vs-full-system-swap',
    get title() {
      const c3 = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 3 }));
      const f3 = fairRange('central-heat-pump', 3);
      return `${usd(lowestPrice(c3))} Condenser vs ${fmtRange(f3)} System: Coil Leak Audit`;
    },
    h1: 'Evaporator coil leak replacement cost vs full condenser + coil swap',
    get description() {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      return `Leaking evaporator coil? Compare warranty coil swaps vs ${usd(s3.min)}–${usd(s3.max)} 3-ton equipment (${fmtRange(f3)} installed) and EPA R-410A vs R-454B/R-32 rules.`;
    },
    updated: today,
    related: { tons: [2.5, 3, 3.5, 4], brands: ['Goodman', 'Trane', 'Carrier', 'Bosch'], systems: { type: 'central-heat-pump', tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const s4 = equipmentStats('central-heat-pump', 4);
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      const c3 = cheapest(systemsWhere({ type: 'heat-pump-only', tons: 3 }));
      const fc3 = fairRange('heat-pump-only', 3);
      return `
<p>Formicary corrosion—microscopic pinhole leaks in copper or aluminum indoor evaporator coils triggered by organic acids in household air—is the single most common sealed-system failure in residential air conditioners and heat pumps between years 4 and 12. When your system loses cooling capacity and freezes into a block of ice, the technician often hands you a painful choice: pay a steep out-of-pocket bill to braze in a replacement evaporator coil and recharge refrigerant, or pay ${rangeText(f3)} for an entirely new system. Here is how to audit that decision using live equipment numbers (${asOf}) and EPA refrigerant rules.</p>

<h2>Equipment and installed benchmarks for comparison (${asOf})</h2>
<p>Rule #1 on TonnageCheck is that we never fabricate standalone coil-part or per-pound refrigerant prices not in a primary public dataset. Instead, we show the exact listed prices of outdoor condensers and complete matched systems (which include both the outdoor unit AND the indoor coil/air handler) so you can see when an indoor-coil repair quote is priced too close to a brand-new system:</p>
<div class="tablewrap"><table><thead><tr><th>System scope</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton full matched heat pump')} (outdoor + indoor air handler/coil)</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td></tr>
<tr><td>${tonLink(4, '4-ton full matched heat pump')} (outdoor + indoor air handler/coil)</td><td class="r num">${usd(s4.min)}–${usd(s4.max)} (median ${usd(s4.median)})</td><td class="r num">${fmtRange(f4)} (mid ${usd(f4.mid)})</td></tr>
${c3 ? `<tr><td>3-ton outdoor heat pump condenser alone (${sysLink(c3)})</td><td class="r num">${usd(lowestPrice(c3))}</td><td class="r num">${fmtRange(fc3)} (mid ${usd(fc3.mid)})</td></tr>` : ''}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
<p>Look at the difference between a 3-ton outdoor condenser alone (${c3 ? usd(lowestPrice(c3)) : 'above'}) and the lowest complete 3-ton matched heat pump system (${usd(s3.min)}): in wholesale/retail catalogs, the indoor air handler or cased evaporator coil represents only a fraction of the total system hardware cost. The reason a standalone evaporator coil replacement quote looks so expensive is that the labor steps—pumping down or recovering refrigerant under ${src('epaSection608', 'EPA Section 608')}, unbrazing the coil, installing a new liquid-line filter-drier, pressure-testing with dry nitrogen, pulling a sub-500-micron vacuum, and weighing in refrigerant—are almost identical to half of a full system installation.</p>

<h2>Step 1: Verify the leak was actually located on the indoor coil</h2>
<p>"Topping off" refrigerant without finding the leak is a trap, but so is condemning an indoor coil based only on low suction pressure. Before approving either a coil replacement or a full system swap, ask the technician how the leak was pinpointed:</p>
<ul>
<li><b>Electronic heated-diode or infrared refrigerant leak detector</b> swept across the indoor coil U-bends, header joints, TXV distributor tubes, and flare/braze fittings.</li>
<li><b>Ultrasonic leak detection or soap bubbles / nitrogen trace pressure test</b> confirming whether the leak is in the indoor evaporator coil versus a replaceable Schrader valve core, a flare nut, or an accessible braze joint at the outdoor service valves.</li>
</ul>

<h2>Step 2: Check OEM warranty status and the EPA refrigerant rule</h2>
<ul>
<li><b>Under 10 years old (in warranty):</b> If your coil is covered under the manufacturer's 10-year parts warranty (${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Carrier')}, ${brandLink('Bosch')}, ${brandLink('LG')}), the OEM supplies the replacement coil at $0 part cost (${src('ftcWarranty', 'FTC Warranty Law')}). You pay only for labor, nitrogen, filter-drier, and any virgin refrigerant needed. Ask a second independent shop to quote the warranty labor if the first company's flat-rate warranty labor fee looks padded.</li>
<li><b>What the EPA R-410A rule actually says about coil repairs:</b> Some sales reps claim that under the 2025/2026 EPA refrigerant rules, you are "not allowed to replace an R-410A evaporator coil." That is false. The EPA's Technology Transitions rule (${src('epaTechTransitions', 'EPA: HFC restrictions by sector')}) applies to newly manufactured complete systems, not to servicing or replacing a component (like an indoor coil) on an existing R-410A system. Furthermore, EPA's May 2026 reconsideration rule removed the installation deadline for systems whose specified components were manufactured or imported before January 1, 2025. See our <a href="/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/">refrigerant transition guide</a>.</li>
</ul>

<h2>When to swap the whole system instead of just the coil</h2>
<p>If the system is out of warranty (over 10 years old) and the out-of-pocket coil + refrigerant repair approaches a large share of our ${usd(s3.min)}–${usd(s3.max)} complete equipment cost, putting an expensive new coil onto an aging 12-year-old outdoor compressor is rarely a good bet—and an out-of-warranty single-component swap will not reset your system warranty or qualify for utility rebates (${src('ahri', 'AHRI')}). Compare full-system replacement options in our <a href="/guides/heat-pump-condenser-only-vs-full-system-replacement/">condenser-only vs full system guide</a> and run any replacement quote through the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')}.</p>`;
    },
  },
];
