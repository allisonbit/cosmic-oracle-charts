## Goal

Give the site two things it's missing: **(A) reasons for other sites to link to it** (linkable assets) and **(B) hundreds of low-competition long-tail pages** that can rank in weeks instead of months. You'll handle outreach; this plan covers everything we build in code.

---

## Part 1 — Backlink Magnets (Linkable Assets)

We build 3 assets other crypto sites and journalists will naturally cite + link to.

### 1.1 Embeddable Widgets (`/embed/*`)
Public, iframe-friendly widgets that other blogs can paste into their articles. Every embed includes a small "Powered by Oracle Bull" backlink — this is how Investing.com, CoinGecko etc. built their early authority.

- `/embed/price/:coin` — live price + 24h chart
- `/embed/fear-greed` — current fear & greed index
- `/embed/prediction/:coin` — today's AI signal card
- `/embed/strength/:coin` — strength meter gauge

Each route renders a minimal, frameable page (no nav/footer), allows `X-Frame-Options: ALLOW`, and exposes a one-line `<iframe>` snippet on a new `/embed` directory page.

### 1.2 Weekly "State of Crypto" Report (`/reports/weekly`)
Auto-generated every Monday by a new `weekly-report` edge function + pg_cron job. Pulls top movers, whale activity, sentiment shifts, and predictions accuracy into a single citable URL with a permanent slug (`/reports/2026-w25`). Adds JSON-LD `Report` schema. These are the pages journalists screenshot and link to.

### 1.3 Public Prediction Accuracy Leaderboard (`/accuracy`)
Already-resolved AI predictions vs. actual outcomes, exposed as a transparent track record. Sortable by coin and timeframe. Auto-generates a JSON feed at `/accuracy.json` that aggregators can pull. This is the "proof page" that makes the rest of the site link-worthy.

---

## Part 2 — Long-Tail Programmatic SEO (500+ new pages)

Targets keywords with low difficulty + clear intent that a new domain can actually rank for in 4–8 weeks.

### 2.1 "Will X hit $Y by Z" pages (`/predict/:coin/:target/:year`)
~300 pages. Template covers: current price, distance to target, % required move, historical comparable moves, AI verdict, time-series chart, FAQ block. Generated from a static slug list of top 30 coins × 5 price targets × 2 years.

### 2.2 "X vs Y" comparison pages (`/vs/:coinA/:coinB`)
~150 pages. Pairs all top 20 coins. Side-by-side: price, market cap, 1y return, volatility, sentiment, AI prediction, "which is the better buy right now" verdict. These rank fast because comparison intent has low SERP competition.

### 2.3 "How much is X worth in Y" converter pages (`/convert/:coin/:fiat`)
~60 pages. Top 20 coins × top 3 fiats. Live rate, historical chart, "1 BTC = $X" structured FAQ. Pure long-tail traffic generator.

### 2.4 Sitemap + indexing wiring
- All new routes added to `sitemap.xml` (split into `sitemap-predict.xml`, `sitemap-vs.xml`, `sitemap-convert.xml` to keep each under the 50k URL cap).
- `seo-prerender.mjs` updated so each route gets unique server-rendered title/description/H1/FAQ markup (no client-only content).
- `ping-search-engines` edge function called on deploy to push the new URL batch to IndexNow.

---

## Technical Section

**New files**
```
src/pages/embed/EmbedPrice.tsx
src/pages/embed/EmbedFearGreed.tsx
src/pages/embed/EmbedPrediction.tsx
src/pages/embed/EmbedStrength.tsx
src/pages/embed/EmbedIndex.tsx          // /embed directory
src/pages/reports/WeeklyReport.tsx      // /reports/:slug
src/pages/Accuracy.tsx                  // /accuracy
src/pages/programmatic/PredictTarget.tsx
src/pages/programmatic/VsCompare.tsx
src/pages/programmatic/Convert.tsx
src/lib/programmaticSlugs.ts            // slug generators
supabase/functions/weekly-report/index.ts
supabase/functions/accuracy-feed/index.ts
```

**Edits**
- `src/App.tsx` — add 9 new routes (lazy-loaded).
- `src/components/layout/Layout.tsx` — render no chrome when route starts with `/embed/`.
- `public/_headers` — `X-Frame-Options: ALLOWALL` scoped to `/embed/*`.
- `scripts/seo-prerender.mjs` — register the new templates + iterate slug lists.
- `public/sitemap.xml` — split into index + child sitemaps.
- Migration: add `weekly_reports` table (slug, week_iso, content jsonb, published_at) + RLS public read, service_role write. Add `prediction_outcomes` view aggregating `predictions_cache` vs realized prices for `/accuracy`.
- pg_cron: schedule `weekly-report` every Monday 00:05 UTC.

**Constraints honored**
- No modals/dropdowns — every page is a full route (flat navigation mandate).
- Light theme, Inter font, JSON-LD on every new template.
- Static HTML rendered before JS via `seo-prerender.mjs` (500–1000 word floor on each template).
- No `Math.random()`; all numbers from real APIs with skeleton fallbacks.
- Ad slots reused from existing `AdPlacement` components.

**Out of scope (you handle)**
- Manual outreach / guest posts / Reddit promotion.
- Submitting embeds to crypto tool directories.
- Buying domain authority shortcuts.

---

## Execution Order

1. Programmatic SEO templates (2.1 → 2.2 → 2.3) + sitemap wiring — biggest traffic upside, fastest to ship.
2. Accuracy leaderboard (1.3) — needed as proof before pitching embeds.
3. Embeddable widgets (1.1) — needs the accuracy page to be credible.
4. Weekly report generator (1.2) — last; depends on cron + data being warm.

## Progress

- [x] **Step 1 done.** Built `src/lib/programmaticSlugs.ts` + 3 page templates
  (`PredictTarget`, `VsCompare`, `Convert`), wired routes in `App.tsx`, and
  generated `public/sitemap-programmatic.xml` with **850 URLs** (linked from
  `robots.txt`). Each page ships full SEO content: H1, intro, stat grid,
  multiple H2 sections, FAQ block, JSON-LD (`FAQPage` + `BreadcrumbList`),
  canonical, og tags, and contextual internal links.
- [x] **Step 2 done.** Public Accuracy Leaderboard at `/accuracy`:
    - New `prediction_outcomes` table (RLS: public read, service-role write).
    - `resolve-predictions` edge function grades expired predictions against
      live CoinGecko prices using the bullish/bearish/neutral target bands.
    - pg_cron job runs the resolver hourly (`7 * * * *`).
    - `/accuracy` page: KPI strip + sortable per-coin leaderboard + "How We
      Score" methodology + `Dataset` JSON-LD.
    - `accuracy-feed` edge function + `/accuracy.json` rewrite for partners.
    - `/accuracy` added to `sitemap.xml`.
- [ ] Step 3 — Embed widgets.
- [ ] Step 4 — Weekly report cron.

Approve and I'll start with step 1.
