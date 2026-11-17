// Thin-page prune (Nov 17, 2026). See /workspace/tc_prune_plan_2026-11-17.md for the per-page table and reasons.
//
// NOINDEX: the page still builds and serves 200 for visitors, but carries <meta name="robots" content="noindex, follow">
//          (set in layouts/Base.astro) and the build hook in astro.config.mjs drops it from the sitemap.
// MERGED:  the page is no longer built; public/_redirects 301s it to the target, whose content absorbed what was unique.
//
// Templated sections default to NOINDEX so new programmatic pages do not re-thin the index; a page is only indexable
// if it is listed in the matching *_INDEXED set (pages that earned clicks, or that carry distinctive sourced content).

/** System detail pages that stay indexed (earned a Google click in the last 90 days). */
export const SYSTEMS_INDEXED = new Set<string>([
  'gree-4-ton-19-seer2-heat-pump-system-fxu60hp230v1r32ao',
]);

/** State rebate pages that stay indexed (earned a Google click in the last 90 days). */
export const STATES_INDEXED = new Set<string>(['district-of-columbia']);

/** Comparison pages that stay indexed: earned clicks, top impressions, or model-level / refrigerant data no other page has. */
export const COMPARE_INDEXED = new Set<string>([
  // earned clicks
  'aciq-vs-mrcool-heat-pump-cost',
  'lg-vs-mitsubishi-heat-pump-cost',
  'lg-vs-trane-heat-pump-cost',
  'bosch-bovb-36rxb-vs-trane-a5hl5036a-3-ton',
  // most impressions in /compare/ (127 in 28 days); also the subject of PR #26
  'bosch-vs-mitsubishi-heat-pump-cost',
  // distinctive sourced content (AHRI model pairs, refrigerant dataset, the only AC + furnace brand matchup)
  'r32-vs-r454b-heat-pump-systems-compared',
  'trane-vs-goodman-ac-furnace-cost',
  'goodman-glzt7ca3610-vs-bosch-bovb-36rxb-3-ton',
  'gree-fxu36hp-vs-mrcool-central-36-3-ton',
  'mitsubishi-suz-ak24nlhz-vs-daikin-rxm24wvju9-2-ton',
  'goodman-glzs4ba4810-vs-trane-a5hl5048a-4-ton',
  'goodman-glzs5ba6010-vs-bosch-bovb-60rxb-5-ton',
]);

/** Comparison slugs folded into a guide and 301-redirected (see public/_redirects). Not built. */
export const COMPARE_MERGED: Record<string, string> = {
  'single-stage-vs-inverter-3-ton-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  'single-stage-vs-inverter-4-ton-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  'single-stage-vs-inverter-5-ton-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  '3-ton-heat-pump-vs-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
  '4-ton-heat-pump-vs-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
  '5-ton-heat-pump-vs-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
};

const seg = (path: string, section: string) => {
  const m = path.match(new RegExp(`^/${section}/([^/]+)/$`));
  return m ? m[1] : null;
};

/** True when a built page should carry noindex and stay out of the sitemap. */
export function isNoindexPath(path: string): boolean {
  const sys = seg(path, 'systems');
  if (sys) return !SYSTEMS_INDEXED.has(sys);
  const st = seg(path, 'states');
  if (st) return !STATES_INDEXED.has(st);
  const cmp = seg(path, 'compare');
  if (cmp) return !COMPARE_INDEXED.has(cmp) && !(cmp in COMPARE_MERGED);
  return false;
}

export const isCompareMerged = (slug: string) => slug in COMPARE_MERGED;
export const isCompareIndexed = (slug: string) => COMPARE_INDEXED.has(slug);
export const isSystemIndexed = (slug: string) => SYSTEMS_INDEXED.has(slug);
export const isStateIndexed = (slug: string) => STATES_INDEXED.has(slug);
