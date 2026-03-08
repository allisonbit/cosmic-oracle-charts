import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Search, RefreshCw, Wifi, WifiOff, TrendingUp, TrendingDown,
  Zap, Shield, Activity, BarChart3, ArrowUpRight, ArrowDownRight,
  Flame, Target, Eye, Filter, ScanLine, Globe, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveTokenSearch, useTrendingTokens, type LiveToken } from "@/hooks/useLiveTokenSearch";
import { useStrengthMeter } from "@/hooks/useStrengthMeter";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";

const chains = ["all", "ethereum", "solana", "bsc", "arbitrum", "base", "polygon", "optimism", "avalanche"] as const;
const sortOptions = [
  { value: "strength", label: "Strength", icon: Zap },
  { value: "volume", label: "Volume", icon: BarChart3 },
  { value: "change", label: "24h Change", icon: TrendingUp },
  { value: "marketcap", label: "Market Cap", icon: Shield },
] as const;

function formatPrice(n: number | undefined): string {
  if (!n) return "$0.00";
  if (n < 0.00001) return `$${n.toExponential(2)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatCompact(n: number | undefined): string {
  if (!n) return "$0";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function calcTokenStrength(token: LiveToken, btcChange: number): number {
  const momentum = Math.min(100, Math.max(0, 50 + (token.change24h || 0) * 2));
  const volumeScore = token.volume24h && token.marketCap
    ? Math.min(100, Math.max(0, 50 + ((token.volume24h / token.marketCap) * 100 - 5)))
    : 50;
  const relVsBtc = Math.min(100, Math.max(0, 50 + ((token.change24h || 0) - btcChange)));
  const buyPressure = token.buys24h && token.sells24h
    ? Math.min(100, (token.buys24h / (token.buys24h + token.sells24h)) * 100)
    : 50;
  const liquidityScore = token.liquidity
    ? Math.min(100, Math.max(0, (token.liquidity / 100000) * 100))
    : 30;

  return Math.round(
    momentum * 0.30 + volumeScore * 0.20 + relVsBtc * 0.20 + buyPressure * 0.15 + liquidityScore * 0.15
  );
}

function StrengthBar({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-400" : score >= 45 ? "text-yellow-400" : "text-red-400";
  const bgColor = score >= 70 ? "bg-green-400" : score >= 45 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", bgColor)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("text-xs font-bold font-mono", color)}>{score}</span>
    </div>
  );
}

function ScannerTokenRow({ token, strength, onClick }: { token: LiveToken; strength: number; onClick: () => void }) {
  const change = token.change24h || 0;
  const isUp = change >= 0;

  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] md:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_120px] items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/20 text-left"
    >
      {/* Token info */}
      <div className="flex items-center gap-3 min-w-0">
        {token.logo ? (
          <img src={token.logo} alt={token.name} className="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{token.symbol?.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{token.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{token.symbol?.toUpperCase()}</span>
            {token.chain && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/20">{token.chain}</Badge>
            )}
            {token.verified && <Shield className="w-3 h-3 text-primary" />}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-sm font-mono font-medium">{formatPrice(token.price)}</p>
      </div>

      {/* 24h Change */}
      <div className="text-right">
        <span className={cn(
          "inline-flex items-center gap-0.5 text-sm font-mono font-medium",
          isUp ? "text-green-400" : "text-red-400"
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change).toFixed(2)}%
        </span>
      </div>

      {/* Volume */}
      <div className="text-right hidden md:block">
        <p className="text-sm font-mono text-muted-foreground">{formatCompact(token.volume24h)}</p>
      </div>

      {/* Market Cap */}
      <div className="text-right hidden md:block">
        <p className="text-sm font-mono text-muted-foreground">{formatCompact(token.marketCap)}</p>
      </div>

      {/* Strength */}
      <div className="flex justify-end">
        <StrengthBar score={strength} />
      </div>
    </button>
  );
}

export default function Scanner() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("strength");
  const [liveTime, setLiveTime] = useState(new Date());

  // Auto-update clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Data hooks
  const { data: searchResults, isLoading: isSearching } = useLiveTokenSearch(searchQuery, selectedChain === "all" ? "ethereum" : selectedChain);
  const { data: trendingData, isLoading: isTrendingLoading, refetch: refreshTrending } = useTrendingTokens(selectedChain === "all" ? "ethereum" : selectedChain, 100);
  const { data: strengthData } = useStrengthMeter("24h");
  const { data: priceData } = useCryptoPrices();

  const btcChange = useMemo(() => {
    const btc = priceData?.prices?.find((p) => p.symbol === "btc");
    return btc?.change24h || 0;
  }, [priceData]);

  // Merge all sources into unified token list
  const allTokens: (LiveToken & { strength: number })[] = useMemo(() => {
    const tokenMap = new Map<string, LiveToken>();

    // Add trending tokens
    if (trendingData?.tokens) {
      trendingData.tokens.forEach(t => tokenMap.set(`${t.symbol}-${t.chain}`, t));
    }

    // Add search results on top
    if (searchQuery && searchResults?.tokens) {
      searchResults.tokens.forEach(t => tokenMap.set(`${t.symbol}-${t.chain}`, t));
    }

    // Add strength meter assets as enrichment
    if (strengthData?.assets && !searchQuery) {
      strengthData.assets.forEach(a => {
        const key = `${a.symbol}-market`;
        if (!tokenMap.has(key)) {
          tokenMap.set(key, {
            symbol: a.symbol,
            name: a.name,
            contractAddress: "",
            chain: "multi",
            price: 0,
            change24h: a.priceChange24h,
            volume24h: 0,
            logo: a.logo,
            marketCap: 0,
            verified: true,
          });
        }
      });
    }

    // Enrich with CoinGecko price data
    if (priceData?.prices) {
      priceData.prices.forEach((p) => {
        const key = `${p.symbol?.toUpperCase()}-market`;
        const existing = tokenMap.get(key);
        if (existing) {
          existing.price = p.price || existing.price;
          existing.volume24h = p.volume24h || existing.volume24h;
          existing.marketCap = p.marketCap || existing.marketCap;
          existing.change24h = p.change24h ?? existing.change24h;
        } else {
          tokenMap.set(key, {
            symbol: p.symbol?.toUpperCase(),
            name: p.name,
            contractAddress: "",
            chain: "multi",
            price: p.price || 0,
            change24h: p.change24h || 0,
            volume24h: p.volume24h || 0,
            marketCap: p.marketCap || 0,
            logo: "",
            verified: true,
          });
        }
      });
    }

    return Array.from(tokenMap.values()).map(t => ({
      ...t,
      strength: calcTokenStrength(t, btcChange),
    }));
  }, [trendingData, searchResults, strengthData, priceData, searchQuery, btcChange]);

  // Filter + sort
  const displayTokens = useMemo(() => {
    let filtered = allTokens;

    if (selectedChain !== "all") {
      filtered = filtered.filter(t => t.chain?.toLowerCase().includes(selectedChain));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "strength": return b.strength - a.strength;
        case "volume": return (b.volume24h || 0) - (a.volume24h || 0);
        case "change": return (b.change24h || 0) - (a.change24h || 0);
        case "marketcap": return (b.marketCap || 0) - (a.marketCap || 0);
        default: return 0;
      }
    });

    return filtered.slice(0, 200);
  }, [allTokens, selectedChain, sortBy]);

  const stats = useMemo(() => {
    const bullish = displayTokens.filter(t => t.strength >= 65).length;
    const bearish = displayTokens.filter(t => t.strength < 35).length;
    const avgStrength = displayTokens.length
      ? Math.round(displayTokens.reduce((s, t) => s + t.strength, 0) / displayTokens.length)
      : 0;
    return { bullish, bearish, neutral: displayTokens.length - bullish - bearish, avgStrength, total: displayTokens.length };
  }, [displayTokens]);

  const isLoading = isTrendingLoading && !allTokens.length;

  const handleTokenClick = (token: LiveToken) => {
    const chain = token.chain || 'ethereum';
    const id = token.contractAddress || token.coingeckoId || token.symbol?.toLowerCase();
    navigate(`/explorer/${chain}/${id}`);
  };

  return (
    <Layout>
      <SEO
        title="Crypto Token Scanner – Real-Time Strength Analysis"
        description="Scan any cryptocurrency in the world. Real-time strength scoring, volume analysis, and market intelligence for every token across all chains."
      />
      <Helmet>
        <link rel="canonical" href="https://cosmic-oracle-charts.lovable.app/scanner" />
      </Helmet>

      <div className="min-h-screen cosmic-bg">
        {/* Live status bar */}
        <div className="border-b border-border/30 bg-background/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono">LIVE</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {liveTime.toLocaleTimeString()} UTC
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{stats.total} tokens loaded</span>
              <span className="text-green-400">{stats.bullish} bullish</span>
              <span className="text-red-400">{stats.bearish} bearish</span>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => refreshTrending()}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Hero */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/20">
                  <ScanLine className="w-6 h-6 text-primary" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Token Scanner</h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl">
                Scan any cryptocurrency across all blockchains. Real-time strength scoring, 
                volume flow analysis, and institutional-grade market intelligence.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3">
              {[
                { label: "Avg Strength", value: stats.avgStrength, icon: Zap, color: stats.avgStrength >= 55 ? "text-green-400" : "text-yellow-400" },
                { label: "Bull/Bear", value: `${stats.bullish}/${stats.bearish}`, icon: Activity, color: "text-primary" },
              ].map(s => (
                <Card key={s.label} className="bg-card/50 border-border/30">
                  <CardContent className="p-3 flex items-center gap-2">
                    <s.icon className={cn("w-4 h-4", s.color)} />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className={cn("text-sm font-bold font-mono", s.color)}>{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Search + Filters */}
          <Card className="bg-card/50 border-border/30">
            <CardContent className="p-4 space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search any token by name, symbol, or contract address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/40 h-11 text-sm"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                )}
              </div>

              {/* Chain filter + Sort */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {chains.map(chain => (
                    <Button
                      key={chain}
                      size="sm"
                      variant={selectedChain === chain ? "default" : "ghost"}
                      className={cn(
                        "h-7 px-2.5 text-xs capitalize",
                        selectedChain === chain && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setSelectedChain(chain)}
                    >
                      {chain === "all" ? "All Chains" : chain === "bsc" ? "BSC" : chain}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 md:ml-auto">
                  <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {sortOptions.map(opt => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={sortBy === opt.value ? "default" : "outline"}
                      className={cn(
                        "h-7 px-2.5 text-xs",
                        sortBy === opt.value && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setSortBy(opt.value)}
                    >
                      <opt.icon className="w-3 h-3 mr-1" />
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strength Legend */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-green-400" />
              Strong (65+)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-yellow-400" />
              Neutral (35-65)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-red-400" />
              Weak (&lt;35)
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Auto-updates every 20s
            </span>
          </div>

          {/* Token Table */}
          <Card className="bg-card/50 border-border/30 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] md:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_120px] items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Token</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h</span>
              <span className="text-right hidden md:block">Volume</span>
              <span className="text-right hidden md:block">MCap</span>
              <span className="text-right">Strength</span>
            </div>

            {/* Rows */}
            <div className="max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                  <span className="ml-3 text-muted-foreground">Scanning tokens...</span>
                </div>
              ) : displayTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ScanLine className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No tokens found. Try a different search or chain.</p>
                </div>
              ) : (
                displayTokens.map((token, i) => (
                  <ScannerTokenRow
                    key={`${token.symbol}-${token.chain}-${i}`}
                    token={token}
                    strength={token.strength}
                    onClick={() => handleTokenClick(token)}
                  />
                ))
              )}
            </div>
          </Card>

          {/* SEO Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none mt-8">
            <h2 className="font-display text-xl font-bold">How the Token Scanner Works</h2>
            <p>
              The Cosmic Oracle Token Scanner aggregates real-time data from DexScreener, CoinGecko, 
              and on-chain sources to provide a unified view of any cryptocurrency across all blockchains. 
              Each token receives a composite Strength Score (0-100) calculated from five key factors: 
              price momentum, volume intensity, relative performance vs BTC, buy/sell pressure, and liquidity depth.
            </p>
            <h3 className="font-display font-bold">Understanding Strength Scores</h3>
            <p>
              Scores above 65 indicate strong bullish momentum with healthy volume and buying pressure. 
              Scores between 35-65 represent neutral or consolidating assets. Scores below 35 suggest 
              weakening momentum or bearish conditions. Use these scores alongside the detailed prediction 
              pages for comprehensive analysis.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
