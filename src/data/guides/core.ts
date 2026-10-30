// Buyer guides. Every dollar figure in the prose is computed from the seed at build time via lib/facts, and
// every policy statement is limited to what the linked primary source says.
import { fairRange, equipmentStats, usd, fmtRange, seedDateLabel, cpi } from '../../lib/facts';
import { SYSTEMS, lowestPrice } from '../equipment';
import { SOURCES } from '../sources';
import type { Guide } from './types';


const a = (url: string, text: string) => `<a href="${url}" rel="noopener" target="_blank">${text}</a>`;
const auditLink = '<a href="/auditor/">TonnageCheck quote auditor</a>';
const today = new Date().toISOString().slice(0, 10);

export const CORE_GUIDES: Guide[] = [
  {
    slug: 'how-to-tell-if-hvac-quote-is-ripoff',
    get title() { return `${usd(equipmentStats('central-heat-pump', 3).min)} Equip vs ${fmtRange(fairRange('central-heat-pump', 3))} Installed: 9 Quote Red Flags`; },
    h1: 'How to tell if your HVAC quote is a rip-off',
    get description() { return `Nine red flags in AC, furnace and heat pump quotes (${usd(equipmentStats('central-heat-pump', 3).min)}–${usd(equipmentStats('central-heat-pump', 3).max)} 3-ton equipment vs ${fmtRange(fairRange('central-heat-pump', 3))} installed benchmark).`; },
    updated: today,
    body: () => {
      const eq = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3, 'standard');
      const fh = fairRange('central-heat-pump', 3, 'high');
      return `
<p>Most homeowners buy a central air or heat pump system once or twice in their lives, usually in a hurry because the old one just died. Contractors know that. A replacement quote is one of the few big purchases where you rarely see an itemized price, and that is exactly where padding hides. The good news: the equipment has public prices, and the U.S. Department of Energy's national labs publish installed-cost benchmarks. You can check a quote in a few minutes.</p>

<h2>First, get the three numbers that matter</h2>
<p>Before you can judge a quote you need three things from the contractor, in writing:</p>
<ol>
<li><b>The exact model numbers</b> of the outdoor unit and the indoor coil or air handler (and furnace, if there is one). Not "a 16 SEER Trane," the actual model numbers.</li>
<li><b>The size in tons</b> and how they got it. One ton is 12,000 BTU per hour of cooling.</li>
<li><b>The total price, and what it includes</b>: ductwork, electrical, line set, thermostat, permit, haul-away, warranty.</li>
</ol>
<p>With those, you can compare against real data. For a typical case, a 3-ton ducted heat pump system: the ${eq.count} 3-ton systems in our data list online for ${usd(eq.min)} to ${usd(eq.max)} for the equipment (captured ${seedDateLabel}). The DOE-lab benchmark for a standard-efficiency 3-ton heat pump replacement, installed, is ${fmtRange(f)}, with a midpoint of ${usd(f.mid)}. A high-efficiency or cold-climate unit runs ${fmtRange(fh)}. Those benchmarks come from the ${a(SOURCES.remdb.url, 'National Residential Efficiency Measures Database (REMDB)')} and are national averages, so expensive metros run higher. They are estimates, and we say so everywhere they appear.</p>

<h2>The 9 red flags</h2>

<h3>1. No model numbers, just a brand and a "tier"</h3>
<p>"Good, better, best" menus with brand names and no model numbers make comparison impossible, which is the point. Every line on a real quote maps to a model you can look up. If the salesperson will not write the model numbers down, treat the quote as incomplete.</p>

<h3>2. Sized by the old unit or by square footage alone</h3>
<p>Matching the old unit's tonnage repeats whatever mistake was made 15 years ago. Square-foot rules of thumb ignore insulation, windows and climate. The industry standard is an ACCA Manual J load calculation. Oversizing is the common error and it is profitable: a bigger unit costs more and often needs bigger ductwork. Ask for the Manual J report.</p>

<h3>3. A same-day "sign now" discount</h3>
<p>A price that is only good if you sign before the salesperson leaves tells you the first price was not a real one. Legitimate contractors hold a written quote for days or weeks.</p>

<h3>4. Tax credit math that no longer exists</h3>
<p>If a 2026 quote subtracts a federal tax credit, be careful. The IRS says the 25C energy efficient home improvement credit is ${a(SOURCES.irsObbba.url, '"Not allowed for any property placed in service after Dec. 31, 2025"')}. Some income-qualified state rebates still exist, but they are not automatic and are not a tax credit. See our <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">rebate guide</a>.</p>

<h3>5. Equipment and coil that are not an AHRI-matched pair</h3>
<p>The efficiency rating on the brochure applies to a specific outdoor unit with a specific indoor coil or air handler. Swap the coil for a cheaper one and the rating, and any rebate that depends on it, can disappear. Ask for the AHRI certificate for the exact pair on the quote.</p>

<h3>6. Labor and markup far beyond the benchmark</h3>
<p>Subtract the listed equipment price from the quote and you get what you are paying for labor, materials, overhead and profit. That number is supposed to be large: installation is skilled work. The question is whether it is two or three times what the benchmark implies. The ${auditLink} does this subtraction for you.</p>

<h3>7. Mystery line items</h3>
<p>"System optimization package," "comfort upgrade," "refrigerant compliance fee." Some are real work, many are not. Ask what each one is, in writing, and whether it is required by code.</p>

<h3>8. Financing that hides the price</h3>
<p>Monthly-payment quotes make the total disappear. Promotional financing is often paid for through a higher cash price. Always get the cash price first, then decide how to pay.</p>

<h3>9. A quote that is suspiciously low</h3>
<p>Below-benchmark quotes are not always good news. Check that the permit, a new matched coil, refrigerant, haul-away and labor warranty are included, and that the model numbers are what you expect. A cheap install of a good unit can perform worse than a careful install of a basic one.</p>

<h2>What a fair quote looks like</h2>
<p>A fair quote names every model number, shows the tonnage and how it was calculated, lists what is included, and lands near the benchmark midpoint for your area. Difficult attics, crane lifts and real ductwork repairs push it up legitimately, as separate lines.</p>

<h2>How to push back</h2>
<p>Get at least two more quotes, ideally including one from an independent, owner-operated company. Show each contractor the others' model numbers so you are comparing like for like. If a quote grades C or worse in our auditor, ask the contractor to walk through the labor and materials line by line. Many will sharpen the price once they know you have checked. If they will not, you can <a href="/auditor/#audit">request a second opinion</a> from a vetted independent master tech through TonnageCheck.</p>

<h2>Quick checklist</h2>
<ul>
<li>Outdoor, indoor and furnace model numbers on paper</li>
<li>Tonnage, with a Manual J load calculation</li>
<li>AHRI certificate number for the exact pair</li>
<li>Cash price, separate from financing</li>
<li>Ductwork, electrical and line set as separate lines</li>
<li>Permit, haul-away and labor warranty included</li>
<li>No 25C tax credit subtracted for a 2026 install</li>
</ul>`;
    },
  },
  {
    slug: '3-ton-vs-4-ton-heat-pump-cost',
    get title() { return `${usd(equipmentStats('central-heat-pump', 3).min)} Equip vs ${fmtRange(fairRange('central-heat-pump', 3))} Installed: 3T vs 4T Cost`; },
    h1: '3-ton vs 4-ton heat pump: what the extra ton costs',
    get description() { return `Side-by-side 3-ton (${usd(equipmentStats('central-heat-pump', 3).min)}+ equip, ${fmtRange(fairRange('central-heat-pump', 3))} installed) and 4-ton (${fmtRange(fairRange('central-heat-pump', 4))} installed) heat pump costs.`; },
    updated: today,
    body: () => {
      const e3 = equipmentStats('central-heat-pump', 3);
      const e4 = equipmentStats('central-heat-pump', 4);
      const s3 = fairRange('central-heat-pump', 3, 'standard');
      const s4 = fairRange('central-heat-pump', 4, 'standard');
      const h3 = fairRange('central-heat-pump', 3, 'high');
      const h4 = fairRange('central-heat-pump', 4, 'high');
      const c3 = equipmentStats('heat-pump-only', 3);
      const c4 = equipmentStats('heat-pump-only', 4);
      const pairs = ['Goodman', 'Trane', 'LG'].map((b) => {
        const x3 = SYSTEMS.filter((s) => s.systemType === 'central-heat-pump' && s.brand === b && s.tons === 3).sort((x, y) => lowestPrice(x) - lowestPrice(y))[0];
        const x4 = SYSTEMS.filter((s) => s.systemType === 'central-heat-pump' && s.brand === b && s.tons === 4).sort((x, y) => lowestPrice(x) - lowestPrice(y))[0];
        return x3 && x4 ? { b, x3, x4 } : null;
      }).filter(Boolean) as { b: string; x3: (typeof SYSTEMS)[number]; x4: (typeof SYSTEMS)[number] }[];
      return `
<p>The jump from 3 tons (36,000 BTU/h) to 4 tons (48,000 BTU/h) is one of the most common upsells in residential HVAC, and one of the easiest to get wrong in either direction. Here is what the extra ton actually costs, using real listed prices and the Department of Energy's installed-cost benchmarks, and how to know which one your house needs.</p>

<h2>Equipment: what the boxes list for</h2>
<p>Across the ducted heat pump systems in our data (outdoor unit plus matched air handler, captured ${seedDateLabel}):</p>
<ul>
<li><b>3-ton:</b> ${e3.count} systems listed from ${usd(e3.min)} to ${usd(e3.max)}, median ${usd(e3.median)}.</li>
<li><b>4-ton:</b> ${e4.count} systems listed from ${usd(e4.min)} to ${usd(e4.max)}, median ${usd(e4.median)}.</li>
</ul>
${pairs.length ? `<p>Within the same brand and product line the step is clearer:</p>
<div class="tablewrap"><table><thead><tr><th>Brand</th><th class="r">3-ton</th><th class="r">4-ton</th><th class="r">Difference</th></tr></thead><tbody>
${pairs.map((p) => `<tr><td>${p.b}</td><td class="r num"><a href="/systems/${p.x3.slug}/">${usd(lowestPrice(p.x3))}</a> <span class="small muted">${p.x3.specs.seer2} SEER2</span></td><td class="r num"><a href="/systems/${p.x4.slug}/">${usd(lowestPrice(p.x4))}</a> <span class="small muted">${p.x4.specs.seer2} SEER2</span></td><td class="r num">${usd(lowestPrice(p.x4) - lowestPrice(p.x3))}</td></tr>`).join('')}
</tbody></table></div>
<p class="small muted">Lowest listed price per brand and size in our data; efficiency differs between some pairs, which explains part of the gap.</p>` : ''}
${c3.count && c4.count ? `<p>If only the outdoor condenser is being replaced, the Goodman heat pump condensers in our data list at ${usd(c3.min)} for 3 tons and ${usd(c4.min)} for 4 tons.</p>` : ''}

<h2>Installed: the DOE-lab benchmark</h2>
<p>The ${a(SOURCES.remdb.url, 'REMDB')} cost model from the National Laboratory of the Rockies (formerly NREL) scales installed cost with both capacity and efficiency. Restated from 2023 dollars into today's using CPI-U (×${cpi.factor}):</p>
<div class="tablewrap"><table><thead><tr><th>Installed, replacement</th><th class="r">3-ton</th><th class="r">4-ton</th><th class="r">Midpoint difference</th></tr></thead><tbody>
<tr><td>Standard efficiency</td><td class="r num">${fmtRange(s3)}</td><td class="r num">${fmtRange(s4)}</td><td class="r num">${usd(s4.mid - s3.mid)}</td></tr>
<tr><td>High efficiency / cold climate</td><td class="r num">${fmtRange(h3)}</td><td class="r num">${fmtRange(h4)}</td><td class="r num">${usd(h4.mid - h3.mid)}</td></tr>
</tbody></table></div>
<p>These are estimates, not quotes: national averages for a like-for-like replacement without new ductwork or a panel upgrade. Labor barely changes between 3 and 4 tons, since it is the same crew and roughly the same day, so most of the difference is equipment and materials. If a contractor's 4-ton price is far more than these gaps above their 3-ton price, ask why.</p>

<h2>Which size does your house actually need?</h2>
<p>The honest answer is a load calculation, not a rule of thumb. ACCA Manual J accounts for square footage, insulation, window area and orientation, air leakage, duct location and your local design temperatures. Two 2,000 sq ft houses in the same city can legitimately need different sizes.</p>
<p>Why it matters for a heat pump in particular:</p>
<ul>
<li><b>Oversizing</b> costs more up front, short-cycles (frequent on/off), removes less humidity in summer and can be noisier. Variable-speed inverter units tolerate some oversizing better because they throttle down, but they still cost more to buy.</li>
<li><b>Undersizing</b> for heating means more hours on backup electric resistance heat in cold weather, which is expensive to run. In cold climates the right answer is often a heat pump sized for the heating load with good low-temperature capacity, which is what ENERGY STAR's ${a(SOURCES.esCriteria.url, 'cold-climate criteria')} (COP of at least 1.75 at 5°F) are about.</li>
</ul>
<p>Look at the heating capacity at 5°F, not just the nameplate tonnage. Our system pages show it for every ENERGY STAR-matched unit. Some 3-ton cold-climate units hold most of their capacity at 5°F, while some 4-ton standard units lose a large share of theirs.</p>

<h2>Signs the extra ton is an upsell</h2>
<ul>
<li>The quote moved up a size with no load calculation and no change to the house.</li>
<li>The justification is "bigger is safer" or "you'll never be hot again."</li>
<li>The larger size also triggers a duct "upgrade" that was not discussed before.</li>
<li>The contractor cannot tell you the design heating and cooling loads in BTU/h.</li>
</ul>

<h2>Signs you genuinely need 4 tons</h2>
<ul>
<li>A Manual J shows a design load above what the 3-ton unit delivers at your design temperatures.</li>
<li>You added square footage, finished a basement or attic, or have large west-facing glass.</li>
<li>You are replacing a gas furnace with a heat pump in a cold climate and the heating load, not cooling, sets the size.</li>
</ul>

<h2>Bottom line</h2>
<p>Expect the equipment for a 4-ton system to cost somewhat more than a comparable 3-ton, and the installed benchmark to rise by roughly the midpoint difference shown above. Get the load calculation, compare like-for-like model numbers, and run both sizes through the ${auditLink} to see whether the quote's size step is priced fairly. Size pages: <a href="/tonnage/3-ton/">3-ton</a>, <a href="/tonnage/4-ton/">4-ton</a>.</p>`;
    },
  },
  {
    slug: 'wholesale-hvac-equipment-cost-vs-installed-price',
    get title() { return `${usd(equipmentStats('central-heat-pump', 3).min)} Equip vs ${fmtRange(fairRange('central-heat-pump', 3))} Installed: Equip vs Labor`; },
    h1: 'HVAC equipment cost vs installed price: where your money goes',
    get description() { return `How much of an HVAC quote is equipment (${usd(equipmentStats('central-heat-pump', 3).min)}–${usd(equipmentStats('central-heat-pump', 3).max)} at 3 tons) vs labor and margin (${fmtRange(fairRange('central-heat-pump', 3))} installed).`; },
    updated: today,
    body: () => {
      const sizes = [2, 3, 4, 5];
      const rows = sizes.map((t) => ({ t, e: equipmentStats('central-heat-pump', t), f: fairRange('central-heat-pump', t, 'standard') })).filter((r) => r.e.count);
      const r3 = rows.find((r) => r.t === 3);
      return `
<p>When a homeowner sees a five-figure HVAC quote and then finds the same outdoor unit online for a fraction of that, the natural reaction is outrage. Sometimes it is justified. Often the gap is real work and real business costs. This guide shows how big the gap typically is, what legitimately fills it, and how to spot when it has been stuffed.</p>

<h2>The equipment number</h2>
<p>Residential equipment is sold through two channels. Contractors buy from distributors at negotiated prices that are not published. Homeowners and DIY installers can buy from online retailers such as HVACDirect and Alpine Home Air, whose prices are public. TonnageCheck uses those public listings because they are verifiable: every price links to its listing and was captured on a known date (${seedDateLabel} for the current data). Treat them as a ceiling on what the contractor paid for the boxes, since a contractor buying in volume usually pays less, not more.</p>

<h2>The installed number</h2>
<p>For installed cost we use the ${a(SOURCES.remdb.url, 'National Residential Efficiency Measures Database (REMDB)')} from the National Laboratory of the Rockies (formerly NREL). Its heat pump and AC models are regressions on real project costs compiled by Lawrence Berkeley National Laboratory, much of it from incentive programs in California and Massachusetts, normalized to national-average labor rates. REMDB publishes 2023 dollars; we multiply by ${cpi.factor} using CPI-U from ${a(SOURCES.fredCpi.url, 'FRED')}. REMDB's own notes say it assumes installation costs about 1.5 times the retail equipment cost, and that some Massachusetts program data suggest the ratio "may be as high as 2" in some markets.</p>

<h2>The gap, by size</h2>
<div class="tablewrap"><table><thead><tr><th>Ducted heat pump, standard efficiency</th><th class="r">Median listed equipment</th><th class="r">Installed benchmark (mid)</th><th class="r">Everything else</th><th class="r">Equipment share</th></tr></thead><tbody>
${rows.map((r) => `<tr><td><a href="/tonnage/${String(r.t).replace('.', '-')}-ton/">${r.t} ton</a> <span class="small muted">(${r.e.count} listed)</span></td><td class="r num">${usd(r.e.median)}</td><td class="r num">${usd(r.f.mid)}</td><td class="r num">${usd(r.f.mid - (r.e.median ?? 0))}</td><td class="r num">${Math.round(((r.e.median ?? 0) / r.f.mid) * 100)}%</td></tr>`).join('')}
</tbody></table></div>
<p class="small muted">Equipment medians mix efficiency levels and brands, and the installed benchmark is a national average and an estimate. Read the share as a rough guide, not a rule.</p>
${r3 ? `<p>At 3 tons, then, roughly ${usd(r3.f.mid - (r3.e.median ?? 0))} of a benchmark-priced install is not equipment. That is the money that pays for the work below.</p>` : ''}

<h2>What legitimately fills the gap</h2>
<ul>
<li><b>Labor.</b> A replacement is usually a two-person crew for one to two days: recover refrigerant from the old system, remove and dispose of it, set the new pad and unit, braze the line set, pressure-test with nitrogen, pull a deep vacuum, charge and commission the system, wire the disconnect and thermostat, and adjust airflow.</li>
<li><b>Materials.</b> Line set or line-set flush, pad, disconnect, whip, condensate line and pump, refrigerant, fittings, filter base, transition plenums. Individually small, together real.</li>
<li><b>Permit and inspection.</b> Varies widely by city.</li>
<li><b>Overhead.</b> Trucks, insurance, licensing, training, warranty callbacks, office staff, marketing. A company with a large call center and TV ads has more of this to recover.</li>
<li><b>Profit.</b> A healthy contractor needs margin to stay in business and honor a labor warranty.</li>
</ul>

<h2>What should not be in the gap</h2>
<ul>
<li><b>Sales commission dressed up as "design."</b> Commissioned comfort advisors are paid on the size of the ticket.</li>
<li><b>Upsized equipment.</b> One extra ton you did not need adds equipment cost and often triggers duct work. See <a href="/guides/3-ton-vs-4-ton-heat-pump-cost/">3-ton vs 4-ton</a>.</li>
<li><b>Bundled accessories at retail-plus.</b> Air purifiers, UV lights and premium thermostats added at several times their price.</li>
<li><b>Financing cost hidden in the cash price.</b></li>
<li><b>Credits you will not get.</b> Subtracting a 25C tax credit for a 2026 install makes a high price look reasonable. The IRS ${a(SOURCES.irsObbba.url, 'ended 25C')} for property placed in service after Dec. 31, 2025.</li>
</ul>

<h2>Why you usually shouldn't buy the equipment yourself</h2>
<p>Seeing the listed price, some homeowners buy the equipment and look for someone to install it. That can work with DIY-oriented mini-splits designed for it, but for split systems it usually backfires: many manufacturers limit warranty coverage when the equipment is not installed by a licensed contractor, many contractors will not install customer-supplied equipment or will charge more and warranty nothing, and refrigerant work requires EPA Section 608 certification. Check the manufacturer's warranty terms before you go this route. Use the listed price as negotiating information, not necessarily as a shopping list.</p>

<h2>Using this to negotiate</h2>
<ol>
<li>Get the exact model numbers on every quote.</li>
<li>Look them up (our <a href="/systems/">equipment price lookup</a> covers common systems) to anchor the equipment value.</li>
<li>Run the quote through the ${auditLink}. It subtracts the equipment, compares the rest with the benchmark, and grades the quote.</li>
<li>If the non-equipment portion is far above the benchmark, ask for an itemized breakdown of labor and materials. A contractor who can explain the number deserves your business more than one who cannot.</li>
</ol>`;
    },
  },
  {
    slug: 'independent-hvac-tech-vs-big-company',
    // GSC: impressions for "private equity acquisition" / "backed by private equity" company queries.
    get title() { return `Independent HVAC Tech vs PE-Backed Co: ${fmtRange(fairRange('central-heat-pump', 3))}`; },
    h1: 'Independent HVAC tech vs big HVAC company',
    get description() { return `Many local HVAC brands are now owned by private equity. Compare independent techs vs big companies on ${fmtRange(fairRange('central-heat-pump', 3))} 3-ton quotes, warranties and vetting.`; },
    updated: today,
    related: { tons: [3], systems: { type: 'central-heat-pump', tons: 3 } },
    body: () => {
      const f = fairRange('central-heat-pump', 3, 'standard');
      return `
<p>Ask three neighbors who replaced their heat pump last year and you may hear three prices that differ by thousands of dollars for similar equipment. A big part of that spread is not the equipment. It is who you hired and how they sell. This guide compares small independent contractors with large companies, including the regional brands that have been bought up and combined by investment firms, and gives you a way to vet either.</p>

<h2>Who is who</h2>
<p><b>Independent, owner-operated contractors</b> typically run one to five trucks. The owner is often a licensed master technician who still diagnoses, sells and sometimes installs. Marketing is mostly referrals and reviews.</p>
<p><b>Large companies</b> run many trucks, a call center, a sales team and heavy advertising. In recent years many well-known local brands have been acquired by larger platforms, often backed by private equity, that keep the local name and phone number. You may not be able to tell from the truck who owns the company.</p>
<p>Neither model is automatically good or bad. There are excellent large companies and careless small ones. The differences are in incentives.</p>

<h2>How the sales process differs</h2>
<p>At many large companies the person who comes to your house is a salesperson, often titled a comfort advisor or home energy consultant, who is paid partly on commission. Their training is in presenting options and closing on the visit. Common features: tiered good-better-best menus, monthly-payment framing, same-day discounts, and add-on accessories.</p>
<p>At a small shop, the person quoting you is more often the person responsible for the install going well. Quotes tend to be simpler, sometimes too simple: a single price on letterhead without model numbers. The fix is the same for both: insist on model numbers, tonnage with a load calculation, and an itemized scope.</p>

<h2>Price</h2>
<p>Companies with call centers, sales staff, advertising and investor returns to fund carry more overhead per job, and it has to come out of the price. That is not a scandal; it is arithmetic. What matters to you is whether the quote is in a reasonable range. For a standard-efficiency 3-ton heat pump replacement, the DOE-lab ${a(SOURCES.remdb.url, 'REMDB')} benchmark is ${fmtRange(f)} installed, midpoint ${usd(f.mid)} (national average, estimate, today's dollars). A quote well above the top of that range for a simple like-for-like swap deserves a second opinion, whoever wrote it.</p>

<h2>Warranty and accountability</h2>
<p>Equipment warranties come from the manufacturer and are usually the same whoever installs, provided the product is registered on time and installed by a licensed contractor. Labor warranties come from the contractor and vary a lot.</p>
<ul>
<li><b>Large companies</b> often advertise long labor warranties and have the staff to honor them. Ask what happens if the company is sold, which happens.</li>
<li><b>Small companies</b> may offer shorter written labor warranties, but the owner's reputation is on the line with every job. Ask how long they have been in business and how callbacks are handled.</li>
</ul>
<p>Either way, the most important warranty is a good install: correct sizing, a clean brazed line set, a proper vacuum and correct charge, and verified airflow. Ask how the installer verifies charge and airflow at commissioning, and whether you get the readings.</p>

<h2>How to vet any contractor</h2>
<ol>
<li><b>License and insurance.</b> Check your state licensing board. Ask for proof of liability and workers' comp insurance.</li>
<li><b>Load calculation.</b> Ask whether they do a Manual J. A contractor who sizes by the old unit is guessing.</li>
<li><b>Model numbers and AHRI certificate.</b> Every quote should name the exact outdoor and indoor models, and the AHRI certificate should match. See <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">how to check it</a>.</li>
<li><b>Permit.</b> Ask who pulls the permit. Skipping it is a red flag.</li>
<li><b>Commissioning.</b> Ask what measurements they record at startup.</li>
<li><b>Who does the work.</b> Employees or subcontractors? Who supervises?</li>
<li><b>Reviews with detail.</b> Look for reviews that mention callbacks and how they were handled, not just the sales visit.</li>
</ol>

<h2>When a big company makes sense</h2>
<ul>
<li>You need same-day emergency service in peak season and smaller shops are booked out.</li>
<li>The job is complex (zoning, multiple systems, commercial-grade work) and needs a larger crew.</li>
<li>You value a long written labor warranty backed by a larger balance sheet, and the price is still within the benchmark.</li>
</ul>

<h2>When an independent makes sense</h2>
<ul>
<li>You want to talk to the person who will stand behind the install.</li>
<li>The job is a straightforward replacement where overhead, not complexity, is driving the price.</li>
<li>You got a high-pressure sales visit and want a quote without the sales process.</li>
</ul>

<h2>Get a second quote the easy way</h2>
<p>Run your existing quote through the ${auditLink} first, so you know where it stands. If it grades poorly, request a second opinion: we pass your request to an independent, owner-operated company serving your ZIP. Independent techs who want to receive these requests can <a href="/partners/">apply here</a>.</p>`;
    },
  },
  {
    slug: 'heat-pump-rebates-and-ahri-certificate-check',
    // GSC: first site click; query "ahri tax credit".
    get title() { const s = equipmentStats('central-heat-pump', 3); return `AHRI Tax Credit Check: ${usd(s.min)}–${usd(s.max)} Heat Pumps`; },
    h1: 'Heat pump rebates after 25C, and how to check the AHRI certificate',
    get description() { return `The 25C heat pump tax credit ended after 2025. See which HEAR and utility rebates still apply and how to match the AHRI certificate to the models on a quote.`; },
    updated: today,
    related: { tons: [2, 3, 4], systems: { type: 'central-heat-pump', energyStar: true, coldClimate: true } },
    body: () => {
      const ex = SYSTEMS.find((s) => s.energyStar?.coldClimate && s.energyStar.ahriReferenceNumber && s.systemType === 'central-heat-pump');
      const esCount = SYSTEMS.filter((s) => s.energyStar).length;
      return `
<p>For a few years, heat pump buyers could count on a federal tax credit. That changed, and plenty of quotes have not caught up. Here is what is and is not available for a heat pump installed now, with links to the primary sources, plus a step-by-step check of the AHRI certificate, the document that decides whether your system is rated what the quote says and whether it qualifies for rebates.</p>

<h2>The federal 25C tax credit: ended</h2>
<p>The Energy Efficient Home Improvement Credit (Section 25C) paid up to $2,000 a year for a qualifying heat pump (${a(SOURCES.irs25c.url, 'IRS')}). The One Big Beautiful Bill Act ended it early. The IRS now lists 25C as ${a(SOURCES.irsObbba.url, '"Not allowed for any property placed in service after Dec. 31, 2025"')}. The date that matters is when the system was installed and working, not when you paid. A heat pump installed in 2026 does not qualify. If a quote subtracts a federal tax credit, ask the contractor to remove it and re-total.</p>

<h2>HEAR / HEEHR rebates: income-qualified, state-run</h2>
<p>The Inflation Reduction Act also created point-of-sale rebates for electrification, called HEAR or HEEHR (Section 50122). Under the statute (${a(SOURCES.hearStatute.url, '42 U.S.C. § 18795a')}):</p>
<ul>
<li>A heat pump for space heating or cooling can receive up to <b>$8,000</b>.</li>
<li>Total rebates are capped at <b>$14,000</b>.</li>
<li>Households under <b>80%</b> of area median income can be covered for up to <b>100%</b> of project cost; households from <b>80% to 150%</b> for up to <b>50%</b>.</li>
<li>Households above 150% of area median income are not eligible.</li>
</ul>
<p><b>Important 2026 change:</b> DOE Program Notice 26-2 (${a(SOURCES.doePn262.url, 'May 2026')}) removed fuel switching from the program. Rebates now cover upgrading existing electric equipment, such as electric resistance heat or an old heat pump, to more efficient electric equipment, not replacing a gas, oil or propane furnace. Homes must also address insulation and air sealing first unless they already meet the state's level. Launched state programs were given three months to adopt the change. See <a href="/states/">your state's page</a> for its energy office.</p>
<p>The program is administered by state energy offices, and each state decides how and when to run it, which measures to cover and which contractors may participate. The ${a(SOURCES.doeRebates.url, 'DOE program page')} tells homeowners to contact their state energy office for status. Find yours in the ${a(SOURCES.naseo.url, 'NASEO directory')}. Do not count on a HEAR rebate until your state program has confirmed your eligibility in writing; in many states it must be applied at the point of sale through a participating contractor.</p>

<h2>Utility and state rebates</h2>
<p>Many electric utilities and some states run their own heat pump rebates, separate from HEAR. They often require ENERGY STAR certified or cold-climate equipment and sometimes a participating contractor or pre-approval. Search by ZIP in the ${a(SOURCES.esRebateFinder.url, 'ENERGY STAR Rebate Finder')} and ${a(SOURCES.dsire.url, 'DSIRE')}. Read the terms before you sign: some programs cannot be combined with others, and some must be reserved before installation.</p>

<h2>Why the AHRI certificate matters</h2>
<p>A split heat pump's efficiency rating (SEER2 for cooling, HSPF2 for heating, EER2 at peak heat) belongs to a specific combination of outdoor unit and indoor coil or air handler, tested and listed by the Air-Conditioning, Heating, and Refrigeration Institute. Change the indoor unit and the rating can change. Rebate programs and ENERGY STAR certification are tied to that certified combination, usually identified by an <b>AHRI reference number</b>.</p>
<p>ENERGY STAR's ${a(SOURCES.esCriteria.url, 'key product criteria')} for split-system heat pumps are at least 7.8 HSPF2, 15.2 SEER2 and 11.0 EER2. The cold-climate designation for ducted systems requires at least 8.1 HSPF2, plus a COP of at least 1.75 at 5°F and at least 70% of rated heating capacity at 5°F.</p>

<h2>How to check the AHRI certificate, step by step</h2>
<ol>
<li><b>Get the model numbers</b> of the outdoor unit and the indoor coil or air handler (and furnace for a dual-fuel system) from the quote.</li>
<li><b>Ask the contractor for the AHRI certificate</b> or reference number for that exact combination. Any contractor quoting a rebate-eligible system should be able to produce it in minutes.</li>
<li><b>Look it up yourself</b> in the ${a(SOURCES.ahri.url, 'AHRI Directory')}. Search by reference number or by the outdoor model, then confirm the indoor model on the certificate matches the quote, not a different coil.</li>
<li><b>Check ENERGY STAR status</b> in the ${a(SOURCES.esApi.url, 'ENERGY STAR heat pump database')}, which lists the AHRI reference number for each certified pairing. Our system pages link the exact ENERGY STAR record for ${esCount} of the systems we track.</li>
<li><b>Compare the ratings</b> on the certificate (SEER2, EER2, HSPF2) with what the quote or brochure claims.</li>
<li><b>Keep a copy</b> with your paperwork. Rebate applications usually ask for it.</li>
</ol>
${ex ? `<p><b>Example from our data:</b> the <a href="/systems/${ex.slug}/">${ex.brand} ${ex.tons}-ton system</a> pairs outdoor unit <span class="num">${ex.energyStar!.outdoorModel}</span> with indoor unit <span class="num">${ex.energyStar!.indoorModel}</span>. Its ENERGY STAR record lists AHRI reference <span class="num">${ex.energyStar!.ahriReferenceNumber}</span> at ${ex.energyStar!.seer2} SEER2, ${ex.energyStar!.eer2} EER2 and ${ex.energyStar!.hspf2} HSPF2, with a COP of ${ex.energyStar!.copAt5F} at 5°F, and it is designated cold climate. Pair the same outdoor unit with a different coil and those numbers no longer apply.</p>` : ''}

<h2>Common certificate problems in quotes</h2>
<ul>
<li><b>Mismatched coil.</b> The quote names a premium outdoor unit but a cheaper or existing indoor coil. The certified rating may not apply.</li>
<li><b>Outdoor-only replacement.</b> Replacing just the condenser and keeping an old coil rarely produces a certified match, especially across a refrigerant change.</li>
<li><b>"Up to" ratings.</b> Brochures quote the best pairing in a product line. Your pairing may be lower.</li>
<li><b>Rebate promised, certificate missing.</b> No certificate, no rebate. Ask before you sign, not after.</li>
</ul>

<h2>Putting it together</h2>
<p>For a heat pump installed now, assume no federal tax credit, check HEAR eligibility with your state energy office if your household income is under 150% of area median and you are replacing existing electric heating or cooling (not a gas, oil or propane furnace), look for utility rebates by ZIP, and make the contractor show the AHRI certificate for the exact pairing on the quote. Then run the price through the ${auditLink}, which also lists the rebate links for your ZIP.</p>`;
    },
  },
];
