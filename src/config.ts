export const SITE = {
  name: 'TonnageCheck',
  url: 'https://tonnagechecker.com',
  tagline: 'HVAC & heat pump quote auditor',
  description: 'Check an HVAC or heat pump quote against real listed equipment prices and DOE-lab installed-cost benchmarks. Every number links to its source.',
  // Mailboxes on the tonnagechecker.com domain. Set these up before launch; partner applications go here.
  contactEmail: 'hello@tonnagechecker.com',
  partnersEmail: 'partners@tonnagechecker.com',
};

// Optional runtime services. Missing values are fine: the auditor and forms work in the browser and
// simply skip saving.
export const SUPABASE_URL = (import.meta.env.PUBLIC_SUPABASE_URL ?? '').trim();
export const SUPABASE_ANON_KEY = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
export const NEWSLETTER_URL = (import.meta.env.PUBLIC_NEWSLETTER_URL ?? '').trim();
