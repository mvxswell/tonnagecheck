// Brand-specific sections for /brands/<slug>/ pages that rank for a query the generic template does not answer.
// Plan A (GSC striking-distance plan, Nov 2026). Prices are computed from the seeded listings and the REMDB
// benchmark; product-line facts (series, SEER2 ceilings, staging, warranty terms) quote the cited OEM documents.
import { BRANDS, type Brand } from './brands';
import { lowestPrice, type System } from './equipment';
import { SOURCES, type SourceId } from './sources';
import { usd, seedDateLabel, type Range } from '../lib/facts';

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
<p><b>Short answer:</b> the equipment is the smaller part of a fair installed quote. ${hp.length + acf.length} complete Trane-built systems with public online prices list <b>${span([...hp, ...acf])}</b> (${b.tonnages[0]}–${b.tonnages[b.tonnages.length - 1]} ton, captured ${seedDateLabel})${condOnly.length ? `, plus ${condOnly.length} condenser-only unit at ${usd(lowestPrice(condOnly[0]))}` : ''}. The rest of a fair quote is labor, materials, permits, overhead and margin.</p>
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
<p>In our data, complete 3-ton Trane-built ducted heat pump ${sys3.length === 1 ? 'system lists' : 'systems list'} ${span(sys3)}${sys3.length === 1 ? ` (the <a href="/systems/${sys3[0].slug}/">${sys3[0].components[0]}</a>)` : ` (${sys3.length} systems)`}, against the 3-ton ducted installed benchmark on this page. The <a href="/guides/3-ton-heat-pump-ac-replacement-cost/">3-ton replacement cost guide</a> breaks a quote into line items and compares Trane with every other brand at that size.</p>`;

  const faq = [
    {
      q: 'How much does a new Trane HVAC system cost?',
      a: `For a 3-ton heat pump system, use the 3-ton ducted installed benchmark on this page. ${hp.length + acf.length} complete Trane-built systems list ${span([...hp, ...acf])} (${hp.length} ducted heat pump systems, ${acf.length} AC + furnace systems)${condOnly.length ? `, plus ${condOnly.length} condenser-only unit at ${usd(lowestPrice(condOnly[0]))}` : ''}${Math.max(...[...hp, ...acf].map(lowestPrice)) < fair3.low ? `, so even the highest-priced complete listing is below the low end of the installed range` : ''}.`,
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

function countEs(xs: System[]) {
  return xs.filter((s) => s.energyStar).length;
}
function countCold(xs: System[]) {
  return xs.filter((s) => s.energyStar?.coldClimate).length;
}
const meanListed = (xs: System[]) => xs.reduce((a, s) => a + lowestPrice(s), 0) / xs.length;
const meanUsd = (xs: System[]) => usd(Math.round(meanListed(xs)));
const pctl = (xs: number[], p: number) => {
  const ys = [...xs].sort((a, b) => a - b);
  if (!ys.length) return 0;
  const i = (ys.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? ys[lo] : ys[lo] * (hi - i) + ys[hi] * (i - lo);
};
const typeLabel: Record<string, string> = {
  'central-heat-pump': 'ducted heat pump',
  'mini-split': 'mini-split',
  'ac-furnace': 'AC + furnace',
  'heat-pump-only': 'condenser only',
};

function catalogRows(groups: { label: string; xs: System[]; note?: string }[]) {
  return groups.filter((g) => g.xs.length).map((g) => {
    const types = [...new Set(g.xs.map((s) => typeLabel[s.systemType] ?? s.systemType))].join(', ');
    return `<tr><td>${g.label}</td><td class="r num">${g.xs.length}</td><td>${types}</td><td class="r num">${span(g.xs)}</td><td class="r num">${countEs(g.xs)}</td><td class="r num">${countCold(g.xs)}</td><td>${g.note ?? '—'}</td></tr>`;
  }).join('\n');
}
const catalogHead = `<thead><tr><th>Line in this catalog</th><th class="r">Count</th><th>Type</th><th class="r">Listed range</th><th class="r">ENERGY STAR pairings</th><th class="r">Cold-climate</th><th>Note</th></tr></thead>`;

function daikin(b: Brand, fair3: Range): BrandExtra {
  const rxf = fam(b, ['RXF']);
  const rxt = fam(b, ['RXT']);
  const rxm = fam(b, ['RXM']);
  const mxm = b.systems.filter((s) => /^[34]MXM/.test(s.components[0]));
  const es = b.systems.filter((s) => s.energyStar);
  const prices = b.systems.map(lowestPrice);
  const t2 = b.systems.filter((s) => s.tons === 2);
  const hspf = b.systems.map((s) => s.specs.hspf2).filter((n): n is number => n != null);
  const meanHspf = hspf.length ? hspf.reduce((a, n) => a + n, 0) / hspf.length : null;
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> every public Daikin listing in this catalog is a <b>ductless mini-split</b> (RXF, RXT, RXM and multi-zone MXM outdoor units), ${b.systems.length} systems from ${usd(b.priceMin)} to ${usd(b.priceMax)}, mean listed ${meanUsd(b.systems)} (${seedDateLabel}). We do not have public prices for Daikin's ducted R-32 splits (DH4SE, DH6VS, DH7TC, DH9VS and the matching air handlers in the ${a('daikinCatalog', 'residential R-32 catalog')}), so a ducted Daikin quote has to be checked against the installed benchmark, not against a Daikin box price we can link to.</p>
<p>${es.length} of the ${b.systems.length} Daikin listings have an ENERGY STAR / AHRI record.</p>
</div>`;
  const sectionsHtml = `
<h2>Daikin lines we actually list, and the ones we don't</h2>
<p>The ${a('daikinCatalog', 'Daikin CT-DAIKIN catalog (02/26)')} covers both ducted R-32 splits and ductless OTERRA / MXM systems. The table below is only the outdoor units with a public online price in our data.</p>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'RXF (OTERRA-class wall outdoor)', xs: rxf, note: a('daikinOterraSm', 'OTERRA service manual') },
    { label: 'RXT', xs: rxt },
    { label: 'RXM', xs: rxm },
    { label: 'MXM multi-zone (3MXM / 4MXM)', xs: mxm },
  ])}
</tbody></table></div>
${b.systems.length >= 3 ? `<p>Across those ${b.systems.length} mini-split listings, the 25th-percentile listed price is ${usd(pctl(prices, 0.25))}.${t2.length >= 3 ? ` The ${t2.length} 2-ton units have a mean listed price of ${meanUsd(t2)}.` : ''}${meanHspf != null && hspf.length >= 3 ? ` The mean HSPF2 across the ${hspf.length} outdoor units that publish a rating is ${meanHspf.toFixed(2)}.` : ''}</p>` : ''}
<p>Specification sheets for the ducted R-32 families (${a('daikinDh4se', 'DH4SE')}, ${a('daikinDh6vs', 'DH6VS')}, ${a('daikinDh7tc', 'DH7TC')}, ${a('daikinDh9vs', 'DH9VS')}) and air handlers (${a('daikinDmvt', 'DMVT')}, ${a('daikinDfve', 'DFVE')}) are cited on our <a href="/decoder/daikin/">Daikin model decoder</a>. Those documents do not include a retail price, so they are not in the table.</p>
<h2>Warranty documents, not a term we inferred</h2>
<p>Daikin publishes separate limited-warranty PDFs for ducted R-32 single-phase equipment (${a('daikinWarrantyBeo', 'PWDACHPR3BEO')}, ${a('daikinWarrantyBeob', 'PWDACHPR3BEOB')}) and for ductless systems (${a('daikinWarrantyDms', 'PWDDMSTWZS')}). The first four digits of the serial number (YYMM) are the manufacture date (${a('daikinWarrantyBeo', 'PWDACHPR3BEO')}). Read the PDF that matches the model on your quote, and register the system at ${a('daikinRegistration', 'Daikin product registration')}. ${a('daikinWarrantyInfo', 'Registration and transfer rules')} vary by state; look a policy up at ${a('daikinWarrantyLookup', 'Daikin warranty lookup')}.</p>`;
  const faq = [
    {
      q: 'Why is there no Daikin ducted heat pump price on this page?',
      a: `The online retailers we track list Daikin ductless outdoor units, not the DH-series ducted R-32 splits in the ${a('daikinCatalog', 'residential catalog')}. A ducted Daikin quote should be graded against the installed benchmark for its size and against the exact model numbers, not against a mini-split listing.`,
    },
    {
      q: 'Where do I find the official Daikin warranty term?',
      a: `In the limited-warranty PDF that names your model family: ${a('daikinWarrantyBeo', 'PWDACHPR3BEO')} or ${a('daikinWarrantyBeob', 'PWDACHPR3BEOB')} for ducted R-32, and ${a('daikinWarrantyDms', 'PWDDMSTWZS')} for ductless. We do not restate a year count here because the term depends on the document and on registration. Start at ${a('daikinWarrantyInfo', 'Daikin warranty information')}.`,
    },
  ];
  return { sizeHeading: 'Daikin mini-split listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function mitsubishi(b: Brand, fair3: Range): BrandExtra {
  const suz = fam(b, ['SUZ-AK', 'SUZ-AA']);
  const puz = fam(b, ['PUZ-AK']);
  const mxz = b.systems.filter((s) => s.components[0].startsWith('MXZ-'));
  const hyper = b.systems.filter((s) => /NLHZ|Hyper/i.test(`${s.components[0]} ${s.title}`));
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> all ${b.systems.length} Mitsubishi listings in this catalog are ductless (SUZ, PUZ and MXZ outdoor units), listed ${usd(b.priceMin)}–${usd(b.priceMax)}, mean ${meanUsd(b.systems)} (${seedDateLabel}). ${hyper.length} of them are Hyper-Heating (H2i) models — the catalog marks that with a <b>Z</b> in the nomenclature (${a('mitsuCatalog', 'M- and P-Series catalog, ME_RS_2762')}). ${countEs(b.systems)} have an ENERGY STAR record; ${countCold(b.systems)} are flagged cold-climate.</p>
<p>Mitsubishi does not sell a 3-ton ducted split through the retailers we track, so the 3-ton ducted installed benchmark on this page is a comparison point for a ducted quote, not a box price for these mini-splits. Cold-climate cost for the Hyper-Heat line is in the <a href="/guides/mitsubishi-hyper-heat-cost/">Hyper-Heat guide</a>.</p>
</div>`;
  const sectionsHtml = `
<h2>SUZ, PUZ and MXZ: the outdoor units in this catalog</h2>
<p>Per the ${a('mitsuCatalog', 'September 2025 catalog')}, current R-454B nomenclature uses L for R-454B, H for a base-pan heater, and Z for H2i Hyper-Heating. The table is built from our listings, not from the full catalog.</p>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'SUZ-AK / SUZ-AA single-zone', xs: suz, note: 'M-Series outdoor' },
    { label: 'PUZ-AK', xs: puz, note: a('mitsuPuzAk', 'PUZ-AK service manual') },
    { label: 'MXZ multi-zone', xs: mxz },
  ])}
