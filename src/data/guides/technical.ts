// Technical and incentive guides: refrigerant transition, ductwork, panel and heat strips, sizing, and rebates.
// Regulatory statements quote the linked EPA, IRS and U.S. Code pages; all dollar figures are computed.
import { lowestPrice, median, TONNAGES } from '../equipment';
import { BRANDS } from '../brands';
import { fairRange, systemsWhere, adderRange, newCircuitAdder, refrigerantGwp, refrigerantOf, usd, fmtRange, pct } from '../../lib/facts';
import { SOURCES } from '../sources';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, rangeText, remdbNote } from './helpers';
import type { Guide } from './types';

export const TECHNICAL_GUIDES: Guide[] = [
  {
    slug: 'r410a-vs-r454b-r32-refrigerant-transition-quotes',
    title: 'R-410A vs R-454B vs R-32 in 2026: what the refrigerant transition means for your quote | TonnageCheck',
    h1: 'R-410A vs R-454B vs R-32: what the refrigerant transition means for your quote',
    description: 'What EPA\'s refrigerant rules actually require for new AC and heat pump installs, the GWP of R-32 and R-454B, listed prices by refrigerant, and refrigerant upsells to question.',
    updated: today,
    related: { tons: [3], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const gwp = refrigerantGwp();
      const groups = ['R-32', 'R-454B', 'R-410A'].map((r) => ({ r, xs: systemsWhere().filter((s) => refrigerantOf(s) === r) }));
      const three = ['R-32', 'R-454B'].map((r) => ({ r, xs: systemsWhere({ type: 'central-heat-pump', tons: 3 }).filter((s) => refrigerantOf(s) === r) }));
      return `
<p>If you have had a replacement quote recently, you have probably heard about the "refrigerant change": new systems use R-454B or R-32 instead of R-410A, and sometimes that is used to justify a higher price or a full-system replacement. Here is what the rule actually says, what the new refrigerants are, and how prices compare in our data (${asOf}).</p>

<h2>What the EPA rule says</h2>
<p>Under the EPA's Technology Transitions program, residential and light commercial air conditioning and heat pump systems (including split systems and mini-splits) have a global warming potential (GWP) limit of 700, with an installation compliance date of January 1, 2025. A May 2026 reconsideration rule removed the installation deadline for systems whose specified components were all manufactured or imported before January 1, 2025 (${src('epaTechTransitions', 'EPA: HFC restrictions by sector')}). R-410A is above that limit, so new systems built from newer components use lower-GWP refrigerants. The rule can change; check the EPA page for the current status.</p>
<p>The rule is about new systems. It does not require you to replace a working R-410A system, and R-410A remains available for servicing existing equipment.</p>

<h2>The new refrigerants, by the numbers</h2>
${gwp.length ? `<p>GWP values as published in the ENERGY STAR records of systems we track: ${gwp.map((g) => `<b>${g.name}</b> ${g.gwp}`).join(', ')}. Both R-32 and R-454B are classed as mildly flammable (A2L), which is why installation instructions for new systems include specific requirements, such as leak detection or minimum room sizes for some indoor units.</p>` : ''}

<h2>Does the refrigerant change the price?</h2>
<div class="tablewrap"><table><thead><tr><th>Refrigerant</th><th class="r">Systems in our data</th><th class="r">Median listed price</th></tr></thead><tbody>
${groups.map((g) => `<tr><td>${g.r}</td><td class="r num">${g.xs.length}</td><td class="r num">${g.xs.length ? usd(median(g.xs.map(lowestPrice))) : '—'}</td></tr>`).join('\n')}
</tbody></table></div>
<p>That mix covers many sizes and types, so compare like for like. For 3-ton ducted heat pumps only: ${three.map((g) => `${g.r} ${g.xs.length ? `${usd(median(g.xs.map(lowestPrice)))} median across ${g.xs.length} systems` : 'no listings'}`).join('; ')}. Brands differ in which refrigerant they chose, so the refrigerant itself is not a reliable reason for a large price difference.</p>

<h2>Refrigerant claims to question on a quote</h2>
<ul>
<li><b>"You have to replace everything because of the new refrigerant."</b> A new outdoor unit on a new refrigerant needs a matched indoor coil, so a split replacement usually means both. But nothing requires replacing a working system just because the rule exists.</li>
<li><b>"R-410A is banned, so repairs are impossible."</b> R-410A remains available for servicing existing equipment. Repair-vs-replace should be decided on the system's age and condition.</li>
<li><b>A "refrigerant compliance fee."</b> Ask what work it covers. Line set flushing or replacement and leak detection may be legitimate; a fee with no work attached is not.</li>
<li><b>A big premium for one refrigerant over the other.</b> Our data shows systems on both new refrigerants at similar prices.</li>
</ul>

<h2>Line sets and the new refrigerants</h2>
<p>Whether an existing line set can be reused with a new system depends on its size, condition and the manufacturer's installation instructions. If a quote replaces it, the line should be itemized; if it reuses it, ask whether it was checked against the new unit's instructions. Our <a href="/guides/heat-pump-condenser-only-vs-full-system-replacement/">condenser-only vs full system guide</a> covers matching the indoor coil.</p>
<p>The standard-efficiency installed benchmark for a 3-ton heat pump is ${rangeText(fairRange('central-heat-pump', 3))}, whichever refrigerant it uses. ${remdbNote} Check your quote in the ${auditLink({ tons: 3 })}.</p>`;
    },
  },
  {
    slug: 'ductwork-replacement-cost-add-on',
    title: 'Ductwork replacement on an HVAC quote: when it is needed and how to check the price | TonnageCheck',
    h1: 'Ductwork replacement as a quote add-on: when it is needed and how to check it',
    description: 'How to tell whether the ductwork line on an HVAC replacement quote is necessary, what tests prove it, and how to get it priced separately so you can compare.',
    updated: today,
    related: { tons: [3, 4], systems: { type: 'central-heat-pump', tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      return `
<p>Ductwork is the add-on most likely to double an HVAC quote, and the hardest for a homeowner to judge. Sometimes it is the most valuable money you will spend: a new heat pump on leaky, undersized ducts will never perform as rated. Sometimes it is padding. This guide explains how to tell which, and how to price it.</p>

<h2>Why we do not publish a ductwork price</h2>
<p>Rule #1 on this site is no made-up numbers. There is no public, citable national benchmark for residential duct replacement that we can apply to your house: the cost depends on how much duct, where it runs, what it is made of and how hard it is to reach. So instead of guessing, our ${auditLink({}, 'auditor')} lets you enter the itemized ductwork amount and grades the rest of the quote against the equipment benchmark. If the quote does not itemize ductwork, the auditor warns that its grade may overstate the overcharge.</p>
<p>For scale, the installed benchmark for a standard-efficiency 3-ton ducted heat pump replacement without duct work is ${rangeText(f3)}, and ${rangeText(f4)} at 4 tons. ${remdbNote} If a quote is far above that and includes ductwork, the ductwork line is where to look.</p>

<h2>Types of duct work, from least to most invasive</h2>
<ul>
<li><b>Sealing and insulating</b> existing ducts: mastic or aerosol sealing of leaks, and insulation for ducts in unconditioned attics or crawlspaces.</li>
<li><b>Transitions and plenums:</b> new connections between the new equipment and the existing trunk. Often unavoidable when the equipment footprint changes, and normally part of the install.</li>
<li><b>Return upgrades:</b> adding or enlarging return air paths when the existing return starves the system.</li>
<li><b>Partial replacement:</b> replacing damaged runs or an undersized trunk.</li>
<li><b>Full replacement</b> of the duct system.</li>
</ul>

<h2>Tests that prove ducts need work</h2>
<p>Ask for measurements, not opinions:</p>
<ol>
<li><b>Total external static pressure.</b> Measured on the existing system with a manometer. Compare it with the equipment manufacturer's rated limit. High static pressure means the ducts are restricting airflow.</li>
<li><b>Duct leakage test.</b> A duct blaster test measures how much air the ducts leak. Many energy codes and rebate programs use it.</li>
<li><b>Room-by-room airflow</b> compared with the Manual J / Manual D design, if the contractor did one. See <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J vs rule of thumb</a>.</li>
</ol>
<p>A contractor who recommends new ducts should be able to show at least one of these numbers. If the recommendation is based only on the age of the ducts or "it's best practice," ask for the test.</p>

<h2>Red flags</h2>
<ul>
<li>Ductwork bundled into a single system price with no separate line.</li>
<li>Full replacement recommended when the quote also upsizes the equipment. Bigger equipment needing bigger ducts can be a manufactured problem; ask whether the original size was right.</li>
<li>No mention of static pressure or leakage.</li>
<li>A ductwork line larger than the equipment-plus-install benchmark, with no drawing or scope.</li>
</ul>

<h2>How to price it fairly</h2>
<ol>
<li>Ask every contractor to quote the system and the duct work as separate lines, with the duct scope in writing (which runs, what material, sealing method).</li>
<li>Compare the system line against the benchmark in the ${auditLink({ tons: 3 }, 'auditor')}, entering the ductwork amount in the ductwork field.</li>
<li>Compare duct lines between contractors for the same written scope.</li>
<li>Ask whether sealing and insulation could fix the problem instead of replacement.</li>
</ol>
<p>Related: ${tonLink(3, '3-ton prices')}, ${tonLink(4, '4-ton prices')}, and <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">panel and heat strip adders</a>.</p>`;
    },
  },
  {
    slug: '200a-panel-upgrade-and-heat-strip-adders',
    title: '200A panel upgrade & heat strip adders on heat pump quotes: what they should cost | TonnageCheck',
    h1: '200A panel upgrades and heat strips on a heat pump quote',
    description: 'When a heat pump really needs a 200A panel upgrade or a new circuit, the DOE-lab REMDB cost for each, how electric backup heat strips are sized, and how to question them.',
    updated: today,
    related: { tons: [3, 4, 5], systems: { type: 'central-heat-pump', coldClimate: true } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const panel = adderRange('panel200A');
      const circuit = newCircuitAdder();
      const cold = systemsWhere({ type: 'central-heat-pump', coldClimate: true });
      const f3 = fairRange('central-heat-pump', 3);
      return `
<p>Electrical work is the second most common heat pump add-on after ductwork, and the easiest to inflate because few homeowners can judge it. Two lines show up most: a 200-amp panel upgrade and electric backup heat (heat strips). Here is what each should cost by the DOE national-lab benchmark, and when each is genuinely needed.</p>

<h2>The benchmark numbers</h2>
<div class="tablewrap"><table><thead><tr><th>Add-on</th><th class="r">Installed cost <span class="badge b-est">est.</span></th><th>Source</th></tr></thead><tbody>
<tr><td>200A electrical panel</td><td class="r num">${fmtRange(panel)} (midpoint ${usd(panel.mid)})</td><td>${src('remdb', 'REMDB')} "Electric Panel, 200A"</td></tr>
<tr><td>New 240V circuit for a heat pump</td><td class="r num">${usd(circuit)}</td><td>${src('remdb', 'REMDB')}: difference between its ducted heat pump classes with and without a new circuit</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote} REMDB rates its panel cost sources as weak ("No Clear Sources"), so treat that row as rough.</p>

<h2>Does a heat pump need a 200A panel?</h2>
<p>Not automatically. What matters is whether your existing panel has the capacity and the breaker space for the new load, which an electrician determines with a load calculation (the electrical code has a method for it). Many heat pump replacements of an existing heat pump or central AC reuse the existing circuit. A panel upgrade is more likely when you are replacing a gas furnace with an all-electric heat pump plus large electric backup heat, or adding other big loads such as an EV charger.</p>
<p>Ask the contractor for the electrical load calculation that shows the upgrade is needed. "Heat pumps need 200 amps" is not a calculation. Retailer listings and installation manuals give each unit's minimum circuit ampacity and maximum breaker size; ask the electrician to compare them with your panel.</p>

<h2>Heat strips: what they are and how they are sized</h2>
<p>Heat strips are electric resistance heaters in the air handler that supplement the heat pump in very cold weather and during defrost. They are rated in kilowatts. Resistance heat is far less efficient than the heat pump itself, so the goal is to size it for real need, not maximum.</p>
<ul>
<li>A cold-climate heat pump that keeps most of its capacity at low temperatures needs less backup. ENERGY STAR's cold-climate designation requires a COP of at least 1.75 at 5°F and at least 70% of rated capacity at 5°F (${src('esCriteria', 'criteria')}).${cold.length ? ` Cold-climate ducted systems in our data: ${cold.slice(0, 6).map((s) => sysLink(s)).join(', ')}.` : ''}</li>
<li>Heat strip size should follow from the heating load at your design temperature minus what the heat pump delivers there, which comes out of a Manual J. See <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J vs rule of thumb</a>.</li>
<li>Larger heat strips draw more current, which is one way a quote ends up "needing" a panel upgrade. If the strip size drives the panel upgrade, question the strip size first.</li>
</ul>

<h2>Questions to ask</h2>
<ol>
<li>What is the electrical load calculation, and what is the existing panel's capacity?</li>
<li>What size heat strips, why that size, and what is the heat pump's capacity at our design temperature?</li>
<li>Is the panel upgrade priced separately, and does it include the utility service upgrade or only the panel?</li>
<li>Is a permit and inspection included for the electrical work?</li>
</ol>

<h2>Putting it together</h2>
<p>A standard-efficiency 3-ton heat pump replacement benchmarks at ${rangeText(f3)}. If a panel is genuinely needed, the panel benchmark above adds to that. A quote whose electrical lines are several times these figures needs a scope you can verify. Tick the panel box in the ${auditLink({ tons: 3 })} and it adds the REMDB panel range to the fair price before grading.</p>`;
    },
  },
  {
    slug: 'manual-j-load-calculation-vs-rule-of-thumb-sizing',
    title: 'Manual J load calculation vs rule-of-thumb sizing: what an oversized quote costs | TonnageCheck',
    h1: 'Manual J load calculation vs rule-of-thumb sizing',
    description: 'Why HVAC sizing by square footage or by the old unit goes wrong, what a Manual J load calculation includes, and what each extra half-ton adds to an installed quote.',
    updated: today,
    related: { tons: [2.5, 3, 3.5, 4], systems: { type: 'central-heat-pump', tons: [3, 3.5, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const steps = TONNAGES.slice(0, -1).map((t, i) => ({ a: t, b: TONNAGES[i + 1], fa: fairRange('central-heat-pump', t), fb: fairRange('central-heat-pump', TONNAGES[i + 1]) }));
      return `
<p>Most oversized HVAC systems are not the result of a calculation; they are the result of not doing one. Contractors who size by square footage, or simply match the old unit, tend to round up, and every step up costs you money up front and comfort afterward. Here is what a proper load calculation is, why rules of thumb miss, and what each extra half-ton adds to an installed price.</p>

<h2>Rule of thumb vs Manual J</h2>
<p>A common contractor rule of thumb is 400–600 square feet per ton. The spread alone shows the problem: for a 2,000 sq ft house it suggests anywhere from about 3.5 to 5 tons. The real answer depends on things square footage ignores:</p>
<ul>
<li>Insulation levels in walls, attic and floors</li>
<li>Window area, orientation and type</li>
<li>Air leakage of the house</li>
<li>Duct location (attic, crawlspace or conditioned space)</li>
<li>Local design temperatures for heating and cooling</li>
<li>Occupants and internal heat gains</li>
</ul>
<p>ACCA Manual J is the industry-standard method that puts these together room by room, and many building codes reference it for new systems. Manual S then selects equipment that matches the calculated loads, and Manual D designs ducts to deliver the right airflow.</p>

<h2>What each step up in size costs</h2>
<div class="tablewrap"><table><thead><tr><th>Step</th><th class="r">Benchmark midpoint before</th><th class="r">After</th><th class="r">Added cost</th></tr></thead><tbody>
${steps.map((x) => `<tr><td>${tonLink(x.a, `${x.a}`)} → ${tonLink(x.b, `${x.b} ton`)}</td><td class="r num">${usd(x.fa.mid)}</td><td class="r num">${usd(x.fb.mid)}</td><td class="r num">${usd(x.fb.mid - x.fa.mid)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">Standard-efficiency ducted heat pump replacement. ${remdbNote}</p>
<p>The equipment itself also steps up. Median listed ducted heat pump prices in our data (${asOf}): ${TONNAGES.map((t) => { const xs = systemsWhere({ type: 'central-heat-pump', tons: t }); return xs.length ? `${t} ton ${usd(median(xs.map(lowestPrice)))}` : ''; }).filter(Boolean).join(', ')}.</p>

<h2>Why oversizing hurts more than your wallet</h2>
<ul>
<li><b>Short cycling:</b> the system reaches the thermostat setting quickly and shuts off, so it runs in short bursts that wear components and waste energy.</li>
<li><b>Poor dehumidification:</b> air conditioners remove moisture during longer run times; short cycles leave the house cool but clammy.</li>
<li><b>Uneven temperatures</b> between rooms, and more noise.</li>
<li><b>Bigger add-ons:</b> larger equipment can push a quote toward new ductwork or a panel upgrade. See <a href="/guides/ductwork-replacement-cost-add-on/">ductwork add-ons</a> and <a href="/guides/200a-panel-upgrade-and-heat-strip-adders/">panel and heat strips</a>.</li>
</ul>
<p>Variable-speed inverter equipment tolerates modest oversizing better because it throttles down, but it still costs more to buy. See <a href="/guides/inverter-vs-single-stage-heat-pump-cost/">inverter vs single-stage</a>.</p>

<h2>How to get a real load calculation</h2>
<ol>
<li>Ask each contractor whether they will do a Manual J, and ask for the report, not just the conclusion.</li>
<li>Check the inputs: does it list your actual window sizes, insulation and design temperatures, or defaults?</li>
<li>Compare the calculated heating and cooling loads (in BTU/h) with the capacity of the equipment quoted.</li>
<li>If two contractors quote different sizes, ask both to reconcile their calculations.</li>
</ol>
<p>Once the size is settled, check the price: the ${auditLink({ tons: 3 })} has a square-footage helper for a quick sanity check, but treat its rule of thumb the same way, as a check, not an answer.</p>`;
    },
  },
  {
    slug: 'heat-pump-tax-credit-and-rebate-stacking-2026',
    title: 'Heat pump tax credit & rebate stacking in 2026: 25C, HEEHRA/HEAR, HOMES and utilities | TonnageCheck',
    h1: 'Heat pump tax credits and rebate stacking in 2026',
    description: 'What is left for a 2026 heat pump install: why 25C no longer applies, HEEHRA/HEAR after DOE dropped fuel switching, HOMES, the no-combining rule, and utility rebates.',
    updated: today,
    related: { brands: BRANDS.filter((b) => b.coldClimateCount > 0).map((b) => b.name), systems: { coldClimate: true } },
    audit: { systemType: 'central-heat-pump', tons: 3, tier: 'high' },
    body: () => {
      const esBrands = BRANDS.filter((b) => b.energyStarCount > 0);
      const f3 = fairRange('central-heat-pump', 3, 'high');
      return `
<p>Rebate math is where many heat pump quotes go wrong, sometimes innocently and sometimes not. A credit that no longer exists gets subtracted, or two rebates that cannot be combined are both counted. Here is what actually applies to a heat pump installed in 2026, with each rule linked to the agency or statute that sets it.</p>

<h2>Federal 25C tax credit: ended</h2>
<p>The Energy Efficient Home Improvement Credit (Section 25C) paid up to $2,000 a year for a qualifying heat pump (${src('irs25c', 'IRS: 25C')}). The IRS now lists it as "Not allowed for any property placed in service after Dec. 31, 2025" (${src('irsObbba', 'IRS: OBBB provisions')}). The date that matters is when the system was installed and working. A heat pump installed in 2026 does not qualify, and there is no replacement federal credit. If a 2026 quote subtracts a federal tax credit, ask for it to be removed and the total recalculated.</p>

<h2>HEEHRA / HEAR: income-qualified point-of-sale rebates</h2>
<p>The High-Efficiency Electric Home Rebate program, often called HEAR, comes from the Inflation Reduction Act. Under the statute (${src('hearStatute', '42 U.S.C. § 18795a')}):</p>
<ul>
<li>Up to <b>$8,000</b> for a heat pump for space heating or cooling, within a <b>$14,000</b> total cap.</li>
<li>Households under <b>80%</b> of area median income: up to <b>100%</b> of project cost. From <b>80% to 150%</b>: up to <b>50%</b>.</li>
<li>Households above 150% of area median income are not eligible.</li>
</ul>
<p><b>The 2026 change that matters most:</b> DOE Program Notice 26-2 (${src('doePn262', 'May 2026')}) removed fuel switching from the program. HEAR now pays only to upgrade existing electric equipment, such as electric resistance heat or an old heat pump, to more efficient electric equipment. Replacing a gas, oil or propane furnace with a heat pump no longer qualifies. Homes must also address insulation and air sealing first unless they already meet the state's level, and state programs that had launched were given three months to adopt the change.</p>
<p>It is run by state energy offices, which decide whether, when and how to offer it, often through participating contractors at the point of sale (${src('doeRebates', 'DOE')}; find yours in the ${src('naseo', 'NASEO directory')} or on our <a href="/states/">state pages</a>). Do not count on it until your state program confirms eligibility in writing.</p>

<h2>HOMES: whole-house savings rebates</h2>
<p>The HOMES program pays for measured or modeled whole-house energy savings, not for specific equipment. For a single-family home, the statute (${src('homesStatute', '42 U.S.C. § 18795')}) sets modeled-savings rebates at the lesser of $2,000 or 50% of project cost for 20–35% savings, and $4,000 or 50% for 35% or more. For households under 80% of area median income, the amounts rise to $4,000 and $8,000, or 80% of cost. HOMES is also run by state energy offices.</p>

<h2>Stacking: what can and cannot be combined</h2>
<p>Both statutes say the same thing in their own words: a HOMES rebate "may not be combined with any other Federal grant or rebate," including HEAR, "for the same single upgrade," and a HEAR rebate may not be combined with any other federal grant or rebate, including HOMES, "for the same qualified electrification project." So you cannot collect both federal programs for the same heat pump. Whether you can use HEAR for the heat pump and HOMES for other work in the same house depends on how your state designed its programs.</p>
<p>Utility and state-funded rebates are separate from these federal programs. Their own terms decide whether they combine with HEAR or HOMES. Search by ZIP in the ${src('esRebateFinder', 'ENERGY STAR Rebate Finder')} and ${src('dsire', 'DSIRE')}, and read the fine print: many require pre-approval, a participating contractor, or ENERGY STAR or cold-climate certified equipment.</p>

<h2>Equipment that is easiest to get rebated</h2>
<p>Many programs key off ENERGY STAR certification of the exact outdoor and indoor pairing, identified by its AHRI reference number. In our data, ${esBrands.map((b) => `${brandLink(b.name)} (${b.energyStarCount} of ${b.systems.length}${b.coldClimateCount ? `, ${b.coldClimateCount} cold-climate` : ''})`).join(', ')} have ENERGY STAR matched pairings. Our <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">AHRI certificate guide</a> shows how to verify the pairing on your quote.</p>

<h2>How to read the rebate lines on a quote</h2>
<ol>
<li>Get the price before any rebates first. A high-efficiency 3-ton heat pump benchmarks at ${rangeText(f3)} installed. ${remdbNote}</li>
<li>Remove any 25C credit for a 2026 install.</li>
<li>Question any HEAR rebate on a quote that replaces a gas, oil or propane furnace: since Program Notice 26-2 that fuel switch no longer qualifies.</li>
<li>For each rebate listed, ask: which program, who applies, when is it paid, and what happens if it is denied?</li>
<li>Make sure the contract price does not depend on a rebate you have not been approved for.</li>
</ol>
<p>The ${auditLink({ tons: 3, tier: 'high' })} includes a rebate check with links for your ZIP.</p>`;
    },
  },
];
