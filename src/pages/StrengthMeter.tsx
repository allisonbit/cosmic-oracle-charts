import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRealtimeStrength } from "@/hooks/useRealtimeStrength";
import { StrengthData } from "@/hooks/useStrengthMeter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  RefreshCw,
  Zap,
  Target,
  Activity,
  BarChart3,
  ArrowRight,
  Wifi,
  WifiOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { StrengthMeterSchema } from "@/components/seo";

const timeframes = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
];

function StrengthBar({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 55) return 'bg-emerald-400';
    if (score >= 45) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };

  return (
    <div className={cn("w-full bg-muted/30 rounded-full overflow-hidden", heights[size])}>
      <div 
        className={cn("h-full rounded-full transition-all duration-500", getColor(score))}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function StrengthCard({ data, rank }: { data: StrengthData; rank: number }) {
  const getStrengthLabel = (score: number) => {
    if (score >= 70) return { text: 'Strong', color: 'text-green-400', icon: TrendingUp };
    if (score >= 55) return { text: 'Bullish', color: 'text-emerald-400', icon: TrendingUp };
    if (score >= 45) return { text: 'Neutral', color: 'text-yellow-400', icon: Minus };
    if (score >= 30) return { text: 'Weak', color: 'text-orange-400', icon: TrendingDown };
    return { text: 'Bearish', color: 'text-red-400', icon: TrendingDown };
  };

  const strength = getStrengthLabel(data.strengthScore);
  const Icon = strength.icon;

  return (
    <Card className="glass-card hover:border-primary/40 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            rank <= 3 ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
          )}>
            {rank}
          </div>

          {/* Logo & Name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img 
              src={data.logo} 
              alt={data.name}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
              }}
            />
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{data.symbol}</h3>
              <p className="text-xs text-muted-foreground truncate">{data.name}</p>
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className={cn("text-xl font-bold", strength.color)}>
                {data.strengthScore}
              </span>
              <Icon className={cn("w-4 h-4", strength.color)} />
            </div>
            <span className={cn("text-xs", strength.color)}>{strength.text}</span>
          </div>
        </div>

        {/* Strength Bar */}
        <div className="mt-3">
          <StrengthBar score={data.strengthScore} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-2 rounded bg-muted/20">
                <p className="text-muted-foreground">24h</p>
                <p className={cn("font-medium", data.priceChange24h >= 0 ? "text-green-400" : "text-red-400")}>
                  {data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h.toFixed(2)}%
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>24 Hour Price Change</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-2 rounded bg-muted/20">
                <p className="text-muted-foreground">Vol</p>
                <p className={cn("font-medium", data.volumeChange >= 0 ? "text-green-400" : "text-red-400")}>
                  {data.volumeChange >= 0 ? '+' : ''}{data.volumeChange.toFixed(1)}%
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>Volume Change</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-2 rounded bg-muted/20">
                <p className="text-muted-foreground">Trend</p>
                <p className="font-medium text-foreground">{data.trendConsistency.toFixed(0)}%</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>Trend Consistency Score</TooltipContent>
          </Tooltip>
        </div>

        {/* Link to Factory */}
        {data.type === 'asset' && (
          <Link 
            to={`/factory?asset=${data.symbol}`}
            className="mt-3 flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View in Factory <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function StrengthTable({ data, isLoading }: { data: StrengthData[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((item, index) => (
        <StrengthCard key={item.id} data={item} rank={index + 1} />
      ))}
    </div>
  );
}

export default function StrengthMeter() {
  const [timeframe, setTimeframe] = useState('24h');
  const [view, setView] = useState<'assets' | 'chains'>('assets');
  
  const { assets, chains, lastUpdate, isConnected, refresh } = useRealtimeStrength(timeframe);

  const displayData = view === 'assets' ? assets : chains;
  const isLoading = displayData.length === 0;

  return (
    <Layout>
      <StrengthMeterSchema />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary" />
              Crypto Strength Meter
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              Measure relative strength of cryptocurrencies and blockchains in real-time
              <span className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-success animate-pulse" />
                    <span className="text-success">LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-danger" />
                    <span className="text-danger">Disconnected</span>
                  </>
                )}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Updated: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </section>

        {/* Info Card */}
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Strength Score</strong> is calculated using a composite weighted model including:
                  price momentum (25%), relative performance vs BTC/ETH (20%), volume flow (15%), sentiment (10%), 
                  volatility (10%), dominance changes (10%), and trend consistency (10%).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* View Toggle */}
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

          {/* Timeframe Toggle */}
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

        {/* Summary Stats */}
        {displayData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold text-green-400">
                  {displayData?.filter(d => d.strengthScore >= 55).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Bullish</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Minus className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold text-yellow-400">
                  {displayData?.filter(d => d.strengthScore >= 45 && d.strengthScore < 55).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Neutral</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-400" />
                <p className="text-2xl font-bold text-red-400">
                  {displayData?.filter(d => d.strengthScore < 45).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Bearish</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">
                  {displayData?.[0]?.symbol || '-'}
                </p>
                <p className="text-xs text-muted-foreground">Strongest</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Strength Rankings */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {view === 'assets' ? <Target className="w-5 h-5 text-primary" /> : <Activity className="w-5 h-5 text-primary" />}
            {view === 'assets' ? 'Asset Strength Rankings' : 'Chain Strength Rankings'}
          </h2>
          <StrengthTable data={displayData || []} isLoading={isLoading} />
        </section>
      </main>
    </Layout>
  );
}
