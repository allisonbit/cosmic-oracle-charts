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
  DollarSign, Users, Clock, Zap, Target, AlertTriangle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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

function formatChange(c: number | undefined): string {
  if (c === undefined || c === null) return '—';
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
}

// ─── Stat Card ───
function StatCard({ label, value, icon: Icon, change, className }: {
  label: string; value: string; icon: any; change?: number; className?: string;
}) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-lg font-bold font-mono text-foreground">{value}</p>
        {change !== undefined && (
          <p className={cn("text-xs font-medium mt-0.5", change >= 0 ? "text-success" : "text-danger")}>
            {formatChange(change)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function TokenDetail() {
  const { chain = 'ethereum', address = '' } = useParams<{ chain: string; address: string }>();
  const navigate = useNavigate();
  const [copiedAddr, setCopiedAddr] = useState(false);

  const chainData = getChainById(chain) || ALL_CHAINS[0];

  // Fetch token data
  const { data: token, isLoading } = useTokenByAddress(address, chain);

  // Fetch AI forecast
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    token ? { symbol: token.symbol, price: token.price, change24h: token.change24h, volume: token.volume24h } : null,
    "coin_forecast",
    !!token && token.price > 0
  );

  const forecast = aiData?.forecast;

  // Generate mock chart data from price
  const chartData = useMemo(() => {
    if (!token) return [];
    const base = token.price;
    const vol = Math.abs(token.change24h || 5) / 100;
    return Array.from({ length: 48 }, (_, i) => {
      const noise = (Math.random() - 0.5) * 2 * vol * base;
      const trend = (token.change24h || 0) > 0 ? (i / 48) * vol * base * 0.5 : -(i / 48) * vol * base * 0.5;
      return {
        time: `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
        price: Math.max(0, base - vol * base + trend + noise),
        volume: Math.floor(Math.random() * (token.volume24h || 1000) / 48),
      };
    });
  }, [token]);

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
        title={`${token.symbol} Price, Chart & AI Analysis — ${token.name} on ${chainData.name}`}
        description={`Live ${token.symbol} price ${formatPrice(token.price)}, 24h change ${formatChange(token.change24h)}, volume ${formatCompact(token.volume24h)}. AI-powered analysis and trading signals for ${token.name}.`}
      />

      <div className="container mx-auto px-4 py-4 md:py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/explorer" className="hover:text-foreground transition-colors">Explorer</Link>
          <span>/</span>
          <span>{chainData.icon} {chainData.name}</span>
          <span>/</span>
          <span className="text-foreground font-medium">{token.symbol}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/explorer')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {token.logo ? (
              <img src={token.logo} alt={token.symbol} className="w-12 h-12 rounded-full bg-muted"
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{token.symbol[0]}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{token.name}</h1>
                <span className="text-sm text-muted-foreground font-mono">{token.symbol}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{chainData.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-muted-foreground">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </span>
                <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-3 h-3" />
                </button>
                <a href={`${chainData.explorer}/token/${address}`} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold font-mono text-foreground">{formatPrice(token.price)}</p>
              <p className={cn("text-sm font-semibold flex items-center justify-end gap-1",
                isPositive ? "text-success" : "text-danger"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatChange(token.change24h)} (24h)
              </p>
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Market Cap" value={formatCompact(token.marketCap)} icon={DollarSign} />
          <StatCard label="24h Volume" value={formatCompact(token.volume24h)} icon={BarChart3} />
          <StatCard label="Liquidity" value={formatCompact(token.liquidity)} icon={Droplets} />
          <StatCard label="FDV" value={formatCompact(token.fdv)} icon={Globe} />
          <StatCard label="24h Txns" value={(token.txns24h || 0).toLocaleString()} icon={Activity} />
          <StatCard label="Buys / Sells" value={`${(token.buys24h || 0).toLocaleString()} / ${(token.sells24h || 0).toLocaleString()}`} icon={Users} />
          <StatCard label="5m Change" value={formatChange(token.change5m)} icon={Zap}
            change={token.change5m} />
          <StatCard label="1h Change" value={formatChange(token.change1h)} icon={Clock}
            change={token.change1h} />
        </div>

        {/* External Links */}
        <div className="flex flex-wrap gap-2">
          <a href={getDexScreenerUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" /> DexScreener
            </Button>
          </a>
          <a href={`${chainData.explorer}/token/${address}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" /> {chainData.name} Explorer
            </Button>
          </a>
          {token.coingeckoId && (
            <a href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" /> CoinGecko
              </Button>
            </a>
          )}
          <Link to={`/price-prediction/${token.symbol.toLowerCase()}/daily`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Target className="w-3 h-3 mr-1" /> Full Prediction
            </Button>
          </Link>
        </div>

        {/* Tabs: Chart, AI Analysis, Trading */}
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="w-full justify-start bg-muted/50">
            <TabsTrigger value="chart" className="text-xs gap-1"><BarChart3 className="w-3.5 h-3.5" /> Chart</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1"><Brain className="w-3.5 h-3.5" /> AI Analysis</TabsTrigger>
            <TabsTrigger value="trading" className="text-xs gap-1"><Activity className="w-3.5 h-3.5" /> Trading</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
          </TabsList>

          {/* Chart Tab */}
          <TabsContent value="chart" className="mt-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Price Chart (24h)</CardTitle>
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
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
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
                {/* Volume bar */}
                <div className="h-[100px] mt-2">
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

          {/* AI Analysis Tab */}
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
                          </div>
                        )}
                        {forecast.targets.moderate && (
                          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                            <p className="text-xs text-primary mb-1">Moderate Target</p>
                            <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.moderate)}</p>
                          </div>
                        )}
                        {forecast.targets.aggressive && (
                          <div className="p-3 rounded-lg border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Aggressive Target</p>
                            <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.aggressive)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Triggers */}
                    {forecast.triggers && forecast.triggers.length > 0 && (
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">KEY TRIGGERS</h4>
                        <ul className="space-y-1">
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
                        {Object.entries(forecast.technicals).slice(0, 8).map(([key, val]) => (
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
                    <p className="text-xs text-muted-foreground mt-1">Try the full prediction page for more analysis.</p>
                    <Link to={`/price-prediction/${token.symbol.toLowerCase()}/daily`}>
                      <Button variant="outline" size="sm" className="mt-3 text-xs">
                        <Target className="w-3 h-3 mr-1" /> Open Full Prediction
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buy/Sell Ratio */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Buy/Sell Ratio (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  {(token.buys24h || token.sells24h) ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-success">Buys: {(token.buys24h || 0).toLocaleString()}</span>
                            <span className="text-danger">Sells: {(token.sells24h || 0).toLocaleString()}</span>
                          </div>
                          <div className="h-3 rounded-full bg-danger/30 overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full"
                              style={{ width: `${((token.buys24h || 0) / Math.max(1, (token.buys24h || 0) + (token.sells24h || 0))) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Buy pressure: {(((token.buys24h || 0) / Math.max(1, (token.buys24h || 0) + (token.sells24h || 0))) * 100).toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Transaction data not available</p>
                  )}
                </CardContent>
              </Card>

              {/* Liquidity Info */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Liquidity & Volume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Liquidity</span>
                    <span className="text-sm font-mono font-medium">{formatCompact(token.liquidity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">24h Volume</span>
                    <span className="text-sm font-mono font-medium">{formatCompact(token.volume24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Vol/Liq Ratio</span>
                    <span className="text-sm font-mono font-medium">
                      {token.liquidity ? ((token.volume24h / token.liquidity) * 100).toFixed(1) + '%' : '—'}
                    </span>
                  </div>
                  {token.dexId && (
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">DEX</span>
                      <span className="text-sm font-medium capitalize">{token.dexId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="trading" className="mt-4">
            {/* already handled above */}
          </TabsContent>
          <TabsContent value="security" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Token Security Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                      token.verified ? "bg-success/20" : "bg-warning/20"
                    )}>
                      {token.verified ? <Shield className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verification</p>
                      <p className="text-sm font-medium">{token.verified ? 'Verified Token' : 'Unverified'}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Liquidity</p>
                      <p className="text-sm font-medium">
                        {(token.liquidity || 0) > 100000 ? 'Strong' : (token.liquidity || 0) > 10000 ? 'Moderate' : 'Low'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">24h Activity</p>
                      <p className="text-sm font-medium">
                        {(token.txns24h || 0) > 1000 ? 'High' : (token.txns24h || 0) > 100 ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Buy/Sell Health</p>
                      <p className="text-sm font-medium">
                        {token.buys24h && token.sells24h
                          ? (token.buys24h / Math.max(1, token.sells24h)) > 1.2 ? 'Healthy (Buy-heavy)' : 'Balanced'
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <p className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
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
