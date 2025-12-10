import { Layout } from "@/components/layout/Layout";
import { Brain, TrendingUp, TrendingDown, Activity, Users, Newspaper, Waves, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";

const SentimentPage = () => {
  const { data: marketData, isLoading } = useMarketData();
  const topCoins = marketData?.topCoins?.slice(0, 10) || [];
  
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    topCoins.length > 0 ? topCoins : null,
    "market_sentiment",
    topCoins.length > 0
  );

  const fearGreedIndex = marketData?.fearGreedIndex || 50;
  
  // Calculate social sentiment from price changes
  const avgChange = topCoins.reduce((sum, c) => sum + c.change24h, 0) / (topCoins.length || 1);
  const socialSentiment = Math.min(100, Math.max(0, 50 + avgChange * 5));
  
  // News impact based on volatility
  const volatility = topCoins.reduce((sum, c) => sum + Math.abs(c.change24h), 0) / (topCoins.length || 1);
  const newsImpact = Math.min(100, Math.max(0, volatility * 10));
  
  // Whale activity based on volume
  const totalVolume = topCoins.reduce((sum, c) => sum + c.volume, 0);
  const whaleActivity = Math.min(100, Math.max(0, 50 + (totalVolume > 100e9 ? 30 : totalVolume > 50e9 ? 15 : 0)));

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
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[600px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-display">Scanning market sentiment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">SENTIMENT</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Real-time analysis of market emotions and whale movements • Live Data
          </p>
        </div>

        {/* Main Sentiment Gauges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Fear & Greed */}
          <div className="holo-card p-6 text-center">
            <Brain className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-display text-sm text-muted-foreground mb-2">FEAR & GREED INDEX</h3>
            <div className={cn("text-5xl font-display font-bold mb-2", getSentimentColor(fearGreedIndex))}>
              {fearGreedIndex}
            </div>
            <div className={cn("font-display", getSentimentColor(fearGreedIndex))}>
              {getSentimentLabel(fearGreedIndex)}
            </div>
            <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                style={{ width: `${fearGreedIndex}%` }}
              />
            </div>
          </div>

          {/* Social Sentiment */}
          <div className="holo-card p-6 text-center">
            <Users className="w-8 h-8 text-secondary mx-auto mb-4" />
            <h3 className="font-display text-sm text-muted-foreground mb-2">SOCIAL SENTIMENT</h3>
            <div className={cn("text-5xl font-display font-bold mb-2", getSentimentColor(socialSentiment))}>
              {Math.round(socialSentiment)}
            </div>
            <div className="text-foreground font-display">
              {socialSentiment >= 60 ? "Positive" : socialSentiment >= 40 ? "Neutral" : "Negative"}
            </div>
            <div className="mt-4 flex justify-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 rounded-full transition-all",
                    i < Math.floor(socialSentiment / 10) ? "bg-success" : "bg-muted"
                  )}
                  style={{ height: `${20 + Math.random() * 20}px` }}
                />
              ))}
            </div>
          </div>

          {/* News Impact */}
          <div className="holo-card p-6 text-center">
            <Newspaper className="w-8 h-8 text-warning mx-auto mb-4" />
            <h3 className="font-display text-sm text-muted-foreground mb-2">VOLATILITY INDEX</h3>
            <div className={cn("text-5xl font-display font-bold mb-2", getSentimentColor(newsImpact))}>
              {Math.round(newsImpact)}
            </div>
            <div className="text-warning font-display">
              {newsImpact >= 60 ? "High" : newsImpact >= 30 ? "Medium" : "Low"}
            </div>
            <div className="mt-4 relative h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-warning/60 transition-all duration-1000"
                style={{ width: `${newsImpact}%` }}
              />
            </div>
          </div>

          {/* Whale Activity */}
          <div className="holo-card p-6 text-center">
            <Waves className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-display text-sm text-muted-foreground mb-2">WHALE ACTIVITY</h3>
            <div className={cn("text-5xl font-display font-bold mb-2", getSentimentColor(whaleActivity))}>
              {Math.round(whaleActivity)}
            </div>
            <div className="text-success font-display">
              {whaleActivity >= 70 ? "High" : whaleActivity >= 40 ? "Medium" : "Low"}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="hsl(230, 20%, 15%)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="hsl(190, 100%, 50%)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${whaleActivity * 2.2} 220`}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {aiData?.forecast && (
          <div className="holo-card p-6 mb-12">
            <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI MARKET ANALYSIS
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-display text-sm text-muted-foreground mb-2">SHORT TERM OUTLOOK</h4>
                <p className="text-foreground">{aiData.forecast.shortTermOutlook || "Analyzing market conditions..."}</p>
              </div>
              {aiData.forecast.keyInsights && aiData.forecast.keyInsights.length > 0 && (
                <div>
                  <h4 className="font-display text-sm text-muted-foreground mb-2">KEY INSIGHTS</h4>
                  <ul className="space-y-1">
                    {aiData.forecast.keyInsights.slice(0, 3).map((insight: string, i: number) => (
                      <li key={i} className="text-foreground text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Signals */}
        <div className="holo-card p-6 mb-12">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            LIVE SIGNALS
          </h2>
          <div className="space-y-4">
            {topCoins.slice(0, 5).map((coin, index) => {
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
                    "flex items-start gap-4 p-4 rounded-lg border transition-all hover:bg-muted/30",
                    type === "bullish" ? "border-success/30" : type === "bearish" ? "border-danger/30" : "border-border"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    type === "bullish" ? "bg-success/20" : type === "bearish" ? "bg-danger/20" : "bg-warning/20"
                  )}>
                    {type === "bullish" ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : type === "bearish" ? (
                      <TrendingDown className="w-5 h-5 text-danger" />
                    ) : (
                      <Activity className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground mt-1">Volume: ${(coin.volume / 1e9).toFixed(2)}B</p>
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
