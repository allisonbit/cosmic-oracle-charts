import { 
  Brain, TrendingUp, TrendingDown, Clock, Sparkles, ArrowRight, 
  Eye, ExternalLink, Activity, Zap, Target, AlertTriangle, 
  Info, Globe, RefreshCw, Lightbulb, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Insight {
  type: "bullish" | "bearish" | "warning" | "opportunity" | "info" | "activity";
  title: string;
  description: string;
  action: string;
  importance: "high" | "medium" | "low";
  category: string;
  details?: string[];
  links?: { label: string; url: string }[];
}

export function EnhancedMarketInsightsPanel() {
  const { data, refetch, isLoading } = useMarketData();
  const [expanded, setExpanded] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const insights = useMemo(() => {
    const global = data?.global;
    const fearGreed = data?.fearGreedIndex || 50;
    const topCoins = data?.topCoins || [];
    
    const bullishCount = topCoins.filter(c => c.change24h > 0).length;
    const bearishCount = topCoins.filter(c => c.change24h < 0).length;
    const avgChange = topCoins.reduce((acc, c) => acc + c.change24h, 0) / Math.max(topCoins.length, 1);
    const strongGainers = topCoins.filter(c => c.change24h > 5).length;
    const strongLosers = topCoins.filter(c => c.change24h < -5).length;
    
    const items: Insight[] = [];

    // Market direction insight
    if (avgChange > 3) {
      items.push({
        type: "bullish",
        title: "Strong Uptrend Active",
        description: `Market is showing ${bullishCount} of ${topCoins.length} coins in green. Average gain: +${avgChange.toFixed(1)}%. ${strongGainers} coins up more than 5%.`,
        action: "Consider taking partial profits on winners",
        importance: "high",
        category: "Market Direction",
        details: [
          "Momentum indicators suggest continuation",
          "Volume supporting the upward move",
          "Watch for resistance levels on major coins",
          "Set trailing stop losses to protect gains"
        ],
        links: [
          { label: "TradingView", url: "https://www.tradingview.com/chart/?symbol=CRYPTOCAP:TOTAL" },
          { label: "Market Overview", url: "https://www.coingecko.com/en/global-charts" }
        ]
      });
    } else if (avgChange < -3) {
      items.push({
        type: "bearish",
        title: "Market Correction",
        description: `${bearishCount} of ${topCoins.length} coins are in red. Average loss: ${avgChange.toFixed(1)}%. ${strongLosers} coins down more than 5%.`,
        action: "Look for oversold opportunities",
        importance: "high",
        category: "Market Direction",
        details: [
          "Check if this is a healthy correction or trend reversal",
          "Monitor key support levels",
          "Wait for volume confirmation before buying dips",
          "Consider dollar-cost averaging into strong projects"
        ],
        links: [
          { label: "Fear & Greed", url: "https://alternative.me/crypto/fear-and-greed-index/" },
          { label: "Liquidation Data", url: "https://www.coinglass.com/LiquidationData" }
        ]
      });
    } else {
      items.push({
        type: "info",
        title: "Consolidation Phase",
        description: "Market is moving sideways with mixed signals across assets. This often precedes a major move.",
        action: "Wait for clearer direction before major moves",
        importance: "medium",
        category: "Market Direction",
        details: [
          "Accumulation or distribution phase possible",
          "Watch for breakout above or below range",
          "Reduce position sizes in uncertain conditions",
          "Focus on relative strength leaders"
        ]
      });
    }

    // Fear & Greed insight
    if (fearGreed > 80) {
      items.push({
        type: "warning",
        title: "Extreme Greed Detected",
        description: `Fear & Greed Index at ${fearGreed}/100 - Historically a time when corrections occur. Market euphoria often precedes pullbacks.`,
        action: "Be cautious with new positions",
        importance: "high",
        category: "Sentiment",
        details: [
          "Extreme greed historically leads to corrections",
          "Consider reducing exposure to high-risk assets",
          "Move stop losses closer to protect profits",
          "Avoid FOMO buying at these levels"
        ],
        links: [
          { label: "Fear & Greed Index", url: "https://alternative.me/crypto/fear-and-greed-index/" }
        ]
      });
    } else if (fearGreed > 60) {
      items.push({
        type: "info",
        title: "Greed Territory",
        description: `Fear & Greed at ${fearGreed}/100 - Market sentiment is optimistic but not extreme.`,
        action: "Normal trading conditions, watch for euphoria",
        importance: "medium",
        category: "Sentiment"
      });
    } else if (fearGreed < 20) {
      items.push({
        type: "opportunity",
        title: "Extreme Fear = Opportunity?",
        description: `Fear & Greed at ${fearGreed}/100 - Historically a good accumulation zone. "Be greedy when others are fearful."`,
        action: "Consider gradual DCA into strong projects",
        importance: "high",
        category: "Sentiment",
        details: [
          "Extreme fear often marks market bottoms",
          "Focus on fundamentally strong projects",
          "Use dollar-cost averaging strategy",
          "Don't try to time the exact bottom"
        ],
        links: [
          { label: "DCA Calculator", url: "https://dcabtc.com/" }
        ]
      });
    } else if (fearGreed < 40) {
      items.push({
        type: "opportunity",
        title: "Fear in the Market",
        description: `Fear & Greed at ${fearGreed}/100 - Market showing fear, potential buying opportunity.`,
        action: "Start building positions carefully",
        importance: "medium",
        category: "Sentiment"
      });
    }

    // Volume insight
    if (global?.totalVolume24h && global?.totalMarketCap) {
      const volToMcap = (global.totalVolume24h / global.totalMarketCap) * 100;
      if (volToMcap > 6) {
        items.push({
          type: "activity",
          title: "Unusually High Trading Activity",
          description: `24h volume is ${volToMcap.toFixed(1)}% of market cap - significantly above average. Major moves may be occurring.`,
          action: "Increased volatility expected",
          importance: "high",
          category: "Volume",
          details: [
            "High volume often confirms trend direction",
            "Watch for breakouts or breakdowns",
            "Widen stop losses to account for volatility",
            "Consider reducing position sizes"
          ],
          links: [
            { label: "Volume Analysis", url: "https://www.coingecko.com/en/global-charts" }
          ]
        });
      } else if (volToMcap > 4) {
        items.push({
          type: "activity",
          title: "Above Average Volume",
          description: `24h volume is ${volToMcap.toFixed(1)}% of market cap - active market conditions.`,
          action: "Good liquidity for trading",
          importance: "medium",
          category: "Volume"
        });
      }
    }

    // BTC dominance insight
    if (global?.btcDominance) {
      if (global.btcDominance > 58) {
        items.push({
          type: "warning",
          title: "BTC Dominance Rising",
          description: `At ${global.btcDominance.toFixed(1)}% - Capital flowing to Bitcoin as a safe haven.`,
          action: "Altcoins may underperform short-term",
          importance: "medium",
          category: "Dominance",
          details: [
            "High BTC dominance often precedes alt weakness",
            "Consider reducing altcoin exposure",
            "BTC typically leads in risk-off environments",
            "Watch for dominance to peak before alt rotation"
          ]
        });
      } else if (global.btcDominance < 45) {
        items.push({
          type: "opportunity",
          title: "Alt Season Signals",
          description: `BTC dominance at ${global.btcDominance.toFixed(1)}% - Altcoins gaining market share.`,
          action: "Look for quality altcoin opportunities",
          importance: "high",
          category: "Dominance",
          details: [
            "Altcoins historically outperform when dominance drops",
            "Focus on large-cap alts first",
            "Small caps are highest risk/reward",
            "Take profits as euphoria increases"
          ]
        });
      }
    }

    // Add momentum insight
    if (strongGainers > 5) {
      items.push({
        type: "bullish",
        title: "Strong Momentum",
        description: `${strongGainers} coins showing gains over 5% - Broad-based strength in the market.`,
        action: "Momentum favors continuation",
        importance: "medium",
        category: "Momentum"
      });
    } else if (strongLosers > 5) {
      items.push({
        type: "bearish",
        title: "Widespread Selling",
        description: `${strongLosers} coins down more than 5% - Broad-based weakness.`,
        action: "Caution advised until selling exhausts",
        importance: "medium",
        category: "Momentum"
      });
    }

    return items;
  }, [data]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "bullish": return { color: "text-success", bg: "bg-success/10", border: "border-success/30", icon: TrendingUp };
      case "bearish": return { color: "text-danger", bg: "bg-danger/10", border: "border-danger/30", icon: TrendingDown };
      case "warning": return { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", icon: AlertTriangle };
      case "opportunity": return { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: Lightbulb };
      case "activity": return { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", icon: Activity };
      default: return { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border", icon: Info };
    }
  };

  const displayedInsights = expanded ? insights : insights.slice(0, 3);

  return (
    <>
      <div className="holo-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI MARKET INSIGHTS
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
            </button>
            <Sparkles className="w-4 h-4 text-warning" />
          </div>
        </div>

        <div className="space-y-3">
          {displayedInsights.map((insight, i) => {
            const style = getTypeStyle(insight.type);
            const TypeIcon = style.icon;
            return (
              <button 
                key={i}
                onClick={() => setSelectedInsight(insight)}
                className={cn(
                  "w-full p-4 rounded-lg border transition-all hover:scale-[1.01] text-left group",
                  style.bg,
                  style.border,
                  insight.importance === "high" && "ring-1 ring-offset-1 ring-offset-background"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon className={cn("w-4 h-4", style.color)} />
                    <h4 className={cn("font-display font-bold text-sm", style.color)}>
                      {insight.title}
                    </h4>
                    {insight.importance === "high" && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-display">
                        IMPORTANT
                      </span>
                    )}
                  </div>
                  <Eye className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Target className="w-3 h-3" />
                    {insight.action}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{insight.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {insights.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1"
          >
            {expanded ? "Show Less" : `Show ${insights.length - 3} More Insights`}
            <ArrowRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
          </button>
        )}

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated just now
          </span>
          <Link to="/sentiment" className="text-xs text-primary hover:underline flex items-center gap-1">
            Deep Analysis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Insight Detail Modal */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedInsight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {(() => {
                    const style = getTypeStyle(selectedInsight.type);
                    const TypeIcon = style.icon;
                    return (
                      <>
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", style.bg)}>
                          <TypeIcon className={cn("w-5 h-5", style.color)} />
                        </div>
                        <div>
                          <span className={cn("font-display text-lg", style.color)}>{selectedInsight.title}</span>
                          <div className="text-sm text-muted-foreground">{selectedInsight.category}</div>
                        </div>
                      </>
                    );
                  })()}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Description */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    ANALYSIS
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedInsight.description}</p>
                </div>

                {/* Recommended Action */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-sm text-primary">RECOMMENDED ACTION</span>
                  </div>
                  <p className="text-sm">{selectedInsight.action}</p>
                </div>

                {/* Details */}
                {selectedInsight.details && (
                  <div className="holo-card p-4">
                    <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-warning" />
                      KEY POINTS
                    </h4>
                    <ul className="space-y-2">
                      {selectedInsight.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Sparkles className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* External Links */}
                {selectedInsight.links && selectedInsight.links.length > 0 && (
                  <div className="holo-card p-4">
                    <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      RESEARCH LINKS
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedInsight.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3 ml-auto text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center bg-muted/20 p-2 rounded">
                  This is AI-generated analysis for educational purposes. Not financial advice.
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
