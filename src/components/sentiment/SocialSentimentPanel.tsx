import { useState } from "react";
import { 
  MessageCircle, Users, TrendingUp, TrendingDown, Activity, 
  Globe, BarChart3, Flame, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TopCoinData, GlobalMarketData } from "@/hooks/useSentimentData";

interface SocialSentimentPanelProps {
  tokens: TopCoinData[];
  globalData?: GlobalMarketData | null;
  isLoading?: boolean;
}

function deriveSentiment(coin: TopCoinData, globalData?: GlobalMarketData | null) {
  // Derive sentiment from real metrics
  const priceScore = Math.min(100, Math.max(0, 50 + coin.change24h * 4));
  const volumeRatio = coin.marketCap > 0 ? (coin.volume / coin.marketCap) * 100 : 5;
  const volumeScore = Math.min(100, volumeRatio * 10);
  const athScore = Math.min(100, Math.max(0, 100 + coin.athChangePercentage));
  const rangePosition = coin.high24h > coin.low24h
    ? ((coin.price - coin.low24h) / (coin.high24h - coin.low24h)) * 100
    : 50;

  const overall = Math.round(priceScore * 0.35 + volumeScore * 0.25 + athScore * 0.2 + rangePosition * 0.2);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    priceScore: Math.round(priceScore),
    volumeScore: Math.round(volumeScore),
    athScore: Math.round(athScore),
    rangePosition: Math.round(rangePosition),
    volumeRatio: volumeRatio.toFixed(2),
    whaleActivity: volumeRatio > 15 ? 'high' as const : volumeRatio > 8 ? 'medium' as const : 'low' as const,
  };
}

export function SocialSentimentPanel({ tokens, globalData, isLoading }: SocialSentimentPanelProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'metrics' | 'comparison'>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const coins = tokens.slice(0, 10);
  const selectedCoin = selectedToken ? coins.find(c => c.symbol === selectedToken) : coins[0];
  const sentiment = selectedCoin ? deriveSentiment(selectedCoin, globalData) : null;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  const getSentimentColor = (value: number) => {
    if (value >= 70) return 'text-success';
    if (value >= 40) return 'text-warning';
    return 'text-danger';
  };

  const getSentimentBg = (value: number) => {
    if (value >= 70) return 'bg-success';
    if (value >= 40) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="space-y-6">
      {/* Token Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {coins.map((coin) => {
          const s = deriveSentiment(coin, globalData);
          return (
            <Button
              key={coin.symbol}
              variant={selectedToken === coin.symbol || (!selectedToken && coin === coins[0]) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedToken(coin.symbol)}
              className="gap-2 whitespace-nowrap shrink-0"
            >
              <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
              {coin.symbol}
              <div className={cn("w-2 h-2 rounded-full", getSentimentBg(s.overall))} />
            </Button>
          );
        })}
      </div>

      {selectedCoin && sentiment && (
        <>
          {/* Header */}
          <div className="holo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-display font-bold text-xl">{selectedCoin.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCoin.name} • {formatNumber(selectedCoin.price)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-3xl font-display font-bold", getSentimentColor(sentiment.overall))}>
                  {sentiment.overall}
                </div>
                <div className="text-xs text-muted-foreground">Composite Score</div>
              </div>
            </div>

            {/* Quick Stats from real data */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                <div className={cn("font-bold", selectedCoin.change24h >= 0 ? "text-success" : "text-danger")}>
                  {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Vol/MCap</div>
                <div className="font-bold text-primary">{sentiment.volumeRatio}%</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Whale Activity</div>
                <div className={cn(
                  "font-bold",
                  sentiment.whaleActivity === 'high' ? 'text-success' :
                  sentiment.whaleActivity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                )}>
                  {sentiment.whaleActivity.toUpperCase()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">From ATH</div>
                <div className={cn("font-bold", selectedCoin.athChangePercentage > -20 ? "text-warning" : "text-danger")}>
                  {selectedCoin.athChangePercentage.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">Scores</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  SENTIMENT BREAKDOWN
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Price Momentum', value: sentiment.priceScore, desc: 'Based on 24h price action' },
                    { label: 'Volume Strength', value: sentiment.volumeScore, desc: 'Volume relative to market cap' },
                    { label: 'ATH Recovery', value: sentiment.athScore, desc: 'Distance from all-time high' },
                    { label: '24h Range Position', value: sentiment.rangePosition, desc: 'Where price sits in daily range' },
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">{metric.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{metric.desc}</span>
                        </div>
                        <span className={cn("text-sm font-bold", getSentimentColor(metric.value))}>
                          {metric.value}
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-4">
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  REAL-TIME METRICS
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Market Cap', value: formatNumber(selectedCoin.marketCap) },
                    { label: '24h Volume', value: formatNumber(selectedCoin.volume) },
                    { label: '24h High', value: formatNumber(selectedCoin.high24h) },
                    { label: '24h Low', value: formatNumber(selectedCoin.low24h) },
                    { label: 'ATH', value: formatNumber(selectedCoin.ath) },
                    { label: 'Circulating Supply', value: selectedCoin.circulatingSupply > 1e9 ? `${(selectedCoin.circulatingSupply / 1e9).toFixed(2)}B` : `${(selectedCoin.circulatingSupply / 1e6).toFixed(2)}M` },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="font-bold text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4 mt-4">
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  TOP 10 SENTIMENT COMPARISON
                </h4>
                <div className="space-y-3">
                  {coins.map((coin) => {
                    const s = deriveSentiment(coin, globalData);
                    return (
                      <button
                        key={coin.symbol}
                        onClick={() => setSelectedToken(coin.symbol)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <span className="font-bold text-sm w-12">{coin.symbol}</span>
                        <Progress value={s.overall} className="flex-1 h-2" />
                        <span className={cn("font-bold text-sm w-8 text-right", getSentimentColor(s.overall))}>
                          {s.overall}
                        </span>
                        <span className={cn(
                          "text-xs w-16 text-right",
                          coin.change24h >= 0 ? "text-success" : "text-danger"
                        )}>
                          {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
