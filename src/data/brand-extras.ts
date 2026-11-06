// Brand-specific sections for /brands/<slug>/ pages that rank for a query the generic template does not answer.
// Plan A (GSC striking-distance plan, Nov 2026). Prices are computed from the seeded listings and the REMDB
// benchmark; product-line facts (series, SEER2 ceilings, staging, warranty terms) quote the cited OEM documents.
import type { Brand } from './brands';
import { lowestPrice, type System } from './equipment';
import { SOURCES, type SourceId } from './sources';
import { usd, fmtRange, seedDateLabel, type Range } from '../lib/facts';

export interface BrandExtra {
  /** Replaces the "<brand> listed price vs installed benchmark, by size" heading. */
  sizeHeading: string;
  /** Answer-first block shown right under the lead. */
  summaryHtml: string;
  /** Extra sections shown after the size table. */
  sectionsHtml: string;
  /** Visible FAQ shown before "Other brands". */
  faq: { q: string; a: string }[];
}

const a = (id: SourceId, text: string) => `<a href="${SOURCES[id].url}" rel="noopener" target="_blank">${text}</a>`;
const span = (xs: System[]) => {
  if (!xs.length) return '—';
  const ps = xs.map(lowestPrice);
  const lo = Math.min(...ps), hi = Math.max(...ps);
  return lo === hi ? usd(lo) : `${usd(lo)}–${usd(hi)}`;
};
// Complete systems only: a condenser-only listing is not comparable with a matched system price.
const fam = (b: Brand, prefixes: string[]) => b.systems.filter((s) => s.systemType !== 'heat-pump-only' && prefixes.some((p) => s.components[0].startsWith(p)));

