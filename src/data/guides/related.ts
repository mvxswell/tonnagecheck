import type { Guide } from './types';

/** A few page-specific related guides, not the same full list on every page. */
export function relatedGuidePicks(g: Guide, all: Guide[], limit = 5): Guide[] {
  const tons = new Set(g.related?.tons ?? []);
  const brands = new Set((g.related?.brands ?? []).map((b) => b.toLowerCase()));
  const type = g.audit?.systemType;
  const scored = all
    .filter((o) => o.slug !== g.slug)
    .map((o) => {
      let score = 0;
      for (const t of o.related?.tons ?? []) if (tons.has(t)) score += 2;
      for (const b of o.related?.brands ?? []) if (brands.has(b.toLowerCase())) score += 3;
      if (type && o.audit?.systemType === type) score += 1;
      // Prefer topic neighbors that this guide already mentions in related slugs via body is hard;
      // boost well-known complements for product/comparison guides.
      return { o, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.o.h1.localeCompare(b.o.h1));
  const picks = scored.slice(0, limit).map((x) => x.o);
  if (picks.length >= limit) return picks;
  // Fill with a short default set of genuinely useful companions, still unique per page because
  // we skip any already picked and skip the current page.
  const defaults = [
    'manual-j-load-calculation-vs-rule-of-thumb-sizing',
    'inverter-vs-single-stage-heat-pump-cost',
    'heat-pump-vs-ac-and-furnace-replacement-cost',
    'how-to-tell-if-hvac-quote-is-ripoff',
    'heat-pump-rebates-and-ahri-certificate-check',
  ];
  const have = new Set(picks.map((p) => p.slug));
  for (const slug of defaults) {
    if (picks.length >= limit) break;
    if (slug === g.slug || have.has(slug)) continue;
    const hit = all.find((o) => o.slug === slug);
    if (hit) {
      picks.push(hit);
      have.add(slug);
    }
  }
  return picks;
}
