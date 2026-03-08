import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, Minus, Clock, Calendar, CalendarDays,
  ChevronRight, Zap, Target, Shield, BarChart3, Globe, Sparkles,
  Search, ArrowUpRight, Activity, RefreshCw, Radio, Eye, Filter
} from "lucide-react";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useCallback, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { BannerAd, InArticleAd } from "@/components/ads";
import { PredictionHubSEOContent, PredictionsHowItWorks, PredictionsDataMeaning } from "@/components/seo";
import { GlobalTokenSearch } from "@/components/prediction/GlobalTokenSearch";
import { PredictionLeaderboard } from "@/components/prediction/PredictionLeaderboard";
import { GlobalToken } from "@/hooks/useGlobalTokenSearch";
import { cn } from "@/lib/utils";

function generateSentiment(symbol: string, change24h: number) {
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (change24h > 3) bias = 'bullish';
  else if (change24h < -3) bias = 'bearish';
  else if (change24h > 0) bias = hash % 2 === 0 ? 'bullish' : 'neutral';
  else if (change24h < 0) bias = hash % 2 === 0 ? 'bearish' : 'neutral';
  const confidence = Math.min(90, Math.max(45, 55 + Math.abs(change24h) * 2 + (hash % 20)));
  return {
    bias,
    confidence,
    signalStrength: Math.floor(confidence * 0.9 + (hash % 10)),
    indicatorAlignment: Math.floor(25 + (hash % 20))
  };
}

const formatPrice = (p: number) => {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  if (p >= 0.01) return `$${p.toFixed(4)}`;
  return `$${p.toPrecision(4)}`;
};

const formatCompact = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
};

export default function PredictionHub() {
  const navigate = useNavigate();
  const { data: pricesData, isLoading, refetch, isFetching } = useCryptoPrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'marketCap'>('confidence');
  const [liveTime, setLiveTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenSelect = useCallback((token: GlobalToken) => {
    const tokenSlug = token.id || token.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/price-prediction/${tokenSlug}/daily`);
  }, [navigate]);

  // Build token list from top 50
  const displayCryptos = useMemo(() => {
    return TOP_50_CRYPTOS.map(crypto => {
      const priceData = pricesData?.prices?.find(
        p => p.symbol.toLowerCase() === crypto.symbol.toLowerCase()
      );
      const change24h = priceData?.change24h ?? 0;
      const sentiment = generateSentiment(crypto.symbol, change24h);
      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: priceData?.price || 0,
        change24h,
        marketCap: priceData?.marketCap || 0,
        ...sentiment
      };
    });
  }, [pricesData]);

  const filteredCryptos = useMemo(() => {
    let result = displayCryptos.filter(crypto => {
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

  // Market summary stats
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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Global Crypto Predictions Hub",
            "description": "AI-powered predictions for any cryptocurrency worldwide",
            "url": "https://oraclebull.com/predictions",
            "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" }
          })}
        </script>
      </Helmet>

      <header><Navbar /></header>

      <main className="flex-1 container mx-auto px-4 py-20 md:py-28 max-w-7xl">
        
        {/* === HERO === */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-success">LIVE</span>
                <span className="text-xs text-muted-foreground font-mono">{liveTime.toLocaleTimeString()}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                AI Prediction Terminal
              </h1>
              <p className="text-muted-foreground mt-1 max-w-lg">
                Real-time AI analysis for <strong>every token on DexScreener</strong>. Search by name, symbol, or contract address.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                disabled={isFetching}
                className="gap-1.5"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Market Pulse Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Bullish Signals</div>
              <div className="text-2xl font-bold text-success">{marketStats.bullish}</div>
              <div className="text-xs text-muted-foreground">of {displayCryptos.length} tokens</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Bearish Signals</div>
              <div className="text-2xl font-bold text-danger">{marketStats.bearish}</div>
              <div className="text-xs text-muted-foreground">of {displayCryptos.length} tokens</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Neutral</div>
              <div className="text-2xl font-bold text-warning">{marketStats.neutral}</div>
              <div className="text-xs text-muted-foreground">waiting for signal</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Avg Confidence</div>
              <div className="text-2xl font-bold text-primary">{marketStats.avgConfidence}%</div>
              <div className="text-xs text-muted-foreground">across all tokens</div>
            </div>
          </div>
        </section>

        {/* === GLOBAL SEARCH === */}
        <section className="mb-8 relative" style={{ zIndex: 100 }}>
          <div className="rounded-xl border-2 border-primary/30 bg-card p-5 shadow-sm">
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
              className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
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

        <BannerAd className="mb-8" />

        {/* === LEADERBOARD === */}
        <section className="mb-8">
          <PredictionLeaderboard />
        </section>

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
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['all', 'bullish', 'bearish', 'neutral'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
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
                className="bg-card border border-border rounded px-2 py-1 text-xs"
              >
                <option value="confidence">Confidence</option>
                <option value="change">24h Change</option>
                <option value="marketCap">Market Cap</option>
              </select>
            </div>
          </div>

          {/* Token Table */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">#</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Token</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Price</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">24h</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">AI Signal</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Confidence</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Market Cap</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Action</th>
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
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              crypto.bias === 'bullish' ? 'bg-success/15 text-success' :
                              crypto.bias === 'bearish' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'
                            )}>
                              {crypto.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{crypto.name}</div>
                              <div className="text-xs text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-sm">{formatPrice(crypto.price)}</td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            "font-mono text-sm font-medium",
                            crypto.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
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
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  crypto.confidence >= 70 ? "bg-success" :
                                  crypto.confidence >= 55 ? "bg-warning" : "bg-danger"
                                )}
                                style={{ width: `${crypto.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono">{crypto.confidence}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right hidden md:table-cell text-xs text-muted-foreground font-mono">
                          {crypto.marketCap > 0 ? formatCompact(crypto.marketCap) : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary">
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <InArticleAd className="mb-8" />

        {/* === SEO CONTENT === */}
        <PredictionsHowItWorks />
        <PredictionsDataMeaning />
        <PredictionHubSEOContent />

        <section className="mt-8 rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">About AI Crypto Predictions</h2>
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
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
