---
name: add-coin-coverage
description: Add one or more cryptocurrencies to OracleBull's programmatic-SEO coverage CONSISTENTLY across every route generator so prediction / question / how-to-buy pages and the sitemap stay in sync. Use when asked to "add a coin", "cover more tokens", or expand programmatic SEO.
---

# Add a coin to programmatic SEO coverage

A coin only ranks if it is **prerendered** AND **in the sitemap** AND its page **hydrates with real
live data**. Coverage is generated in two places that must stay in sync:

- `scripts/seo-prerender.mjs` — the `COINS` array of `[coingeckoSlug, 'Display Name', 'SYMBOL']`
  drives the actual prerendered static pages: `/price-prediction/<slug>`, `/how-to-buy/<slug>`,
  and the `/q/...` answer pages (`Q_COINS = COINS.slice(0, 75)`). **This is what ships and what
  the sitemap is built from.**
- `vite.config.ts` — `topCryptoIds` feeds `vite-plugin-sitemap`, but that output is overwritten by
  the seo-prerender sitemap. Keep it in sync for hygiene, but `seo-prerender.mjs` is authoritative.

## Steps per coin

1. Get the correct **CoinGecko id** (slug). It must match what the data layer resolves
   (check `src/lib/extendedCryptos.ts` and `src/hooks/useCryptoPrices.ts` / `useResolvedCoin.ts`).
   A wrong slug = a prerendered page that never hydrates with prices = a thin page.
2. Add `['slug', 'Display Name', 'SYM']` to `COINS` in `scripts/seo-prerender.mjs`.
   If it deserves long-term year pages, also add the slug to the year-prediction allowlist
   (search for the `['bitcoin', 'ethereum', ...].includes(slug)` array).
3. Add the same slug to `topCryptoIds` in `vite.config.ts`.
4. `npm run build`, then confirm the pages exist with coin-specific titles:
   `ls dist/price-prediction/<slug>/index.html dist/how-to-buy/<slug>/index.html`
   `grep -oE '<title>[^<]*</title>' dist/price-prediction/<slug>/index.html`
5. Confirm the page hydrates with real data (open `/price-prediction/<slug>`; the chart/forecast
   must populate — no live data means do not ship the page).
6. typecheck + lint, then ship via the **ship-safe** skill, then **verify-prod-seo**.

## Quality gate (important for the 100k-visitors goal)

Do NOT mass-add low-liquidity coins with no search demand or no CoinGecko data. Near-duplicate
thin pages waste crawl budget and can suppress the whole domain. Prefer coins that have
(a) real live data and (b) genuine search volume.
