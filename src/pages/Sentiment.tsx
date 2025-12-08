import { Layout } from "@/components/layout/Layout";
import { Brain, TrendingUp, TrendingDown, Activity, Users, Newspaper, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const SentimentPage = () => {
  const fearGreedIndex = 68;
  const socialSentiment = 72;
  const newsImpact = 45;
  const whaleActivity = 85;

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">COSMIC</span> SENTIMENT SCANNER
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time analysis of market emotions and whale movements
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
              {socialSentiment}
            </div>
            <div className="text-foreground font-display">Positive</div>
            <div className="mt-4 flex justify-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-8 rounded-full transition-all",
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
            <h3 className="font-display text-sm text-muted-foreground mb-2">NEWS IMPACT</h3>
            <div className={cn("text-5xl font-display font-bold mb-2", getSentimentColor(newsImpact))}>
              {newsImpact}
            </div>
            <div className="text-warning font-display">Neutral</div>
            <div className="mt-4 relative h-4 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 flex justify-end pr-1">
                  <div className="h-full w-12 bg-danger/60 rounded-l-full" />
                </div>
                <div className="w-1/2 flex pl-1">
                  <div className="h-full w-8 bg-success/60 rounded-r-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Whale Activity */}
          <div className="holo-card p-6 text-center">
            <Waves className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-display text-sm text-muted-foreground mb-2">WHALE ACTIVITY</h3>
            <div className={cn("text-5xl font-display font-bold mb-2", getSentimentColor(whaleActivity))}>
              {whaleActivity}
            </div>
            <div className="text-success font-display">High</div>
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

        {/* Recent Signals */}
        <div className="holo-card p-6 mb-12">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            RECENT SIGNALS
          </h2>
          <div className="space-y-4">
            {[
              { time: "2 min ago", type: "bullish", message: "Large BTC accumulation detected - 500+ BTC moved to cold storage" },
              { time: "15 min ago", type: "neutral", message: "ETH gas fees normalizing after morning spike" },
              { time: "32 min ago", type: "bullish", message: "SOL showing strong momentum with increasing volume" },
              { time: "1 hour ago", type: "bearish", message: "Minor whale sell-off detected in XRP markets" },
              { time: "2 hours ago", type: "bullish", message: "Positive regulatory news impacting overall market sentiment" },
            ].map((signal, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-all hover:bg-muted/30",
                  signal.type === "bullish" ? "border-success/30" : signal.type === "bearish" ? "border-danger/30" : "border-border"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  signal.type === "bullish" ? "bg-success/20" : signal.type === "bearish" ? "bg-danger/20" : "bg-warning/20"
                )}>
                  {signal.type === "bullish" ? (
                    <TrendingUp className={cn("w-5 h-5", "text-success")} />
                  ) : signal.type === "bearish" ? (
                    <TrendingDown className={cn("w-5 h-5", "text-danger")} />
                  ) : (
                    <Activity className={cn("w-5 h-5", "text-warning")} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{signal.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">{signal.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SentimentPage;
