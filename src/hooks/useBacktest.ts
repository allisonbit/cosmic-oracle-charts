import { useQuery } from "@tanstack/react-query";
import { backtestSeries, fetchMarkets, fetchPriceSeries, type BacktestOutcome } from "@/lib/marketEngine";

// Coins graded in the live backtest — the majors, run against real 90-day history.
export const BACKTEST_COINS = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple", "cardano"];

// backtestSeries only needs id + symbol. If the /markets fetch fails (rate
// limit, flaky network), fall back to these so a scoreboard isn't blanked.
const COIN_SYMBOLS: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  binancecoin: "BNB",
  ripple: "XRP",
  cardano: "ADA",
};

export interface BacktestOutcomeRow extends BacktestOutcome {
  resolved_at: string;
}

/**
 * Live backtest of the prediction engine against real 90-day history for the
 * majors. Shared by the Accuracy leaderboard and the homepage proof band —
 * same query key means one computation, one cache entry.
 *
 * allSettled so one failed series degrades to fewer coins instead of blanking
 * the scoreboard; cgFetch retries rate limits internally, and successful
 * series stay in the engine cache so gaps backfill on refetch.
 */
export function useBacktestOutcomes() {
  return useQuery({
    queryKey: ["engine-backtest"],
    queryFn: async (): Promise<BacktestOutcomeRow[]> => {
      const [marketsRes, ...seriesRes] = await Promise.allSettled([
        fetchMarkets(250),
        ...BACKTEST_COINS.map(id => fetchPriceSeries(id, 90)),
      ]);
      const markets = marketsRes.status === "fulfilled" ? marketsRes.value : [];
      const out: BacktestOutcomeRow[] = [];

      for (let i = 0; i < BACKTEST_COINS.length; i++) {
        const coinId = BACKTEST_COINS[i];
        const res = seriesRes[i];
        const series = res.status === "fulfilled" ? res.value : null;
        const coin = markets.find(m => m.id === coinId)
          ?? (COIN_SYMBOLS[coinId] ? { id: coinId, symbol: COIN_SYMBOLS[coinId] } : null);
        if (!coin || !series || series.length < 60) continue;
        const s = series;
        const outcomes = backtestSeries({ id: coin.id, symbol: coin.symbol }, s);
        outcomes.forEach(o =>
          out.push({ ...o, resolved_at: new Date(s[Math.min(o.at + 5, s.length - 1)]?.time ?? Date.now()).toISOString() }),
        );
      }
      return out.sort((a, b) => (a.resolved_at < b.resolved_at ? 1 : -1));
    },
    // Successes are cached by the engine (10-min), so a modest refetch only
    // re-fetches series that failed last time — gaps backfill over time.
    staleTime: 4 * 60_000,
  });
}

/** Aggregate overall stats from outcome rows. */
export function summarizeBacktest(rows: BacktestOutcomeRow[] | undefined) {
  const list = rows ?? [];
  const total = list.length;
  const hits = list.filter(r => r.hit).length;
  const coins = new Set(list.map(r => r.coinId)).size;
  return { total, hits, rate: total ? (hits / total) * 100 : 0, coins };
}
