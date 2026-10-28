# TonnageCheck v1

HVAC & heat pump quote auditor, equipment price lookup, independent-installer concierge and newsletter capture for https://tonnagechecker.com. Static Astro 5 site; every number traces to a public source.

```bash
npm install
npm run build      # → dist/ (static; deploy anywhere)
npm run dev        # local dev server
npm run seed       # re-fetch prices, ENERGY STAR specs, REMDB benchmarks, CPI → src/data/seed/*.json
npm run check:sources  # are the seeded listings still live and priced within 10%?
npm run seed:states    # re-fetch EIA prices, PNNL climate zones, Census counties, NASEO office links -> states.seed.json
npm run indexnow   # IndexNow dry run for live sitemap URLs (add -- --submit to send)
```

Node 20+. No env vars are required: without Supabase the auditor and forms work entirely in the browser (forms fall back to a prefilled email).

## Rule #1: no fabricated prices or specs

| Data | Source | How it gets in |
|---|---|---|
| Equipment prices | HVACDirect listings (65 systems across 10 brands, 1 line set) and Alpine Home Air (cross-check on condensers) | `scripts/seed-sources.json` lists the URLs; `scripts/fetch-energystar-seed.mjs` reads the price from each page (`product:price:amount` / JSON-LD `offers.price`) |
| SEER2 / EER2 / HSPF2 / COP@5°F / AHRI ref | EPA ENERGY STAR API, dataset `w7cv-9xjt` | Matched by outdoor model prefix and accepted only if the indoor model (or exact SEER2) also matches; otherwise the listing's own spec table, labelled "listing" |
| Installed-cost ranges | REMDB, National Laboratory of the Rockies (formerly NREL), `https://remdb.nlr.gov/db.json` | Same formula as the REMDB web app; always shown with an **estimate** badge and methodology |
| 2023$ → today | CPI-U `CPIAUCSL` via FRED | Factor stored in `benchmarks.seed.json` |
| Tax credit / rebate rules | IRS (25C, OBBB provisions), 42 U.S.C. § 18795a, DOE, ENERGY STAR criteria | `src/data/sources.ts`, every URL checked live |

Never hand-edit `src/data/seed/*.json`. To add a system, add its listing URL to `scripts/seed-sources.json` and run `npm run seed`. Failures are written to the seed's `failures` array and left out. The build fails if any `/systems/*` page lacks a retailer link, if titles or descriptions are duplicated, if a canonical is wrong, or if JSON-LD does not parse.

Brand hubs (`/brands/`) are generated from whichever brands have live listings in the seed (`src/data/brands.ts`). Bryant and American Standard have no listings at HVACDirect or Alpine Home Air, so they have no pages; Carrier is ductless-only and Daikin is mini-split-only for the same reason. Guides live in `src/data/guides/` and compute every figure from the seed through `src/lib/facts.ts`.

State pages (`/states/`) come from `scripts/fetch-state-seed.mjs`: EIA residential electricity (Table 5.6.B, year to date), EIA residential gas price and heat content (annual), IECC 2021 county climate zones parsed from PNNL-33270, the Census 2020 county list (to measure PNNL coverage), and NASEO state energy office links checked live. The PNNL PDF has a few typos (a block of Iowa counties labelled "IN", duplicated rows); the script corrects them mechanically and logs every correction in `states.seed.json`. A state is indexed only if every data point is verified; otherwise its page is `noindex` and the build removes it from the sitemap. The build also fails if a state page's title is 60+ characters, its description 160+, or its title does not lead with a dollar range.

Known limits, stated on the site:
- Retail online prices are not distributor (true wholesale) prices; the UI says so.
- REMDB is a national average with no ZIP-level adjustment; ZIP is used only to name the state for rebate links.
- "Heat pump only" (outdoor-unit swap) and the 200A panel adder rest on weaker REMDB support; both are labelled.
- Ductwork has no public benchmark, so users enter the itemized amount and the rest is graded.
- The ENERGY STAR central-AC dataset (`tyr2-hhgu`) returned no rows during seeding, so AC + furnace specs come from listings.
- State pages show the national REMDB benchmark; there is no public, citable state cost adjustment.
- HEEHR (HEAR) copy reflects DOE Program Notice 26-2 (May 2026): no fuel switching, insulation and air sealing first.

## Supabase (optional)

1. Create a project, then run `supabase/migrations/0001_tonnagecheck_init.sql` (SQL editor or `supabase db push`).
2. Copy `.env.example` to `.env` and set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.
3. Rebuild.

All four tables have RLS on with no anon policies, and the anon role has no table grants. The browser only calls these SECURITY DEFINER RPCs:

| RPC | Table | Limits per caller |
|---|---|---|
| `submit_quote_audit` | `quote_audits` (anonymized: 3-digit ZIP) | 20/hour |
| `request_independent_quote` | `installer_match_requests` | 3/hour, 10/day |
| `subscribe_newsletter` | `newsletter_subscribers` (unique on lower(email); repeats are silently accepted) | 5/hour |
| `submit_partner_application` | `partner_applications` (ZIPs parsed into `text[]`) | 3/hour, 5/day |

Each also has a global hourly cap. Rate-limit keys are a daily-rotating SHA-256 of the caller IP; raw IPs are never stored. Read the data with the service role. Without the env vars, the newsletter form uses `PUBLIC_NEWSLETTER_URL` or email, and partner and second-opinion forms open a prefilled email.

## Before launch

- Set up `hello@tonnagechecker.com` and `partners@tonnagechecker.com` (`src/config.ts`); the no-backend fallbacks send email there.
- Newsletter sign-ups land in `newsletter_subscribers`; export them to your sending tool (or set `PUBLIC_NEWSLETTER_URL` if you would rather use a hosted subscribe page when Supabase is off).
- `public/og-image.png` (1200×630) is rendered from `public/og-image.svg` in headless Chrome; re-render it if you edit the SVG.
- Re-run `npm run seed` before each deploy (or weekly) so prices stay current.
- After each deploy, submit URLs to IndexNow: `npm run build && npm run indexnow -- --submit`. It only sends URLs that already return 200 on the live site (dry run without `--submit`).
