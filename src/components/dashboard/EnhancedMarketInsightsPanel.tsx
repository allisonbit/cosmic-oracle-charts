import { 
  Brain, TrendingUp, TrendingDown, Clock, Sparkles, ArrowRight, 
  Activity, Zap, Target, AlertTriangle, 
  Info, Lightbulb, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  const { data, isLoading } = useMarketData();
  const [expanded, setExpanded] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

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

    if (avgChange > 3) {
      items.push({ type: "bullish", title: "Strong Uptrend Active", description: `Market is showing ${bullishCount} of ${topCoins.length} coins in green. Average gain: +${avgChange.toFixed(1)}%.`, action: "Consider taking partial profits on winners", importance: "high", category: "Market Direction", details: ["Momentum indicators suggest continuation", "Volume supporting the upward move", "Watch for resistance levels on major coins"], links: [{ label: "TradingView", url: "https://www.tradingview.com/chart/?symbol=CRYPTOCAP:TOTAL" }] });
    } else if (avgChange < -3) {
      items.push({ type: "bearish", title: "Market Correction", description: `${bearishCount} of ${topCoins.length} coins are in red. Average loss: ${avgChange.toFixed(1)}%.`, action: "Look for oversold opportunities", importance: "high", category: "Market Direction", details: ["Check if this is a healthy correction or trend reversal", "Monitor key support levels", "Wait for volume confirmation before buying dips"], links: [{ label: "Fear & Greed", url: "https://alternative.me/crypto/fear-and-greed-index/" }] });
    } else {
      items.push({ type: "info", title: "Consolidation Phase", description: "Market is moving sideways with mixed signals across assets.", action: "Wait for clearer direction", importance: "medium", category: "Market Direction", details: ["Accumulation or distribution phase possible", "Watch for breakout above or below range"] });
    }

    if (fearGreed > 80) {
      items.push({ type: "warning", title: "Extreme Greed Detected", description: `Fear & Greed Index at ${fearGreed}/100 - Historically a time when corrections occur.`, action: "Be cautious with new positions", importance: "high", category: "Sentiment", details: ["Extreme greed historically leads to corrections", "Consider reducing exposure to high-risk assets"] });
    } else if (fearGreed < 20) {
      items.push({ type: "opportunity", title: "Extreme Fear = Opportunity?", description: `Fear & Greed at ${fearGreed}/100 - Historically a good accumulation zone.`, action: "Consider gradual DCA into strong projects", importance: "high", category: "Sentiment", details: ["Extreme fear often marks market bottoms", "Focus on fundamentally strong projects"] });
    }

    if (global?.totalVolume24h && global?.totalMarketCap) {
      const volToMcap = (global.totalVolume24h / global.totalMarketCap) * 100;
      if (volToMcap > 6) {
        items.push({ type: "activity", title: "Unusually High Trading Activity", description: `24h volume is ${volToMcap.toFixed(1)}% of market cap - significantly above average.`, action: "Increased volatility expected", importance: "high", category: "Volume" });
      }
    }

    if (global?.btcDominance && global.btcDominance > 58) {
      items.push({ type: "warning", title: "BTC Dominance Rising", description: `At ${global.btcDominance.toFixed(1)}% - Capital flowing to Bitcoin.`, action: "Altcoins may underperform short-term", importance: "medium", category: "Dominance" });
    }

    if (strongGainers > 5) items.push({ type: "bullish", title: "Strong Momentum", description: `${strongGainers} coins showing gains over 5%.`, action: "Momentum favors continuation", importance: "medium", category: "Momentum" });
    if (strongLosers > 5) items.push({ type: "bearish", title: "Widespread Selling", description: `${strongLosers} coins down more than 5%.`, action: "Caution advised", importance: "medium", category: "Momentum" });

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
    <div className="holo-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI MARKET INSIGHTS
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
            Live
          </div>
          <Sparkles className="w-4 h-4 text-warning" />
        </div>
      </div>

      <div className="space-y-3">
        {displayedInsights.map((insight, i) => {
          const style = getTypeStyle(insight.type);
          const TypeIcon = style.icon;
          const isExpanded = expandedInsight === i;
          return (
            <div key={i}>
              <button 
                onClick={() => setExpandedInsight(isExpanded ? null : i)}
                className={cn(
                  "w-full p-4 rounded-lg border transition-all hover:scale-[1.01] text-left",
                  style.bg, style.border,
                  insight.importance === "high" && "ring-1 ring-offset-1 ring-offset-background"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon className={cn("w-4 h-4", style.color)} />
                    <h4 className={cn("font-display font-bold text-sm", style.color)}>{insight.title}</h4>
                    {insight.importance === "high" && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-display">IMPORTANT</span>
                    )}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Target className="w-3 h-3" /> {insight.action}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{insight.category}</span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="ml-4 mt-2 mb-1 p-3 rounded-lg bg-muted/20 border border-border/30 animate-in fade-in slide-in-from-top-1 duration-200">
                  {insight.details && (
                    <ul className="space-y-1.5 mb-3">
                      {insight.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                  {insight.links && insight.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {insight.links.map(link => (
                        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1">
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {insights.length > 3 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1">
          {expanded ? "Show Less" : `Show ${insights.length - 3} More Insights`}
          <ArrowRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> Updated just now
        </span>
        <Link to="/sentiment" className="text-xs text-primary hover:underline flex items-center gap-1">
          Deep Analysis <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
