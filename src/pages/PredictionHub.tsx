import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdsterraNative } from "@/components/ads/AdsterraNative";
import { AdUnit } from "@/components/ads/AdUnit";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { AdsterraBanner300 } from "@/components/ads/AdsterraBanner300";
import { AdsterraBanner320 } from "@/components/ads/AdsterraBanner320";
import { AdsterraSmartlink } from "@/components/ads/AdsterraSmartlink";
import { AdsterraStickyBanner } from "@/components/ads/AdsterraStickyBanner";
import { AdBreak } from "@/components/ads/AdBreak";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Minus, Clock, Calendar, CalendarDays,
  ChevronRight, Zap, Target, Shield, BarChart3, Globe, Sparkles,
  Search, ArrowUpRight, Activity, RefreshCw, Radio, Eye, Filter,
  Bookmark, CheckCircle2, XCircle
} from "lucide-react";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";
import { TokenIcon } from "@/components/ui/token-icon";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback, useEffect } from "react";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { PredictionHubSEOContent, PredictionsHowItWorks, PredictionsDataMeaning } from "@/components/seo/index";
import { GlobalTokenSearch } from "@/components/prediction/GlobalTokenSearch";
import { PredictionLeaderboard } from "@/components/prediction/PredictionLeaderboard";
import { GlobalToken } from "@/hooks/useGlobalTokenSearch";
import { cn } from "@/lib/utils";
import { computeLocalSignal } from "@/lib/localSignal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMySetups, TradeSetup } from "@/hooks/useTradeSetups";
import { useAuth } from "@/hooks/useAuth";

const formatPrice = (p: number) => {
  if (!p || p <= 0) return '—';
  if (p >= 1000) return `$${(p ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${(p ?? 0).toFixed(2)}`;
  if (p >= 0.01) return `$${(p ?? 0).toFixed(4)}`;
  return `$${(p ?? 0).toPrecision(4)}`;
};

