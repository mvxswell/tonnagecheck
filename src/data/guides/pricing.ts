// Pricing-practice guides. Dollar figures, including the headline numbers in the title, are computed from the
// seed and REMDB at build time. Statements about business practices are descriptive and carry no statistics.
import { lowestPrice, median } from '../equipment';
import { fairRange, systemsWhere, usd, fmtRange, pct } from '../../lib/facts';
import { today, src, tonLink, auditLink, asOf, rangeText, cheapest, remdbNote } from './helpers';
import type { Guide } from './types';

const threeHp = () => systemsWhere({ type: 'central-heat-pump', tons: 3 });
const threeStd = () => fairRange('central-heat-pump', 3, 'standard');

export const PRICING_GUIDES: Guide[] = [
  {
    slug: 'why-hvac-quotes-cost-more-than-equipment',
    get title() { return `Why a 3-ton heat pump runs ${usd(threeStd().mid)}–${usd(threeStd().high)} installed when the equipment lists for ${usd(lowestPrice(cheapest(threeHp())))} | TonnageCheck`; },
    get h1() { return `Why HVAC companies charge ${usd(threeStd().mid)}–${usd(threeStd().high)} for ${usd(lowestPrice(cheapest(threeHp())))} of equipment`; },
    description: 'The gap between listed HVAC equipment prices and installed quotes, size by size: what legitimately fills it, what pushes a quote to the top of the range, and what is padding.',
    updated: today,
    related: { tons: [2, 3, 4, 5], systems: { type: 'central-heat-pump', tons: 3 } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const hp3 = threeHp();
      const lo3 = lowestPrice(cheapest(hp3));
      const f3 = threeStd();
      const sizes = [2, 2.5, 3, 3.5, 4, 5];
      return `
<p>The cheapest 3-ton ducted heat pump system in our data lists online for ${usd(lo3)} (${asOf}). The Department of Energy's national-lab benchmark for installing a standard-efficiency 3-ton heat pump is ${rangeText(f3)}. So a quote at the benchmark midpoint is about ${(f3.mid / lo3).toFixed(1)} times the cheapest listed equipment, and one at the top of the range is about ${(f3.high / lo3).toFixed(1)} times. Is that a rip-off? Sometimes. Usually it is mostly real cost, and the part that is not is what you can negotiate.</p>

<h2>The multiple, size by size</h2>
<div class="tablewrap"><table><thead><tr><th>Ducted heat pump</th><th class="r">Cheapest listed</th><th class="r">Median listed</th><th class="r">Benchmark mid</th><th class="r">Benchmark high</th><th class="r">Mid ÷ median</th></tr></thead><tbody>
${sizes.map((t) => { const xs = systemsWhere({ type: 'central-heat-pump', tons: t }); if (!xs.length) return ''; const m = median(xs.map(lowestPrice)); const f = fairRange('central-heat-pump', t); return `<tr><td>${tonLink(t, `${t} ton`)}</td><td class="r num">${usd(lowestPrice(xs[0]))}</td><td class="r num">${usd(m)}</td><td class="r num">${usd(f.mid)}</td><td class="r num">${usd(f.high)}</td><td class="r num">${(f.mid / m).toFixed(1)}×</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="small muted">${remdbNote} REMDB's own notes assume installation costs about 1.5 times the retail equipment cost, and say some Massachusetts program data suggest up to 2 times.</p>

<h2>Why the gap is real</h2>
<p>Public listings are retail prices for boxes delivered to a driveway. An installed system adds everything needed to make those boxes into working, permitted, warrantied comfort:</p>
<ul>
<li><b>Two people for one to two days:</b> recovery of the old refrigerant, removal and disposal, setting the pad and unit, brazing, nitrogen pressure test, deep vacuum, charging, wiring, airflow setup.</li>
<li><b>Materials:</b> pad, disconnect, whip, condensate line or pump, fittings, refrigerant, transitions, filter base.</li>
<li><b>Permit and inspection</b>, which vary widely by city.</li>
<li><b>Overhead:</b> trucks, insurance, licenses, training, office, callbacks under warranty.</li>
<li><b>Profit</b>, which a contractor needs to still be around for the warranty.</li>
</ul>

<h2>What pushes a quote from the midpoint to the top of the range</h2>
<p>The benchmark range is wide, ${usd(f3.low)} to ${usd(f3.high)} at 3 tons, because jobs differ. Legitimate reasons to land near the top: a difficult attic or crawlspace, a crane lift, long line set runs, a high-cost metro, real duct or electrical corrections, or a high-efficiency unit. Each of those should be visible as a line item or a clear explanation.</p>
<p>Reasons that should not push you to the top: a sales commission, an oversized unit, a "system optimization package," accessories at several times their price, financing cost buried in the cash price, or a tax credit that no longer exists being used to make the total look smaller. The IRS lists the 25C credit as not allowed for property placed in service after Dec. 31, 2025 (${src('irsObbba', 'IRS')}).</p>

<h2>A quote above the top of the range</h2>
<p>If your graded quote is above ${usd(f3.high)} for a 3-ton like-for-like heat pump swap, the contractor is charging more than the high end of what comparable projects cost. That does not prove bad faith, but it does mean the burden is on them to explain it. Ask for:</p>
<ol>
<li>Model numbers and the AHRI certificate, so you can check the equipment price yourself.</li>
<li>The Manual J load calculation behind the tonnage.</li>
<li>An itemized breakdown of labor, materials, permits and any add-ons.</li>
<li>The cash price separately from any financing offer.</li>
</ol>

<h2>Where the equipment share leaves room to negotiate</h2>
<p>At the 3-ton benchmark midpoint, the cheapest listed equipment is about ${pct(lo3 / f3.mid)} of the installed price. That means the equipment choice moves the total less than people think, and the labor-and-overhead portion is where quotes really diverge. Getting a second quote from a lower-overhead independent contractor is often the fastest way to move it. See <a href="/guides/independent-hvac-tech-vs-big-company/">independent tech vs big company</a> and <a href="/guides/flat-rate-price-books-and-pe-hvac-rollups/">flat-rate price books and PE roll-ups</a>.</p>
<p>Grade your exact quote in the ${auditLink({ tons: 3 })}. It subtracts the matching listed equipment, compares the rest with the benchmark, and flags what to ask about.</p>`;
    },
  },
  {
    slug: 'flat-rate-price-books-and-pe-hvac-rollups',
    title: 'Flat-rate price books & private-equity HVAC roll-ups: what they do to your quote | TonnageCheck',
    h1: 'Flat-rate price books and private-equity HVAC roll-ups: what they do to your quote',
    description: 'How flat-rate pricing, sales commissions and private-equity HVAC consolidators shape replacement quotes, how to tell who you are dealing with, and how to check the price.',
    updated: today,
    related: { tons: [3, 4], systems: { type: ['central-heat-pump', 'ac-furnace'], tons: [3, 4] } },
    audit: { systemType: 'central-heat-pump', tons: 3 },
    body: () => {
      const f3 = threeStd();
      const f4 = fairRange('central-heat-pump', 4);
      const acf3 = fairRange('ac-furnace', 3);
      return `
<p>Two business practices shape a lot of HVAC replacement quotes without ever appearing on them: flat-rate price books and private-equity ownership. Neither is illegal, and neither guarantees a bad price. But both change how a price is set, and knowing that helps you check it.</p>

<h2>What a flat-rate price book is</h2>
<p>Instead of charging time and materials, many HVAC companies price from a book: every task has a fixed price, set in advance, whatever it takes on your job. Replacement systems are priced the same way, often as good-better-best packages. The technician or salesperson looks up the package and presents it, frequently on a tablet.</p>
<p>Flat-rate pricing has real advantages: you know the price before work starts, and the company carries the risk if the job runs long. The catch is that book prices are set to cover the company's costs, sales commissions and target margin, not your job's actual labor. On a straightforward replacement, a flat-rate package can land well above what the work takes.</p>

<h2>How sales commissions show up</h2>
<p>At companies that use dedicated sales staff, the person in your living room is often paid partly on the size of the ticket. Common features of a commission-driven presentation: tiered menus that anchor you to the middle, monthly-payment framing, a discount that expires when the salesperson leaves, and add-ons such as air purifiers or UV lights bundled into the package. None of these is a reason to walk away by itself. All of them are reasons to get the model numbers and a second quote.</p>

<h2>Private-equity HVAC roll-ups</h2>
<p>Over recent years, many established local HVAC companies have been bought by larger platforms backed by private-equity investors, which combine dozens of local brands under shared management. The local name, trucks and phone number usually stay the same, so customers may not know. Platforms like these typically standardize pricing through price books, centralize call handling and marketing, and set sales targets, because the investors expect a return on the acquisition.</p>
<p>That model can deliver real benefits, such as scheduling capacity and long written warranties. It also adds layers of overhead and return expectations that a one-truck owner-operator does not have, and those costs reach the price. The practical question for you is not who owns the company, but whether the quote is in a reasonable range.</p>

<h2>Check the price, not the logo</h2>
<p>Whatever the business model, these are the benchmarks a replacement quote should be judged against (installed, standard efficiency):</p>
<ul>
<li>3-ton ducted heat pump: ${rangeText(f3)}</li>
<li>4-ton ducted heat pump: ${rangeText(f4)}</li>
<li>3-ton central AC + gas furnace: ${rangeText(acf3)}</li>
</ul>
<p class="small muted">${remdbNote}</p>
<p>A flat-rate package inside these ranges is fine. One far above them should come with an explanation you can verify.</p>

<h2>How to tell who you are dealing with</h2>
<ul>
<li>Search your state's business registry for the company and look at who holds it; a holding company or out-of-state parent can be a sign of consolidation.</li>
<li>Look at the company's "about" page and press releases for "joined," "partnered with" or "family of brands."</li>
<li>Ask directly: who owns the company, who will do the install, and are installers employees or subcontractors?</li>
<li>Ask whether the person quoting is paid on commission.</li>
</ul>

<h2>How to get a fair price either way</h2>
<ol>
<li>Ask for the price as time and materials, or at least itemized: equipment, labor, materials, permit, add-ons.</li>
<li>Get the model numbers and AHRI certificate and look up the equipment's listed price on our <a href="/systems/">equipment lookup</a>.</li>
<li>Get a quote from an independent owner-operated contractor; see <a href="/guides/independent-hvac-tech-vs-big-company/">independent vs big company</a>.</li>
<li>Grade each quote in the ${auditLink({ tons: 3 })} and bring the results to the table.</li>
</ol>
<p>If you want a second quote without a sales process, request one from an independent master tech using the form below. Related: <a href="/guides/why-hvac-quotes-cost-more-than-equipment/">why quotes cost so much more than equipment</a>, ${tonLink(3, '3-ton prices')}, ${tonLink(4, '4-ton prices')}, and <a href="/brands/">prices by brand</a>.</p>`;
    },
  },
];
