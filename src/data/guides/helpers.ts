// HTML snippets shared by the guides. Every number they print comes from a System or a Range passed in,
// i.e. from the seed or the REMDB benchmark; nothing here holds a figure of its own.
import { lowestPrice, tonSlug, SYSTEM_TYPE_LABEL, type System, type SystemType, type Tier } from '../equipment';
import { brandSlug } from '../brands';
import { fairRange, usd, fmtRange, seedDateLabel, type Range } from '../../lib/facts';
import { SOURCES, type SourceId } from '../sources';

export const today = new Date().toISOString().slice(0, 10);
export const a = (url: string, text: string) => `<a href="${url}" rel="noopener" target="_blank">${text}</a>`;
export const src = (id: SourceId, text?: string) => a(SOURCES[id].url, text ?? SOURCES[id].title);
export const tonLink = (t: number, text?: string) => `<a href="/tonnage/${tonSlug(t)}/">${text ?? `${t}-ton`}</a>`;
export const brandLink = (b: string, text?: string) => `<a href="/brands/${brandSlug(b)}/">${text ?? b}</a>`;
export const sysLink = (s: System, text?: string) => `<a href="/systems/${s.slug}/">${text ?? `${s.brand} ${s.tons}-ton ${s.components[0]}`}</a>`;
export const auditLink = (q: Record<string, string | number> = {}, text = 'TonnageCheck quote auditor') => {
  const qs = new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)])).toString();
  return `<a href="/auditor/${qs ? `?${qs}` : ''}">${text}</a>`;
};
export const asOf = `listed prices captured ${seedDateLabel}`;

const shortType: Record<SystemType, string> = { 'central-heat-pump': 'Ducted heat pump', 'mini-split': 'Mini-split', 'ac-furnace': 'AC + furnace', 'heat-pump-only': 'Condenser only' };

/** Table of seeded systems with their listed price and source link. */
export function systemsTable(xs: System[], opts: { showType?: boolean; caption?: string } = {}) {
  if (!xs.length) return '';
  return `<div class="tablewrap"><table><thead><tr><th>System</th>${opts.showType ? '<th>Type</th>' : ''}<th class="r">Tons</th><th class="r">SEER2</th><th class="r">HSPF2</th><th class="r">Listed</th><th>Source</th></tr></thead><tbody>
${xs.map((s) => {
  const best = s.prices.reduce((x, p) => (p.price < x.price ? p : x), s.prices[0]);
  return `<tr><td>${sysLink(s, `${s.brand} ${s.components[0]}`)}${s.energyStar ? ' <span class="badge b-es">ENERGY STAR</span>' : ''}</td>${opts.showType ? `<td>${shortType[s.systemType]}${s.zones && s.zones > 1 ? `, ${s.zones}-zone` : ''}</td>` : ''}<td class="r num">${s.tons}</td><td class="r num">${s.specs.seer2 ?? '—'}</td><td class="r num">${s.specs.hspf2 ?? '—'}</td><td class="r num">${usd(lowestPrice(s))}</td><td><a href="${best.url}" rel="nofollow noopener" target="_blank">${best.retailer}</a></td></tr>`;
}).join('\n')}
</tbody></table></div>${opts.caption ? `<p class="small muted">${opts.caption}</p>` : ''}`;
}

/** REMDB installed range table for one system type across tiers and sizes. */
export function benchmarkTable(type: SystemType, sizes: number[], tiers: Tier[] = ['standard', 'mid', 'high']) {
  const label: Record<Tier, string> = { standard: 'Standard', mid: 'Mid-tier', high: 'High-eff. / cold-climate' };
  return `<div class="tablewrap"><table><thead><tr><th>${SYSTEM_TYPE_LABEL[type]}, installed <span class="badge b-est">est.</span></th>${tiers.map((t) => `<th class="r">${label[t]}</th>`).join('')}</tr></thead><tbody>
${sizes.map((t) => `<tr><td>${tonLink(t, `${t} ton`)}</td>${tiers.map((ti) => { const r = fairRange(type, t, ti); return `<td class="r num">${usd(r.mid)}<br><span class="small muted">${fmtRange(r)}</span></td>`; }).join('')}</tr>`).join('\n')}
</tbody></table></div>`;
}

export const rangeText = (r: Range) => `${fmtRange(r)} (midpoint ${usd(r.mid)})`;
export const cheapest = (xs: System[]) => [...xs].sort((x, y) => lowestPrice(x) - lowestPrice(y))[0];
export const priceOf = (s: System | undefined) => (s ? usd(lowestPrice(s)) : '—');
export const remdbNote = `Installed figures are ${a(SOURCES.remdb.url, 'REMDB')} estimates (National Laboratory of the Rockies, formerly NREL), restated from 2023 dollars with CPI-U: national averages, so high-cost metros run higher.`;
