// Sales tactics, warranties, permits, duct/return sizing, and independent installer guides (#15–#20 from Issue #4).
// Every dollar figure is computed from src/lib/facts.ts or src/data/equipment.ts; non-price claims cite src/data/sources.ts.
import { lowestPrice, median, TONNAGES } from '../equipment';
import { BRANDS } from '../brands';
import { fairRange, systemsWhere, equipmentStats, adderRange, newCircuitAdder, lineSet, usd, fmtRange, pct } from '../../lib/facts';
import { today, src, tonLink, brandLink, sysLink, auditLink, asOf, systemsTable, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

export const SALES_TACTICS_GUIDES: Guide[] = [
  {
    slug: 'hvac-financing-zero-apr-dealer-fee-buydown-markup',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: 0% APR Dealer Fee`;
    },
    h1: 'HVAC "0% APR" financing & dealer fee buy-downs: why your cash quote is inflated',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `How 0% APR promotional HVAC financing hides dealer buy-down fees inside ${fmtRange(f)} 3-ton quotes (${usd(s.min)}–${usd(s.max)} equipment)—and CFPB deferred-interest traps.`;
    },
    updated: today,
    related: { tons: [3, 4, 5], brands: ['Goodman', 'Trane', 'Bosch', 'Carrier'], systems: { type: 'central-heat-pump', tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      const nonEquipShare = 1 - s3.median! / f3.mid;
      return `
<p>When an HVAC sales representative sits at your kitchen table and leads with a monthly payment—"Just $199 a month with 0% APR for 60 months!"—two things are almost always happening behind the scenes. First, the third-party lender charges the contractor a merchant "dealer fee" (a buy-down discount deducted from the loan payout) to subsidize that 0% rate, and the contractor builds that fee straight into the sticker price of your system. Second, many "no interest" promotions are actually deferred-interest credit cards that retroactively bill accrued interest if a single dollar remains at the deadline (${src('cfpbDeferredInterest', 'CFPB: Deferred interest promotions')}). Here is how to strip financing padding out of your quote using live equipment and installed benchmarks (${asOf}).</p>

<h2>Start with the unfinanced equipment and installed benchmark (${asOf})</h2>
<p>Before discussing monthly payments, anchor the conversation on what the physical equipment lists for at public retailers and what the U.S. Department of Energy's ${src('remdb', 'REMDB')} database shows for an unfinanced installation:</p>
<div class="tablewrap"><table><thead><tr><th>System size</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th><th class="r">Equipment share at midpoint</th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton central heat pump')} (${s3.count} systems)</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td><td class="r num">${pct(s3.median! / f3.mid)} equip / ${pct(nonEquipShare)} labor &amp; overhead</td></tr>
<tr><td>${tonLink(4, '4-ton central heat pump')}</td><td class="r num">${usd(equipmentStats('central-heat-pump', 4).min)}–${usd(equipmentStats('central-heat-pump', 4).max)}</td><td class="r num">${fmtRange(f4)} (mid ${usd(f4.mid)})</td><td class="r num">${pct(equipmentStats('central-heat-pump', 4).median! / f4.mid)} equip</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>How dealer fee buy-downs inflate even the "cash" price</h2>
<p>In residential home improvement lending, banks do not lend money for 36 to 60 months at 0% APR for free. Instead, the finance company deducts a merchant discount fee from the check it sends the HVAC contractor. Because Truth in Lending rules prohibit adding an undisclosed finance surcharge on top of the cash price after the fact, flat-rate price books solve this by embedding the highest promotional dealer fee into the <b>standard list price</b> presented to every homeowner.</p>
<ul>
<li>If you pay by check or ACH without asking for an unbundled cash/check discount, you are often paying the built-in promotional financing buy-down fee even though you never used the lender.</li>
<li>If a contractor quotes near or above the 80th percentile (${usd(f3.high)} at 3 tons, ${usd(f4.high)} at 4 tons) while heavily promoting "0% interest," ask explicitly: <b>"What is the ACH / check price if we do not use your promotional financing provider?"</b></li>
</ul>

<h2>Deferred interest ("no interest if paid in full") vs true 0% APR</h2>
<p>The Consumer Financial Protection Bureau warns consumers to distinguish between two very different promotions (${src('cfpbDeferredInterest', 'CFPB guide to deferred interest')}):</p>
<ol>
<li><b>True 0% APR installment loan:</b> Interest is genuinely 0% during the promotional term, and equal monthly payments retire the principal on schedule. (The cost is hidden upfront in the contractor's dealer fee buy-down.)</li>
<li><b>Deferred interest ("No interest if paid in full in 12 / 18 / 24 months"):</b> Interest accrues in the background from day one at a high credit-card rate. If you pay off the entire balance before the promotional expiration date, the accrued interest is waived. If you owe even $1 after the expiration date—or miss a minimum payment rules check—all retroactive interest from the original purchase date is added to your balance at once (${src('cfpbDeferredInterest', 'CFPB')}). Worse, the minimum monthly payment required on the statement is often too small to pay off the balance before the deadline.</li>
</ol>

<h2>Better ways to pay or finance an HVAC replacement</h2>
<ul>
<li><b>Get the cash/check bottom line from an independent contractor first:</b> An independent mechanic quoting near the lower half of the ${fmtRange(f3)} 3-ton benchmark on ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, or ${brandLink('Carrier')} hardware often saves more upfront than any subsidized 0% loan saves in interest. See <a href="/guides/independent-hvac-tech-vs-big-company/">independent HVAC tech vs big company</a>.</li>
<li><b>Check state and utility on-bill or low-interest energy loans:</b> Many state energy offices (${src('naseo', 'NASEO directory')}) and utilities tracked in ${src('dsire', 'DSIRE')} offer genuine low-interest energy efficiency loans without hidden contractor buy-down fees.</li>
<li><b>Audit the total contract price, never the monthly payment:</b> Always multiply the monthly payment by the number of months (plus any down payment or origination fee), compare against 3-ton equipment starting at ${sysLink(cheapest(s3.systems))} (${usd(s3.min)}), and enter that total into the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')}.</li>
</ul>`;
    },
  },
  {
    slug: 'today-only-hvac-discount-tactic-how-to-counter-offer',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Counter-Offers`;
    },
    h1: 'The "today-only / call the manager" HVAC discount tactic & how to counter-offer with wholesale numbers',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `How to counter today-only HVAC sales pressure using ${usd(s.min)}–${usd(s.max)} 3-ton equipment prices, ${fmtRange(f)} DOE benchmarks, and the 3-day FTC Cooling-Off Rule.`;
    },
    updated: today,
    related: { tons: [2.5, 3, 4], brands: ['Goodman', 'Trane', 'Bosch', 'LG'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      const f3h = fairRange('central-heat-pump', 3, 'high');
      const top3 = systemsWhere({ type: 'central-heat-pump', tons: 3 }).slice(0, 6);
      return `
<p>If an in-home comfort advisor presents a high HVAC replacement quote, then offers to "call the installation manager to see if we have an open crew slot tomorrow" or drops a "today-only model-home / fleet discount" provided you sign before they walk out the driveway, you are looking at a classic high-anchor close. The goal of a "today-only" drop is simple: prevent you from getting second and third bids or looking up what the equipment actually costs. Here is how to disarm that tactic using live equipment data (${asOf}), DOE installation benchmarks, and federal consumer law.</p>

<h2>Step 1: Know the real numbers before you counter-offer</h2>
<p>In our live ${tonLink(3, '3-ton ducted heat pump')} catalog (${asOf}), complete matched outdoor and indoor systems list from <b>${usd(s3.min)} to ${usd(s3.max)}</b> (median <b>${usd(s3.median)}</b>), while the U.S. Department of Energy's ${src('remdb', 'REMDB')} installed benchmark spans <b>${fmtRange(f3)}</b> (midpoint <b>${usd(f3.mid)}</b>) for standard efficiency and <b>${fmtRange(f3h)}</b> (midpoint <b>${usd(f3h.mid)}</b>) for high efficiency:</p>
${systemsTable(top3)}
<p class="small muted">${remdbNote}</p>
<p>When a sales rep starts way above the 80th percentile (${usd(f3.high)} for standard tier, ${usd(f3h.high)} for high tier) and then offers a dramatic "today-only discount" that brings the price down to ${usd(f3.high)}, the discounted price is still at the top of the market.</p>

<h2>Step 2: Your 3-day federal cancellation right (16 CFR Part 429)</h2>
<p>Many homeowners feel trapped after signing a tablet contract at the kitchen table under high-pressure urgency. Under the Federal Trade Commission's <b>Rule Concerning Cooling-Off Period for Sales Made at Homes or at Certain Other Locations</b> (${src('ftcCoolingOff', '16 CFR Part 429')}):</p>
<ul>
<li>You have the legal right to cancel most in-home sales of $25 or more within <b>3 business days</b> (until midnight of the third business day after the sale) for a full refund.</li>
<li>The seller is legally required to give you a written receipt or contract showing the date of the sale and <b>two copies of a Notice of Cancellation form</b> explaining how to cancel (${src('ftcCoolingOff', '16 CFR § 429.1')}).</li>
<li>Be careful with "same-day / next-morning emergency install" pitches: once a crew rips out your old furnace and bolts in new equipment, untangling an emergency waiver becomes much harder, which is why high-pressure shops push next-morning installation slots.</li>
</ul>

<h2>Step 3: How to structure a calm, data-backed counter-offer</h2>
<p>You do not need to argue about a contractor's overhead or profit margin. Instead, use the exact model numbers and DOE benchmarks to send a written email or text counter-offer after the rep leaves:</p>
<ol>
<li><b>Lock down the exact model numbers and AHRI reference number:</b> Ask for the outdoor condenser model, indoor air handler or coil model, and ${src('ahri', 'AHRI')} reference number in writing. Look up the brand on our ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, or ${brandLink('LG')} pages.</li>
<li><b>Separate the base swap from optional add-ons:</b> Strip out bundled UV lights, ionizers, third-party labor plans, and promotional financing dealer fees. See <a href="/guides/uv-light-air-scrubber-ionization-hvac-add-on-cost/">UV and IAQ add-ons</a> and <a href="/guides/hvac-financing-zero-apr-dealer-fee-buydown-markup/">0% APR financing dealer fees</a>.</li>
<li><b>Anchor on the REMDB 20th–50th percentile range:</b> For a straightforward 3-ton heat pump replacement using an existing circuit and ductwork, point out that the listed equipment is ${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)}) and the DOE national-lab benchmark midpoint is ${usd(f3.mid)} (20th percentile ${usd(f3.low)}). State the exact check/ACH price you are willing to pay if they have an open crew day to fill.</li>
</ol>
<p>Run your quote through the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} and read our <a href="/guides/flat-rate-price-books-and-pe-hvac-rollups/">flat-rate price books guide</a> before replying to any "today-only" offer.</p>`;
    },
  },
  {
    slug: 'hvac-labor-warranty-vs-oem-parts-warranty-registration',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: HVAC Warranties`;
    },
    h1: 'HVAC labor warranty vs parts warranty: 10-year OEM registration vs extended labor plans',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `Free 10-year OEM parts registration vs extended labor plans, Magnuson-Moss warranty rules, and auditing ${fmtRange(f)} (${usd(s.min)}+ equip) 3-ton quotes.`;
    },
    updated: today,
    related: { tons: [2, 3, 4], brands: ['Goodman', 'Trane', 'Bosch', 'Mitsubishi', 'LG'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      return `
<p>Every residential HVAC quote mentions a "10-year warranty," which leaves many homeowners shocked when a component fails in year 4 and the contractor presents a large bill. The catch is the split between the <b>manufacturer's parts warranty</b> (which covers the physical compressor, coil, or motor at $0 OEM part cost) and the <b>contractor's or third-party's labor warranty</b> (which covers the mechanic's time, refrigerant, and torch work to install that part). Worse, many contractors use extended labor warranties and mandatory annual maintenance plans to pad a ${rangeText(f3)} replacement quote. Here is how HVAC warranties actually work under federal law and manufacturer rules (${asOf}).</p>

<h2>Equipment cost vs total installed price: what each warranty covers</h2>
<div class="tablewrap"><table><thead><tr><th>Cost component (3-ton heat pump example)</th><th class="r">Dollar range (${asOf})</th><th>Covered by</th></tr></thead><tbody>
<tr><td>Physical equipment (${tonLink(3, `${s3.count} seeded 3-ton heat pumps`)})</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td><b>OEM parts warranty</b> (typically 10 years when registered within 60–90 days; 5 years if unregistered)</td></tr>
<tr><td>Full installed replacement (${src('remdb', 'DOE REMDB')}) <span class="badge b-est">est.</span></td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td><td><b>Installer workmanship / labor warranty</b> (typically 1–2 years included; longer only via extended labor contract)</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Rule 1: The 60-to-90-day OEM registration clock (and why it is free)</h2>
<p>Across major brands in our catalog—including ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, ${brandLink('LG')}, ${brandLink('Daikin')}, ${brandLink('Carrier')}, and ${brandLink('Gree')}—the standard factory parts warranty for an original residential homeowner is <b>10 years on functional parts</b>, provided the system serial numbers (outdoor unit, indoor coil/air handler, and furnace) are registered online within 60 to 90 days of installation. (Some brands or states, such as California and Quebec, prohibit shortening the warranty for non-registration.)</p>
<ul>
<li><b>Registration costs $0 on the manufacturer's website:</b> A good installer registers the serial numbers for you on commissioning day and emails you the PDF certificate. Never pay a "warranty registration fee," and always verify registration yourself using the outdoor and indoor serial numbers before day 60.</li>
<li><b>What OEM parts warranties exclude:</b> Refrigerant (R-410A, R-454B, R-32), nitrogen, brazing rods, filter-driers, maintenance filters, and diagnostic/installation labor.</li>
</ul>

<h2>Rule 2: What federal law (Magnuson-Moss Warranty Act) says about "mandatory maintenance plans"</h2>
<p>Many big HVAC companies tell homeowners: <i>"Your 10-year warranty is void unless you buy our annual maintenance membership every year."</i> It is critical to separate the <b>OEM parts warranty</b> from a <b>dealer labor contract</b>:</p>
<ul>
<li>Under the federal <b>Magnuson-Moss Warranty Act</b> (${src('ftcWarranty', 'FTC: Businessperson\'s Guide to Federal Warranty Law, 15 U.S.C. § 2302')}), a manufacturer generally cannot condition its written product parts warranty on your using a specific company's branded paid service or maintenance club ("tie-in sales" restriction), unless the service is provided free of charge or has an FTC waiver. While neglecting filter changes or physical abuse isn't covered, you do not have to pay one specific dealer's annual membership fee to keep your factory ${brandLink('Goodman')}, ${brandLink('Trane')}, or ${brandLink('Bosch')} parts warranty alive.</li>
<li>By contrast, a <b>5- or 10-year extended labor warranty</b> sold by the installing dealer or a third-party administrator is usually structured as a service contract, which <i>can</i> require documented annual tune-ups by that specific dealer—and if you miss one annual visit by 30 days, the dealer can cancel the labor coverage you already paid for upfront.</li>
</ul>

<h2>How to evaluate an extended labor warranty add-on</h2>
<ol>
<li><b>Ask whether it is backed by a third-party insurer/OEM or only by the local dealer:</b> If a local shop sells an "in-house 10-year labor warranty" and gets bought out or closes in year 4, an in-house promise may not transfer. An OEM-backed or regulated third-party extended service contract stays with the serial number across authorized dealers.</li>
<li><b>Calculate the true cost including required annual tune-ups:</b> If a 10-year labor warranty requires ten annual paid tune-ups with that company (where each visit is also used by commission techs to pitch UV lights or capacitors), add the upfront plan fee plus 10 years of required service fees and compare that against the ${usd(s3.median)} median cost of the entire 3-ton heat pump hardware.</li>
<li><b>Unbundle it from the quote:</b> Subtract any extended labor plan, compare hardware like ${sysLink(cheapest(s3.systems))} (${usd(s3.min)}), and grade the base installation in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')}.</li>
</ol>`;
    },
  },
  {
    slug: 'hvac-permit-inspection-hers-manual-j-testing-fees-on-quote',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Permits/HERS`;
    },
    h1: 'Permit, municipal inspection, HERS & Manual J testing fees on an HVAC quote',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `Audit municipal mechanical/electrical permit fees, HERS duct testing, and Manual J charges on ${fmtRange(f)} 3-ton quotes (${usd(s.min)}–${usd(s.max)} equipment).`;
    },
    updated: today,
    related: { tons: [2.5, 3, 4], brands: ['Goodman', 'Trane', 'Bosch', 'Mitsubishi'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      const f4 = fairRange('central-heat-pump', 4);
      const c = newCircuitAdder();
      return `
<p>Nearly every city and county building department requires a mechanical permit (and often an electrical permit) when replacing a central heat pump, air conditioner, or gas furnace. On HVAC quotes, permits show up in two opposite ways that both hurt homeowners: either an unlicensed or corner-cutting installer skips the permit entirely to shave time, or a large company adds a massive "Code, Permit, Engineering &amp; Compliance Package" line item that is many times the city's published municipal fee schedule. Here is how to verify permit, HERS testing, and Manual J charges against our live benchmarks (${asOf}).</p>

<h2>Benchmark context: what the DOE installed range already includes</h2>
<div class="tablewrap"><table><thead><tr><th>System / Scope</th><th class="r">Listed equipment (${asOf})</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th></tr></thead><tbody>
<tr><td>${tonLink(3, '3-ton central heat pump replacement')}</td><td class="r num">${usd(s3.min)}–${usd(s3.max)} (median ${usd(s3.median)})</td><td class="r num">${fmtRange(f3)} (mid ${usd(f3.mid)})</td></tr>
<tr><td>${tonLink(4, '4-ton central heat pump replacement')}</td><td class="r num">${usd(equipmentStats('central-heat-pump', 4).min)}–${usd(equipmentStats('central-heat-pump', 4).max)}</td><td class="r num">${fmtRange(f4)} (mid ${usd(f4.mid)})</td></tr>
<tr><td>New 240V electrical circuit adder (${src('remdb', 'REMDB')})</td><td class="r num">—</td><td class="r num">${usd(c)}</td></tr>
</tbody></table></div>
<p class="small muted">${remdbNote} Under Rule #1, we do not publish a single national municipal permit dollar figure because every city and county sets its own fee schedule by ordinance.</p>

<h2>How to check your city's exact municipal permit fee in 60 seconds</h2>
<p>Every municipal building department publishes its residential mechanical and electrical permit fee schedule online (either as a flat residential HVAC changeout fee or a small percentage of valuation). To audit a contractor's permit line item:</p>
<ol>
<li><b>Look up your city or county building department's fee schedule PDF:</b> Compare the city's actual mechanical/electrical permit receipt against the contractor's "permit &amp; code administration" charge. A modest administrative charge for filing the application and meeting the municipal inspector is normal; marking up the municipal fee several times over is padding.</li>
<li><b>Require the permit number on your final invoice:</b> Never release the final payment until the permit is pulled in the contractor's license name (never let a contractor ask <i>you</i> to pull a homeowner permit to hide an unlicensed crew) and the municipal inspector signs off.</li>
</ol>

<h2>Why skipping the permit can cost you rebates, insurance, and resale value</h2>
<ul>
<li><b>State and utility rebates require permit and AHRI proof:</b> State energy office programs (${src('doeRebates', 'DOE Home Energy Rebates')}, ${src('naseo', 'NASEO')}) and utility incentives in ${src('dsire', 'DSIRE')} routinely require the closed mechanical permit number, invoice, and ${src('ahri', 'AHRI certificate')} before issuing a rebate check.</li>
<li><b>Third-party HERS / Title 24 / duct leakage verification:</b> In jurisdictions like California (Title 24) and other IECC energy-code states, pulling a mechanical permit for an HVAC changeout triggers mandatory third-party verification by a certified HERS rater (testing duct leakage, airflow CFM per watt, and refrigerant charge). Because the HERS rater is an independent third-party inspector, ask for the HERS rater's fee to be listed transparently on the quote.</li>
</ul>

<h2>Should a Manual J load calculation be a separate fee?</h2>
<p>As explained in our <a href="/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/">Manual J load calculation vs rule-of-thumb sizing guide</a>, ACCA Manual J is required by residential building codes and by ${src('bascColdClimate', 'DOE/PNNL cold-climate sizing guidance')} to select the right tonnage. If you hire an independent energy auditor or HVAC engineer solely to perform a standalone room-by-room Manual J/S/D report so you can solicit apples-to-apples bids, paying for that standalone engineering report is well worth it—and you own the PDF report. If a bidding contractor charges a "design/engineering fee" inside a ${rangeText(f3)} installation quote, require them to hand over the full room-by-room Manual J printout showing your actual window, insulation, and design-temperature inputs before you pay it.</p>
<p>Compare 3-ton hardware starting at ${sysLink(cheapest(s3.systems))} (${usd(s3.min)}), grade your total quote in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')}, and check our ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, and ${brandLink('Mitsubishi')} pages.</p>`;
    },
  },
  {
    slug: 'asbestos-old-flex-duct-removal-and-return-air-drop-sizing',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Return Air Drop`;
    },
    h1: 'Asbestos duct tape, old flex-duct removal & return-air drop sizing (why undersized returns kill ECM blowers)',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `EPA asbestos duct rules, 400 CFM/ton return-air drop sizing for ECM blowers, and auditing duct add-ons on ${fmtRange(f)} (${usd(s.min)}+ equip) 3-ton quotes.`;
    },
    updated: today,
    related: { tons: [3, 3.5, 4, 5], brands: ['Goodman', 'Trane', 'Bosch', 'LG'], systems: { type: 'central-heat-pump', tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const sizes = [2, 2.5, 3, 3.5, 4, 5].map((t) => ({
        t,
        cfm: t * 400,
        fair: fairRange('central-heat-pump', t),
      }));
      const s3 = equipmentStats('central-heat-pump', 3);
      const f3 = fairRange('central-heat-pump', 3);
      return `
<p>Two duct issues come up repeatedly when replacing an older furnace or heat pump: first, the discovery of brittle, sun-rotted 1980s flex duct or suspect white asbestos-containing paper tape on sheet-metal boots; second, a recommendation to enlarge the sheet-metal <b>return-air drop</b> and filter rack next to the indoor unit. While full-house ductwork replacement is often over-sold (see our <a href="/guides/ductwork-replacement-cost-add-on/">ductwork replacement add-on guide</a>), fixing an undersized return-air drop is frequently the single highest-value sheet-metal upgrade you can make to protect a modern heat pump. Here is the airflow math, the EPA asbestos guidance, and how to audit both on a quote (${asOf}).</p>

<h2>Airflow math: why heat pumps need 400 CFM per ton on the return side</h2>
<p>Older gas furnaces could tolerate slightly undersized return drops because combustion heat rises steeply even at lower airflow. Modern high-efficiency heat pumps and ECM (electronically commutated) constant-torque or variable-speed blower motors move roughly <b>400 cubic feet per minute (CFM) per ton</b> of nominal capacity:</p>
<div class="tablewrap"><table><thead><tr><th>System tonnage</th><th class="r">Nominal airflow at 400 CFM/ton</th><th class="r">Heat pump installed benchmark <span class="badge b-est">est.</span></th><th class="r">Listed equipment (${asOf})</th></tr></thead><tbody>
${sizes.map((r) => `<tr><td>${tonLink(r.t, `${r.t} ton`)}</td><td class="r num">${r.cfm.toLocaleString('en-US')} CFM</td><td class="r num">${fmtRange(r.fair)} (mid ${usd(r.fair.mid)})</td><td class="r num">${usd(equipmentStats('central-heat-pump', r.t).min)}–${usd(equipmentStats('central-heat-pump', r.t).max)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>How an undersized return drop and 1-inch filter destroy ECM blower motors</h2>
<p>When a ${tonLink(3, '3-ton')} (1,200 CFM) or ${tonLink(4, '4-ton')} (1,600 CFM) heat pump from ${brandLink('Goodman')}, ${brandLink('Trane')}, ${brandLink('Bosch')}, or ${brandLink('LG')} is bolted onto an old, narrow sheet-metal return drop with a restrictive 1-inch filter slot and a sharp 90-degree square throat, suction static pressure spikes:</p>
<ul>
<li><b>Unlike an old single-speed PSC motor</b> (which simply slows down and moves less air when choked), an <b>ECM blower motor ramps up its RPM and electrical wattage</b> to try to maintain its programmed airflow against the restriction.</li>
<li>Running continuously against excessive Total External Static Pressure (above the 0.50 in. w.c. rating on most residential air handlers) overheats the ECM electronics module, causes loud air-rush noise at the return grilles, and leads to premature blower failure. See <a href="/guides/capacitor-contactor-blower-motor-failure-vs-full-hvac-replacement/">capacitor, contactor, and blower motor failures</a>.</li>
<li><b>What a proper return drop upgrade includes:</b> Replacing the narrow vertical return drop at the air handler with a properly sized sheet-metal drop, a sweeping radius turning-vane elbow (returning air through both sides or the bottom platform of a 4- or 5-ton unit when required by the manual), and a 4- or 5-inch deep-pleat media filter cabinet that drops filter velocity and static pressure.</li>
</ul>

<h2>Old flex duct vs suspect asbestos duct wrap: what the EPA says</h2>
<p>In homes built before the 1980s, grey/white corrugated paper wrap or seam tape on sheet-metal duct boots and furnace plenums may contain chrysotile asbestos. In homes from the 1970s–1990s, uninsulated or degraded inner plastic liners in attic flex duct can crumble and leak attic air.</p>
<ul>
<li><b>Never let an unlicensed HVAC crew dry-scrape or tear out suspect asbestos tape:</b> According to the U.S. Environmental Protection Agency (${src('epaAsbestos', 'EPA: Learn About Asbestos')}), disturbing friable asbestos-containing duct insulation or paper tape releases airborne fibers into the home. If suspect material is present on boots or plenums that must be disturbed for the new system, have a certified testing lab or state-accredited asbestos abatement contractor inspect and encapsulate or abate it under negative pressure before the HVAC crew works—and never pay an HVAC sales rep an unverified "hazmat fee" without an accredited abatement subcontractor's written scope and manifest.</li>
<li><b>Enter any itemized duct or return-drop upgrade separately in our auditor:</b> Put the base heat pump quote (${usd(s3.min)}–${usd(s3.max)} equipment starting at ${sysLink(cheapest(s3.systems))}, ${fmtRange(f3)} benchmark at 3 tons) and the itemized ductwork/return-drop amount into the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} so the system price is graded accurately.</li>
</ul>`;
    },
  },
  {
    slug: 'how-to-hire-independent-epa-608-hvac-tech-customer-supplied-equipment',
    get title() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `${usd(s.min)} Equip vs ${fmtRange(f)} Installed: Hire EPA-608 Tech`;
    },
    h1: 'How to hire an independent EPA-608 licensed HVAC tech for low-markup or customer-supplied equipment',
    get description() {
      const s = equipmentStats('central-heat-pump', 3);
      const f = fairRange('central-heat-pump', 3);
      return `3-ton heat pumps list at ${usd(s.min)}–${usd(s.max)} while installed quotes run ${fmtRange(f)}. How to hire an EPA-608 certified independent tech and protect OEM warranties.`;
    },
    updated: today,
    related: { tons: [2, 3, 4, 5], brands: ['Goodman', 'ACiQ', 'MRCOOL', 'Gree', 'Bosch'], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const sizes = [2, 2.5, 3, 3.5, 4, 5].map((t) => {
        const eq = equipmentStats('central-heat-pump', t);
        const fair = fairRange('central-heat-pump', t);
        return { t, eq, fair, gap: fair.mid - eq.median! };
      });
      const r3 = sizes.find((x) => x.t === 3)!;
      const top3 = systemsWhere({ type: 'central-heat-pump', tons: 3 }).slice(0, 6);
      return `
<p>Once a homeowner sees that a matched 3-ton heat pump lists for ${usd(r3.eq.min)}–${usd(r3.eq.max)} (median ${usd(r3.eq.median)}) at public online distributors (${src('hvacdirect', 'HVACDirect')}, ${src('alpine', 'Alpine Home Air')}) while the DOE installed benchmark runs ${fmtRange(r3.fair)} (midpoint ${usd(r3.fair.mid)}), the natural next question is: <i>"Can I buy the equipment myself—or hire a small independent EPA-608 licensed mechanic who bills transparent labor plus low equipment markup?"</i> Here is the exact dollar spread across every tonnage (${asOf}), the legal and warranty rules you must follow, and the commissioning checklist to put in your installation agreement.</p>

<h2>The gap between listed equipment and installed midpoint, by tonnage (${asOf})</h2>
<div class="tablewrap"><table><thead><tr><th>Size</th><th class="r">Listed equipment range</th><th class="r">Median equipment</th><th class="r">Installed benchmark <span class="badge b-est">est.</span></th><th class="r">Midpoint minus median equip</th></tr></thead><tbody>
${sizes.map((r) => `<tr><td>${tonLink(r.t, `${r.t} ton`)}</td><td class="r num">${usd(r.eq.min)}–${usd(r.eq.max)}</td><td class="r num">${usd(r.eq.median)}</td><td class="r num">${fmtRange(r.fair)} (mid ${usd(r.fair.mid)})</td><td class="r num">${usd(r.gap)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote}</p>

<h2>Two ways to work with an independent HVAC contractor</h2>
<p>As we compare in our <a href="/guides/independent-hvac-tech-vs-big-company/">independent HVAC tech vs big company guide</a>, small owner-operated shops do not carry private-equity debt, TV ad budgets, or 10–12% sales-rep commissions. When hiring an independent mechanic, you have two ways to source the hardware:</p>
<ol>
<li><b>Option A (Usually best): Let the independent contractor supply the equipment from their local supply house with a transparent equipment + labor split.</b> Why? When the licensed contractor purchases the unit from their local distributor, they handle freight damage claims, bring the exact matching sheet-metal transitions and pad, and stand behind both the 10-year OEM parts warranty and their own 1- to 2-year workmanship warranty. If their total installed quote sits near the 20th–50th percentile of our benchmark (${usd(r3.fair.low)}–${usd(r3.fair.mid)} at 3 tons), you get wholesale-level pricing without taking on supply-chain risk.</li>
<li><b>Option B: Customer-supplied equipment from a public online distributor (${src('hvacdirect', 'HVACDirect')}, ${src('alpine', 'Alpine')}) installed by a licensed independent tech.</b> Direct-to-consumer friendly brands in our catalog—such as ${brandLink('Goodman')}, ${brandLink('ACiQ')}, ${brandLink('MRCOOL')}, ${brandLink('Gree')}, and ${brandLink('Bosch')}—sell complete AHRI-matched packages online. However, before clicking "buy," you must secure a licensed installer in advance and verify the manufacturer's online-purchase warranty terms.</li>
</ol>

<h2>Sample 3-ton ducted heat pumps listed online (${asOf})</h2>
${systemsTable(top3)}

<h2>What EPA Section 608 and OEM warranties require</h2>
<ul>
<li><b>Clean Air Act Section 608 certification is mandatory:</b> Under federal law (${src('epaSection608', 'EPA Section 608, 40 CFR Part 82 Subpart F')}), anyone who opens, recovers, evacuates, or charges a refrigerant circuit must hold a valid EPA Section 608 Technician Certification (Type II or Universal for residential split systems), plus any state-required HVAC contractor license and municipal mechanical permit.</li>
<li><b>OEM warranty proof of licensed installation:</b> Even on equipment bought online, manufacturers require installation and commissioning by a state-licensed, EPA-608 certified technician to honor the 10-year registered parts warranty (${src('ftcWarranty', 'FTC Warranty Law')}). Keep the installer's invoice showing their license number, EPA 608 cert, and the model and serial numbers of both cabinets.</li>
<li><b>AHRI match verification before ordering:</b> If you supply the equipment, verify the exact outdoor + indoor model pairing in the ${src('ahri', 'AHRI Directory')} and ${src('esCriteria', 'ENERGY STAR dataset')} before ordering so your installer is not stuck with mismatched cabinets or an un-rebatable pair. See <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">how to check an AHRI certificate</a>.</li>
</ul>

<h2>Written commissioning checklist to attach to an independent install contract</h2>
<p>Whether the independent contractor supplies the unit or installs yours, put these five measurable commissioning steps in the scope of work:</p>
<ol>
<li>Flow dry nitrogen through the copper lines while brazing (prevents black copper-oxide scale from clogging the TXV/EEV).</li>
<li>Install a new liquid-line filter-drier and pressure-test the line set with dry nitrogen.</li>
<li>Evacuate the lines and indoor coil with a vacuum pump to <b>below 500 microns</b>, verified with a digital micron gauge after isolating the pump (standing decay test).</li>
<li>Weigh in any additional refrigerant charge for line-set length by digital scale and record final <b>superheat, subcooling, and external static pressure</b> on the invoice.</li>
<li>Pull and pass the municipal mechanical/electrical permit inspection.</li>
</ol>
<p>Grade any bid in the ${auditLink({ systemType: 'central-heat-pump', tons: 3 }, 'TonnageCheck quote auditor')} or use the independent installer request form below to get matched.</p>`;
    },
  },
];