</tbody></table></div>
<h2>The 120-day installation-date rule</h2>
<p>Mitsubishi's residential limited warranty (${a('mitsuWarranty', 'effective Oct 15, 2026')}) says that if the installation date is not documented, "the date of installation shall be deemed to be the date which is one hundred twenty (120) days after the date of manufacture stamped on the Product." Register the system at ${a('mitsuRegister', 'Mitsubishi product registration')} and keep the install invoice. Current and earlier statements are collected at ${a('mitsuWarranties', 'Mitsubishi warranties')}.</p>`;
  const faq = [
    {
      q: 'What does the Z in a Mitsubishi model like SUZ-AK36NLHZ mean?',
      a: `In the current R-454B nomenclature, Z marks H2i Hyper-Heating (${a('mitsuCatalog', 'ME_RS_2762')}). L is R-454B and H is a base-pan heater. Confirm the exact outdoor and indoor pair on the AHRI certificate; the suffix alone is not a capacity rating.`,
    },
    {
      q: 'When does the Mitsubishi warranty clock start if I lose the install date?',
      a: `The ${a('mitsuWarranty', 'limited warranty (effective Oct 15, 2026)')} deems installation to be 120 days after the manufacture date stamped on the product when the install date is not documented. That is why the serial and the invoice both matter. Register at ${a('mitsuRegister', 'mitsubishicomfort.com/register-your-product')}.`,
    },
  ];
  return { sizeHeading: 'Mitsubishi mini-split listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function carrier(b: Brand, fair3: Range): BrandExtra {
  const maha = fam(b, ['37MAHA']);
  const mpra = fam(b, ['37MPRA']);
  const gree = BRANDS.find((x) => x.slug === 'gree');
  const greeShare = gree ? `${countCold(gree.systems)}/${gree.systems.length}` : 'all';
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> Carrier appears in this catalog only as ductless systems — ${b.systems.length} outdoor units in the 37MAHA and 37MPRA families, all R-454B, all ENERGY STAR cold-climate pairings, listed ${usd(b.priceMin)}–${usd(b.priceMax)}, mean ${meanUsd(b.systems)} (${seedDateLabel}). The ${a('carrier37maha', '37MAHA product data')} is the document for the single-zone line we list.</p>
<p>We have no public price for Carrier or Bryant ducted splits (27SCA5, 26SCA5 and related families). A ducted Carrier quote should be graded against the 3-ton ducted installed benchmark on this page and the model numbers on the quote, not against these mini-split listings.</p>
</div>`;
  const sectionsHtml = `
<h2>Carrier ductless lines we list</h2>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: '37MAHA single-zone', xs: maha, note: a('carrier37maha', '37MAHA-03PD') },
    { label: '37MPRA', xs: mpra },
  ])}
