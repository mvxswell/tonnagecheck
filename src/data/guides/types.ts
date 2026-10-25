import type { SystemType, Tier } from '../equipment';
import type { Where } from '../../lib/facts';

export interface Guide {
  slug: string;
  title: string;
  h1: string;
  description: string;
  updated: string;
  body: () => string;
  /** Drives the "Related pages" block: tonnage and brand hubs, plus the cheapest matching seeded systems. */
  related?: { tons?: number[]; brands?: string[]; systems?: Where };
  /** Pre-fills the embedded auditor (which also carries the second-opinion form). */
  audit?: { systemType?: SystemType; tons?: number; tier?: Tier; brand?: string };
}
