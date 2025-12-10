import { Layout } from "@/components/layout/Layout";
import { Brain, TrendingUp, TrendingDown, Activity, Users, Newspaper, Waves, Loader2, Flame, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useMemo } from "react";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

const SentimentPage = () => {
  const { data: marketData, isLoading } = useMarketData();
  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 16) || [], [marketData]);
  
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    topCoins.length > 0 ? topCoins : null,
    "market_sentiment",
    topCoins.length > 0
  );

  const fearGreedIndex = marketData?.fearGreedIndex || 50;
  
  // Calculate metrics
  const avgChange = useMemo(() => topCoins.reduce((sum, c) => sum + c.change24h, 0) / (topCoins.length || 1), [topCoins]);
  const socialSentiment = Math.min(100, Math.max(0, 50 + avgChange * 5));
  const volatility = useMemo(() => topCoins.reduce((sum, c) => sum + Math.abs(c.change24h), 0) / (topCoins.length || 1), [topCoins]);
  const volatilityIndex = Math.min(100, Math.max(0, volatility * 10));
  const totalVolume = useMemo(() => topCoins.reduce((sum, c) => sum + c.volume, 0), [topCoins]);
  const whaleActivity = Math.min(100, Math.max(0, 50 + (totalVolume > 100e9 ? 30 : totalVolume > 50e9 ? 15 : 0)));

  // Top gainers and losers
  const topGainers = useMemo(() => [...topCoins].sort((a, b) => b.change24h - a.change24h).slice(0, 5), [topCoins]);
  const topLosers = useMemo(() => [...topCoins].sort((a, b) => a.change24h - b.change24h).slice(0, 5), [topCoins]);

  const getSentimentColor = (value: number) => {
    if (value >= 70) return "text-success";
    if (value >= 40) return "text-warning";
    return "text-danger";
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 80) return "Extreme Greed";
    if (value >= 60) return "Greed";
    if (value >= 40) return "Neutral";
    if (value >= 20) return "Fear";
    return "Extreme Fear";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-display text-sm md:text-base">Scanning market sentiment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-10 space-y-2 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">SENTIMENT</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-lg max-w-2xl mx-auto">
            Real-time analysis of market emotions and whale movements • Live Data
          </p>
        </div>

        {/* Main Sentiment Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
          {/* Fear & Greed */}
          <div className="holo-card p-4 md:p-6 text-center">
            <Brain className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-4" />
            <h3 className="font-display text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-2">FEAR & GREED</h3>
            <div className={cn("text-3xl md:text-5xl font-display font-bold mb-1 md:mb-2", getSentimentColor(fearGreedIndex))}>
              {fearGreedIndex}
            </div>
            <div className={cn("font-display text-xs md:text-sm", getSentimentColor(fearGreedIndex))}>
              {getSentimentLabel(fearGreedIndex)}
            </div>
            <div className="mt-3 md:mt-4 h-2 md:h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                style={{ width: `${fearGreedIndex}%` }}
              />
            </div>
          </div>

          {/* Social Sentiment */}
          <div className="holo-card p-4 md:p-6 text-center">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2 md:mb-4" />
            <h3 className="font-display text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-2">SOCIAL</h3>
            <div className={cn("text-3xl md:text-5xl font-display font-bold mb-1 md:mb-2", getSentimentColor(socialSentiment))}>
              {Math.round(socialSentiment)}
            </div>
            <div className="text-foreground font-display text-xs md:text-sm">
              {socialSentiment >= 60 ? "Positive" : socialSentiment >= 40 ? "Neutral" : "Negative"}
            </div>
            <div className="mt-3 md:mt-4 flex justify-center gap-0.5 md:gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 md:w-2 rounded-full transition-all",
                    i < Math.floor(socialSentiment / 10) ? "bg-success" : "bg-muted"
                  )}
                  style={{ height: `${12 + Math.random() * 12}px` }}
                />
              ))}
            </div>
          </div>

          {/* Volatility */}
          <div className="holo-card p-4 md:p-6 text-center">
            <Newspaper className="w-6 h-6 md:w-8 md:h-8 text-warning mx-auto mb-2 md:mb-4" />
            <h3 className="font-display text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-2">VOLATILITY</h3>
            <div className={cn("text-3xl md:text-5xl font-display font-bold mb-1 md:mb-2", getSentimentColor(volatilityIndex))}>
              {Math.round(volatilityIndex)}
            </div>
            <div className="text-warning font-display text-xs md:text-sm">
              {volatilityIndex >= 60 ? "High" : volatilityIndex >= 30 ? "Medium" : "Low"}
            </div>
            <div className="mt-3 md:mt-4 relative h-2 md:h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-warning/60 transition-all duration-1000"
                style={{ width: `${volatilityIndex}%` }}
              />
            </div>
          </div>

          {/* Whale Activity */}
          <div className="holo-card p-4 md:p-6 text-center">
            <Waves className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-4" />
            <h3 className="font-display text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-2">WHALE ACTIVITY</h3>
            <div className={cn("text-3xl md:text-5xl font-display font-bold mb-1 md:mb-2", getSentimentColor(whaleActivity))}>
              {Math.round(whaleActivity)}
            </div>
            <div className="text-success font-display text-xs md:text-sm">
              {whaleActivity >= 70 ? "High" : whaleActivity >= 40 ? "Medium" : "Low"}
            </div>
            <div className="mt-3 md:mt-4 flex justify-center">
              <div className="relative w-14 h-14 md:w-20 md:h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" stroke="hsl(230, 20%, 15%)" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="32" stroke="hsl(190, 100%, 50%)" strokeWidth="6" fill="none" strokeDasharray={`${whaleActivity * 2} 200`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">
          {/* Top Gainers */}
          <div className="holo-card p-4 md:p-6">
            <h3 className="font-display text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-success" />
              TOP GAINERS
            </h3>
            <div className="space-y-2 md:space-y-3">
              {topGainers.map((coin, index) => (
                <div key={coin.symbol} className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-muted-foreground text-xs md:text-sm w-4 md:w-6">{index + 1}</span>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <span className="font-display font-bold text-success text-xs">{coin.symbol[0]}</span>
                    </div>
                    <div>
                      <span className="font-display font-bold text-xs md:text-sm">{coin.symbol}</span>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-xs md:text-sm">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="text-success font-bold text-xs md:text-sm">+{coin.change24h.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="holo-card p-4 md:p-6">
            <h3 className="font-display text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-danger" />
              TOP LOSERS
            </h3>
            <div className="space-y-2 md:space-y-3">
              {topLosers.map((coin, index) => (
                <div key={coin.symbol} className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-muted-foreground text-xs md:text-sm w-4 md:w-6">{index + 1}</span>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-danger/20 flex items-center justify-center">
                      <span className="font-display font-bold text-danger text-xs">{coin.symbol[0]}</span>
                    </div>
                    <div>
                      <span className="font-display font-bold text-xs md:text-sm">{coin.symbol}</span>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-xs md:text-sm">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="text-danger font-bold text-xs md:text-sm">{coin.change24h.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="holo-card p-4 md:p-6 mb-6 md:mb-10">
          <h2 className="font-display text-sm md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
            <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            AI MARKET ANALYSIS
            {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </h2>
          {aiData?.forecast ? (
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <h4 className="font-display text-xs md:text-sm text-muted-foreground mb-2">OVERALL SENTIMENT</h4>
                <div className={cn(
                  "text-xl md:text-3xl font-display font-bold",
                  aiData.forecast.overallSentiment === "bullish" ? "text-success" : aiData.forecast.overallSentiment === "bearish" ? "text-danger" : "text-warning"
                )}>
                  {aiData.forecast.overallSentiment?.toUpperCase() || "ANALYZING..."}
                </div>
              </div>
              <div>
                <h4 className="font-display text-xs md:text-sm text-muted-foreground mb-2">SHORT TERM OUTLOOK</h4>
                <p className="text-foreground text-xs md:text-sm">{aiData.forecast.shortTermOutlook || "Analyzing market conditions..."}</p>
              </div>
              {aiData.forecast.keyInsights && aiData.forecast.keyInsights.length > 0 && (
                <div>
                  <h4 className="font-display text-xs md:text-sm text-muted-foreground mb-2">KEY INSIGHTS</h4>
                  <ul className="space-y-1">
                    {aiData.forecast.keyInsights.slice(0, 3).map((insight: string, i: number) => (
                      <li key={i} className="text-foreground text-xs md:text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Live Signals */}
        <div className="holo-card p-4 md:p-6">
          <h2 className="font-display text-sm md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            LIVE MARKET SIGNALS
          </h2>
          <div className="space-y-3 md:space-y-4">
            {topCoins.slice(0, 8).map((coin) => {
              const type = coin.change24h >= 3 ? "bullish" : coin.change24h <= -3 ? "bearish" : "neutral";
              const message = type === "bullish" 
                ? `${coin.name} showing strong momentum with +${coin.change24h.toFixed(2)}% gain`
                : type === "bearish"
                ? `${coin.name} under pressure with ${coin.change24h.toFixed(2)}% decline`
                : `${coin.name} trading sideways at $${coin.price.toLocaleString()}`;
              
              return (
                <div
                  key={coin.symbol}
                  className={cn(
                    "flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border transition-all hover:bg-muted/30",
                    type === "bullish" ? "border-success/30" : type === "bearish" ? "border-danger/30" : "border-border"
                  )}
                >
                  <div className={cn(
                    "p-1.5 md:p-2 rounded-lg flex-shrink-0",
                    type === "bullish" ? "bg-success/20" : type === "bearish" ? "bg-danger/20" : "bg-warning/20"
                  )}>
                    {type === "bullish" ? (
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-success" />
                    ) : type === "bearish" ? (
                      <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-danger" />
                    ) : (
                      <Activity className="w-4 h-4 md:w-5 md:h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-primary text-xs md:text-sm">{coin.symbol}</span>
                      {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 text-warning" />}
                    </div>
                    <p className="text-foreground text-xs md:text-sm">{message}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Vol: {formatNumber(coin.volume)} • MCap: {formatNumber(coin.marketCap)}</p>
                  </div>
                  <div className={cn(
                    "text-right flex-shrink-0",
                    coin.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    <div className="font-bold text-xs md:text-sm">{coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SentimentPage;