</tbody></table></div>
<p>Every one of the ${b.systems.length} Carrier outdoor units in this catalog is an R-454B ENERGY STAR cold-climate pairing. Carrier and Gree are the two brands whose every listing is an ENERGY STAR cold-climate pairing (${b.systems.length}/${b.systems.length} and ${greeShare}).</p>
<p>Ducted product data we cite for identification, not for a retail price: ${a('carrier27sca5', '27SCA5 heat pump')}, ${a('carrier26sca5', '26SCA5 air conditioner')}, and the ${a('carrier2425sm', '24-25-2SM application guideline')}. Nomenclature for Infinity 24VNA / 25VNA is in the ${a('carrier24vnaSm', '24VNA6-25VNA4 service manual')}.</p>
<h2>Warranty lookup, not a term we invented</h2>
<p>Carrier publishes a ${a('carrierWarrantyLookup', 'warranty lookup and coverage guide')} and Bryant has its own ${a('bryantWarranty', 'warranty information and lookup')}. We do not restate a year count here because we do not have a limited-warranty PDF with a single term that covers every 37MAHA / ducted family in our source list. Look up the serial on Carrier's tool and get labor coverage in writing from the installer.</p>`;
  const faq = [
    {
      q: 'Can I use these Carrier mini-split prices to check a ducted Carrier or Bryant quote?',
      a: `No. The listings are 37MAHA and 37MPRA ductless systems only. Grade a ducted quote in the auditor against the installed benchmark for its size, and identify the family from the product data (${a('carrier27sca5', '27SCA5')}, ${a('carrier26sca5', '26SCA5')}) or the model decoder.`,
    },
    {
      q: 'Where do I check Carrier warranty coverage?',
      a: `Use ${a('carrierWarrantyLookup', 'Carrier warranty lookup')}. For Bryant-branded equipment, use ${a('bryantWarranty', 'Bryant warranty information')}.`,
    },
  ];
  return { sizeHeading: 'Carrier ductless listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function lg(b: Brand, fair3: Range): BrandExtra {
  const kusxa = fam(b, ['KUSXA']);
  const kusxe = fam(b, ['KUSXE']);
  const kusxb = fam(b, ['KUSXB']);
  const kumx = fam(b, ['KUMXA', 'KUMXB']);
  const kss = fam(b, ['KSSAC', 'KSSLA']);
  const kusx = [...kusxa, ...kusxe, ...kusxb];
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> LG listings in this catalog are R-32 ducted (KUSX) and multi-zone (KUMX) outdoor units, ${b.systems.length} systems from ${usd(b.priceMin)} to ${usd(b.priceMax)} (${seedDateLabel}). The ${kusx.length} ducted outdoor units have a mean listed price of ${meanUsd(kusx)}; the ${kumx.length} multi-zone units average ${meanUsd(kumx)}. ${countEs(b.systems)} have an ENERGY STAR record and ${countCold(b.systems)} are flagged cold-climate.</p>
<p>LG's ${a('lgR32ModelMap', 'R-410A to R-32 model map')} is the document that matches older LSU / LUU / LV / LMU models to the KUSA / KUSX / KUMX replacements we list. The current R-32 limited warranty card (${a('lgWarrantyR32', 'WD_LG_Res_Lgt_Comm_LTD_EXT_R32_12_2025')}) names those KUS* / KUM* families and is valid for systems installed from September 1, 2024.</p>
</div>`;
  const sectionsHtml = `
<h2>KUSX, KUMX and related outdoor units in this catalog</h2>
<p>Engineering manuals we cite for nomenclature: ${a('lgEmSzMega', 'standard / Mega')}, ${a('lgEmSzHighEff', 'high efficiency')}, and ${a('lgEmAhuRed', 'multi-position AHU with LGRED°')}.</p>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'KUSXA', xs: kusxa, note: 'R-32 ducted outdoor' },
    { label: 'KUSXE', xs: kusxe },
    { label: 'KUSXB', xs: kusxb },
    { label: 'KUMXA / KUMXB multi-zone', xs: kumx },
    { label: 'KSSAC / KSSLA indoor or matched', xs: kss },
  ])}
