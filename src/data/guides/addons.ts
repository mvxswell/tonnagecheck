// Line-item add-on audit guides (#1–#6 from Issue #4).
// Every dollar figure is computed from src/lib/facts.ts or src/data/equipment.ts; non-price claims cite src/data/sources.ts.
import { lowestPrice, median, TONNAGES } from '../equipment';
import { fairRange, systemsWhere, adderRange, newCircuitAdder, lineSet, equipmentStats, refrigerantOf, usd, fmtRange, pct } from '../../lib/facts';
const ls = lineSet!;
import { STATES, heatingCosts, EFFICIENCY } from '../states';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

export const ADDON_GUIDES: Guide[] = [
  {
    slug: 'uv-light-air-scrubber-ionization-hvac-add-on-cost',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: UV & IAQ Cost`;
    },
    h1: 'UV lights, air scrubbers & whole-home ionization add-ons on an HVAC quote',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `How to audit UV light, air scrubber, and bipolar ionization add-ons against ${usd(s.min)}–${usd(s.max)} 3-ton equipment and ${fmtRange(f)} installed benchmarks.`;
    },
    updated: today,
    related: { tons: [2, 3, 4], brands: ['Goodman', 'Trane', 'Bosch'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      const f3h = fairRange('central-heat-pump', 3, 'high');
      const g3 = cheapest(systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Goodman' }));
      const t3 = cheapest(systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Trane' }));
      const b3 = cheapest(systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Bosch' }));
      return `
<p>When a residential HVAC replacement quote arrives in "Good / Better / Best" tiers, the "Best" column almost always bundles indoor air quality (IAQ) accessories: a germicidal UV-C lamp in the supply plenum, a photocatalytic oxidation ("air scrubber") module, or a needlepoint bipolar ionizer. Because these accessories are rarely itemized with model numbers, they are one of the easiest ways for a flat-rate price book to add margin to a replacement quote. Here is what federal indoor-air guidance actually says about these devices, how they compare to core equipment costs (${asOf}), and how to separate them before grading your quote.</p>

<h2>Why we do not publish a standalone UV or ionizer price</h2>
<p>Rule #1 on TonnageCheck is zero fabricated or unverified numbers. Neither the DOE National Laboratory of the Rockies database (${src('remdb', 'REMDB')}) nor the public matched-system catalogs we seed from carry a standardized residential cost regression for plenum UV bulbs or electronic air scrubbers, because hardware ranges from a basic 24-volt transformer lamp to proprietary duct modules. Instead of guessing at part prices, you can audit any IAQ package by forcing the contractor to unbundle it from the base heat pump installation and comparing it directly against the cost of actual heating and cooling hardware.</p>

<h2>Scale check: IAQ add-ons vs real 3-ton heat pump hardware</h2>
<p>Before paying for a bundled "healthy home package," compare the size of that add-on against the complete outdoor condenser and indoor air handler that actually heat and cool the house:</p>
<div class="tablewrap"><table><thead><tr><th>Benchmark / System</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton central heat pump')} (all ${s3.count} seeded systems)</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td></tr>
<tr><td>${tonLink(3, '3-ton high-efficiency tier')}</td><td class="r num">${usd(s3.min)}–${usd(s3.max)}</td><td class="r num">${fmtRange(f3h)} (mid ${usd(f3h.mid)})</td></tr>
${g3 ? `<tr><td>${sysLink(g3)} (${brandLink('Goodman')})</td><td class="r num">${usd(lowestPrice(g3))}</td><td class="r num">${fmtRange(fairRange(g3.systemType, g3.tons, g3.tier))}</td></tr>` : ''}
${t3 ? `<tr><td>${sysLink(t3)} (${brandLink('Trane')})</td><td class="r num">${usd(lowestPrice(t3))}</td><td class="r num">${fmtRange(fairRange(t3.systemType, t3.tons, t3.tier))}</td></tr>` : ''}
${b3 ? `<tr><td>${sysLink(b3)} (${brandLink('Bosch')})</td><td class="r num">${usd(lowestPrice(b3))}</td><td class="r num">${fmtRange(fairRange(b3.systemType, b3.tons, b3.tier))}</td></tr>` : ''}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
<p>When a complete 3-ton heat pump condenser and matched air handler list for a median of ${usd(s3.median)} across our catalog—starting at ${usd(s3.min)}—any IAQ accessory package that approaches a meaningful fraction of the core equipment price deserves strict scrutiny.</p>

<h2>What the EPA says about UV lamps, photocatalytic scrubbers, and ionizers</h2>
<p>Sales brochures often promise that plenum add-ons eliminate viruses, mold spores, odors, and volatile organic compounds (VOCs) across the entire house. The U.S. Environmental Protection Agency's indoor air quality guidance is far more cautious:</p>
<ul>
<li><b>Source control, ventilation, and mechanical filtration come first:</b> In its residential guide (${src('epaAirCleaners', 'EPA: Guide to Air Cleaners in the Home')}), the EPA states that removing pollution sources, ventilating with outdoor air, and capturing particles with a properly fitted pleated media filter (such as a deep-pleat MERV 11–13 cabinet that does not choke static pressure) are the primary proven ways to clean indoor air.</li>
<li><b>Coil irradiation vs moving-air disinfection:</b> A UV-C lamp aimed directly at a wet indoor evaporator coil and drain pan has continuous exposure time to inhibit biofilm growth on the metal fins. Disinfecting air moving through a supply duct at hundreds of feet per minute is much harder because the exposure time in the light zone is a fraction of a second (${src('epaAirCleaners', 'EPA')}).</li>
<li><b>Ionizers, PCO scrubbers, and ozone byproducts:</b> The EPA specifically warns homeowners about electronic air cleaners, photocatalytic oxidation (PCO) units, and ionizers (${src('epaIonizers', 'EPA: What are ionizers and other ozone-generating air cleaners?')}). Depending on their design, ionizers and PCO devices can generate ozone—a documented lung irritant—or react with existing household VOCs to form new chemical byproducts such as formaldehyde and ultrafine particles.</li>
</ul>

<h2>Hidden ongoing costs and warranty traps</h2>
<ul>
<li><b>Annual bulb and cell replacement:</b> UV-C lamps lose germicidal output long before the visible blue glow burns out. Most manufacturers specify replacing the UV lamp every 12 months and catalyst cells every 1 to 2 years. Ask for the exact replacement part number and retail bulb cost before agreeing to the install.</li>
<li><b>Plastic and wire insulation degradation:</b> High-intensity UV-C light degrades non-UV-stabilized plastic drain pans, flex-duct inner liners, and control-wire insulation if mounted without shielding.</li>
<li><b>Bundled tier pricing:</b> Contractors frequently bundle a UV light and an ionizer into a "Platinum" heat pump quote so you cannot tell how much of the step-up over the base quote is the inverter compressor and how much is the IAQ hardware. Compare the pure equipment upgrade cost in our <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage heat pump guide</a>.</li>
</ul>

<h2>How to audit IAQ line items on your quote</h2>
<ol>
<li><b>Ask for line-item removal:</b> Tell the contractor you want the UV light, air scrubber, or ionizer moved to an optional add-on line with its exact manufacturer, model number, and UL 2998 (zero-ozone emission) listing.</li>
<li><b>Prioritize a deep-pleat media filter cabinet:</b> A 4- or 5-inch media filter cabinet installed in the sheet-metal return drop captures particles across the entire airstream without generating ozone, and reduces pressure drop compared with a restrictive 1-inch filter. See <a href="/guides/ductwork-replacement-cost-add-on/">ductwork replacement add-ons</a>.</li>
<li><b>Grade the base system in the auditor:</b> Subtract optional IAQ add-ons and run the core quote through the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} against the ${rangeText(f3)} 3-ton benchmark.</li>
</ol>`;
    },
  },
  {
    slug: 'smart-thermostat-markup-communicating-vs-24v-hvac-quotes',
    get title() {
      const t = adderRange('smartThermostat');
      const f = fairRange('central-heat-pump', 3);
      return `${fmtRange(t)} Stat vs ${fmtRange(f)} Installed: Thermostats`;
    },
    h1: 'Smart thermostat markup on HVAC quotes: 24V vs proprietary communicating controls',
    get description() {
      const t = adderRange('smartThermostat');
      const f = fairRange('central-heat-pump', 3);
      return `DOE REMDB benchmarks an installed smart thermostat at ${fmtRange(t)} (mid ${usd(t.mid)}). How to spot thermostat markups on ${fmtRange(f)} 3-ton heat pump quotes.`;
    },
    updated: today,
    related: { tons: [2, 3, 4], brands: ['Bosch', 'Goodman', 'Trane', 'Mitsubishi'], systems: { type: 'central-heat-pump', staging: 'inverter' } },
    audit: { systemType: 'central-heat-pump', tons: 3, tier: 'mid' },
    body: () => {
      const stat = adderRange('smartThermostat');
      const f3 = fairRange('central-heat-pump', 3);
      const f3m = fairRange('central-heat-pump', 3, 'mid');
      const inv3 = systemsWhere({ type: 'central-heat-pump', tons: 3, staging: 'inverter' });
      const bosch3 = cheapest(systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Bosch' }));
      const goodman3 = cheapest(systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Goodman', staging: 'inverter' }));
      return `
<p>Thermostats show up on HVAC replacement quotes in two ways: either as an overpriced line-item add-on for a standard 24-volt Wi-Fi thermostat, or as a mandatory proprietary "communicating control" required to unlock variable-speed staging. Fortunately, the U.S. Department of Energy's National Laboratory of the Rockies publishes a specific installed-cost regression for residential smart thermostats (${src('remdb', 'REMDB')}), giving you an objective benchmark (${asOf}).</p>

<h2>The DOE national-lab benchmark for a smart thermostat</h2>
<div class="tablewrap"><table><thead><tr><th>Item</th><th class="r">20th–80th percentile <span class="badge b-est">est.</span></th><th class="r">Benchmark midpoint</th><th>Source</th></tr></thead><tbody>
<tr><td>Smart thermostat, installed</td><td class="r num">${fmtRange(stat)}</td><td class="r num">${usd(stat.mid)}</td><td>${src('remdb', 'REMDB')} "Smart Thermostat" regression (CPI-adjusted)</td></tr>
<tr><td>${tonLink(3, '3-ton heat pump, standard tier')}</td><td class="r num">${fmtRange(f3)}</td><td class="r num">${usd(f3.mid)}</td><td>${src('remdb', 'REMDB')} ducted heat pump replacement</td></tr>
<tr><td>${tonLink(3, '3-ton heat pump, mid tier')}</td><td class="r num">${fmtRange(f3m)}</td><td class="r num">${usd(f3m.mid)}</td><td>${src('remdb', 'REMDB')} ducted heat pump replacement</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
<p>When a standalone smart thermostat installation—including both the thermostat hardware and the service trip to wire and configure it—benchmarks at ${fmtRange(stat)} with a midpoint of ${usd(stat.mid)}, paying several times that amount during a full system replacement (when the technician is already wiring the air handler) is pure price-book markup.</p>

<h2>Standard 24-volt thermostats vs proprietary communicating controls</h2>
<p>Not every inverter heat pump uses the same control architecture, and understanding the difference can save you both upfront cost and future lock-in:</p>
<ul>
<li><b>Non-communicating 24V inverter systems:</b> Some variable-speed condensers—most notably ${brandLink('Bosch')} IDS systems${bosch3 ? ` like the ${sysLink(bosch3)} (${usd(lowestPrice(bosch3))} listed)` : ''}—modulate compressor speed using their own onboard suction-pressure and coil-temperature sensors. They wire to any standard 24V two-stage heat pump thermostat (such as an Ecobee or Honeywell 24V model) without needing a proprietary wall controller. See our <a href="/guides/bosch-ids-inverter-heat-pump-cost/">Bosch IDS inverter cost guide</a>.</li>
<li><b>Proprietary communicating systems:</b> Other variable-speed lines communicate digitally over data wires between the thermostat, indoor air handler, and outdoor inverter board to coordinate exact blower CFM, electronic expansion valve position, and dehumidification profiles.${goodman3 ? ` Systems such as the ${sysLink(goodman3)} (${usd(lowestPrice(goodman3))} listed)` : ''} or multi-zone ductless systems from ${brandLink('Mitsubishi')} and ${brandLink('Daikin')} often require or perform best with their matched control interface.</li>
</ul>

<h2>3-ton inverter heat pumps in our catalog (${asOf})</h2>
${systemsTable(inv3.slice(0, 6))}

<h2>Why the thermostat matters for AHRI ratings and rebates</h2>
<p>Before declining a manufacturer's communicating thermostat on a variable-speed quote, check the AHRI certificate (${src('ahri', 'AHRI Directory')}). Some inverter pairings only achieve their published SEER2, EER2, and HSPF2 ratings—and their ${src('esCriteria', 'ENERGY STAR Cold Climate')} status—when installed with the specific communicating control listed on the AHRI certificate. If you substitute a generic 24V thermostat on a system that relies on communicating data to modulate, the unit may drop back to basic two-stage operation and lose utility rebate eligibility. See <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">how to check an AHRI certificate</a>.</p>

<h2>Questions to ask when auditing the thermostat line</h2>
<ol>
<li><b>Is a thermostat already included in the base quote?</b> Most full-system replacement quotes include a basic digital thermostat in the base labor package. If you are charged an upgrade fee, it should reflect the net difference, not a second installation trip.</li>
<li><b>Does the AHRI certificate require the proprietary control?</b> Ask the contractor for the AHRI reference number and verify whether the rated efficiency depends on the communicating stat.</li>
<li><b>Is there a C-wire (common wire) at the wall?</b> If the contractor charges extra to pull new 18/8 thermostat cable, ask whether the wire run is accessible through the basement or attic or if they are using a fast-stat / power-extender module.</li>
<li><b>Check utility marketplace rebates:</b> Many electric utilities subsidize smart thermostats directly through their online marketplaces; check ${src('esRebateFinder', 'ENERGY STAR Rebate Finder')} and ${src('dsire', 'DSIRE')}.</li>
</ol>
<p>Tick the "Smart thermostat" box in the ${auditLink({ systemType: 'central-heat-pump', tons: 3, tier: 'mid' }, 'quote auditor')} to add the ${fmtRange(stat)} REMDB allowance automatically when grading your quote.</p>`;
    },
  },
  {
    slug: 'hvac-line-set-flush-vs-copper-line-set-replacement-cost',
    get title() {
      const f = fairRange('central-heat-pump', 3);
      return `${usd(ls.price)} Line Set vs ${fmtRange(f)} Installed: Flush vs Replace`;
    },
    h1: 'HVAC line set flush vs full copper line set replacement cost',
    get description() {
      const f = fairRange('central-heat-pump', 3);
      return `A 30-ft insulated copper line set lists at ${usd(ls.price)}. When you can flush and reuse existing copper vs replace it on a ${fmtRange(f)} 3-ton heat pump quote.`;
    },
    updated: today,
    related: { tons: [2, 3, 4], brands: ['Goodman', 'Trane', 'LG', 'ACiQ'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const f3 = fairRange('central-heat-pump', 3);
      const s3 = equipmentStats('central-heat-pump', 3);
      const r32 = systemsWhere({ type: 'central-heat-pump', tons: 3 }).filter((s) => refrigerantOf(s) === 'R-32');
      return `
<p>The copper refrigerant line set—the insulated larger suction line and smaller liquid line connecting your indoor coil to the outdoor condenser—is one of the most misunderstood items on an HVAC quote. Some contractors reuse an old, undersized, or oil-contaminated line set without mentioning it; others add a steep "mandatory R-454B / R-32 copper replacement" surcharge even when the existing copper is short, accessible, or reusable. Here is what new copper tubing actually lists for (${asOf}) and the technical rules that decide between flushing and replacing.</p>

<h2>What a new copper line set lists for in our seed data</h2>
<div class="tablewrap"><table><thead><tr><th>Component</th><th class="r">Listed retail price (${asOf})</th><th>Retailer / Source</th></tr></thead><tbody>
<tr><td><a href="${ls.url}" rel="noopener" target="_blank">${ls.label}</a></td><td class="r num">${usd(ls.price)}</td><td>${src('hvacdirect', 'HVACDirect')}</td></tr>
<tr><td>${tonLink(3, '3-ton central heat pump equipment')} (${s3.count} systems)</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td>${src('hvacdirect', 'HVACDirect')} / ${src('alpine', 'Alpine')}</td></tr>
<tr><td>${tonLink(3, '3-ton full replacement, installed')} <span class="badge b-est">est.</span></td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td><td>${src('remdb', 'DOE REMDB')}</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
<p>The material cost of a standard ${ls.label} is ${usd(ls.price)}. When an accessible basement, crawlspace, or exterior wall run needs a new line set, the copper itself is a modest part of a ${rangeText(f3)} 3-ton installation. What drives legitimate line-set labor up is routing: copper buried behind finished drywall, snaked through a two-story chase, or running under a slab.</p>

<h2>When you can flush and reuse existing copper vs when you must replace it</h2>
<p>Every manufacturer's installation manual sets four criteria for reusing an existing copper line set during a system swap:</p>
<ol>
<li><b>Correct outside diameter (OD) for the new tonnage and model:</b> A heat pump's capacity and oil-return velocity depend on exact tubing diameter (for example, a 3/8-inch liquid line and 3/4-inch or 7/8-inch suction line on many ${tonLink(3, '3-ton')} and ${tonLink(4, '4-ton')} units). If the old system used a smaller suction line—or if you are stepping up in tonnage—reusing the narrow copper restricts refrigerant flow and starves the compressor of returning oil.</li>
<li><b>Compatible compressor oil and clean flush:</b> Systems built over the last fifteen years using R-410A use synthetic polyolester (POE) oil, which is the same oil family used by most new R-454B and R-32 systems (${src('epaTechTransitions', 'EPA Technology Transitions')}). Older R-22 systems used mineral oil, which does not mix with POE oil. If the copper is the right diameter and free of leaks, a technician can flush residual oil and debris with an approved flushing solvent and dry nitrogen before brazing in the new equipment and filter-drier.</li>
<li><b>No compressor burnout contamination:</b> If the old compressor suffered an electrical burnout, acid and carbon sludge coat the inside of the copper tubing. Replacing the line set is the safest way to keep acid from destroying the new compressor.</li>
<li><b>Intact pressure test and insulation:</b> The line set must hold a dry-nitrogen pressure test and pass a deep micron vacuum decay test (typically below 500 microns), and the outdoor suction-line foam insulation must be intact and UV-protected.</li>
</ol>

<h2>Why the R-410A to R-454B / R-32 transition is used as a line-set upsell</h2>
<p>Some sales reps tell homeowners that EPA rules for A2L refrigerants (R-454B and R-32) make it "illegal to reuse R-410A copper." That is false. The EPA's Technology Transitions rule sets a 700 GWP limit on new equipment (${src('epaTechTransitions', 'EPA: HFC restrictions')}); it does not ban reusing structurally sound, properly sized copper tubing that has been flushed, pressure-tested, and evacuated according to the manufacturer's manual. Read more in our <a href="/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/">R-410A vs R-454B vs R-32 refrigerant transition guide</a>.${r32.length ? ` Current 3-ton R-32 systems in our data include ${r32.slice(0, 3).map((s) => sysLink(s)).join(', ')}.` : ''}</p>

<h2>Checklist for the line-set line on your quote</h2>
<ul>
<li>Ask the estimator to measure and write down the existing liquid- and suction-line diameters and compare them against the new unit's installation manual.</li>
<li>Require the quote to state explicitly either <b>"Replace copper line set (specify diameter and length)"</b> or <b>"Nitrogen flush, pressure test, and evacuate existing line set to &lt;500 microns."</b></li>
<li>If the contractor charges a large separate line-set replacement adder on an open basement or exterior run, point to the ${usd(ls.price)} material cost for a ${ls.label} and ask how many labor hours are budgeted.</li>
</ul>
<p>Check your full quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} and compare brand pricing on our ${brandLink('Goodman')}, ${brandLink('Trane')}, and ${brandLink('LG')} pages.</p>`;
    },
  },
  {
    slug: 'condenser-pad-disconnect-box-whip-surge-protector-add-ons',
    get title() {
      const c = newCircuitAdder();
      const f = fairRange('central-heat-pump', 3);
      return `${usd(c)} Circuit vs ${fmtRange(f)} Installed: Pad & Surge`;
    },
    h1: 'Condenser pad, disconnect box, whip & surge protector add-on charges',
    get description() {
      const c = newCircuitAdder();
      const f = fairRange('central-heat-pump', 3);
      return `DOE REMDB values a new 240V circuit at ${usd(c)}. How to audit pad, disconnect box, whip, and surge protector add-ons on ${fmtRange(f)} 3-ton quotes.`;
    },
    updated: today,
    related: { tons: [2, 3, 4], brands: ['Goodman', 'Bosch', 'Mitsubishi', 'Gree'], systems: { type: 'central-heat-pump', tons: 3, staging: 'inverter' } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const circuit = newCircuitAdder();
      const panel = adderRange('panel200A');
      const f3 = fairRange('central-heat-pump', 3);
      const s3 = equipmentStats('central-heat-pump', 3);
      const inv = systemsWhere({ type: 'central-heat-pump', tons: 3, staging: 'inverter' });
      return `
