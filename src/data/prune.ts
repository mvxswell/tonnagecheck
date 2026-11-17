// Thin-page prune (Nov 17, 2026). See /workspace/tc_prune_plan_2026-11-17.md for the per-page table and reasons.
// Preview-merge of remaining indexable /compare/ and /tonnage/ templates (Nov 17): see COMPARE_MERGED and TONNAGE_MERGED.
//
// NOINDEX: the page still builds and serves 200 for visitors, but carries <meta name="robots" content="noindex, follow">
//          (set in layouts/Base.astro) and the build hook in astro.config.mjs drops it from the sitemap.
// MERGED:  the page is no longer built; public/_redirects 301s it to the target, whose content absorbed what was unique.
//
// Templated sections default to NOINDEX so new programmatic pages do not re-thin the index; a page is only indexable
// if it is listed in the matching *_INDEXED set.

import { tonSlug } from './equipment';

/** System detail pages that stay indexed (earned a Google click in the last 90 days). */
export const SYSTEMS_INDEXED = new Set<string>([
  'gree-4-ton-19-seer2-heat-pump-system-fxu60hp230v1r32ao',
]);

/** State rebate pages that stay indexed (earned a Google click in the last 90 days). */
export const STATES_INDEXED = new Set<string>(['district-of-columbia']);

/**
 * Comparison pages that stay indexed. Empty after the Nov 17 preview-merge: the 12 previously
 * allowed compare slugs are in COMPARE_MERGED. The /compare/ hub (workbench) stays indexed.
 */
export const COMPARE_INDEXED = new Set<string>([]);

/** Destination size-guide path for a tonnage (1.5-ton has no guide of its own; it folds into 2-ton). */
export function sizeGuidePath(tons: number): string {
  const slug =
    tons === 1.5
      ? '2-ton-heat-pump-ac-replacement-cost'
      : `${String(tons).replace('.', '-')}-ton-heat-pump-ac-replacement-cost`;
  return `/guides/${slug}/`;
}

/** Comparison slugs folded into a guide and 301-redirected (see public/_redirects). Not built. */
export const COMPARE_MERGED: Record<string, string> = {
  // PR #40 (already live)
  'single-stage-vs-inverter-3-ton-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  'single-stage-vs-inverter-4-ton-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  'single-stage-vs-inverter-5-ton-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  '3-ton-heat-pump-vs-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
  '4-ton-heat-pump-vs-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
  '5-ton-heat-pump-vs-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
  // Brand-vs-brand (remaining indexable compares)
  'bosch-vs-mitsubishi-heat-pump-cost': '/guides/bosch-ids-inverter-heat-pump-cost/',
  'lg-vs-mitsubishi-heat-pump-cost': '/guides/mitsubishi-hyper-heat-cost/',
  'lg-vs-trane-heat-pump-cost': '/guides/goodman-vs-trane-vs-carrier-equipment-markup/',
  'aciq-vs-mrcool-heat-pump-cost': '/guides/inverter-vs-single-stage-heat-pump-cost/',
  'trane-vs-goodman-ac-furnace-cost': '/guides/heat-pump-vs-ac-and-furnace-replacement-cost/',
  // Refrigerant dataset
  'r32-vs-r454b-heat-pump-systems-compared': '/guides/r410a-vs-r454b-r32-refrigerant-transition-quotes/',
  // Model-vs-model flagship pairs, folded into the matching size guide
  'mitsubishi-suz-ak24nlhz-vs-daikin-rxm24wvju9-2-ton': sizeGuidePath(2),
  'bosch-bovb-36rxb-vs-trane-a5hl5036a-3-ton': sizeGuidePath(3),
  'goodman-glzt7ca3610-vs-bosch-bovb-36rxb-3-ton': sizeGuidePath(3),
  'gree-fxu36hp-vs-mrcool-central-36-3-ton': sizeGuidePath(3),
  'goodman-glzs4ba4810-vs-trane-a5hl5048a-4-ton': sizeGuidePath(4),
  'goodman-glzs5ba6010-vs-bosch-bovb-60rxb-5-ton': sizeGuidePath(5),
};

/** /tonnage/{size}/ pages folded into the matching size guide. The /tonnage/ hub stays. */
export const TONNAGE_MERGED: Record<string, string> = Object.fromEntries(
  [1.5, 2, 2.5, 3, 3.5, 4, 5].map((t) => [tonSlug(t), sizeGuidePath(t)]),
);

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
export const isTonnageMerged = (slug: string) => slug in TONNAGE_MERGED;

/** Live href for a comparison slug: the merge target if folded, otherwise the compare page. */
export function comparePath(slug: string): string {
  return COMPARE_MERGED[slug] ?? `/compare/${slug}/`;
}

/** Live href for a size: the size guide after the tonnage-page merge. */
export function tonnagePath(tons: number): string {
  return sizeGuidePath(tons);
}