</tbody></table></div>
<h2>Warranty card and registration</h2>
<p>Read the ${a('lgWarrantyR32', 'R-32 warranty card')} that covers KUSA / KUSX / KUMX outdoor units, KNS / KNU / KNM indoor units, LKMMA A-coils and PMBD branch boxes, for systems installed from September 1, 2024. Older R-410A systems use a ${a('lgWarranty410', 'separate card valid from April 1, 2017')}. Register at ${a('lgRegister', 'LG HVAC residential product registration')}; LG also keeps a ${a('lgWarrantyPage', 'warranty page')} for current documents. We do not restate a year count beyond what those cards say, because the term depends on the card and on registration.</p>`;
  const faq = [
    {
      q: 'My quote still uses an LSU or LMU model number. Is that the same as a KUSX or KUMX?',
      a: `Not automatically. LG's ${a('lgR32ModelMap', 'R-410A to R-32 cross-reference')} maps each older model to its R-32 replacement. Confirm the exact outdoor and indoor pair on the AHRI certificate and on the ${a('lgWarrantyR32', 'R-32 warranty card')}.`,
    },
    {
      q: 'Which LG warranty card applies to a 2026 install?',
      a: `For current R-32 KUS* / KUM* systems installed from September 1, 2024, use ${a('lgWarrantyR32', 'WD_LG_Res_Lgt_Comm_LTD_EXT_R32_12_2025')}. Register at ${a('lgRegister', 'lg-dfs-warranty.com/register')}.`,
    },
  ];
  return { sizeHeading: 'LG R-32 heat pump listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function aciq(b: Brand, fair3: Range): BrandExtra {
  const hpE = b.systems.filter((s) => s.systemType !== 'heat-pump-only' && /HP-E-32|HPD/.test(s.components[0]));
  const k = fam(b, ['ACIQ-K']);
  const esLine = fam(b, ['ES-']);
  const r410 = b.systems.filter((s) => /R-?410A/i.test(`${s.specs.refrigerant ?? ''} ${s.energyStar?.refrigerant ?? ''} ${s.title}`));
  const ducted = b.systems.filter((s) => s.systemType === 'central-heat-pump');
  const mini = b.systems.filter((s) => s.systemType === 'mini-split');
  const leftover = r410[0];
  const summaryHtml = `
<div class="card answer">
<p><b>A mixed catalog, not a single product line:</b> ACiQ is the only brand on this site with ducted heat pumps, mini-splits, an AC + furnace and a condenser-only listing in the same public-price set — ${b.systems.length} systems from ${usd(b.priceMin)} to ${usd(b.priceMax)} (${seedDateLabel}). The ${ducted.length} complete ducted heat pumps average ${meanUsd(ducted)}; the ${mini.length} mini-splits average ${meanUsd(mini)}.</p>
<p>${countEs(b.systems)} of the ${b.systems.length} ACiQ listings have an ENERGY STAR record; ${countCold(b.systems)} are flagged cold-climate.</p>
</div>`;
  const sectionsHtml = `
<h2>ACiQ families with a public price</h2>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'ACIQ-*-HP-E-32 / HPD ducted', xs: hpE, note: 'R-32 ducted heat pumps' },
    { label: 'ACIQ-K single-zone', xs: k },
    { label: 'ES- multi-zone', xs: esLine },
    { label: 'Leftover R-410A AC + furnace', xs: r410, note: 'Not a current A2L system' },
  ])}
</tbody></table></div>
<p>One leftover listing, the ${leftover ? leftover.components[0] : 'R-410A unit'}${leftover ? ` at ${usd(lowestPrice(leftover))}` : ''}, is still an R-410A AC + furnace. It is in the catalog because it has a public price, not because it is a current A2L replacement. For how the refrigerant transition affects a quote, see <a href="/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/">R-410A vs R-454B vs R-32</a>.</p>
<p>Our source list has no official ACiQ limited-warranty PDF, so this page does not assign a parts-year or labor-year count to the brand. Ask the seller which document names the outdoor unit on the quote.</p>`;
  const faq = [
    {
      q: 'Why does this page refuse to quote an ACiQ warranty length?',
      a: 'Because we do not have an OEM limited-warranty PDF for ACiQ in the source list this site cites. A year count without that document would be invented. Get the paper that names the model, and get labor coverage in writing.',
    },
    {
      q: 'Why is there an R-410A ACiQ system next to R-32 and R-454B units?',
      a: `Because it still has a public listed price in the catalog we captured on ${seedDateLabel}. New equipment built from newer components uses R-32 or R-454B under the EPA GWP limit. Treat that R-410A row as a leftover listing, not as the going replacement.`,
    },
  ];
  return { sizeHeading: 'ACiQ listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function gree(b: Brand, fair3: Range): BrandExtra {
  const fxu = fam(b, ['FXU']);
  const mul = fam(b, ['MUL']);
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> every Gree system in this catalog is an R-32 unit with an ENERGY STAR record, and every one is flagged cold-climate — ${b.systems.length} systems (FXU ducted and MUL mini-split) listed ${usd(b.priceMin)}–${usd(b.priceMax)} (${seedDateLabel}).</p>
<p>The ${fxu.length} FXU ducted pairings average ${meanUsd(fxu)} listed; the ${mul.length} MUL mini-splits average ${meanUsd(mul)}. That is a ${usd(Math.abs(Math.round(meanListed(fxu)) - Math.round(meanListed(mul))))} gap between the two Gree families in this catalog.</p>
</div>`;
  const sectionsHtml = `
<h2>FXU ducted and MUL ductless, all R-32</h2>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'FXU ducted heat pump', xs: fxu, note: 'All ENERGY STAR, cold-climate, R-32' },
    { label: 'MUL mini-split', xs: mul, note: 'All ENERGY STAR, cold-climate, R-32' },
  ])}
