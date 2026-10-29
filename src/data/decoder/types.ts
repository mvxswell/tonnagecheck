// Model & serial decoder data model. One file per brand family (goodman-amana.ts, ...), registered in index.ts.
// Every code table and date rule carries the SOURCES id it was transcribed from; anything we could not verify
// against an OEM document (or a clearly labelled reputable reference) is left out rather than guessed.
import type { SourceId } from '../sources';

/** One decoded field of a model number: a regex capture group and its code table. */
export interface ModelField {
  /** Index of the capture group in ModelFamily.pattern (1-based). */
  group: number;
  label: string;
  /** Code -> meaning. Codes not listed are shown as "not in the source table" instead of guessed. */
  codes?: Record<string, string>;
  /** Free-text meaning when the position is not a lookup (e.g. "engineering revision"). */
  describe?: string;
  /** If set, this field carries the cooling capacity; value is code -> nominal tons. */
  tons?: Record<string, number>;
}

export interface ModelFamily {
  id: string;
  /** Brand printed on the unit, e.g. "Goodman", "Amana", "RunTru by Trane". */
  brand: string;
  name: string;
  /** Equipment type, e.g. "Heat pump / AC outdoor unit (R-32)". */
  kind: string;
  /** Case-insensitive, anchored at the start; trailing characters are allowed and shown as "rest". */
  pattern: string;
  example: string;
  /** Position diagram for the page, e.g. "G L Z S 4 B A 36 1 0 A A". */
  layout: string;
  fields: ModelField[];
  sourceIds: SourceId[];
  notes?: string[];
}

export type SerialKind = 'goodman-yymm' | 'trane-acin3' | 'carrier-wwyy' | 'payne-style1';

export interface SerialRule {
  id: string;
  /** Brands this rule is documented for. */
  appliesTo: string[];
  kind: SerialKind;
  title: string;
  /** Plain-language rule, e.g. "First four digits = YYMM". */
  rule: string;
  example: { serial: string; reads: string };
  /** Manufacturing-site / plant codes, when the source lists them. */
  plants?: Record<string, string>;
  sourceIds: SourceId[];
  caveats?: string[];
}

export interface WarrantyFact {
  label: string;
  detail: string;
  sourceIds: SourceId[];
}

export interface Faq { q: string; a: string }

export interface DecoderBrand {
  slug: string;
  /** Short family name, e.g. "Goodman & Amana". */
  name: string;
  /** Brands covered, in display order. */
  brands: string[];
  /** Seed brand names whose listings and prices this page may show (from equipment.seed.json). */
  seedBrands: string[];
  title: string;
  description: string;
  h1: string;
  lead: string;
  /** Hand-written explainer paragraphs (plain text; rendered as <p>). */
  intro: string[];
  labelLocation: { text: string; sourceIds: SourceId[] };
  families: ModelFamily[];
  serials: SerialRule[];
  warranty: WarrantyFact[];
  /** Things a homeowner commonly gets wrong for this brand. */
  gotchas: { title: string; text: string; sourceIds: SourceId[] }[];
  faqs: Faq[];
  /** Brand options offered in the interactive decoder's serial-number dropdown: label -> SerialRule id. */
  serialOptions: { label: string; rule: string }[];
  /** Things we looked for and could not verify, stated on the page so nobody assumes we forgot. */
  notCovered: string[];
  updated: string;
}
