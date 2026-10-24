# TonnageCheck v1

HVAC & heat pump quote auditor, equipment price lookup, independent-installer concierge and newsletter capture for https://tonnagecheck.com. Static Astro 5 site; every number traces to a public source.

```bash
npm install
npm run build      # → dist/ (static; deploy anywhere)
npm run dev        # local dev server
npm run seed       # re-fetch prices, ENERGY STAR specs, REMDB benchmarks, CPI → src/data/seed/*.json
npm run check:sources  # are the seeded listings still live and priced within 10%?
```

Node 20+. No env vars are required: without Supabase the auditor and forms work entirely in the browser (forms fall back to a prefilled email).

## Rule #1: no fabricated prices or specs

| Data | Source | How it gets in |
|---|---|---|
| Equipment prices | HVACDirect listings (32 systems, 1 line set) and Alpine Home Air (cross-check on condensers) | `scripts/seed-sources.json` lists the URLs; `scripts/fetch-energystar-seed.mjs` reads the price from each page (`product:price:amount` / JSON-LD `offers.price`) |
| SEER2 / EER2 / HSPF2 / COP@5°F / AHRI ref | EPA ENERGY STAR API, dataset `w7cv-9xjt` | Matched by outdoor model prefix and accepted only if the indoor model (or exact SEER2) also matches; otherwise the listing's own spec table, labelled "listing" |
| Installed-cost ranges | REMDB, National Laboratory of the Rockies (formerly NREL), `https://remdb.nlr.gov/db.json` | Same formula as the REMDB web app; always shown with an **estimate** badge and methodology |
| 2023$ → today | CPI-U `CPIAUCSL` via FRED | Factor stored in `benchmarks.seed.json` |
| Tax credit / rebate rules | IRS (25C, OBBB provisions), 42 U.S.C. § 18795a, DOE, ENERGY STAR criteria | `src/data/sources.ts`, every URL checked live |

Never hand-edit `src/data/seed/*.json`. To add a system, add its listing URL to `scripts/seed-sources.json` and run `npm run seed`. Failures are written to the seed's `failures` array and left out. The build fails if any `/systems/*` page lacks a retailer link, if titles or descriptions are duplicated, if a canonical is wrong, or if JSON-LD does not parse.

Known limits, stated on the site:
- Retail online prices are not distributor (true wholesale) prices; the UI says so.
- REMDB is a national average with no ZIP-level adjustment; ZIP is used only to name the state for rebate links.
- "Heat pump only" (outdoor-unit swap) and the 200A panel adder rest on weaker REMDB support; both are labelled.
- Ductwork has no public benchmark, so users enter the itemized amount and the rest is graded.
- The ENERGY STAR central-AC dataset (`tyr2-hhgu`) returned no rows during seeding, so AC + furnace specs come from listings.

## Supabase (optional)

1. Create a project, then run `supabase/migrations/0001_tonnagecheck_init.sql` (SQL editor or `supabase db push`).
2. Copy `.env.example` to `.env` and set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.
3. Rebuild.

Both tables have RLS on with no anon policies; the browser only calls `submit_quote_audit` (anonymized, 20/hour per caller) and `request_independent_quote` (write-only, 3/hour and 10/day per caller). Rate-limit keys are a daily-rotating SHA-256 of the caller IP; raw IPs are never stored. Read the data with the service role.

## Before launch

- Set up `hello@tonnagecheck.com` and `partners@tonnagecheck.com` (`src/config.ts`); partner applications and no-backend fallbacks go there by email.
- Set `PUBLIC_NEWSLETTER_URL` to your newsletter's subscribe page (e.g. beehiiv). Until then, the form offers an email sign-up.
- Replace `public/og-image.svg` with a 1200×630 PNG; some social networks ignore SVG previews.
- Re-run `npm run seed` before each deploy (or weekly) so prices stay current.
