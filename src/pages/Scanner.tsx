import { useState, useMemo, useEffect, Fragment } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Search, RefreshCw, Wifi, TrendingUp, TrendingDown, Zap, Shield, Activity,
  BarChart3, ArrowUpRight, ArrowDownRight, Flame, Filter, ScanLine,
  Globe, Clock, ChevronDown, ExternalLink, Droplets, LayoutGrid, List, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveTokenSearch, useInfiniteTrendingTokens, type LiveToken } from "@/hooks/useLiveTokenSearch";
import { useInView } from "react-intersection-observer";
import { useStrengthMeter } from "@/hooks/useStrengthMeter";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { CoinImage } from "@/components/ui/CoinImage";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";

type ScannedToken = LiveToken & { strength: number };

const chains = ["all", "ethereum", "solana", "bsc", "arbitrum", "base", "polygon", "optimism", "avalanche"] as const;

const presets = [
  { value: "strong", label: "Strongest", icon: Zap },
  { value: "gainers", label: "Top Gainers", icon: TrendingUp },
  { value: "losers", label: "Top Losers", icon: TrendingDown },
  { value: "volume", label: "High Volume", icon: BarChart3 },
  { value: "liquid", label: "Most Liquid", icon: Droplets },
  { value: "new", label: "New Pairs", icon: Rocket },
] as const;

const DEX_EXPLORER: Record<string, string> = {
  ethereum: "https://etherscan.io/token/", bsc: "https://bscscan.com/token/",
  polygon: "https://polygonscan.com/token/", arbitrum: "https://arbiscan.io/token/",
  base: "https://basescan.org/token/", optimism: "https://optimistic.etherscan.io/token/",
  avalanche: "https://snowtrace.io/token/", solana: "https://solscan.io/token/",
};

function formatPrice(n: number | undefined): string {
  if (!n) return "$0.00";
  if (n < 0.00001) return `$${(n ?? 0).toExponential(2)}`;
  if (n < 0.01) return `$${(n ?? 0).toFixed(6)}`;
  if (n < 1) return `$${(n ?? 0).toFixed(4)}`;
  if (n < 1000) return `$${(n ?? 0).toFixed(2)}`;
  return `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function formatCompact(n: number | undefined): string {
  if (!n) return "$0";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${(n ?? 0).toFixed(2)}`;
}
function formatAge(hours?: number): string {
  if (hours === undefined || hours === null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 720) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 720)}mo`;
}

function calcTokenStrength(token: LiveToken, btcChange: number): number {
  const momentum = Math.min(100, Math.max(0, 50 + (token.change24h || 0) * 2));
  const volumeScore = token.volume24h && token.marketCap
    ? Math.min(100, Math.max(0, 50 + ((token.volume24h / token.marketCap) * 100 - 5))) : 50;
  const relVsBtc = Math.min(100, Math.max(0, 50 + ((token.change24h || 0) - btcChange)));
  const buyPressure = token.buys24h && token.sells24h
    ? Math.min(100, (token.buys24h / (token.buys24h + token.sells24h)) * 100) : 50;
  const liquidityScore = token.liquidity ? Math.min(100, Math.max(0, (token.liquidity / 100000) * 100)) : 30;
  return Math.round(momentum * 0.30 + volumeScore * 0.20 + relVsBtc * 0.20 + buyPressure * 0.15 + liquidityScore * 0.15);
}

function pctClass(n?: number) { return (n ?? 0) >= 0 ? "text-success" : "text-danger"; }
function pctText(n?: number) { return n === undefined || n === null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`; }

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