<p>Every outdoor heat pump or air conditioner sits on a base pad or wall bracket, connects to a line-of-sight exterior electrical disconnect box, and uses a flexible liquid-tight conduit ("whip") to carry power into the cabinet. On a transparent quote, those basic mounting and hookup materials are part of the standard installation scope. On a padded quote, they appear as hundreds or thousands of dollars of extra "code compliance packages" alongside high-margin outdoor surge protectors. Here is how to benchmark those charges (${asOf}).</p>

<h2>The DOE national-lab electrical benchmark</h2>
<p>Rule #1 on this site is that we never invent hardware prices for individual plastic pads or disconnect switches not in our verified seed. Instead, we can bound the entire outdoor electrical hookup using the U.S. Department of Energy's ${src('remdb', 'REMDB')} cost regressions:</p>
<div class="tablewrap"><table><thead><tr><th>Scope</th><th class="r">Benchmark cost <span class="badge b-est">est.</span></th><th>What it represents</th></tr></thead><tbody>
<tr><td>Complete new 240V heat pump circuit</td><td class="r num">${usd(circuit)}</td><td>${src('remdb', 'REMDB')} difference between a ducted heat pump replacement <i>with</i> a new circuit and <i>without</i> a new circuit</td></tr>
<tr><td>Full 200A electrical panel replacement</td><td class="r num">${fmtRange(panel)} (mid ${usd(panel.mid)})</td><td>${src('remdb', 'REMDB')} "Electric Panel, 200A"</td></tr>
<tr><td>${tonLink(3, '3-ton heat pump replacement (existing circuit)')}</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td><td>Includes standard outdoor unit set, pad/tie-downs, disconnect/whip reconnection, and commissioning</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>
<p>Look closely at the first row: in DOE's national database, running a <b>brand-new 240V circuit</b> from the panel to the outdoor unit adds ${usd(circuit)} to the midpoint of a 3-ton heat pump installation. When your house already has the 240V circuit at the wall and the installer is merely replacing the fused or pull-out disconnect box and the 4- to 6-foot flexible whip at the condenser, charging more than the ${usd(circuit)} cost of an entire new circuit is an immediate red flag.</p>

