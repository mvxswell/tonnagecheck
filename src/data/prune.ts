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

/** System detail pages that stay indexed (earned a Google click in the last 90 days).
 *  The Gree FXU60 page was the only former member; it is in PR42_NOINDEX. */
export const SYSTEMS_INDEXED = new Set<string>([]);

/** State rebate pages that stay indexed (earned a Google click in the last 90 days). */
export const STATES_INDEXED = new Set<string>(['district-of-columbia']);

/**
 * Comparison pages that stay indexed. Empty after the Nov 17 preview-merge: the 12 previously
 * allowed compare slugs are in COMPARE_MERGED. The /compare/ hub (workbench) stays indexed.
 */
export const COMPARE_INDEXED = new Set<string>([]);

/** All sizes now live in one guide. Keep the 3-ton URL: /tonnage/3-ton/ had 87 GSC impressions
 *  in 28 days, more than any other size page, and the 3-ton guide is the natural merge target. */
export const COMBINED_SIZE_GUIDE_SLUG = '3-ton-heat-pump-ac-replacement-cost';
export const COMBINED_SIZE_GUIDE_PATH = `/guides/${COMBINED_SIZE_GUIDE_SLUG}/`;

export function sizeAnchor(tons: number): string {
  return `${String(tons).replace('.', '-')}-ton`;
}

/** In-page href to the combined size guide (hash jumps to that size's section). */
export function sizeGuidePath(tons: number): string {
  return `${COMBINED_SIZE_GUIDE_PATH}#${sizeAnchor(tons)}`;
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
  'mitsubishi-suz-ak24nlhz-vs-daikin-rxm24wvju9-2-ton': COMBINED_SIZE_GUIDE_PATH,
  'bosch-bovb-36rxb-vs-trane-a5hl5036a-3-ton': COMBINED_SIZE_GUIDE_PATH,
  'goodman-glzt7ca3610-vs-bosch-bovb-36rxb-3-ton': COMBINED_SIZE_GUIDE_PATH,
  'gree-fxu36hp-vs-mrcool-central-36-3-ton': COMBINED_SIZE_GUIDE_PATH,
  'goodman-glzs4ba4810-vs-trane-a5hl5048a-4-ton': COMBINED_SIZE_GUIDE_PATH,
  'goodman-glzs5ba6010-vs-bosch-bovb-60rxb-5-ton': COMBINED_SIZE_GUIDE_PATH,
};

/** /tonnage/{size}/ pages folded into the matching size guide. The /tonnage/ hub stays. */
export const TONNAGE_MERGED: Record<string, string> = Object.fromEntries(
  [1.5, 2, 2.5, 3, 3.5, 4, 5].map((t) => [tonSlug(t), COMBINED_SIZE_GUIDE_PATH]),
);

const seg = (path: string, section: string) => {
  const m = path.match(new RegExp(`^/${section}/([^/]+)/$`));
  return m ? m[1] : null;
};

/** 38 thin or low-uniqueness pages approved for noindex on the PR #42 preview.
 *  Homepage, the 12 fixable pages, the 4 utility pages, and the combined size guide stay indexed.
 *  Paths are trailing-slash canonicals, matching `trailingSlash: 'always'`. */
export const PR42_NOINDEX = new Set<string>([
  '/guides/dual-fuel-heat-pump-gas-furnace-vs-cold-climate-heat-pump-cost/',
  '/guides/txv-thermal-expansion-valve-vs-piston-replacement-quote/',
  '/guides/condenser-pad-disconnect-box-whip-surge-protector-add-ons/',
  '/systems/',
  '/decoder/',
  '/parts/',
  '/guides/capacitor-contactor-blower-motor-failure-vs-full-hvac-replacement/',
  '/guides/manual-j-load-calculation-vs-rule-of-thumb-sizing/',
  '/guides/ductwork-replacement-cost-add-on/',
  '/guides/flat-rate-price-books-and-pe-hvac-rollups/',
  '/guides/heat-pump-tax-credit-and-rebate-stacking-2026/',
  '/guides/hvac-permit-inspection-hers-manual-j-testing-fees-on-quote/',
  '/guides/today-only-hvac-discount-tactic-how-to-counter-offer/',
  '/guides/why-hvac-quotes-cost-more-than-equipment/',
  '/guides/200a-panel-upgrade-and-heat-strip-adders/',
  '/guides/condensate-pump-float-switch-secondary-drain-pan-quote/',
  '/guides/cracked-heat-exchanger-scare-tactic-how-to-verify/',
  '/guides/evaporator-coil-leak-replacement-cost-vs-full-system-swap/',
  '/guides/how-to-tell-if-hvac-quote-is-ripoff/',
  '/guides/hvac-line-set-flush-vs-copper-line-set-replacement-cost/',
  '/guides/independent-hvac-tech-vs-big-company/',
  '/guides/smart-thermostat-markup-communicating-vs-24v-hvac-quotes/',
  '/brands/',
  '/guides/',
  '/guides/heat-pump-condenser-only-vs-full-system-replacement/',
  '/systems/gree-4-ton-19-seer2-heat-pump-system-fxu60hp230v1r32ao/',
  '/guides/rooftop-package-unit-vs-split-system-hvac-replacement-cost/',
  '/guides/uv-light-air-scrubber-ionization-hvac-add-on-cost/',
  '/guides/wholesale-hvac-equipment-cost-vs-installed-price/',
  '/decoder/daikin/',
  '/guides/attic-vs-crawlspace-vs-closet-air-handler-installation-cost/',
  '/guides/goodman-vs-trane-vs-carrier-equipment-markup/',
  '/guides/hvac-financing-zero-apr-dealer-fee-buydown-markup/',
  '/guides/how-to-hire-independent-epa-608-hvac-tech-customer-supplied-equipment/',
  '/guides/heat-pump-rebates-and-ahri-certificate-check/',
  '/guides/hvac-labor-warranty-vs-oem-parts-warranty-registration/',
  '/guides/multi-zone-mini-split-cost/',
  '/guides/asbestos-old-flex-duct-removal-and-return-air-drop-sizing/',
]);

/** True when a built page should carry noindex and stay out of the sitemap. */
export function isNoindexPath(path: string): boolean {
  if (PR42_NOINDEX.has(path)) return true;
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
  const dest = COMPARE_MERGED[slug];
  // Redirects stay hash-free; in-page links jump to the folded section.
  return dest ? `${dest}#${slug}` : `/compare/${slug}/`;
}

/** Live href for a size: the size guide after the tonnage-page merge. */
export function tonnagePath(tons: number): string {
  return sizeGuidePath(tons);
}

/** Old per-size guide slugs that now 301 to the combined 3-ton URL. */
export const SIZE_GUIDES_MERGED: Record<string, string> = Object.fromEntries(
  [2, 2.5, 3.5, 4, 5].map((t) => [`${String(t).replace('.', '-')}-ton-heat-pump-ac-replacement-cost`, COMBINED_SIZE_GUIDE_PATH]),
);