</tbody></table></div>
<p>Because every Gree pairing we list is in the ENERGY STAR dataset, compare a Gree quote on the certified capacity and the AHRI reference, not only on the nameplate tons. Several 3-ton-labeled systems across brands are certified below 36,000 BTU/h; that check is on the <a href="/guides/3-ton-heat-pump-ac-replacement-cost/#3-ton">size guide</a>. Our source list has no official Gree limited-warranty PDF, so we point you to the AHRI number on the ENERGY STAR record and to the seller for the document that names the FXU or MUL model.</p>`;
  const faq = [
    {
      q: 'Where should I look up Gree coverage if this page will not state a term?',
      a: 'Start with the AHRI reference on the ENERGY STAR pairing, then ask the seller for the warranty that names the exact FXU or MUL model. We will not invent a parts-year or labor-year count without an official PDF already in our source list.',
    },
    {
      q: 'Are these Gree systems actually cold-climate rated?',
      a: `In our catalog, all ${b.systems.length} Gree pairings are ENERGY STAR records flagged cold-climate. Still verify the exact outdoor and indoor combination on the AHRI certificate attached to your quote.`,
    },
  ];
  return { sizeHeading: 'Gree R-32 listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function mrcool(b: Brand, fair3: Range): BrandExtra {
  const uhp = fam(b, ['UHP']);
  const central = fam(b, ['CENTRAL-']);
  const diy = b.systems.filter((s) => s.components[0].startsWith('DIY-'));
  const mdph = fam(b, ['MDPH']);
  const aLine = fam(b, ['A-']);
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> MRCOOL listings in this catalog span several outdoor-unit families — UHP and CENTRAL ducted heat pumps, DIY multi-zone, MDPH and a single-zone A- line — ${b.systems.length} systems from ${usd(b.priceMin)} to ${usd(b.priceMax)} (${seedDateLabel}). The ${uhp.length + central.length + mdph.length} ducted systems (UHP, CENTRAL and the MDPH package unit) average ${meanUsd([...uhp, ...central, ...mdph])} listed; the ductless DIY and A- listings are in the family table below. ${countEs(b.systems)} have an ENERGY STAR record; ${countCold(b.systems)} are flagged cold-climate.</p>
<p>We do not have an official MRCOOL limited-warranty PDF in our source list, so this page does not state a warranty term. DIY and professionally installed families can carry different documents; get the one that names the model on your quote.</p>
</div>`;
  const sectionsHtml = `
<h2>MRCOOL families with a public price</h2>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'UHP ducted', xs: uhp },
    { label: 'CENTRAL ducted', xs: central },
    { label: 'DIY multi-zone', xs: diy, note: 'Ductless DIY family' },
    { label: 'MDPH', xs: mdph },
    { label: 'A- single-zone', xs: aLine },
  ])}
</tbody></table></div>
<p>Refrigerant is not the same across these families: most ENERGY STAR records in this catalog are R-454B, and one (MDPH18036D) is R-32. Two listings (the A-18 single-zone and the DIY 4-zone) have no ENERGY STAR record; their listing titles say R-454B. Read the rating plate and the AHRI certificate, not the brand name, when a quote calls the refrigerant a reason for a surcharge. See <a href="/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/">R-410A vs R-454B vs R-32</a>.</p>`;
  const faq = [
    {
      q: 'Does MRCOOL publish a warranty term we can cite here?',
      a: 'Not in the official documents already in our source list. We do not invent a year count, and we do not assume the DIY document applies to a CENTRAL or UHP system. Ask for the warranty that names the exact model, and get labor coverage in writing.',
    },
    {
      q: 'Is a DIY MRCOOL multi-zone priced the same way as a CENTRAL ducted system?',
      a: `No. They are different families in the table above, with different listed ranges. Grade each quote against the listed price of that family and the installed benchmark for its size, not against a mixed "MRCOOL" average.`,
    },
  ];
  return { sizeHeading: 'MRCOOL listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}


function bosch(b: Brand, fair3: Range): BrandExtra {
  const bovb = b.systems.filter((s) => s.components[0].startsWith('BOVB') && s.systemType !== 'heat-pump-only');
  const bova = b.systems.filter((s) => s.components[0].startsWith('BOVA') || s.systemType === 'heat-pump-only');
  const meanBovb = bovb.length ? meanListed(bovb) : 0;
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> Bosch appears in this catalog as the <b>IDS inverter</b> family — BOVB matched systems and BOVA condenser-only outdoor units, ${b.systems.length} listings from ${usd(b.priceMin)} to ${usd(b.priceMax)} (${seedDateLabel}). ${countEs(b.systems)} have an ENERGY STAR record; ${countCold(b.systems)} are flagged cold-climate.</p>
<p>The ${bovb.length} BOVB matched systems average ${meanUsd(bovb)} listed. Condenser-only BOVA rows are not mixed into that average, because a bare outdoor unit is not a matched system price.</p>
</div>`;
  const sectionsHtml = `
<h2>IDS lines in this catalog: BOVB matched systems and BOVA condensers</h2>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'BOVB matched ducted heat pump', xs: bovb, note: 'IDS inverter outdoor + air handler' },
    { label: 'BOVA / condenser-only', xs: bova, note: 'Outdoor unit without a matched air handler price' },
  ])}