<h2>What should be in the base install vs legitimate upgrades</h2>
<ul>
<li><b>Equipment pad or snow risers:</b> A composite or concrete equipment pad under a ground-set condenser is standard installation hardware. In cold climates (${src('bascColdClimate', 'DOE/PNNL Cold Climate Guide')}), outdoor heat pumps must be elevated on snow legs, risers, or a wall bracket so defrost water can drain freely above the snow line without encasing the bottom coil in ice.</li>
<li><b>Exterior disconnect box and liquid-tight whip:</b> Electrical code requires a disconnecting means within sight of the outdoor condenser. Replacing a weathered pull-out disconnect and degraded whip during a condenser swap takes minutes while the high-voltage wires are already disconnected.</li>
<li><b>Breaker sizing (MCA and MOP):</b> Often a new heat pump requires a smaller breaker than an older unit (to match the nameplate Maximum Overcurrent Protection, or MOP) while reusing the existing copper wire gauge (which must meet Minimum Circuit Ampacity, or MCA). Swapping a 2-pole breaker in an existing panel is routine electrical hookup, not a panel upgrade. See <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">200A panel upgrade and heat strip adders</a>.</li>
</ul>

<h2>When an outdoor HVAC surge protector is worth having</h2>
<p>Variable-speed inverter heat pumps—which make up ${inv.length} of the ${s3.count} 3-ton ducted systems in our catalog, from ${brandLink('Bosch')}, ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('LG')}, ${brandLink('Gree')}, ${brandLink('MRCOOL')}, and ${brandLink('ACiQ')}—convert incoming AC power to DC on a rectifier and inverter control board. Unlike a single-stage contactor system, inverter boards are sensitive to voltage spikes and utility grid switching surges.</p>
<ul>
<li>An external Type 1 or Type 2 surge protective device (SPD) mounted at the outdoor disconnect box (or a whole-home surge protector at the main breaker panel) is smart protection for an inverter condenser.</li>
<li>However, some contractors mark up a disconnect-mounted surge protector into a four-figure "power conditioning package." Ask for the exact SPD brand and model number on the quote so you can verify its retail hardware cost and check whether it is already included in the contractor's inverter install kit.</li>
</ul>

