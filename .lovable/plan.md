## Goal
Eliminate every `Math.random()`-driven number across the site and wire each panel to a real data source. Where no free real-time API exists, hide the panel rather than show simulated values (matches your "no hardcoded fake data" core rule).

## Audit summary
50+ components currently fabricate data with `Math.random()`. Grouped by what they pretend to show:

| Group | Files | Real source available? |
|---|---|---|
| Price sparklines / charts | `CryptoChart`, `PortfolioChart`, `AdvancedPriceChart`, `SignalChart`, `EnhancedPriceAnalysis` | Yes — CoinGecko `/coins/{id}/market_chart` |
| Sector performance / dominance / regime | `SectorPerformancePanel`, `EnhancedDominanceChart`, `MarketRegimeIndicator`, `EnhancedMarketMomentum`, `CorrelationMatrix` | Yes — CoinGecko categories + global |
| Volume / trending / movers | `TopMovers`, `TrendingSearches`, `VolumeLeaders`, `TopTokensTable`, `EcosystemTokensPanel` | Yes — CoinGecko search/trending |
| Whale & on-chain flow | `EnhancedWhaleTracker`, `WhaleActivityRadar`, `EnhancedSmartMoneyFlow`, `EnhancedDailySummary` | Partial — Alchemy (already wired for some) |
| Sentiment / signals / alerts | `EnhancedSignalsPanel`, `EnhancedOverviewPanel`, `LiveAlertsFeed`, `DivergenceScanner`, `SocialSentimentGalaxy`, `TokenSentimentSearch` | Partial — existing `sentiment-data` edge fn; gaps must hide |
| Token detail (holders/trading/security) | `TokenHoldersTab`, `TokenTradingTab`, `EnhancedTokenDetailPanel`, `CoinDetailModal`, `TokenDetailModal` | Holders: Alchemy `getOwnersForToken`; trades: DexScreener `/latest/dex/tokens` |
| Recent trades / options / network info | `RecentTradesPanel`, `OptionsFlowPanel`, `NetworkInfoPanel`, `MarketStatsBar` | Trades: Binance `/api/v3/trades`; Options: **no free source → remove**; Network: chain RPC |
| Misc UI demo | `MyCopyTrading`, `MySignals`, `MyNewsFeed`, `LearnArticle`, `CTASection`, `AlertDetailModal`, `EcosystemTokenSearch`, `EnhancedTrendingAlerts` | Mix — wire to existing hooks or hide demo numbers |

## Phased delivery (each phase is a separate message)

**Phase 1 — Dashboard core (this turn)**
- `RecentTradesPanel` → Binance `/api/v3/trades` via new `live-trades` edge fn (BTC/ETH/SOL/top symbols rotation)
- `SectorPerformancePanel` → CoinGecko `/coins/categories`
- `CryptoChart` 24h sparkline → CoinGecko `market_chart` (cached 60s)
- `VolumeLeaders` already uses real `useMarketData` — verify no random
- Fix order-book HTML-not-JSON error in console (broken edge fn URL)

**Phase 2 — Token detail & explorer**
- `MarketStatsBar` → real chain stats via DefiLlama `/chains` + DexScreener counts
- `TokenHoldersTab` → Alchemy `alchemy_getOwnersForToken`
- `TokenTradingTab` recent trades → DexScreener `latest/dex/tokens/{address}`
- `EnhancedTokenDetailPanel`, `CoinDetailModal`, `TokenDetailModal` → CoinGecko `/coins/{id}`
- `TopTokensTable` → already has `useMarketData`, strip random

**Phase 3 — Sentiment & signals**
- Audit `EnhancedSignalsPanel`, `EnhancedOverviewPanel`, `LiveAlertsFeed`, `DivergenceScanner`, `SocialSentimentGalaxy`, `TokenSentimentSearch`, `EnhancedWhaleTracker` — replace random with `sentiment-data`/`whale-tracker` edge fn output; hide cards where source is empty.

**Phase 4 — Chain analytics & misc**
- `WhaleActivityRadar`, `EnhancedSmartMoneyFlow`, `EnhancedDailySummary`, `NetworkInfoPanel`, `AdvancedPriceChart`, `EnhancedPriceAnalysis`, `EnhancedPredictionDeepDive`, `EnhancedRiskAnalyzer`, `EnhancedSocialSentimentGalaxy`, `EcosystemTokensPanel`, `EcosystemTokenSearch`
- `MyCopyTrading`, `MySignals`, `MyNewsFeed`, `EnhancedTrendingAlerts`, `AlertDetailModal`, `LearnArticle`, `CTASection`, `TrendingSearches`, `TopMovers`, `PortfolioChart`, `CorrelationMatrix`, `EnhancedDominanceChart`, `EnhancedMarketMomentum`, `MarketRegimeIndicator`, `OptionsFlowPanel`, `SignalChart`, `PredictionCard`, `SectorStrengthHeatmap`, `DailyStrengthReport`

## Items being removed (no free real source)
- `OptionsFlowPanel` — institutional options flow requires Deribit Pro / Laevitas (paid). Will hide.
- `CorrelationMatrix` random base → compute from real 30d CoinGecko prices (keep, real).
- `MyCopyTrading` follower stats → keep only DB-backed `user_follows` data, strip vanity numbers.

## Technical notes
- All new edge functions: short cache via `predictions_cache` table pattern (or in-memory map keyed by minute) to avoid hammering free APIs.
- Multiple Alchemy keys already rotated via `ALCHEMY_API_KEY_1..5`.
- Loading states stay `animate-pulse` skeletons; on hard failure (rare) show "—" not random.

## Deliverable for this turn
Phase 1 only — Dashboard panels + order-book fix. Phases 2-4 follow on your go-ahead.