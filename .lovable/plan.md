# Cosmic Oracle: 5-Feature Rollout Plan

Ship in this exact order. Each step is independently deployable so nothing blocks the next.

---

## Step 1 — Daily Digest Email

**What:** Users subscribe an email; every morning (08:00 UTC) they get top 5 gainers, top 5 losers, and 3 highest-confidence AI forecasts.

**Build:**
- New table `digest_subscribers` (email, is_active, unsubscribe_token, created_at) with RLS: anonymous can INSERT, only service_role can SELECT/UPDATE.
- Edge function `send-daily-digest`: pulls movers from CoinGecko + top 3 rows from `predictions_cache` ordered by confidence, renders branded HTML, sends via Resend (needs `RESEND_API_KEY`).
- pg_cron: daily 08:00 UTC.
- UI: `<DigestSignup>` component on homepage footer + `/unsubscribe/:token` page.

---

## Step 2 — Mobile-Optimized Dashboard

**What:** New route `/m` (auto-redirect from `/dashboard` when viewport < 768px) — a swipeable, single-column, tap-friendly command center.

**Build:**
- `src/pages/MobileDashboard.tsx` with 4 swipe tabs: Markets, Signals, Portfolio, AI Picks.
- Fluid `clamp()` typography, 48px touch targets, sticky bottom nav already exists.
- Pull-to-refresh on the top scroll container.
- Lazy-load each tab (React.lazy).

---

## Step 3 — Chart Export (PNG / SVG)

**What:** Every price/prediction chart gets an "Export" menu → PNG or SVG download with watermark.

**Build:**
- `src/lib/chartExport.ts` — utility using `html-to-image` (already MIT-safe) to serialize the target chart DOM node.
- `<ChartExportButton chartRef={ref} filename="btc-daily.png" />` dropdown.
- Wire into `PredictionChart`, `PriceSeries`, and `TokenChartTab`.

---

## Step 4 — Public REST API

**What:** `https://oraclebull.com/api/v1/*` — free, rate-limited JSON endpoints.

**Endpoints:**
- `GET /api/v1/price/:coin` — live price + 24h change
- `GET /api/v1/trending` — top movers
- `GET /api/v1/prediction/:coin/:timeframe` — cached AI forecast

**Build:**
- Edge function `public-api` handling all three paths via URL routing.
- Redirect `/api/v1/*` → the edge function in the Cloudflare/Netlify config.
- Simple IP-based rate limit (60 req/min) using an in-memory Map + 5-min TTL.
- Docs on the existing `/connect` page.

---

## Step 5 — Guided Tutorial Page

**What:** `/how-to-read-predictions` — long-form walkthrough with annotated screenshots, live example, and an interactive "try it" section.

**Build:**
- `src/pages/TutorialPage.tsx` — sticky-nav sections: Reading the bias badge, Confidence %, Support/resistance zones, RSI/MACD, Bull vs Bear scenarios, Common mistakes.
- FAQ + HowTo JSON-LD for rich results.
- Link from Prediction pages ("New here? Learn how to read this →") and nav menu.

---

## Technical stack notes

- All backend on Supabase Edge Functions + Lovable Cloud (already provisioned).
- Digest emails need a `RESEND_API_KEY` (I'll request it before Step 1).
- No new npm deps except `html-to-image` for Step 3.
- Every new page: canonical, OG tags, JSON-LD via existing `PredictionSEO`/`FAQHowToSchema` patterns.
- Rollout order is strict — Step 1 → 5, one after another, verifying each before moving on.