const formatCompact = (n: number) => {
  if (!n || n <= 0) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${(n ?? 0).toLocaleString()}`;
};

// Fetch cached predictions from database
function useCachedPredictions() {
  return useQuery({
    queryKey: ['cached-predictions-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions_cache')
        .select('coin_id, symbol, bias, confidence, current_price, prediction_data, timeframe, created_at')
        .eq('timeframe', 'daily')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
    refetchIntervalInBackground: true,
  });
}

export default function PredictionHub() {
  const navigate = useNavigate();
  const { data: pricesData, isLoading, refetch, isFetching } = useCryptoPrices();
  const { data: cachedPredictions } = useCachedPredictions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'marketCap'>('confidence');
  const [liveTime, setLiveTime] = useState(new Date());
  const { user } = useAuth();
  const { data: mySetups } = useMySetups();
  const [showSavedSetups, setShowSavedSetups] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenSelect = useCallback((token: GlobalToken) => {
    const tokenSlug = token.id || token.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/price-prediction/${tokenSlug}/daily`);
  }, [navigate]);

  // Build token list from top 50 with real cached AI data
  const displayCryptos = useMemo(() => {
    return TOP_50_CRYPTOS.map(crypto => {
      const priceData = pricesData?.prices?.find(
        p => p.symbol.toLowerCase() === crypto.symbol.toLowerCase()
      );
      const change24h = priceData?.change24h ?? 0;
      
      // Use real cached prediction data if available
      const cached = cachedPredictions?.find(
        p => p.coin_id === crypto.id || p.symbol?.toLowerCase() === crypto.symbol.toLowerCase()
      );
      
      const predData = cached?.prediction_data as any;

      // Per-coin local signal from live data — used when there's no cached AI
      // prediction so each token gets a distinct bias/confidence (not a flat value).
      const local = computeLocalSignal({
        symbol: crypto.symbol,
        price: priceData?.price || cached?.current_price || 0,
        change24h,
        high24h: priceData?.high24h,
        low24h: priceData?.low24h,
        volume24h: priceData?.volume24h,
        marketCap: priceData?.marketCap,
      }, 'daily');

      const bias: 'bullish' | 'bearish' | 'neutral' = (cached?.bias as any) || local.bias;
      const confidence = cached?.confidence || local.confidence;
      const signalStrength = predData?.technicalIndicators
        ? Math.floor((predData.technicalIndicators.rsi || 50) + (confidence * 0.3))
        : Math.floor((local.rsi + confidence) / 2);

      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: priceData?.price || cached?.current_price || 0,
        change24h,
        marketCap: priceData?.marketCap || 0,
        bias,
        confidence,
        signalStrength,
        hasCachedPrediction: !!cached,
        riskLevel: predData?.riskLevel || local.riskLevel,
      };
    });
  }, [pricesData, cachedPredictions]);

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
        description="Get AI-powered predictions for ANY cryptocurrency worldwide. Real-time monitoring with 50+ technical indicators. Daily, weekly, monthly forecasts auto-updated."
        keywords="crypto prediction, token analysis, bitcoin prediction, AI trading signals, real-time crypto forecast"
        canonicalPath="/predictions"
      />
      <Helmet>
        
      </Helmet>

      <header><Navbar /></header>

      <main className="flex-1 container mx-auto px-4 py-20 md:py-28">
        <AdsterraSmartlink variant="banner" className="my-3 max-w-5xl mx-auto" />
        <div className="hidden md:block"><AdsterraBanner className="my-2" /></div>
        <div className="block md:hidden"><AdsterraBanner320 className="my-2" /></div>
        <AdUnit format="horizontal" className="my-2 max-w-5xl mx-auto" />

        <div className="flex justify-center mb-5">
        </div>

        {/* === LIVE MONITORING BAR === */}
        <div className="flex flex-wrap items-center gap-3 mb-6 px-0 py-2.5 border-b border-border/30 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-success font-medium">LIVE</span>
          </div>
          <span className="text-muted-foreground font-mono">{liveTime.toLocaleTimeString()}</span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Prices: <span className="text-foreground font-medium">15s</span>
          </span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            AI Cache: <span className="text-foreground font-medium">2m</span>
          </span>
          {cachedPredictions && cachedPredictions.length > 0 && (
            <>
              <span className="text-border">|</span>
              <Badge variant="outline" className="text-[10px] gap-1 border-success/30 text-success">
                <Zap className="w-2.5 h-2.5" /> {cachedPredictions.length} cached
              </Badge>
            </>
          )}
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
        <section className="mb-10">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              AI Crypto Price Predictions
            </h1>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Real-time AI analysis for <strong>every token on DexScreener</strong>. Search by name, symbol, or contract address.
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
              <Badge variant="outline" className="text-[10px] ml-auto">DexScreener + CoinGecko</Badge>
            </div>
            <GlobalTokenSearch 
              onSelect={handleTokenSelect}
              onSearchResults={() => {}}
              placeholder="Search token name, symbol (PEPE, WIF), or paste contract address (0x...)..."
            />
          </div>
        </section>

        {/* === TIMEFRAME LINKS === */}
        <section className="grid md:grid-cols-3 gap-3 mb-8">
          {[
            { id: 'daily', label: 'Daily Predictions', icon: Clock, desc: 'Intraday signals • Entry/Exit zones • 5-min updates' },
            { id: 'weekly', label: 'Weekly Forecast', icon: Calendar, desc: 'Swing trade setups • Breakout analysis • 30-min updates' },
            { id: 'monthly', label: 'Monthly Outlook', icon: CalendarDays, desc: 'Investment thesis • Macro factors • Hourly updates' },
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


        {/* === LEADERBOARD === */}
        <section className="mb-8">
          <PredictionLeaderboard />
        </section>

        {/* === MY SAVED SETUPS === */}
        {user?.id && mySetups && mySetups.length > 0 && (
          <section className="mb-8 border-t border-border/30 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                My Saved Setups
                <Badge variant="outline" className="text-[10px] ml-1">{mySetups.length}</Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setShowSavedSetups(!showSavedSetups)}
              >
                {showSavedSetups ? "Hide" : "Show All"}
              </Button>
            </div>
            {showSavedSetups && (
              <div className="border-t border-border/40 overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Token</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Direction</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Entry</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Stop Loss</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">TP1</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">P&L</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySetups.map((s: TradeSetup) => {
                      const isWin = s.status === "hit_tp1" || s.status === "hit_tp2" || s.status === "hit_tp3";
                      const isStopped = s.status === "stopped";
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => navigate(`/price-prediction/${s.coin_id}/${s.timeframe}`)}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <TokenIcon coinId={s.coin_id} symbol={s.symbol} size="sm" />
                              <div>
                                <div className="font-medium text-sm">{s.name}</div>
                                <div className="text-[10px] text-muted-foreground">{s.symbol.toUpperCase()} · {s.timeframe}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={cn("text-[10px] gap-0.5",
                              s.bias === "bullish" ? "border-success/40 text-success" :
                              s.bias === "bearish" ? "border-danger/40 text-danger" :
                              "border-warning/40 text-warning"
                            )}>
                              {s.bias === "bullish" && <TrendingUp className="w-3 h-3" />}
                              {s.bias === "bearish" && <TrendingDown className="w-3 h-3" />}
                              {s.bias === "neutral" && <Minus className="w-3 h-3" />}
                              {s.bias.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-mono text-xs">{formatPrice(s.entry_price)}</td>
                          <td className="p-3 text-right font-mono text-xs text-danger">{formatPrice(s.stop_loss)}</td>
                          <td className="p-3 text-right font-mono text-xs text-success">{formatPrice(s.take_profit_1)}</td>
                          <td className="p-3 text-center">
                            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold",
                              isWin ? "text-success" : isStopped ? "text-danger" :
                              s.status === "active" ? "text-primary" : "text-muted-foreground"
                            )}>
                              {isWin && <CheckCircle2 className="w-3 h-3" />}
                              {isStopped && <XCircle className="w-3 h-3" />}
                              {s.status === "active" && <Activity className="w-3 h-3" />}
                              {s.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className={cn("font-mono text-xs font-bold",
                              (s.pnl_percent || 0) >= 0 ? "text-success" : "text-danger"
                            )}>
                              {(s.pnl_percent || 0) >= 0 ? "+" : ""}{(s.pnl_percent || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-right text-xs text-muted-foreground">
                            {new Date(s.generated_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* === MAIN TOKEN TABLE === */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Token Signals
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filteredCryptos.length} tokens monitored • Auto-refreshing</p>
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
                              <div className="font-medium text-sm truncate flex items-center gap-1">
                                {crypto.name}
                                {crypto.hasCachedPrediction && (
                                  <Zap className="w-3 h-3 text-primary shrink-0" />
                                )}
                              </div>
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

        <div className="container mx-auto px-4 mb-8">
        </div>

        {/* === SEO CONTENT === */}
        <PredictionsHowItWorks />
        <PredictionsDataMeaning />
        <PredictionHubSEOContent />

        <section className="mt-8 border-t border-border/30 pt-8">
          <h2 className="text-2xl font-bold mb-4">About AI Crypto Predictions</h2>
          <div className="prose max-w-none text-muted-foreground text-sm">
            <p className="mb-3">
              Oracle Bull provides AI-powered cryptocurrency predictions for <strong>any token in the world</strong>. 
              Search by name, symbol, or paste a contract address to get instant analysis with 50+ technical indicators.
            </p>
            <p className="mb-3">
              Our system monitors <strong>every token on DexScreener and CoinGecko</strong> in real-time, delivering 
              institutional-grade analysis including RSI, MACD, Bollinger Bands, support/resistance levels, and 
              AI-generated trading zones with entry, stop-loss, and take-profit targets.
            </p>
            <p>
              All predictions auto-update continuously: daily predictions refresh every 5 minutes, weekly every 30 minutes, 
              and monthly every hour — ensuring you always have the latest market intelligence.
            </p>
          </div>
        </section>

        <div className="flex justify-center mt-8">
        </div>
      </main>

      <AdsterraNative className="my-4 max-w-5xl mx-auto px-4" />
      <AdsterraBanner300 className="my-4" />
      <div className="hidden md:block"><AdsterraBanner className="my-4" /></div>
      <div className="block md:hidden"><AdsterraBanner320 className="my-4" /></div>
      <AdsterraSmartlink variant="button" className="my-4" />
      <AdUnit format="horizontal" className="mt-6 mb-2 max-w-5xl mx-auto px-4" />
      <Footer />
      <MobileBottomNav />
      <AdsterraStickyBanner />
    </div>
  );
}