function trane(b: Brand, fair3: Range): BrandExtra {
  const hp = b.systems.filter((s) => s.systemType === 'central-heat-pump');
  const acf = b.systems.filter((s) => s.systemType === 'ac-furnace');
  const runtru = b.systems.filter((s) => /RunTru/i.test(s.title));
  const allRunTru = runtru.length === b.systems.length;
  const hp4 = fam(b, ['A5HP4']), hp5 = fam(b, ['A5HP5']), hl5 = fam(b, ['A5HL5']);
  const ac = fam(b, ['A5AC3', 'A5AC4', 'A5AC5']);
  const condOnly = b.systems.filter((s) => s.systemType === 'heat-pump-only');
  const sys3 = hp.filter((s) => s.tons === 3).sort((x, y) => lowestPrice(x) - lowestPrice(y));
  const es = b.systems.filter((s) => s.energyStar);
  const hb = (t = 'Trane product handbook 22-8301-39') => a('traneHandbook', t);

  const summaryHtml = `
<div class="card answer">
<p><b>Short answer:</b> a new 3-ton Trane heat pump system benchmarks at <b>${fmtRange(fair3)} installed</b> (midpoint ${usd(fair3.mid)}), a national DOE-lab estimate for that size and efficiency range. The equipment is the smaller part of the bill: the ${b.systems.length} Trane-built systems with public online prices list <b>${usd(b.priceMin)}–${usd(b.priceMax)}</b> (${b.tonnages[0]}–${b.tonnages[b.tonnages.length - 1]} ton, captured ${seedDateLabel}). The rest of a fair quote is labor, materials, permits, overhead and margin.</p>
${allRunTru ? `<p class="small">All ${b.systems.length} of those listings are <b>RunTru by Trane</b> models (A5HP, A5HL and A5AC families), Trane's lower-priced line. We found no public prices for the Trane-branded Choice, Priority and Premier lines (5TW and 5TT model families), which are quoted by dealers, so compare a Trane-branded quote with the installed benchmark and the line it names, below.</p>` : ''}
</div>`;

  const row = (line: string, models: string, seer: string, comp: string, warranty: string, price: string) =>
    `<tr><td>${line}</td><td class="num">${models}</td><td class="r num">${seer}</td><td>${comp}</td><td>${warranty}</td><td class="r num">${price}</td></tr>`;
  const rtW = '5-yr base; 10-yr functional parts if registered';
  const tW10 = '10-yr compressor, outdoor coil &amp; parts if registered';
  const tW12 = '12-yr compressor, 10-yr coil &amp; parts if registered';
  const dealer = '<span class="small muted">dealer quote</span>';

  const sectionsHtml = `
<h2>Trane system cost by line: which one is on your quote?</h2>
<p>The model number on the quote tells you which line you are being sold, and that matters more than the brand name. Trane's ${hb('2026 product handbook')} (effective Jan. 1, 2026) groups its heat pumps into Choice, Priority and Premier tiers and lists RunTru by Trane as a separate family; the first letter of the outdoor model is the giveaway ("A = RunTru by Trane", "T = Trane" in the 5T… models). SEER2 figures are the handbook's "up to" ceilings for each family; your exact pairing's rating is on its AHRI certificate.</p>
<div class="tablewrap"><table>
<thead><tr><th>Line</th><th>Outdoor model family</th><th class="r">SEER2 up to</th><th>Compressor</th><th>Registered limited warranty</th><th class="r">Listed equipment (${seedDateLabel})</th></tr></thead>
<tbody>
${row('RunTru by Trane', 'A5HP4', '14.3', 'Single-stage scroll', rtW, `${span(hp4)} <span class="small muted">(${hp4.length})</span>`)}
${row('RunTru by Trane', 'A5HP5', '16.0', 'Single-stage scroll', rtW, `${span(hp5)} <span class="small muted">(${hp5.length})</span>`)}
${row('RunTru by Trane', 'A5HL5 (side discharge)', '16.0', 'Inverter, tonnage DIP switch', rtW, `${span(hl5)} <span class="small muted">(${hl5.length})</span>`)}
${row('RunTru by Trane AC + furnace', 'A5AC3 / A5AC4 / A5AC5', '13.4 / 14.3 / 16.0', 'Single-stage scroll', rtW, `${span(ac)} <span class="small muted">(${ac.length})</span>`)}
${row('Trane Choice', '5TWR4', '14.3', 'Single-stage', tW10, dealer)}
${row('Trane Choice', '5TWR5 / 5TWR6', '17.0', 'Single-stage', tW10, dealer)}
${row('Trane Choice (WeatherGuard top)', '5TWX5 / 5TWX6', '17.0', 'Single-stage', tW12, dealer)}
${row('Trane Priority', '5TWR7', '17.1', 'Multi-speed (70/100% capacity)', tW10, dealer)}
${row('Trane Priority (WeatherGuard top)', '5TWX7', '18.0', 'Multi-speed (70/100% capacity)', tW12, dealer)}
${row('Trane Premier', '5TWV8', '18.1', 'TruComfort variable speed', tW12, dealer)}
${row('Trane Premier (WeatherGuard top)', '5TWV0', '22.4', 'TruComfort variable speed', tW12, dealer)}
</tbody></table></div>
<p class="small muted">Sources: ${hb()}: "Trane Consumer Product Names 2026" and tables SH-2-A, SH-4-A, SH-6-A (Trane heat pumps) and RTSH-2-A, RTSC-2-A (RunTru). Registered terms apply when the product is registered within 60 days of installation; otherwise Trane's base limited warranty applies. ${a('runtruWarranty', 'RunTru warranty page')}: the registered warranty covers parts "but not the labor to replace them." Listed prices are the lowest to highest public online price per family for complete systems (count in brackets)${condOnly.length ? `; the ${usd(lowestPrice(condOnly[0]))} RunTru listing is an outdoor unit only and is left out` : ''}. "Dealer quote" means we found no public price.</p>
<p>How to use this on a quote: if you are paying for a Trane Priority or Premier line, the quote should show what you are paying for: a higher SEER2 on the AHRI certificate, a multi-speed or variable-speed compressor, and the longer compressor warranty. If the quote just says "Trane" and the outdoor model starts with A, it is a RunTru unit; if it names a 5TW model, ask for the AHRI certificate for that exact outdoor and indoor pairing. Our ${'<a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">AHRI certificate guide</a>'} shows how to check the pairing in a few minutes, and ${es.length} of the ${b.systems.length} Trane listings here link their ENERGY STAR record with the AHRI reference number.</p>

<h2>What a new 3-ton Trane system costs, line by line</h2>
<p>In our data, complete 3-ton Trane-built ducted heat pump ${sys3.length === 1 ? 'system lists' : 'systems list'} ${span(sys3)}${sys3.length === 1 ? ` (the <a href="/systems/${sys3[0].slug}/">${sys3[0].components[0]}</a>)` : ` (${sys3.length} systems)`}, against the ${fmtRange(fair3)} installed benchmark for a 3-ton heat pump. The <a href="/guides/3-ton-heat-pump-ac-replacement-cost/">3-ton replacement cost guide</a> breaks a quote into line items (equipment, line set, pad, electrical, permit, labor) so you can see where a Trane quote sits, and the <a href="/tonnage/3-ton/">3-ton price page</a> compares Trane with every other brand at that size.</p>`;

  const faq = [
    {
      q: 'How much does a new Trane HVAC system cost?',
      a: `For a 3-ton heat pump system, the DOE-lab installed benchmark is ${fmtRange(fair3)} (midpoint ${usd(fair3.mid)}). Trane-built equipment with public prices lists ${usd(b.priceMin)}–${usd(b.priceMax)} across ${b.systems.length} systems (${hp.length} ducted heat pump systems, ${acf.length} AC + furnace systems)${b.priceMax < fair3.low ? `, so even the highest-priced listing is below the low end of the installed range` : ''}.`,
    },
    {
      q: 'Is RunTru the same as Trane?',
      a: `RunTru is Trane's lower-priced line. It describes itself as "quality HVAC systems at an affordable price" and says its systems are "designed, built, and tested by Trane" (${a('runtru', 'RunTru')}), and Trane's ${hb('handbook')} lists RunTru models with their own nomenclature ("A = RunTru by Trane"). They are different product families from Trane-branded units, with different SEER2 ceilings and warranties (see the table above).`,
    },
    {
      q: 'What warranty does a new Trane system have?',
      a: `Per the ${hb('2026 handbook')}, registered Trane heat pumps carry a 10-year limited warranty on the compressor, outdoor coil and functional parts, or 12 years on the compressor for WeatherGuard and TruComfort variable-speed models, if registered within 60 days of installation (${a('traneSupport', 'Trane support')}). RunTru units carry 5 years base or 10 years on functional parts with registration, parts only (${a('runtruWarranty', 'RunTru warranty')}). Ask the installer what labor coverage they include, and get it in writing.`,
    },
    {
      q: 'Does a Trane heat pump installed in 2026 qualify for the federal tax credit?',
      a: `No. The IRS lists the 25C credit as not allowed for property placed in service after Dec. 31, 2025 (${a('irsObbba', 'IRS')}). State, utility and income-qualified HEAR rebates may still apply; see <a href="/guides/heat-pump-rebates-and-ahri-certificate-check/">heat pump rebates and the AHRI check</a>.`,
    },
  ];

  return { sizeHeading: 'New Trane HVAC system cost by size: listed equipment vs installed', summaryHtml, sectionsHtml, faq };
}

export function brandExtra(b: Brand, fair3: Range): BrandExtra | undefined {
  switch (b.slug) {
    case 'trane':
      return trane(b, fair3);
  }
  return undefined;
}