function BuyPressureBar({ buys, sells }: { buys?: number; sells?: number }) {
  if (!buys && !sells) return <span className="text-[10px] text-muted-foreground">—</span>;
  const total = (buys || 0) + (sells || 0);
  const pct = total > 0 ? ((buys || 0) / total) * 100 : 50;
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-danger/30 overflow-hidden"><div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} /></div>
      <span className={cn("text-[10px] font-mono", pct > 55 ? "text-success" : pct < 45 ? "text-danger" : "text-muted-foreground")}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function Sparkline({ data, w = 84, h = 26 }: { data?: number[]; w?: number; h?: number }) {
  if (!data || data.length < 3) return <span className="text-[10px] text-muted-foreground">—</span>;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const positive = data[data.length - 1] >= data[0];
  const color = positive ? "hsl(var(--success))" : "hsl(var(--danger))";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const GRID = "grid-cols-[2.3fr_0.9fr_0.6fr_0.7fr_0.6fr_0.8fr_0.8fr_0.8fr_0.8fr_110px_28px]";

function ExpandedDetail({ token, onOpen }: { token: ScannedToken; onOpen: () => void }) {
  const t = token as any;
  const explorerBase = DEX_EXPLORER[token.chain?.toLowerCase()];
  const stats = [
    { label: "5m", value: pctText(t.change5m), cls: pctClass(t.change5m) },
    { label: "1h", value: pctText(t.change1h), cls: pctClass(t.change1h) },
    { label: "6h", value: pctText(t.change6h), cls: pctClass(t.change6h) },
    { label: "7d", value: pctText(t.change7d), cls: pctClass(t.change7d) },
    { label: "FDV", value: t.fdv ? formatCompact(t.fdv) : "—", cls: "text-foreground" },
    { label: "Txns 24h", value: (t.txns24h || 0).toLocaleString(), cls: "text-foreground" },
    { label: "Buys", value: (t.buys24h || 0).toLocaleString(), cls: "text-success" },
    { label: "Sells", value: (t.sells24h || 0).toLocaleString(), cls: "text-danger" },
    { label: "Age", value: formatAge(t.ageHours), cls: "text-foreground" },
    { label: "DEX", value: t.dexId || "—", cls: "text-foreground capitalize" },
  ];
  return (
    <div className="px-4 py-3 bg-muted/20 border-b border-border/20">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
        {stats.map(s => (
          <div key={s.label}>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-xs font-mono font-medium", s.cls)}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={onOpen}><Activity className="w-3 h-3" /> Full Analysis</Button>
        {token.contractAddress && explorerBase && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
            <a href={`${explorerBase}${token.contractAddress}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" /> Explorer</a>
          </Button>
        )}
        {token.pairAddress && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
            <a href={`https://dexscreener.com/${token.chain}/${token.pairAddress}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" /> DexScreener</a>
          </Button>
        )}
        {token.coingeckoId && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
            <a href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" /> CoinGecko</a>
          </Button>
        )}
      </div>
    </div>
  );
}

function ScannerTokenRow({ token, expanded, onToggle, onOpen }: { token: ScannedToken; expanded: boolean; onToggle: () => void; onOpen: () => void }) {
  const change = token.change24h || 0;
  const isUp = change >= 0;
  const t = token as any;
  return (
    <Fragment>
      <button onClick={onToggle} className={cn("w-full grid items-center gap-1 px-3 py-2.5 hover:bg-muted/30 transition-colors border-b border-border/20 text-left", GRID, expanded && "bg-muted/20")}>
        <div className="flex items-center gap-2.5 min-w-0">
          <CoinImage symbol={token.symbol} image={token.logo} size={28} className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs truncate max-w-[100px]">{token.name}</span>
              {token.verified && <Shield className="w-3 h-3 text-primary flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-mono">{token.symbol?.toUpperCase()}</span>
              {token.chain && <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-primary/20 capitalize">{token.chain}</Badge>}
            </div>
          </div>
        </div>
        <div className="text-right"><p className="text-xs font-mono font-medium">{formatPrice(token.price)}</p></div>
        <div className="text-right"><span className={cn("text-[11px] font-mono", pctClass(t.change1h))}>{t.change1h !== undefined ? pctText(t.change1h) : "—"}</span></div>
        <div className="text-right"><span className={cn("inline-flex items-center gap-0.5 text-xs font-mono font-medium", isUp ? "text-success" : "text-danger")}>{isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(change).toFixed(2)}%</span></div>
        <div className="text-right"><span className={cn("text-[11px] font-mono", pctClass(t.change7d))}>{t.change7d !== undefined ? pctText(t.change7d) : "—"}</span></div>
        <div className="text-right"><p className="text-xs font-mono text-muted-foreground">{formatCompact(token.volume24h)}</p></div>
        <div className="text-right"><p className="text-xs font-mono text-muted-foreground">{formatCompact(t.liquidity)}</p></div>
        <div className="flex justify-end"><BuyPressureBar buys={t.buys24h} sells={t.sells24h} /></div>
        <div className="text-right"><p className="text-xs font-mono text-muted-foreground">{formatCompact(token.marketCap)}</p></div>
        <div className="flex justify-end"><StrengthBar score={token.strength} /></div>
        <div className="flex justify-end"><ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} /></div>
      </button>
      {expanded && <ExpandedDetail token={token} onOpen={onOpen} />}
    </Fragment>
  );
}

function TokenCard({ token, onOpen }: { token: ScannedToken; onOpen: () => void }) {
  const change = token.change24h || 0;
  const t = token as any;
  return (
    <button onClick={onOpen} className="text-left">
      <Card className="border-t border-border/30 pt-5 h-full">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex items-center gap-2.5">
            <CoinImage symbol={token.symbol} image={token.logo} size={34} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1"><span className="font-semibold text-sm truncate">{token.symbol?.toUpperCase()}</span>{token.verified && <Shield className="w-3 h-3 text-primary" />}</div>
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 capitalize">{token.chain}</Badge>
            </div>
            <div className="text-right"><p className="text-sm font-mono font-medium">{formatPrice(token.price)}</p><p className={cn("text-[11px] font-mono", change >= 0 ? "text-success" : "text-danger")}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</p></div>
          </div>
          <div className="h-[26px] flex items-center"><Sparkline data={t.sparkline} w={200} h={26} /></div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-[9px] text-muted-foreground uppercase">Vol</p><p className="text-[11px] font-mono">{formatCompact(token.volume24h)}</p></div>
            <div><p className="text-[9px] text-muted-foreground uppercase">Liq</p><p className="text-[11px] font-mono">{formatCompact(t.liquidity)}</p></div>
            <div><p className="text-[9px] text-muted-foreground uppercase">MCap</p><p className="text-[11px] font-mono">{formatCompact(token.marketCap)}</p></div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/30">
            <span className="text-[10px] text-muted-foreground">Strength</span>
            <StrengthBar score={token.strength} />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function OverviewStat({ label, value, icon: Icon, color }: { label: string; value: React.ReactNode; icon: typeof Zap; color?: string }) {
  return (
    <Card className="border-t border-border/30 pt-5">
      <CardContent className="p-2.5 flex items-center gap-2">
        <Icon className={cn("w-4 h-4 shrink-0", color)} />
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{label}</p>
          <p className={cn("text-sm font-bold font-mono truncate", color)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Scanner() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<string>("all");
  const [preset, setPreset] = useState<string>("strong");
  const [view, setView] = useState<"table" | "cards">("table");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: searchResults, isLoading: isSearching } = useLiveTokenSearch(searchQuery, selectedChain);
  const { data: trendingDataPages, isLoading: isTrendingLoading, refetch: refreshTrending, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteTrendingTokens(selectedChain, 50);
  const { ref: loadMoreRef, inView } = useInView();
  useEffect(() => { if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage(); }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const { data: strengthData } = useStrengthMeter("24h");
  const { data: priceData } = useCryptoPrices();

  const btcChange = useMemo(() => {
    const btc = priceData?.prices?.find((p) => p.symbol?.toUpperCase() === "BTC");
    return btc?.change24h || 0;
  }, [priceData]);

  const allTokens: ScannedToken[] = useMemo(() => {
    const tokenMap = new Map<string, LiveToken>();
    if (trendingDataPages?.pages) trendingDataPages.pages.flatMap(p => p.tokens).forEach(t => tokenMap.set(`${t.symbol}-${t.chain}`, t));
    if (searchQuery && searchResults?.tokens) searchResults.tokens.forEach(t => tokenMap.set(`${t.symbol}-${t.chain}`, t));
    if (strengthData?.assets && !searchQuery) {
      strengthData.assets.forEach(a => {
        const key = `${a.symbol}-market`;
        if (!tokenMap.has(key)) tokenMap.set(key, { symbol: a.symbol, name: a.name, contractAddress: "", chain: "multi", price: 0, change24h: a.priceChange24h, volume24h: 0, logo: a.logo, marketCap: 0, verified: true });
      });
    }
    if (priceData?.prices) {
      priceData.prices.forEach((p) => {
        const key = `${p.symbol?.toUpperCase()}-market`;
        const existing = tokenMap.get(key);
        if (existing) {
          existing.price = p.price || existing.price; existing.volume24h = p.volume24h || existing.volume24h;
          existing.marketCap = p.marketCap || existing.marketCap; existing.change24h = p.change24h ?? existing.change24h;
        } else {
          tokenMap.set(key, { symbol: p.symbol?.toUpperCase(), name: p.name, contractAddress: "", chain: "multi", price: p.price || 0, change24h: p.change24h || 0, volume24h: p.volume24h || 0, marketCap: p.marketCap || 0, logo: "", verified: true });
        }
      });
    }
    return Array.from(tokenMap.values()).map(t => ({ ...t, strength: calcTokenStrength(t, btcChange) }));
  }, [trendingDataPages, searchResults, strengthData, priceData, searchQuery, btcChange]);

  const displayTokens = useMemo(() => {
    let list = Array.from(allTokens);
    if (selectedChain !== "all") list = list.filter(t => t.chain?.toLowerCase() === selectedChain.toLowerCase() || t.chain === "multi");
    const t = (x: ScannedToken) => x as any;
    switch (preset) {
      case "gainers": list = list.filter(x => (x.change24h || 0) > 0).sort((a, b) => (b.change24h || 0) - (a.change24h || 0)); break;
      case "losers": list = list.filter(x => (x.change24h || 0) < 0).sort((a, b) => (a.change24h || 0) - (b.change24h || 0)); break;
      case "volume": list.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0)); break;
      case "liquid": list.sort((a, b) => (t(b).liquidity || 0) - (t(a).liquidity || 0)); break;
      case "new": list = list.filter(x => t(x).ageHours !== undefined && t(x).ageHours < 168).sort((a, b) => (t(a).ageHours || 0) - (t(b).ageHours || 0)); break;
      default: list.sort((a, b) => b.strength - a.strength);
    }
    return list;
  }, [allTokens, selectedChain, preset]);

  const overview = useMemo(() => {
    const list = allTokens;
    const total = list.length;
    const gainers = list.filter(t => (t.change24h || 0) > 0).length;
    const losers = list.filter(t => (t.change24h || 0) < 0).length;
    const totalVol = list.reduce((s, t) => s + (t.volume24h || 0), 0);
    const avgChange = total ? list.reduce((s, t) => s + (t.change24h || 0), 0) / total : 0;
    const avgStrength = total ? Math.round(list.reduce((s, t) => s + t.strength, 0) / total) : 0;
    const newPairs = list.filter(t => (t as any).ageHours !== undefined && (t as any).ageHours < 24).length;
    const strongest = [...list].sort((a, b) => b.strength - a.strength)[0];
    return { total, gainers, losers, totalVol, avgChange, avgStrength, newPairs, strongest };
  }, [allTokens]);

  const isLoading = isTrendingLoading && !allTokens.length;

  const handleTokenClick = (token: LiveToken) => {
    const chain = token.chain || "ethereum";
    const id = token.contractAddress || token.coingeckoId || token.symbol?.toLowerCase();
    navigate(`/explorer/${chain}/${id}`);
  };

  return (
    <Layout>
      <SEO title="Crypto Token Scanner – Every Token, CEX & DEX, All Chains" description="Scan every cryptocurrency in the world across CEX and DEX. Live data from DexScreener, CoinGecko and Alchemy: strength scoring, multi-timeframe momentum, liquidity, buy pressure and new-pair discovery on all chains." />
      <Helmet></Helmet>

      <div className="min-h-screen cosmic-bg">
        {/* Live status bar */}
        <div className="border-b border-border/30 bg-background/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0"><Wifi className="w-3.5 h-3.5 text-green-400 animate-pulse" /><span className="text-xs text-green-400 font-mono">LIVE</span></div>
              <span className="text-xs text-muted-foreground font-mono truncate">{liveTime.toLocaleTimeString()} UTC</span>
              <span className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground"><Globe className="w-3 h-3" /> DexScreener · CoinGecko · Alchemy</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground shrink-0">
              <span className="hidden sm:inline">{overview.total} tokens</span>
              <span className="hidden sm:inline text-green-400">{overview.gainers} up</span>
              <span className="hidden sm:inline text-red-400">{overview.losers} down</span>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs shrink-0" onClick={() => refreshTrending()}><RefreshCw className="w-3 h-3 mr-1" /> Refresh</Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-5">
          {/* Hero */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/20"><ScanLine className="w-6 h-6 text-primary" /></div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Token Scanner</h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Scan <span className="text-foreground font-medium">every token in the world</span> — CEX and DEX, across all chains.
                Live data fused from DexScreener, CoinGecko and Alchemy with real-time strength scoring, multi-timeframe momentum and new-pair discovery.
              </p>
            </div>
          </div>

          {/* Market overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <OverviewStat label="Tokens Scanned" value={overview.total} icon={ScanLine} color="text-primary" />
            <OverviewStat label="24h Volume" value={formatCompact(overview.totalVol)} icon={BarChart3} color="text-foreground" />
            <OverviewStat label="Avg Change" value={`${overview.avgChange >= 0 ? "+" : ""}${overview.avgChange.toFixed(2)}%`} icon={Activity} color={overview.avgChange >= 0 ? "text-success" : "text-danger"} />
            <OverviewStat label="Gainers / Losers" value={`${overview.gainers}/${overview.losers}`} icon={TrendingUp} color="text-foreground" />
            <OverviewStat label="New Pairs (24h)" value={overview.newPairs} icon={Rocket} color="text-warning" />
            <OverviewStat label="Strongest" value={overview.strongest?.symbol?.toUpperCase() ?? "—"} icon={Flame} color="text-success" />
          </div>

          {/* Search + filters */}
          <Card className="border-t border-border/30 pt-5">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search any token in the world by name, symbol, or contract address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background/50 border-border/40 h-11 text-sm" />
                {isSearching && <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
              </div>

              {/* Chains */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {chains.map(chain => (
                  <Button key={chain} size="sm" variant={selectedChain === chain ? "default" : "ghost"} className={cn("h-7 px-2.5 text-xs capitalize", selectedChain === chain && "bg-primary text-primary-foreground")} onClick={() => setSelectedChain(chain)}>
                    {chain === "all" ? "All Chains" : chain === "bsc" ? "BSC" : chain}
                  </Button>
                ))}
              </div>

              {/* Presets + view toggle */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {presets.map(p => (
                    <Button key={p.value} size="sm" variant={preset === p.value ? "default" : "outline"} className={cn("h-7 px-2.5 text-xs", preset === p.value && "bg-primary text-primary-foreground")} onClick={() => setPreset(p.value)}>
                      <p.icon className="w-3 h-3 mr-1" />{p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-1 md:ml-auto bg-background/50 rounded-lg p-0.5 border border-border/40">
                  <Button aria-label="Switch to table view" aria-pressed={view === "table"} size="sm" variant="ghost" className={cn("h-6 px-2 text-xs", view === "table" && "bg-primary/20 text-primary")} onClick={() => setView("table")}><List className="w-3.5 h-3.5" /></Button>
                  <Button aria-label="Switch to card view" aria-pressed={view === "cards"} size="sm" variant="ghost" className={cn("h-6 px-2 text-xs", view === "cards" && "bg-primary/20 text-primary")} onClick={() => setView("cards")}><LayoutGrid className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground px-1 flex-wrap">
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-green-400" /> Strong (65+)</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-yellow-400" /> Neutral (35-65)</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-red-400" /> Weak (&lt;35)</span>
            <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" /> Auto-updates every 60s · tap a row for detail</span>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 text-primary animate-spin" /><span className="ml-3 text-muted-foreground">Scanning tokens worldwide...</span></div>
          ) : view === "table" ? (
            <Card className="overflow-x-auto border-t border-border/30 pt-5">
              <div className="min-w-[1040px]">
                <div className={cn("grid items-center gap-1 px-3 py-2.5 bg-muted/30 border-b border-border/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider", GRID)}>
                  <span>Token</span><span className="text-right">Price</span><span className="text-right">1H</span><span className="text-right">24H</span><span className="text-right">7D</span><span className="text-right">Volume</span><span className="text-right">Liquidity</span><span className="text-right">Buy %</span><span className="text-right">MCap</span><span className="text-right">Strength</span><span></span>
                </div>
                <div className="max-h-[72vh] overflow-y-auto">
                  <div className="flex flex-col">
                    {displayTokens.map((token, i) => {
                      const key = `${token.symbol}-${token.chain}-${i}`;
                      return <ScannerTokenRow key={key} token={token} expanded={expandedKey === key} onToggle={() => setExpandedKey(expandedKey === key ? null : key)} onOpen={() => handleTokenClick(token)} />;
                    })}
                    {hasNextPage && !searchQuery && (
                      <div ref={loadMoreRef} className="py-6 flex justify-center items-center">{isFetchingNextPage ? <RefreshCw className="h-6 w-6 animate-spin text-primary" /> : <span className="text-sm text-muted-foreground">Scroll for more tokens</span>}</div>
                    )}
                    {displayTokens.length === 0 && !isSearching && !isTrendingLoading && <div className="text-center py-12 text-muted-foreground">No tokens match this filter</div>}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayTokens.map((token, i) => <TokenCard key={`${token.symbol}-${token.chain}-${i}`} token={token} onOpen={() => handleTokenClick(token)} />)}
              </div>
              {hasNextPage && !searchQuery && (
                <div ref={loadMoreRef} className="py-6 flex justify-center items-center">{isFetchingNextPage ? <RefreshCw className="h-6 w-6 animate-spin text-primary" /> : <span className="text-sm text-muted-foreground">Scroll for more tokens</span>}</div>
              )}
              {displayTokens.length === 0 && !isSearching && !isTrendingLoading && <div className="text-center py-12 text-muted-foreground">No tokens match this filter</div>}
            </>
          )}


          {/* SEO content */}
          <div className="prose prose-sm dark:prose-invert max-w-none mt-8">
            <h2 className="font-display text-xl font-bold">Every Token, Every Chain — CEX & DEX</h2>
            <p>
              The Oracle Bull Token Scanner unifies real-time data from <strong>DexScreener</strong> (live DEX pairs and liquidity),
              <strong> CoinGecko</strong> (centralised-exchange listings, market caps and 7-day history) and <strong>Alchemy</strong>
              (direct on-chain contract lookups) into a single worldwide view. Search any cryptocurrency by name, symbol or
              contract address, or browse trending tokens across Ethereum, Solana, BSC, Base, Arbitrum, Polygon, Optimism and Avalanche.
            </p>
            <h3 className="font-display font-bold">Strength Score & Scan Presets</h3>
            <p>
              Every token receives a composite <strong>Strength Score (0–100)</strong> built from five factors: price momentum,
              volume intensity, relative performance vs Bitcoin, buy/sell pressure and liquidity depth. Use the scan presets to
              instantly surface the <em>Strongest</em> tokens, <em>Top Gainers</em> and <em>Losers</em>, <em>High Volume</em> and
              <em> Most Liquid</em> markets, or freshly launched <em>New Pairs</em>. Tap any row to reveal multi-timeframe momentum
              (5m, 1h, 6h, 7d), FDV, transaction counts, token age and direct links to the explorer, DexScreener and CoinGecko.
            </p>
            <p className="text-xs text-muted-foreground">
              Data is for research and information only and is not financial advice. Always verify contract addresses and do your own research.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
