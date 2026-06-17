# Blue Pro Plan

Three phases. I ship phase 1, you confirm, I ship phase 2, and so on. No big-bang rewrites.

## Phase 1 — Bug sweep (ship first)

Goal: zero red errors on `/`, `/dashboard`, `/tools`, `/explorer`, `/sentiment`.

1. Drive Playwright across the 5 hot routes, capture console + network failures, screenshot each.
2. Fix the known offenders from the current console:
   - `useMarketData` "Failed to fetch" fallback warning → add timeout + 1 retry + silent fallback so it stops spamming.
   - `orderbook` edge fn returning HTML (noted in `.lovable/plan.md`) → repair endpoint URL / CORS.
3. Fix anything else the sweep surfaces (broken edge fn, 404 asset, hydration warning).

Done when all 5 routes load with a clean console.

## Phase 2 — Performance pass on hot routes

Goal: measurable LCP/INP win on `/` and `/dashboard`, no behaviour change.

1. Run Lighthouse via Playwright on `/` and `/dashboard`, save the JSON.
2. Target only what the trace flags. Likely candidates:
   - Add `<link rel="preconnect">` for the 2-3 actually-used API origins.
   - Convert any large non-hero image in `public/` to WebP/AVIF (script-only, no code churn).
   - Defer any third-party script that blocks LCP (AdSense already deferred; double-check ticker/analytics).
3. Re-run Lighthouse, paste before/after scores.

No `manualChunks`, no blanket `React.memo`, no React-Query swap — these are explicitly forbidden by project memory.

## Phase 3 — Kill remaining `Math.random()` data

Walk through `.lovable/plan.md` phases 2 → 4 in order:

- **2:** `MarketStatsBar`, `TokenHoldersTab`, `TokenTradingTab`, token detail panels, `TopTokensTable`.
- **3:** Sentiment + signals panels (use existing `sentiment-data` / `whale-tracker` edge fns; hide cards with no source).
- **4:** Chain analytics, misc demo numbers, `MyCopyTrading` / `MySignals` / `MyNewsFeed`.

Rule per file: wire to real API → on failure show `—` and a skeleton, never random.

## Out of scope (won't touch)

- Custom Vite chunking (caused TDZ outage — memory rule).
- Dark mode / non-Inter fonts (memory rule).
- Removing AdSense, adding paid tiers, re-adding Telegram (memory rules).
- `OptionsFlowPanel` — no free data source, will be hidden per existing plan.

## Deliverable for the first reply

Phase 1 only: bug sweep + the two known fixes, with Playwright screenshots showing clean console. Then I stop and wait for your go-ahead on Phase 2.
