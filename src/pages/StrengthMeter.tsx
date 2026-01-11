import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRealtimeStrength } from "@/hooks/useRealtimeStrength";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Zap, 
  RefreshCw,
  Target,
  Activity,
  Wifi,
  WifiOff,
  Trophy,
  Flame,
  Shield,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StrengthMeterSchema } from "@/components/seo";
import { StrengthMeterSEOHeader, StrengthMeterSEOContent } from "@/components/seo";
import { InArticleAd } from "@/components/ads";
import {
  StrengthComparisonGauge,
  WeightingPlayground,
  ExpandableStrengthCard,
  SectorStrengthHeatmap,
  DivergenceWatchlist,
  DailyStrengthReport,
  TokenStrengthSearch,
} from "@/components/strength";

const timeframes = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
];

const leaderboardTabs = [
  { value: 'overall', label: 'Overall', icon: Trophy },
  { value: 'momentum', label: 'Momentum', icon: Flame },
  { value: 'risk-adjusted', label: 'Risk-Adjusted', icon: Shield },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
];

export default function StrengthMeter() {
  const [timeframe, setTimeframe] = useState('24h');
  const [view, setView] = useState<'assets' | 'chains'>('assets');
  const [leaderboard, setLeaderboard] = useState('overall');
  
  const { assets, chains, lastUpdate, isConnected, refresh } = useRealtimeStrength(timeframe);

  const displayData = view === 'assets' ? assets : chains;
  const isLoading = displayData.length === 0;

  // Sort data based on leaderboard type
  const getSortedData = () => {
    if (!displayData.length) return [];
    
    switch (leaderboard) {
      case 'momentum':
        return [...displayData].sort((a, b) => b.priceChange24h - a.priceChange24h);
      case 'risk-adjusted':
        return [...displayData].sort((a, b) => 
          (b.strengthScore / Math.max(1, b.volatility)) - (a.strengthScore / Math.max(1, a.volatility))
        );
      case 'trending':
        return [...displayData].sort((a, b) => b.momentum - a.momentum);
      default:
        return displayData;
    }
  };

  const sortedData = getSortedData();
  const top10Data = sortedData.slice(0, 10);

  return (
    <Layout>
      <StrengthMeterSchema />
      <StrengthMeterSEOHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary" />
              Crypto Strength Meter
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              Real-time strength analysis with interactive tools
              <span className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-success animate-pulse" />
                    <span className="text-success">LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-danger" />
                    <span className="text-danger">Offline</span>
                  </>
                )}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </section>

        {/* Daily Report */}
        <DailyStrengthReport assets={assets} chains={chains} />

        {/* Comparison Gauge & Search */}
        <div className="grid lg:grid-cols-2 gap-6">
          <StrengthComparisonGauge assets={assets} chains={chains} />
          <TokenStrengthSearch allAssets={assets} />
        </div>

        {/* Sector Heatmap & Divergence */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SectorStrengthHeatmap assets={assets} />
          <DivergenceWatchlist assets={assets} />
        </div>

        <InArticleAd className="my-4" />

        {/* Weighting Playground */}
        <WeightingPlayground assets={assets} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={view} onValueChange={(v) => setView(v as 'assets' | 'chains')}>
            <TabsList className="bg-muted/30">
              <TabsTrigger value="assets" className="gap-2">
                <Target className="w-4 h-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="chains" className="gap-2">
                <Activity className="w-4 h-4" />
                Chains
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Timeframe:</span>
            <div className="flex bg-muted/30 rounded-lg p-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  variant={timeframe === tf.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(tf.value)}
                  className="px-3 h-8"
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={leaderboard} onValueChange={setLeaderboard}>
          <TabsList className="bg-muted/30 w-full justify-start overflow-x-auto">
            {leaderboardTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Top 10 Rankings */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Top 10 {view === 'assets' ? 'Asset' : 'Chain'} Rankings
          </h2>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="h-24 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {top10Data.map((item, index) => (
                <ExpandableStrengthCard key={item.id} data={item} rank={index + 1} />
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Use the search above to find strength data for any token not shown here.
          </p>
        </section>
        
        <StrengthMeterSEOContent />
      </main>
    </Layout>
  );
}
