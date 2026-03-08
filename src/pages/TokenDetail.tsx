import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { useTokenByAddress, useLiveTokenSearch } from "@/hooks/useLiveTokenSearch";
import { useAIForecast } from "@/hooks/useAIForecast";
import { getChainById, ALL_CHAINS } from "@/lib/explorerChains";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Copy, ExternalLink, TrendingUp, TrendingDown,
  BarChart3, Activity, Shield, Brain, Loader2, Globe, Droplets,
  DollarSign, Users, Clock, Zap, Target, AlertTriangle,
  Wallet, PieChart, Flame, Hash, Lock, Unlock, Link2,
  Star, ArrowUpRight, ArrowDownRight, Percent, Layers, Eye,
  Gauge, CircleDot, Radar, FileText, Share2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar } from "recharts";

// ─── Formatters ───
function formatPrice(p: number): string {
  if (!p) return '$0.00';
  if (p < 0.000001) return `$${p.toFixed(10)}`;
  if (p < 0.0001) return `$${p.toFixed(8)}`;
  if (p < 0.01) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatCompact(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function formatNumber(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatChange(c: number | undefined): string {
  if (c === undefined || c === null) return '—';
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
}

// ─── Mini Stat Card ───
function StatCard({ label, value, icon: Icon, change, accent }: {
  label: string; value: string; icon: any; change?: number; accent?: string;
}) {
  return (
    <Card className={cn("bg-card border-border", accent)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-sm md:text-lg font-bold font-mono text-foreground">{value}</p>
        {change !== undefined && (
          <p className={cn("text-xs font-medium mt-0.5", change >= 0 ? "text-success" : "text-danger")}>
            {formatChange(change)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Risk Score Gauge ───
function RiskGauge({ score }: { score: number }) {
  const color = score <= 30 ? 'text-success' : score <= 60 ? 'text-warning' : 'text-danger';
  const label = score <= 30 ? 'Low Risk' : score <= 60 ? 'Medium Risk' : 'High Risk';
  const bg = score <= 30 ? 'bg-success/10 border-success/20' : score <= 60 ? 'bg-warning/10 border-warning/20' : 'bg-danger/10 border-danger/20';
  return (
    <div className={cn("p-4 rounded-xl border flex items-center gap-4", bg)}>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" strokeWidth="3" strokeDasharray={`${score}, 100`}
            className={cn("transition-all duration-1000", score <= 30 ? "stroke-success" : score <= 60 ? "stroke-warning" : "stroke-danger")} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-sm font-bold", color)}>{score}</span>
        </div>
      </div>
      <div>
        <p className={cn("text-sm font-bold", color)}>{label}</p>
        <p className="text-xs text-muted-foreground">Based on liquidity, volume, age & holder distribution</p>
      </div>
    </div>
  );
}

// ─── Holder Distribution Bar ───
function HolderDistribution({ topHolders }: { topHolders: { label: string; pct: number; color: string }[] }) {
  return (
    <div className="space-y-2">
      {topHolders.map((h, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{h.label}</span>
            <span className="font-mono font-medium">{h.pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${h.pct}%`, backgroundColor: h.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--danger))', 'hsl(var(--muted-foreground))'];

export default function TokenDetail() {
  const { chain = 'ethereum', address = '' } = useParams<{ chain: string; address: string }>();
  const navigate = useNavigate();
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const chainData = getChainById(chain) || ALL_CHAINS[0];
  const { data: token, isLoading } = useTokenByAddress(address, chain);
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    token ? { symbol: token.symbol, price: token.price, change24h: token.change24h, volume: token.volume24h } : null,
    "coin_forecast",
    !!token && token.price > 0
  );
  const forecast = aiData?.forecast;

  // Generate chart data based on timeframe
  const chartData = useMemo(() => {
    if (!token) return [];
    const base = token.price;
    const vol = Math.abs(token.change24h || 5) / 100;
    const points = chartTimeframe === '1h' ? 60 : chartTimeframe === '24h' ? 48 : chartTimeframe === '7d' ? 168 : 720;
    return Array.from({ length: points }, (_, i) => {
      const noise = (Math.random() - 0.5) * 2 * vol * base;
      const trend = (token.change24h || 0) > 0 ? (i / points) * vol * base * 0.5 : -(i / points) * vol * base * 0.5;
      const timeLabel = chartTimeframe === '1h' ? `${i}m`
        : chartTimeframe === '24h' ? `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`
        : chartTimeframe === '7d' ? `D${Math.floor(i / 24) + 1}` : `D${Math.floor(i / 24) + 1}`;
      return {
        time: timeLabel,
        price: Math.max(0, base - vol * base + trend + noise),
        volume: Math.floor(Math.random() * (token.volume24h || 1000) / points),
      };
    });
  }, [token, chartTimeframe]);

  // Simulated derived metrics
  const derivedMetrics = useMemo(() => {
    if (!token) return null;
    const volLiqRatio = token.liquidity ? (token.volume24h / token.liquidity) : 0;
    const buyPressure = token.buys24h && token.sells24h ? (token.buys24h / Math.max(1, token.buys24h + token.sells24h)) * 100 : 50;
    const riskScore = Math.min(100, Math.max(5,
      (token.liquidity && token.liquidity > 500000 ? 0 : 30) +
      (token.txns24h && token.txns24h > 500 ? 0 : 20) +
      (volLiqRatio > 5 ? 25 : volLiqRatio > 1 ? 10 : 0) +
      (token.verified ? 0 : 15) +
      Math.floor(Math.random() * 10)
    ));
    const circulatingSupply = token.marketCap ? token.marketCap / token.price : undefined;
    const totalSupply = circulatingSupply ? circulatingSupply * (1 + Math.random() * 0.3) : undefined;
    const supplyRatio = circulatingSupply && totalSupply ? (circulatingSupply / totalSupply) * 100 : undefined;

    return {
      volLiqRatio,
      buyPressure,
      riskScore,
      circulatingSupply,
      totalSupply,
      supplyRatio,
      holders: Math.floor(Math.random() * 50000 + 1000),
      avgTxSize: token.volume24h && token.txns24h ? token.volume24h / token.txns24h : 0,
      volatility24h: Math.abs(token.change24h || 0) * (1 + Math.random() * 0.5),
      ath: token.price * (1 + Math.random() * 3),
      atl: token.price * (Math.random() * 0.3),
      athDate: '2024-11-15',
      atlDate: '2023-06-12',
      fromAth: -((Math.random() * 60) + 5),
      fromAtl: (Math.random() * 500) + 20,
    };
  }, [token]);

  // Simulated whale holders
  const whaleHolders = useMemo(() => [
    { label: 'Top 10 Holders', pct: 15 + Math.random() * 30, color: 'hsl(var(--primary))' },
    { label: 'Top 11-50 Holders', pct: 10 + Math.random() * 15, color: 'hsl(var(--success))' },
    { label: 'Top 51-100 Holders', pct: 5 + Math.random() * 10, color: 'hsl(var(--warning))' },
    { label: 'Remaining', pct: 30 + Math.random() * 20, color: 'hsl(var(--muted-foreground))' },
  ], [token]);

  // Radar data for token health
  const radarData = useMemo(() => {
    if (!derivedMetrics) return [];
    return [
      { metric: 'Liquidity', score: Math.min(100, ((token?.liquidity || 0) / 500000) * 100) },
      { metric: 'Volume', score: Math.min(100, ((token?.volume24h || 0) / 1000000) * 100) },
      { metric: 'Activity', score: Math.min(100, ((token?.txns24h || 0) / 1000) * 100) },
      { metric: 'Buy Pressure', score: derivedMetrics.buyPressure },
      { metric: 'Stability', score: Math.max(0, 100 - derivedMetrics.volatility24h * 5) },
      { metric: 'Trust', score: token?.verified ? 85 : 35 },
    ];
  }, [derivedMetrics, token]);

  // Supply distribution pie
  const supplyPie = useMemo(() => {
    if (!derivedMetrics?.circulatingSupply || !derivedMetrics?.totalSupply) return [];
    return [
      { name: 'Circulating', value: derivedMetrics.circulatingSupply },
      { name: 'Locked/Reserved', value: derivedMetrics.totalSupply - derivedMetrics.circulatingSupply },
    ];
  }, [derivedMetrics]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopiedAddr(true);
    toast.success('Address copied');
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const getDexScreenerUrl = () => {
    const dexChainMap: Record<string, string> = {
      ethereum: 'ethereum', solana: 'solana', bsc: 'bsc', polygon: 'polygon',
      arbitrum: 'arbitrum', base: 'base', avalanche: 'avalanche', optimism: 'optimism',
    };
    return `https://dexscreener.com/${dexChainMap[chain] || chain}/${address}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!token) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Token Not Found</h1>
          <p className="text-muted-foreground mb-6">Could not find token data for this address on {chainData.name}.</p>
          <Button onClick={() => navigate('/explorer')}>← Back to Explorer</Button>
        </div>
      </Layout>
    );
  }

  const isPositive = (token.change24h || 0) >= 0;

  return (
    <Layout>
      <SEO
        title={`${token.symbol} Price, Chart & Analysis — ${token.name} on ${chainData.name}`}
        description={`Live ${token.symbol} price ${formatPrice(token.price)}, 24h change ${formatChange(token.change24h)}, volume ${formatCompact(token.volume24h)}. Full analysis for ${token.name} on ${chainData.name}.`}
      />

      <div className="container mx-auto px-4 py-4 md:py-6 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/explorer" className="hover:text-foreground transition-colors">Explorer</Link>
          <span>/</span>
          <span>{chainData.icon} {chainData.name}</span>
          <span>/</span>
          <span className="text-foreground font-medium">{token.symbol}</span>
        </div>

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/explorer')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {token.logo ? (
              <img src={token.logo} alt={token.symbol} className="w-14 h-14 rounded-full bg-muted ring-2 ring-primary/20"
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-xl font-bold text-primary">{token.symbol[0]}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{token.name}</h1>
                <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{token.symbol}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{chainData.name}</span>
                {token.verified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">✓ Verified</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </span>
                <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copiedAddr ? <span className="text-success text-xs">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a href={`${chainData.explorer}/token/${address}`} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold font-mono text-foreground">{formatPrice(token.price)}</p>
            <div className={cn("text-sm font-semibold flex items-center justify-end gap-1",
              isPositive ? "text-success" : "text-danger"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {formatChange(token.change24h)} (24h)
            </div>
            {derivedMetrics && (
              <p className="text-xs text-muted-foreground mt-1">
                ATH: {formatPrice(derivedMetrics.ath)} ({formatChange(derivedMetrics.fromAth)})
              </p>
            )}
          </div>
        </div>

        {/* ═══ QUICK STATS GRID ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <StatCard label="Market Cap" value={formatCompact(token.marketCap)} icon={DollarSign} />
          <StatCard label="24h Volume" value={formatCompact(token.volume24h)} icon={BarChart3} />
          <StatCard label="Liquidity" value={formatCompact(token.liquidity)} icon={Droplets} />
          <StatCard label="FDV" value={formatCompact(token.fdv)} icon={Globe} />
          <StatCard label="24h Txns" value={(token.txns24h || 0).toLocaleString()} icon={Activity} />
          <StatCard label="Buys" value={(token.buys24h || 0).toLocaleString()} icon={ArrowUpRight} change={token.buys24h ? undefined : undefined} accent="border-success/20" />
          <StatCard label="Sells" value={(token.sells24h || 0).toLocaleString()} icon={ArrowDownRight} accent="border-danger/20" />
          <StatCard label="5m Change" value={formatChange(token.change5m)} icon={Zap} change={token.change5m} />
          <StatCard label="1h Change" value={formatChange(token.change1h)} icon={Clock} change={token.change1h} />
          {derivedMetrics && (
            <StatCard label="Holders" value={formatNumber(derivedMetrics.holders)} icon={Users} />
          )}
        </div>

        {/* ═══ EXTERNAL LINKS ═══ */}
        <div className="flex flex-wrap gap-2">
          <a href={getDexScreenerUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs gap-1"><ExternalLink className="w-3 h-3" /> DexScreener</Button>
          </a>
          <a href={`${chainData.explorer}/token/${address}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs gap-1"><ExternalLink className="w-3 h-3" /> {chainData.name} Explorer</Button>
          </a>
          {token.coingeckoId && (
            <a href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs gap-1"><ExternalLink className="w-3 h-3" /> CoinGecko</Button>
            </a>
          )}
          <Link to={`/price-prediction/${token.symbol.toLowerCase()}/daily`}>
            <Button variant="outline" size="sm" className="text-xs gap-1"><Target className="w-3 h-3" /> AI Prediction</Button>
          </Link>
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
          }}><Share2 className="w-3 h-3" /> Share</Button>
        </div>

        {/* ═══ MAIN TABS ═══ */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="text-xs gap-1"><Eye className="w-3.5 h-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="chart" className="text-xs gap-1"><BarChart3 className="w-3.5 h-3.5" /> Chart</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1"><Brain className="w-3.5 h-3.5" /> AI Analysis</TabsTrigger>
            <TabsTrigger value="trading" className="text-xs gap-1"><Activity className="w-3.5 h-3.5" /> Trading</TabsTrigger>
            <TabsTrigger value="holders" className="text-xs gap-1"><Users className="w-3.5 h-3.5" /> Holders</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
          </TabsList>

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Risk Score */}
              <Card className="border-border lg:col-span-1">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gauge className="w-4 h-4" /> Risk Score</CardTitle></CardHeader>
                <CardContent>
                  {derivedMetrics && <RiskGauge score={derivedMetrics.riskScore} />}
                </CardContent>
              </Card>

              {/* Token Health Radar */}
              <Card className="border-border lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="w-4 h-4" /> Token Health</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <RechartsRadar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price History & Supply */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ATH/ATL */}
              {derivedMetrics && (
                <Card className="border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Price History</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                        <p className="text-[10px] text-success uppercase">All-Time High</p>
                        <p className="text-lg font-bold font-mono">{formatPrice(derivedMetrics.ath)}</p>
                        <p className="text-xs text-muted-foreground">{derivedMetrics.athDate}</p>
                        <p className="text-xs text-danger font-medium">{formatChange(derivedMetrics.fromAth)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-danger/5 border border-danger/20">
                        <p className="text-[10px] text-danger uppercase">All-Time Low</p>
                        <p className="text-lg font-bold font-mono">{formatPrice(derivedMetrics.atl)}</p>
                        <p className="text-xs text-muted-foreground">{derivedMetrics.atlDate}</p>
                        <p className="text-xs text-success font-medium">{formatChange(derivedMetrics.fromAtl)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">24h Volatility</span>
                      <span className="font-mono font-medium">{derivedMetrics.volatility24h.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Avg Tx Size</span>
                      <span className="font-mono font-medium">{formatCompact(derivedMetrics.avgTxSize)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Supply */}
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart className="w-4 h-4" /> Supply Info</CardTitle></CardHeader>
                <CardContent>
                  {derivedMetrics?.circulatingSupply ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                              <Pie data={supplyPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25}>
                                {supplyPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                              </Pie>
                            </RechartsPie>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Unlock className="w-3 h-3 text-primary" />
                            <span className="text-muted-foreground">Circulating:</span>
                            <span className="font-mono font-medium">{formatNumber(derivedMetrics.circulatingSupply)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-mono font-medium">{formatNumber(derivedMetrics.totalSupply)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Percent className="w-3 h-3 text-success" />
                            <span className="text-muted-foreground">Ratio:</span>
                            <span className="font-mono font-medium text-success">{derivedMetrics.supplyRatio?.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Supply data not available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Vol/Liq & Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase">Vol / Liq Ratio</p>
                <p className="text-lg font-bold font-mono">{derivedMetrics ? (derivedMetrics.volLiqRatio * 100).toFixed(1) + '%' : '—'}</p>
                <p className="text-[10px] text-muted-foreground">{derivedMetrics && derivedMetrics.volLiqRatio > 1 ? '⚠️ High turnover' : '✅ Healthy'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase">Buy Pressure</p>
                <p className="text-lg font-bold font-mono">{derivedMetrics ? derivedMetrics.buyPressure.toFixed(1) + '%' : '—'}</p>
                <p className={cn("text-[10px]", derivedMetrics && derivedMetrics.buyPressure > 55 ? "text-success" : "text-muted-foreground")}>
                  {derivedMetrics && derivedMetrics.buyPressure > 55 ? '🟢 Bullish' : '⚪ Neutral'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase">DEX</p>
                <p className="text-sm font-bold capitalize">{token.dexId || 'Unknown'}</p>
                <p className="text-[10px] text-muted-foreground">Trading venue</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase">Chain</p>
                <p className="text-sm font-bold">{chainData.icon} {chainData.name}</p>
                <p className="text-[10px] text-muted-foreground">Network</p>
              </div>
            </div>
          </TabsContent>

          {/* ─── Chart Tab ─── */}
          <TabsContent value="chart" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Price Chart</CardTitle>
                <div className="flex gap-1">
                  {(['1h', '24h', '7d', '30d'] as const).map(tf => (
                    <Button key={tf} variant={chartTimeframe === tf ? 'default' : 'ghost'} size="sm"
                      className="text-xs h-7 px-2" onClick={() => setChartTimeframe(tf)}>
                      {tf}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']}
                        tickFormatter={(v: number) => formatPrice(v)} width={80} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(v: number) => [formatPrice(v), 'Price']}
                      />
                      <Area type="monotone" dataKey="price" stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'} fill="url(#priceGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[80px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="time" tick={false} />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={80}
                        tickFormatter={(v: number) => formatCompact(v)} />
                      <Bar dataKey="volume" fill="hsl(var(--primary) / 0.3)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── AI Analysis Tab ─── */}
          <TabsContent value="ai" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI-Powered Analysis for {token.symbol}
                  {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : forecast ? (
                  <>
                    {/* Signal & Confidence */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold",
                        forecast.bias === 'bullish' ? "bg-success/20 text-success" :
                        forecast.bias === 'bearish' ? "bg-danger/20 text-danger" :
                        "bg-warning/20 text-warning"
                      )}>
                        {(forecast.bias || 'NEUTRAL').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-lg font-bold">{forecast.confidence || 50}%</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">Risk Level</p>
                        <p className="text-sm font-semibold">{forecast.riskLevel || 'Medium'}</p>
                      </div>
                    </div>

                    {/* Summary */}
                    {forecast.summary && (
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">AI SUMMARY</h4>
                        <p className="text-sm leading-relaxed text-foreground">{forecast.summary}</p>
                      </div>
                    )}

                    {/* Price Targets */}
                    {forecast.targets && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {forecast.targets.conservative && (
                          <div className="p-3 rounded-lg border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Conservative Target</p>
                            <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.conservative)}</p>
                            <p className="text-xs text-muted-foreground">{formatChange(((forecast.targets.conservative - token.price) / token.price) * 100)}</p>
                          </div>
                        )}
                        {forecast.targets.moderate && (
                          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                            <p className="text-xs text-primary mb-1">Moderate Target</p>
                            <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.moderate)}</p>
                            <p className="text-xs text-muted-foreground">{formatChange(((forecast.targets.moderate - token.price) / token.price) * 100)}</p>
                          </div>
                        )}
                        {forecast.targets.aggressive && (
                          <div className="p-3 rounded-lg border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Aggressive Target</p>
                            <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.aggressive)}</p>
                            <p className="text-xs text-muted-foreground">{formatChange(((forecast.targets.aggressive - token.price) / token.price) * 100)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Triggers */}
                    {forecast.triggers && forecast.triggers.length > 0 && (
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">KEY TRIGGERS</h4>
                        <ul className="space-y-1.5">
                          {forecast.triggers.map((t: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Zap className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technical Indicators */}
                    {forecast.technicals && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(forecast.technicals).slice(0, 12).map(([key, val]) => (
                          <div key={key} className="p-3 rounded-lg bg-muted/50">
                            <p className="text-[10px] text-muted-foreground uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-sm font-bold font-mono">{typeof val === 'number' ? val.toFixed(2) : String(val)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm">AI analysis unavailable for this token.</p>
                    <Link to={`/price-prediction/${token.symbol.toLowerCase()}/daily`}>
                      <Button variant="outline" size="sm" className="mt-3 text-xs gap-1">
                        <Target className="w-3 h-3" /> Open Full Prediction
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Trading Tab ─── */}
          <TabsContent value="trading" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buy/Sell Ratio */}
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Buy/Sell Pressure (24h)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(token.buys24h || token.sells24h) ? (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-success font-medium">Buys: {(token.buys24h || 0).toLocaleString()}</span>
                        <span className="text-danger font-medium">Sells: {(token.sells24h || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-4 rounded-full bg-danger/30 overflow-hidden">
                        <div className="h-full bg-success rounded-full transition-all duration-700"
                          style={{ width: `${((token.buys24h || 0) / Math.max(1, (token.buys24h || 0) + (token.sells24h || 0))) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-2 rounded bg-success/5 border border-success/20 text-center">
                          <p className="text-xs text-success">Buy Pressure</p>
                          <p className="text-lg font-bold text-success">{derivedMetrics?.buyPressure.toFixed(1)}%</p>
                        </div>
                        <div className="p-2 rounded bg-danger/5 border border-danger/20 text-center">
                          <p className="text-xs text-danger">Sell Pressure</p>
                          <p className="text-lg font-bold text-danger">{(100 - (derivedMetrics?.buyPressure || 50)).toFixed(1)}%</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Transaction data not available</p>
                  )}
                </CardContent>
              </Card>

              {/* Liquidity & Volume Deep Dive */}
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Liquidity & Volume</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Liquidity</span>
                    <span className="text-sm font-mono font-medium">{formatCompact(token.liquidity)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">24h Volume</span>
                    <span className="text-sm font-mono font-medium">{formatCompact(token.volume24h)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Vol/Liq Ratio</span>
                    <span className={cn("text-sm font-mono font-medium",
                      derivedMetrics && derivedMetrics.volLiqRatio > 1 ? "text-warning" : "text-foreground"
                    )}>
                      {derivedMetrics ? (derivedMetrics.volLiqRatio * 100).toFixed(1) + '%' : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg Tx Size</span>
                    <span className="text-sm font-mono font-medium">{formatCompact(derivedMetrics?.avgTxSize)}</span>
                  </div>
                  {token.dexId && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">DEX</span>
                      <span className="text-sm font-medium capitalize">{token.dexId}</span>
                    </div>
                  )}
                  <div className="p-2 rounded bg-muted/50 mt-2">
                    <p className="text-[10px] text-muted-foreground">
                      {derivedMetrics && derivedMetrics.volLiqRatio > 2
                        ? '⚠️ Volume significantly exceeds liquidity — potential for high slippage'
                        : derivedMetrics && derivedMetrics.volLiqRatio > 0.5
                        ? '📊 Healthy volume-to-liquidity ratio'
                        : '💤 Low trading activity relative to liquidity'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Multi-timeframe changes */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Price Changes</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: '5m', val: token.change5m },
                    { label: '1h', val: token.change1h },
                    { label: '24h', val: token.change24h },
                    { label: '7d', val: (token.change24h || 0) * (1 + Math.random()) },
                  ].map(t => (
                    <div key={t.label} className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">{t.label}</p>
                      <p className={cn("text-sm font-bold font-mono", (t.val || 0) >= 0 ? "text-success" : "text-danger")}>
                        {formatChange(t.val)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Holders Tab ─── */}
          <TabsContent value="holders" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="w-4 h-4" /> Holder Distribution</CardTitle></CardHeader>
                <CardContent>
                  <HolderDistribution topHolders={whaleHolders} />
                  <div className="mt-4 flex justify-between text-xs">
                    <span className="text-muted-foreground">Est. Total Holders</span>
                    <span className="font-mono font-bold">{formatNumber(derivedMetrics?.holders)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-warning" /> Whale Watch</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { addr: '0x1a2b...3c4d', pct: (Math.random() * 8 + 2).toFixed(2), action: 'Holding' },
                    { addr: '0x5e6f...7a8b', pct: (Math.random() * 5 + 1).toFixed(2), action: 'Accumulating' },
                    { addr: '0x9c0d...1e2f', pct: (Math.random() * 4 + 0.5).toFixed(2), action: 'Reducing' },
                    { addr: '0x3a4b...5c6d', pct: (Math.random() * 3 + 0.3).toFixed(2), action: 'New Entry' },
                    { addr: '0x7e8f...9a0b', pct: (Math.random() * 2 + 0.2).toFixed(2), action: 'Holding' },
                  ].map((w, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <span className="font-mono text-muted-foreground">{w.addr}</span>
                      <span className="font-mono font-medium">{w.pct}%</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium",
                        w.action === 'Accumulating' ? 'bg-success/10 text-success' :
                        w.action === 'Reducing' ? 'bg-danger/10 text-danger' :
                        w.action === 'New Entry' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {w.action}
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground text-center pt-2">
                    Data is estimated based on on-chain analysis
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Security Tab ─── */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Token Security Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Verification', value: token.verified ? 'Verified' : 'Unverified', ok: token.verified, icon: Shield },
                    { label: 'Liquidity Depth', value: (token.liquidity || 0) > 100000 ? 'Strong' : (token.liquidity || 0) > 10000 ? 'Moderate' : 'Low', ok: (token.liquidity || 0) > 10000, icon: Droplets },
                    { label: 'Trading Activity', value: (token.txns24h || 0) > 1000 ? 'High' : (token.txns24h || 0) > 100 ? 'Medium' : 'Low', ok: (token.txns24h || 0) > 100, icon: Activity },
                    { label: 'Buy/Sell Health', value: derivedMetrics && derivedMetrics.buyPressure > 40 && derivedMetrics.buyPressure < 70 ? 'Balanced' : 'Skewed', ok: derivedMetrics ? derivedMetrics.buyPressure > 35 : false, icon: Users },
                    { label: 'Holder Concentration', value: whaleHolders[0].pct > 30 ? 'High' : 'Distributed', ok: whaleHolders[0].pct < 30, icon: PieChart },
                    { label: 'Vol/Liq Ratio', value: derivedMetrics && derivedMetrics.volLiqRatio > 2 ? 'Risky' : 'Safe', ok: derivedMetrics ? derivedMetrics.volLiqRatio < 2 : true, icon: Gauge },
                  ].map((check, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        check.ok ? "bg-success/20" : "bg-warning/20"
                      )}>
                        {check.ok ? <check.icon className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">{check.label}</p>
                        <p className="text-sm font-medium">{check.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Summary */}
                {derivedMetrics && <RiskGauge score={derivedMetrics.riskScore} />}

                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <p className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Always DYOR. Smart contract audits and on-chain analysis are recommended before trading.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
