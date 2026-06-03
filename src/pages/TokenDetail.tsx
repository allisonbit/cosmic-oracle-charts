import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
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
import { formatPrice, formatCompact, formatNumber, formatChange } from "@/lib/formatters";
import { TokenAITab } from "@/components/features/token-detail/TokenAITab";
import { TokenTradingTab } from "@/components/features/token-detail/TokenTradingTab";
import { TokenHoldersTab } from "@/components/features/token-detail/TokenHoldersTab";
import { TokenSecurityTab } from "@/components/features/token-detail/TokenSecurityTab";
import { TokenOverviewTab } from "@/components/features/token-detail/TokenOverviewTab";
import { TokenChartTab } from "@/components/features/token-detail/TokenChartTab";
import { TokenHeader } from "@/components/features/token-detail/TokenHeader";
import { TokenQuickStats } from "@/components/features/token-detail/TokenQuickStats";

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

  // Real OHLC sparkline via edge fn (CoinGecko)
  const { data: sparkData } = useQuery({
    queryKey: ["sparkline", token?.symbol, token?.coingeckoId, chartTimeframe],
    queryFn: async () => {
      const days = chartTimeframe === '1h' ? 1 : chartTimeframe === '24h' ? 1 : chartTimeframe === '7d' ? 7 : 30;
      const { data, error } = await supabase.functions.invoke("sparkline", {
        body: { symbol: token!.symbol, id: token!.coingeckoId, days },
      });
      if (error) throw error;
      return (data?.points ?? []) as Array<{ time: string; price: number }>;
    },
    enabled: !!token && (!!token.coingeckoId || !!token.symbol),
    refetchInterval: 120_000,
    refetchIntervalInBackground: true,
    staleTime: 60_000,
  });

  const chartData = useMemo(
    () => (sparkData ?? []).map((p, i) => ({ time: `${i}`, price: p.price, volume: 0 })),
    [sparkData]
  );

  // Real derived metrics — only from live token fields, no random
  const derivedMetrics = useMemo(() => {
    if (!token) return null;
    const volLiqRatio = token.liquidity ? (token.volume24h / token.liquidity) : 0;
    const buyPressure = token.buys24h && token.sells24h
      ? (token.buys24h / Math.max(1, token.buys24h + token.sells24h)) * 100
      : 50;
    const riskScore = Math.min(100, Math.max(5,
      (token.liquidity && token.liquidity > 500000 ? 0 : 30) +
      (token.txns24h && token.txns24h > 500 ? 0 : 20) +
      (volLiqRatio > 5 ? 25 : volLiqRatio > 1 ? 10 : 0) +
      (token.verified ? 0 : 15)
    ));
    const circulatingSupply = token.marketCap && token.price ? token.marketCap / token.price : undefined;
    return {
      volLiqRatio,
      buyPressure,
      riskScore,
      circulatingSupply,
      totalSupply: undefined,
      supplyRatio: undefined,
      holders: null,
      avgTxSize: token.volume24h && token.txns24h ? token.volume24h / token.txns24h : 0,
      volatility24h: Math.abs(token.change24h || 0),
      ath: null,
      atl: null,
      athDate: null,
      atlDate: null,
      fromAth: null,
      fromAtl: null,
    };
  }, [token]);

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

  // Supply pie only renders when real circ+total are present
  const supplyPie: Array<{ name: string; value: number }> = [];

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
        <TokenHeader
          token={token}
          chainData={chainData}
          address={address!}
          isPositive={isPositive}
          derivedMetrics={derivedMetrics}
          navigate={navigate}
          copyAddress={copyAddress}
          copiedAddr={copiedAddr}
        />

        {/* ═══ QUICK STATS GRID ═══ */}
        <TokenQuickStats token={token} derivedMetrics={derivedMetrics} />

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
          <TabsContent value="overview" className="mt-4">
            <TokenOverviewTab
              token={token}
              derivedMetrics={derivedMetrics}
              radarData={radarData}
              supplyPie={supplyPie}
              PIE_COLORS={PIE_COLORS}
              chainData={chainData}
            />
          </TabsContent>

          {/* ─── Chart Tab ─── */}
          <TabsContent value="chart" className="mt-4">
            <TokenChartTab
              chartData={chartData}
              chartTimeframe={chartTimeframe}
              setChartTimeframe={setChartTimeframe}
              isPositive={isPositive}
            />
          </TabsContent>

          {/* ─── AI Analysis Tab ─── */}
          <TabsContent value="ai" className="mt-4">
            <TokenAITab token={token} aiLoading={aiLoading} forecast={forecast} />
          </TabsContent>

          {/* ─── Trading Tab ─── */}
          <TabsContent value="trading" className="mt-4">
            <TokenTradingTab token={token} derivedMetrics={derivedMetrics} />
          </TabsContent>

          {/* ─── Holders Tab ─── */}
          <TabsContent value="holders" className="mt-4">
            <TokenHoldersTab derivedMetrics={derivedMetrics} />
          </TabsContent>

          {/* ─── Security Tab ─── */}
          <TabsContent value="security" className="mt-4">
            <TokenSecurityTab token={token} derivedMetrics={derivedMetrics} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