</tbody></table></div>
<h2>What the Bosch limited-warranty PDF actually says</h2>
<p>The ${a('boschWarranty', 'IDS family limited warranty (BTC 761709102 O, 11.2025, effective July 1, 2025)')} is the document for BOV**/BOH** condensers, BC**/BV**/BW**/BI** air handlers, BMAC cased coils and BMXF blowers. In a one- or two-family home, that certificate gives the original purchaser 10 years on compressors and internal components of those products, excluding the gateway assembly, while the unit stays where it was installed and was installed and maintained by a licensed HVAC contractor. The gateway assembly is covered for 2 years from the commencement date. In buildings other than one- or two-family homes, coverage is 3 years on compressors and 1 year on other internal components. Current PDFs are collected in the ${a('boschWarrantyLibrary', 'Bosch warranty library')}.</p>
<p>Registration within 90 days, through ${a('boschProPortal', 'Bosch Home Comfort Pro')} or the Bosch EasyAir app, adds a labor allowance: Bosch pays labor under its Warranty Labor Allowance Schedule for 90 days from the commencement date. Coverage starts on the date a new-home buyer purchased the house from the builder, or on the original installation date in an existing home; if neither can be verified, it starts 90 days from the manufacture date in the serial number.</p>
<p>Separately, the ${a('boschBgh97', 'BGH97 gas-furnace submittal sheet')} summarizes 5 years on parts and 20 years on the primary and secondary heat exchangers in one- or two-family homes, and says registering the product raises that to 10 years on parts and a lifetime heat exchanger warranty. That sheet is for the furnace line, not for an IDS heat pump; do not assume the furnace term applies to a BOVB outdoor unit.</p>`;
  const faq = [
    {
      q: 'Does registering a Bosch IDS system change the parts term?',
      a: `The ${a('boschWarranty', 'IDS family limited warranty')} describes a 10-year compressor and internal-component term for one- or two-family homes, with a 2-year gateway-assembly term. What registration within 90 days adds is a labor allowance under Bosch's Warranty Labor Allowance Schedule, filed through ${a('boschProPortal', 'Bosch Home Comfort Pro')} or the EasyAir app — not a longer parts term in the PDF we cite.`,
    },
    {
      q: 'When does Bosch warranty coverage start if the install date is missing?',
      a: `The same ${a('boschWarranty', 'limited warranty')} starts coverage on the date a new-home buyer purchased the house from the builder, or on the original installation date in an existing home. If neither can be verified, coverage starts 90 days from the manufacture date shown by the serial number.`,
    },
  ];
  return { sizeHeading: 'Bosch IDS listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

function goodman(b: Brand, fair3: Range): BrandExtra {
  const glzs4 = fam(b, ['GLZS4']);
  const glzs5 = fam(b, ['GLZS5']);
  const glzt7 = fam(b, ['GLZT7']);
  const glxs = b.systems.filter((s) => s.components[0].startsWith('GLXS'));
  const cond = b.systems.filter((s) => s.systemType === 'heat-pump-only');
  const acf = b.systems.filter((s) => s.systemType === 'ac-furnace');
  const hp = b.systems.filter((s) => s.systemType === 'central-heat-pump');
  const summaryHtml = `
<div class="card answer">
<p><b>What we can price:</b> Goodman is the largest public-price catalog on this site — ${b.systems.length} systems (${hp.length} matched ducted heat pumps, ${acf.length} AC + furnace, ${cond.length} condenser-only) from ${usd(b.priceMin)} to ${usd(b.priceMax)} (${seedDateLabel}). ${countEs(b.systems)} have an ENERGY STAR record; none of the Goodman listings in this catalog is flagged as an ENERGY STAR cold-climate pairing.</p>
<p>The ${hp.length} matched ducted heat pumps average ${meanUsd(hp)} listed; the ${acf.length} AC + furnace systems average ${meanUsd(acf)}; the ${cond.length} condenser-only rows average ${meanUsd(cond)}.</p>
</div>`;
  const sectionsHtml = `
<h2>Goodman families in this catalog</h2>
<div class="tablewrap"><table>
${catalogHead}
<tbody>
${catalogRows([
    { label: 'GLZS4 R-32 heat pump', xs: glzs4 },
    { label: 'GLZS5 R-32 heat pump', xs: glzs5 },
    { label: 'GLZT7C two-stage heat pump', xs: glzt7, note: a('gdmGlzt7c', 'SS-GLZT7C-R32') },
    { label: 'GLXS AC + furnace', xs: glxs },
  ])}
</tbody></table></div>
<h2>What the Goodman R-32 warranty certificate actually says</h2>
<p>The ${a('gdmWarrantyR32', 'R-32 air conditioner and heat pump limited warranty (PWGACHPR3BODB)')} covers GLZS4B, GLZS5B, GLZS4M, GLXS3B, GLXS4B, GLXS5B and GLXS4M. Unregistered, the term is 5 years on all parts. Registering online at ${a('gdmRegistration', 'goodmanmfg.com/product-registration')} within 60 days starts the "Registered Additional Term Warranty," up to 10 years on parts. The first four digits of the serial number (YYMM) are the manufacture date. Look a policy up at ${a('gdmWarrantyLookup', 'Goodman warranty lookup')} and read the ${a('gdmWarrantyInfo', 'registration and transfer rules by state')}.</p>
<p>Goodman lists states where registration cannot be required: California (installs on or after January 1, 2004), Florida (July 1, 2024), Georgia (January 1, 2026) and Québec (April 30, 1980). Florida, Georgia and Texas also require the warranty to transfer to a new owner, on the dates Goodman publishes on that information page.</p>
<p>The ${a('gdmGlzt7c', 'GLZT7C specification sheet')} lists a 10-year unit replacement limited warranty plus 10-year parts with registration within 60 days. Compressor coverage for years 11–99 is a paid ASURE Extend service plan, not part of the warranty — do not treat "11–99" as included coverage.</p>
<p>Amana is Goodman's sister brand. The ${a('amanaWarrantyLzA', 'Amana R-32 certificate (PWAACHPLZA, 10/2026)')} is 5 years unregistered and 10 years on parts if registered online within 60 days at ${a('amanaRegistration', "Amana product registration")}; if the compressor fails on a registered unit during the first 10 years, Amana replaces the whole unit once, provided it was installed with a new matching coil or air handler. An older ${a('amanaAlzs5b', 'ALZS5B specification sheet dated 11/2024')} still advertises a "Lifetime Unit Replacement Limited Warranty"; the newer 10/2026 certificate says 10 years. The certificate for your install date is the one that applies.</p>`;
  const faq = [
    {
      q: 'How long is a Goodman R-32 heat pump warranty if I do not register it?',
      a: `The ${a('gdmWarrantyR32', 'PWGACHPR3BODB certificate')} is 5 years on all parts unregistered, and up to 10 years on parts if you register at ${a('gdmRegistration', 'goodmanmfg.com/product-registration')} within 60 days. In California, Florida, Georgia and Québec, Goodman itself says registration cannot be required; see the ${a('gdmWarrantyInfo', 'warranty information page')} for the dates that apply.`,
    },
    {
      q: 'Does the GLZT7C "years 11–99" compressor language come with the unit?',
      a: `No. The ${a('gdmGlzt7c', 'GLZT7C specification sheet')} says compressor coverage for years 11–99 is a paid ASURE Extend service plan, not part of the warranty. The included terms it lists are the 10-year unit replacement limited warranty and 10-year parts with registration within 60 days.`,
    },
  ];
  return { sizeHeading: 'Goodman listed prices vs the installed benchmark by size', summaryHtml, sectionsHtml, faq };
}

export function brandExtra(b: Brand, fair3: Range): BrandExtra | undefined {
  switch (b.slug) {
    case 'trane':
      return trane(b, fair3);
    case 'daikin':
      return daikin(b, fair3);
    case 'mitsubishi':
      return mitsubishi(b, fair3);
    case 'carrier':
      return carrier(b, fair3);
    case 'lg':
      return lg(b, fair3);
    case 'aciq':
      return aciq(b, fair3);
    case 'gree':
      return gree(b, fair3);
    case 'mrcool':
      return mrcool(b, fair3);
    case 'bosch':
      return bosch(b, fair3);
    case 'goodman':
      return goodman(b, fair3);
  }
  return undefined;
}
