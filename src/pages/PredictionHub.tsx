import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdUnit } from "@/components/ads/AdUnit";
import { AdBreak } from "@/components/ads/AdBreak";
import { LazyAd } from "@/components/ads/LazyAd";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, RefreshCw, Globe, Clock, Calendar, CalendarDays, ChevronRight,
  Search, TrendingUp, TrendingDown, Minus, Target, Trophy,
} from "lucide-react";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";
import { TokenIcon } from "@/components/ui/token-icon";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback, useEffect } from "react";
import { SEO } from "@/components/MainSEO";
import { PredictionHubSEOContent, PredictionsHowItWorks, PredictionsDataMeaning } from "@/components/seo/index";
import { GlobalTokenSearch } from "@/components/prediction/GlobalTokenSearch";
import { GlobalToken } from "@/hooks/useGlobalTokenSearch";
import { cn } from "@/lib/utils";
import { computeLocalSignal } from "@/lib/localSignal";
import { useBacktestOutcomes, summarizeBacktest, BACKTEST_COINS } from "@/hooks/useBacktest";

const formatPrice = (p: number) => {
  if (!p) return "—";
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(4)}`;
};

const formatCompact = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

interface CoinTrackRecord { symbol: string; coinId: string; hits: number; total: number; rate: number }

export default function PredictionHub() {
  const navigate = useNavigate();
  const { data: pricesData, isLoading, refetch, isFetching } = useCryptoPrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'marketCap'>('confidence');
  const [liveTime, setLiveTime] = useState(new Date());

  // Real engine track record — same shared backtest cache as the Accuracy page.
  const { data: outcomeRows } = useBacktestOutcomes();
  const proof = summarizeBacktest(outcomeRows);
  const coinRecords = useMemo<CoinTrackRecord[]>(() => {
    const byCoin = new Map<string, CoinTrackRecord>();
    (outcomeRows ?? []).forEach(r => {
      const rec = byCoin.get(r.coinId) ?? { symbol: r.symbol.toUpperCase(), coinId: r.coinId, hits: 0, total: 0, rate: 0 };
      rec.total += 1;
      if (r.hit) rec.hits += 1;
      byCoin.set(r.coinId, rec);
    });
    return [...byCoin.values()]
      .map(rec => ({ ...rec, rate: rec.total ? (rec.hits / rec.total) * 100 : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [outcomeRows]);

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenSelect = useCallback((token: GlobalToken) => {
    const tokenSlug = token.id || token.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/price-prediction/${tokenSlug}/daily`);
  }, [navigate]);

  // Build token list from the top 50 with a real per-coin local signal
  // computed from live prices — distinct bias/confidence for every token.
  const displayCryptos = useMemo(() => {
    return TOP_50_CRYPTOS.map(crypto => {
      const priceData = pricesData?.prices?.find(
        p => p.symbol.toLowerCase() === crypto.symbol.toLowerCase()
      );
      const change24h = priceData?.change24h ?? 0;

      const local = computeLocalSignal({
        symbol: crypto.symbol,
        price: priceData?.price || 0,
        change24h,
        high24h: priceData?.high24h,
        low24h: priceData?.low24h,
        volume24h: priceData?.volume24h,
        marketCap: priceData?.marketCap,
      }, 'daily');

      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: priceData?.price || 0,
        change24h,
        marketCap: priceData?.marketCap || 0,
        bias: local.bias,
        confidence: local.confidence,
        signalStrength: local.rsi,
        riskLevel: local.riskLevel,
      };
    });
  }, [pricesData]);

  const filteredCryptos = useMemo(() => {
    const result = displayCryptos.filter(crypto => {
      const matchesSearch = !searchQuery ||
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || crypto.bias === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence': return b.confidence - a.confidence;
        case 'change': return b.change24h - a.change24h;
        case 'marketCap': return b.marketCap - a.marketCap;
        default: return 0;
      }
    });
    return result;
  }, [displayCryptos, searchQuery, selectedCategory, sortBy]);

  const marketStats = useMemo(() => {
    const bullish = displayCryptos.filter(c => c.bias === 'bullish').length;
    const bearish = displayCryptos.filter(c => c.bias === 'bearish').length;
    const avgConfidence = displayCryptos.length > 0
      ? (displayCryptos.reduce((s, c) => s + c.confidence, 0) / displayCryptos.length).toFixed(0)
      : '0';
    return { bullish, bearish, neutral: displayCryptos.length - bullish - bearish, avgConfidence };
  }, [displayCryptos]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="AI Crypto Predictions | Real-Time Token Analysis | Oracle Bull"
        description="AI-powered crypto predictions computed from real 90-day market history. RSI, MACD, moving averages and Bollinger Bands for 50+ major tokens — daily, weekly, monthly forecasts, with a public track record."
        keywords="crypto prediction, token analysis, bitcoin prediction, AI trading signals, real-time crypto forecast"
        canonicalPath="/predictions"
      />

      <header><Navbar /></header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-10">
        {/* === LIVE MONITORING BAR === */}
        <div className="flex flex-wrap items-center gap-3 mb-6 px-0 py-2.5 border-b border-border/30 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-success font-medium">LIVE</span>
          </div>
          <span className="text-muted-foreground font-mono">{liveTime.toLocaleTimeString()}</span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Signals: <span className="text-foreground font-medium">computed from live prices</span>
          </span>
          {pricesData?.timestamp && (
            <>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">
                Last: {new Date(pricesData.timestamp).toLocaleTimeString()}
              </span>
            </>
          )}
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-6 px-2 text-xs gap-1"
            >
              <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
              {isFetching ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* === HERO === */}
        <section className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              AI Crypto Price Predictions
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Real signals computed from <strong>real market history</strong> for the top 50 tokens —
              RSI, MACD, moving averages and Bollinger Bands, with entry zones, stops and targets.
            </p>
          </div>

          {/* Market Pulse Bar */}
          <div className="flex flex-wrap gap-0 mb-6 border-y border-border/30 divide-x divide-border/30">
            <div className="stat-inline flex-1 min-w-[120px] py-4 px-4">
              <span className="section-label mb-1">Bullish Signals</span>
              <span className="stat-value text-success">{marketStats.bullish}</span>
              <span className="stat-label">of {displayCryptos.length} tokens</span>
            </div>
            <div className="stat-inline flex-1 min-w-[120px] py-4 px-4">
              <span className="section-label mb-1">Bearish Signals</span>
              <span className="stat-value text-danger">{marketStats.bearish}</span>
              <span className="stat-label">of {displayCryptos.length} tokens</span>
            </div>
            <div className="stat-inline flex-1 min-w-[120px] py-4 px-4">
              <span className="section-label mb-1">Neutral</span>
              <span className="stat-value text-warning">{marketStats.neutral}</span>
              <span className="stat-label">waiting for signal</span>
            </div>
            <div className="stat-inline flex-1 min-w-[120px] py-4 px-4">
              <span className="section-label mb-1">Avg Confidence</span>
              <span className="stat-value text-primary">{marketStats.avgConfidence}%</span>
              <span className="stat-label">across all tokens</span>
            </div>
          </div>
        </section>

        {/* === GLOBAL SEARCH === */}
        <section className="mb-8 relative" style={{ zIndex: 100 }}>
          <div className="border-b border-primary/30 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Search Any Token Worldwide</span>
              <Badge variant="outline" className="text-[10px] ml-auto">CoinGecko data</Badge>
            </div>
            <GlobalTokenSearch
              onSelect={handleTokenSelect}
              onSearchResults={() => {}}
              placeholder="Search token name or symbol (PEPE, WIF)..."
            />
          </div>
        </section>

        {/* === ENGINE TRACK RECORD — real, verifiable === */}
        <section className="mb-8 border-t border-border/30 pt-6" aria-labelledby="track-record-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-warning" />
                <span className="section-label">Engine Track Record</span>
              </div>
              <h2 id="track-record-heading" className="text-xl font-bold">
                How the Engine Has <span className="text-gradient-cosmic">Actually Performed</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Today's prediction logic replayed over 90 days of real history — every call graded, hits and misses.
              </p>
            </div>
            <Link
              to="/accuracy"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              Full leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {proof.total > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="stat-value text-2xl">{proof.rate.toFixed(1)}%</p>
                  <p className="section-label mt-1">Overall Hit Rate</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="stat-value text-2xl">{proof.total.toLocaleString()}</p>
                  <p className="section-label mt-1">Calls Graded</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="stat-value text-2xl">{proof.hits.toLocaleString()}</p>
                  <p className="section-label mt-1">Correct</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card px-4 py-3 text-center">
                  <p className="stat-value text-2xl">{(proof.total - proof.hits).toLocaleString()}</p>
                  <p className="section-label mt-1">Misses — published too</p>
                </div>
              </div>
              {coinRecords.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {coinRecords.map(rec => (
                    <Link
                      key={rec.coinId}
                      to={`/price-prediction/${rec.coinId}/daily`}
                      className="rounded-lg border border-border/50 bg-card px-3 py-2.5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{rec.symbol}</span>
                        <span className={cn(
                          "text-xs font-bold tabular-nums",
                          rec.rate >= 55 ? "text-success" : rec.rate >= 45 ? "text-foreground" : "text-danger",
                        )}>{rec.rate.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", rec.rate >= 55 ? "bg-success" : rec.rate >= 45 ? "bg-primary" : "bg-danger")}
                          style={{ width: `${rec.rate}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{rec.hits}/{rec.total} correct</p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-foreground">Running the live backtest…</p>
              <p className="text-xs text-muted-foreground mt-1">
                Grading ~4,200 calls against real history. First run takes a minute — refresh shortly.
              </p>
            </div>
          )}
        </section>

        {/* === TIMEFRAME LINKS === */}
        <section className="grid md:grid-cols-3 gap-3 mb-8">
          {[
            { id: 'daily', label: 'Daily Predictions', icon: Clock, desc: 'Intraday plan • volatility-sized entry, stop and targets' },
            { id: 'weekly', label: 'Weekly Forecast', icon: Calendar, desc: 'Swing horizon • wider bands, trend-following read' },
            { id: 'monthly', label: 'Monthly Outlook', icon: CalendarDays, desc: 'Position horizon • macro structure over daily noise' },
          ].map(tf => (
            <Link
              key={tf.id}
              to={`/price-prediction/bitcoin/${tf.id}`}
              className="group border-t border-border/40 pt-5 pb-4 hover:bg-muted/20 px-2 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <tf.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{tf.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{tf.desc}</p>
              <div className="mt-3 flex items-center text-primary text-xs font-medium group-hover:translate-x-1 transition-transform">
                Explore <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </section>

        <AdBreak variant="compact" />

        {/* === MAIN TOKEN TABLE === */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Token Signals
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filteredCryptos.length} tokens monitored • signals recomputed from live prices</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-card"
                />
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 border-b border-border/30 pb-3">
            <div className="flex items-center gap-4 text-xs">
              {(['all', 'bullish', 'bearish', 'neutral'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "font-medium transition-colors capitalize pb-1 -mb-[13px] border-b-2",
                    selectedCategory === cat
                      ? "text-primary border-primary font-semibold"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-b border-border px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
              >
                <option value="confidence">Confidence</option>
                <option value="change">24h Change</option>
                <option value="marketCap">Market Cap</option>
              </select>
            </div>
          </div>

          {/* Token Table */}
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted/20 animate-pulse border-b border-border/20" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden border-t border-border/40">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground w-10">#</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground w-[180px] min-w-[140px]">Token</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground w-[100px]">Price</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground w-[80px]">24h</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground w-[90px]">AI Signal</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground w-[120px]">Confidence</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground w-[70px]">Risk</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground w-[100px]">Mkt Cap</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground w-[70px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCryptos.map((crypto, idx) => (
                      <tr
                        key={crypto.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/price-prediction/${crypto.id}/daily`)}
                      >
                        <td className="p-3 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <TokenIcon coinId={crypto.id} symbol={crypto.symbol} size="md" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{crypto.name}</div>
                              <div className="text-[10px] text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-sm tabular-nums">{formatPrice(crypto.price)}</td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            "font-mono text-xs font-medium tabular-nums",
                            crypto.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {crypto.change24h >= 0 ? '+' : ''}{(crypto.change24h ?? 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] gap-0.5 font-medium",
                              crypto.bias === 'bullish' ? 'border-success/40 text-success bg-success/5' :
                              crypto.bias === 'bearish' ? 'border-danger/40 text-danger bg-danger/5' :
                              'border-warning/40 text-warning bg-warning/5'
                            )}
                          >
                            {crypto.bias === 'bullish' && <TrendingUp className="w-3 h-3" />}
                            {crypto.bias === 'bearish' && <TrendingDown className="w-3 h-3" />}
                            {crypto.bias === 'neutral' && <Minus className="w-3 h-3" />}
                            {crypto.bias.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  crypto.confidence >= 70 ? "bg-success" :
                                  crypto.confidence >= 55 ? "bg-warning" : "bg-danger"
                                )}
                                style={{ width: `${crypto.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono tabular-nums w-8 text-right">{crypto.confidence}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={cn("text-[10px] capitalize",
                            crypto.riskLevel === 'low' ? 'text-success border-success/30' :
                            crypto.riskLevel === 'medium' ? 'text-warning border-warning/30' :
                            'text-danger border-danger/30'
                          )}>
                            {crypto.riskLevel}
                          </Badge>
                        </td>
                        <td className="p-3 text-right text-xs text-muted-foreground font-mono tabular-nums">
                          {crypto.marketCap > 0 ? formatCompact(crypto.marketCap) : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <ChevronRight className="w-4 h-4 text-muted-foreground mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <AdBreak variant="full" />

        {/* === SEO CONTENT === */}
        <PredictionsHowItWorks />
        <PredictionsDataMeaning />
        <PredictionHubSEOContent />

        <section className="mt-8 border-t border-border/30 pt-8">
          <h2 className="text-2xl font-bold mb-4">About AI Crypto Predictions</h2>
          <div className="prose max-w-none text-muted-foreground text-sm">
            <p className="mb-3">
              Oracle Bull generates predictions for the top 50 tokens — and any token you search — by computing{" "}
              <strong>real technical indicators</strong> on real market history: RSI(14) for momentum extremes, MACD for
              trend direction, MA20/MA50 crossovers for structure, and Bollinger Bands for volatility positioning. Every
              forecast ships with a bias, a confidence score, and volatility-sized entry zones, stops and targets.
            </p>
            <p className="mb-3">
              Signals are recomputed from live CoinGecko data each visit — no stale cache, no black box. If there isn't
              enough history to compute a real read, the engine shows no prediction rather than a fabricated one.
            </p>
            <p>
              And because trust requires evidence, the same prediction logic is replayed over 90 days of history on the{" "}
              <Link to="/accuracy" className="text-primary hover:underline">Accuracy leaderboard</Link> — roughly{" "}
              {proof.total ? proof.total.toLocaleString() : "4,000"} graded calls across {BACKTEST_COINS.length} majors,
              misses included. Treat every signal as a research input, never financial advice.
            </p>
          </div>
        </section>
      </main>

      <LazyAd className="space-y-1">
        <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
      </LazyAd>
      <Footer />
      <MobileBottomNav />

    </div>
  );
}
