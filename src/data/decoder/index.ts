// Registry of decoder brand families. To add a brand: create src/data/decoder/<slug>.ts exporting a
// DecoderBrand, add its SOURCES entries in src/data/sources.ts, and append it here. The /decoder/<slug>/ page,
// the hub, the interactive decoder, the sitemap and llms.txt pick it up automatically.
import type { DecoderBrand } from './types';
import { goodmanAmana } from './goodman-amana';
import { traneAmericanStandard } from './trane-american-standard';
import { carrierBryantPayne } from './carrier-bryant-payne';

export const DECODER_BRANDS: DecoderBrand[] = [goodmanAmana, traneAmericanStandard, carrierBryantPayne];

export const decoderBySlug = (slug: string) => DECODER_BRANDS.find((b) => b.slug === slug);

/** Decoder page for a /brands/[slug] brand name (e.g. "Goodman" -> goodman-amana), if one exists. */
export const decoderForBrand = (brandName: string) =>
  DECODER_BRANDS.find((d) => d.brands.some((b) => b.toLowerCase() === brandName.toLowerCase()) || d.seedBrands.includes(brandName));

export type { DecoderBrand } from './types';