<h2>How to push back on pad, whip, and disconnect padding</h2>
<ol>
<li>Ask whether the base installation price includes setting the unit on a new level pad (or snow risers) and reconnecting it with a new whip and disconnect.</li>
<li>If the contractor adds a separate electrical hookup fee on an existing circuit, compare it with the ${usd(circuit)} REMDB new-circuit benchmark and ask what work beyond the disconnect box is included.</li>
<li>Compare inverter system prices like ${sysLink(cheapest(inv))} (${usd(lowestPrice(cheapest(inv)))}) and run the total quote through the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} to see how the bottom line grades against ${rangeText(f3)}.</li>
</ol>`;
    },
  },
  {
    slug: 'condensate-pump-float-switch-secondary-drain-pan-quote',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Drain & Float`;
    },
    h1: 'Condensate pump, float switch & secondary drain pan quotes: what is required by code',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `Secondary drain pans, SS2 overflow float switches, and condensate pumps on ${fmtRange(f)} 3-ton HVAC quotes (${usd(s.min)}–${usd(s.max)} equipment): what should be standard.`;
    },
    updated: today,
    related: { tons: [2.5, 3, 4], brands: ['Goodman', 'Trane', 'Carrier'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      const g3 = cheapest(systemsWhere({ type: 'central-heat-pump', tons: 3, brand: 'Goodman' }));
      return `
<p>In cooling mode, a 3-ton or 4-ton air conditioner or heat pump pulls gallons of moisture out of indoor air every day. That water drips off the indoor evaporator coil into a primary drain pan and flows out through a 3/4-inch PVC condensate line. Because a clogged drain line in an attic or second-floor closet will ruin drywall ceilings and hardwood floors, building codes require overflow protection. The problem on many HVAC quotes is not that the contractor includes a float switch, secondary drain pan, or condensate pump—it is that basic code-required water protection gets broken out as hundreds of dollars of "optional protection adders." Here is how to audit those lines against our live benchmarks (${asOf}).</p>

<h2>Benchmark context: full system replacement vs drain accessories</h2>
<div class="tablewrap"><table><thead><tr><th>System / Benchmark</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton central heat pump')} (${s3.count} seeded systems)</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td></tr>
<tr><td>${tonLink(4, '4-ton central heat pump')}</td><td class="r num">${usd(equipmentStats('central-heat-pump', 4).min)}–${usd(equipmentStats('central-heat-pump', 4).max)}</td><td class="r num">${fmtRange(f4)} (mid ${usd(f4.mid)})</td></tr>
${g3 ? `<tr><td>Lowest listed 3-ton heat pump: ${sysLink(g3)} (${brandLink('Goodman')})</td><td class="r num">${usd(lowestPrice(g3))}</td><td class="r num">${fmtRange(fairRange(g3.systemType, g3.tons, g3.tier))}</td></tr>` : ''}
</tbody></table></div>
<p class="small muted">${remdbNote} Rule #1 note: REMDB and our matched-equipment seed do not publish separate part prices for PVC traps, float switches, or condensate pumps, so we evaluate them as part of the standard installation scope inside the REMDB replacement benchmark.</p>

<h2>The three condensate components and when each is needed</h2>
<ul>
<li><b>Secondary (auxiliary) drain pan:</b> Whenever an air handler or evaporator coil is installed above a finished ceiling or living space (such as an attic or upstairs closet), residential mechanical codes require a secondary metal or high-impact polymer drain pan underneath the entire unit—either piped to a conspicuous exterior termination point or fitted with a water-level shutoff switch. If your air handler is in an unfinished concrete basement next to a floor drain, an attic-style emergency pan is rarely needed.</li>
<li><b>Overflow float switch (primary SS2 inline switch and pan switch):</b> A low-voltage float switch wires in series with the 24V thermostat circuit (R or Y wire). If algae or sludge backs water up into the primary coil pan's auxiliary port—or into the emergency pan underneath—the float rises and shuts the condenser off before water overflows onto the ceiling. Every attic or closet install should include overflow float switches as standard workmanship, not as a luxury tier upgrade.</li>
<li><b>Electric condensate pump:</b> Needed only when gravity cannot carry water from the air handler to a drain or outdoors—for example, in a below-grade basement with no floor drain, or on an interior-wall <a href="/guides/multi-zone-mini-split-cost/">multi-zone mini-split head</a>. Always ask for a pump with its own built-in overflow safety switch wired to the unit.</li>
</ul>

<h2>Red flags on condensate and drain line quotes</h2>
<ol>
<li><b>Charging extra for code-mandated overflow protection on an attic install:</b> In an attic or second-floor closet, an emergency drain pan and float switch are required to pass mechanical inspection (${src('remdb', 'REMDB')} full-system benchmarks reflect complete code-compliant replacements). Treating a float switch as an optional upsell means the base quote is not code-compliant.</li>
<li><b>Replacing an unbroken metal pan at new-system prices:</b> If an existing galvanized or polymer emergency pan under an attic air handler is rusted through, cracked, or too small for the new cabinet footprint, replacing it is legitimate. If it is intact, sized for the new cabinet, and passes a water test, ask why it is being billed for replacement.</li>
<li><b>Bundling a "drain line maintenance contract" into the equipment price:</b> Pouring water through the P-trap and testing the float switch is part of startup commissioning.</li>
</ol>

<h2>How to keep your quote clean</h2>
<p>Ask every bidding contractor to confirm in writing that the base installation price includes a new primary PVC trap with cleanout tee, code-required overflow float switches wired to shut down the system, and (for attic or upstairs closet units) a properly sized secondary drain pan. Then grade the complete price in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} and compare with our <a href="/guides/attic-vs-crawlspace-vs-closet-air-handler-installation-cost/">attic vs crawlspace vs closet installation guide</a>.</p>`;
    },
  },
  {
    slug: 'electric-heat-strip-aux-heat-5kw-10kw-15kw-cost',
    get title() {
      const c = newCircuitAdder();
      const f = fairRange('central-heat-pump', 3);
      return `${usd(c)} Circuit vs ${fmtRange(f)} Installed: 5–15kW Strips`;
    },
    h1: 'Electric heat strips (5kW, 8kW, 10kW, 15kW aux heat): sizing, operating cost & quote adders',
    get description() {
      const c = newCircuitAdder();
      const f = fairRange('central-heat-pump', 3);
      return `How 5kW, 8kW, 10kW, and 15kW electric aux heat strips affect breaker size, ${usd(c)} circuit adders, operating bills, and ${fmtRange(f)} 3-ton heat pump quotes.`;
    },
    updated: today,
    related: { tons: [2.5, 3, 4], brands: ['Goodman', 'Bosch', 'Mitsubishi', 'LG'], systems: { type: 'central-heat-pump', coldClimate: true } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const circuit = newCircuitAdder();
      const panel = adderRange('panel200A');
      const f3 = fairRange('central-heat-pump', 3);
      const cold = systemsWhere({ type: 'central-heat-pump', coldClimate: true });
      const sampleState = STATES.find((s) => s.code === 'NY' && s.electricity) ?? STATES.find((s) => s.electricity)!;
      const costs = heatingCosts(sampleState);
      const hpCost = costs.find((c) => c.label.startsWith('Heat pump,'))!;
      const coldCost = costs.find((c) => c.label.startsWith('Cold-climate'));
      const resCost = costs.find((c) => c.label.startsWith('Electric resistance'))!;
      const kws = [5, 8, 10, 15].map((kw) => ({
        kw,
        btuh: Math.round(kw * 3412.14),
        amps240: (kw * 1000) / 240,
        mcaApprox: ((kw * 1000) / 240) * 1.25,
      }));
      return `
<p>Almost every ducted air handler has a slot for an electric resistance heater kit—commonly called "heat strips," "auxiliary heat," or "emergency heat"—sold in nominal sizes like 5 kW, 8 kW, 10 kW, 15 kW, or 20 kW. Contractors who size by habit often drop a 10 kW or 15 kW heat strip into every air handler automatically. Oversizing that strip does three expensive things at once: it inflates the quote, triggers a ${usd(circuit)} new-circuit or ${fmtRange(panel)} panel upgrade you may not need, and triples your hourly heating bill whenever auxiliary heat locks on. Here is the exact electrical and thermal math (${asOf}).</p>

<h2>Thermal output and electrical current draw by heat strip size (5 kW to 15 kW)</h2>
<p>By physics, 1 kilowatt-hour of electric resistance heat equals 3,412.14 BTU, and continuous heating loads are sized at 125% of heater current under electrical code rules:</p>
<div class="tablewrap"><table><thead><tr><th>Nominal strip size</th><th class="r">Heat output (BTU/h at 240V)</th><th class="r">Heater current at 240V</th><th class="r">125% continuous load (before blower)</th></tr></thead><tbody>
${kws.map((r) => `<tr><td><b>${r.kw} kW</b></td><td class="r num">${r.btuh.toLocaleString('en-US')} BTU/h</td><td class="r num">${r.amps240.toFixed(1)} A</td><td class="r num">${r.mcaApprox.toFixed(1)} A</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">Exact Minimum Circuit Ampacity (MCA) and Maximum Overcurrent Protection (MOP) also add the indoor blower motor amps and vary slightly by voltage rating (208/240V); always read the air handler nameplate.</p>
<p>Notice what happens between 5 kW and 15 kW: a 5 kW strip draws about 20.8 amps at 240V (fitting on a single 30-amp circuit in most air handlers), whereas a 15 kW strip draws 62.5 amps before the blower motor—typically requiring two separate 240V circuits (such as a 60A plus a 30A breaker) and heavy copper wire back to the main panel. That jump is the #1 reason a quote suddenly includes a ${fmtRange(panel)} 200A panel upgrade (${src('remdb', 'REMDB')}). See our <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">200A panel upgrade and heat strip guide</a>.</p>

<h2>Operating cost: heat pump vs electric resistance heat strips</h2>
<p>Electric resistance strips operate at 100% efficiency (COP = 1.00), while the ${EFFICIENCY.hspf2Count} ducted heat pumps in our seed carry a median HSPF2 of ${EFFICIENCY.hspf2Median} (seasonal COP ${(EFFICIENCY.hspf2Median / 3.41214).toFixed(2)}) and the ${EFFICIENCY.coldCount} ENERGY STAR cold-climate pairings carry a median HSPF2 of ${EFFICIENCY.coldHspf2Median} (seasonal COP ${((EFFICIENCY.coldHspf2Median ?? EFFICIENCY.hspf2Median) / 3.41214).toFixed(2)}). Using EIA state electricity data (${src('eiaElectricity', 'EIA Table 5.6.B')}) for <a href="/states/${sampleState.slug}/">${sampleState.name}</a> (${sampleState.electricity!.centsPerKwh}¢/kWh) as an example:</p>
<div class="tablewrap"><table><thead><tr><th>Heating mode (${sampleState.name} EIA rate: ${sampleState.electricity!.centsPerKwh}¢/kWh)</th><th class="r">Cost per million BTU delivered</th><th>Calculation</th></tr></thead><tbody>
<tr><td>${hpCost.label}</td><td class="r num">${usd(hpCost.dollarsPerMMBtu)} / MMBtu</td><td>${hpCost.method}</td></tr>
${coldCost ? `<tr><td>${coldCost.label}</td><td class="r num">${usd(coldCost.dollarsPerMMBtu)} / MMBtu</td><td>${coldCost.method}</td></tr>` : ''}
<tr><td><b>${resCost.label} (heat strips)</b></td><td class="r num"><b>${usd(resCost.dollarsPerMMBtu)} / MMBtu</b></td><td>${resCost.method}</td></tr>
</tbody></table></div>
<p class="small muted">Check your own state's exact EIA electricity and gas math on our <a href="/states/">state heat pump cost pages</a>.</p>
<p>Because resistance heat costs ${ (resCost.dollarsPerMMBtu / hpCost.dollarsPerMMBtu).toFixed(2) }× as much per million BTU as the median heat pump, the thermostat should lock out auxiliary strips above your balance point and use a cold-climate compressor to carry the winter load.</p>

<h2>How DOE / Building America says to size backup heat strips</h2>
<p>According to the U.S. Department of Energy's Building America Solution Center (${src('bascColdClimate', 'Cold Climate Heat Pump Sizing and Selection')}) and ${src('esCriteria', 'ENERGY STAR Cold Climate criteria')}, cold-climate ducted heat pumps must deliver at least 70% of rated capacity at 5°F with a COP of at least 1.75. Supplemental resistance heat should only bridge the gap between the house's Manual J heating load at the 99% outdoor design temperature and the heat pump's actual BTU/h output at that temperature—not replace the entire heating load unless local code or utility emergency rules require full redundancy.</p>
${cold.length ? `<p>Seeded cold-climate ducted heat pumps with verified 5°F performance include ${cold.slice(0, 5).map((s) => `${sysLink(s)} (${brandLink(s.brand)}, COP at 5°F: ${s.energyStar?.copAt5F ?? '—'})`).join(', ')}.</p>` : ''}

<h2>How to audit the heat strip line on your quote</h2>
<ol>
<li>Ask the contractor: <b>"What is my Manual J heating load at our outdoor design temperature, and what is this heat pump's BTU/h output at that temperature?"</b> The difference (divided by 3,412) is the kilowatt gap you actually need.</li>
<li>If a 10 kW or 15 kW strip is triggering a ${fmtRange(panel)} panel upgrade on your quote, ask whether a cold-climate heat pump paired with a 5 kW or 8 kW strip fits within your existing breaker panel.</li>
<li>Verify that the thermostat is configured with an outdoor auxiliary heat lockout temperature so the strips do not fire every time you bump the thermostat up by 2 degrees.</li>
</ol>
<p>Compare 3-ton (${tonLink(3)}) and 4-ton (${tonLink(4)}) installed benchmarks (${rangeText(f3)} at 3 tons) and grade your quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')}.</p>`;
    },
  },
];
