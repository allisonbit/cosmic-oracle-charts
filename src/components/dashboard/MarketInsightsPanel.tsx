import { Brain, TrendingUp, TrendingDown, Clock, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function MarketInsightsPanel() {
  const { data } = useMarketData();
  const [expanded, setExpanded] = useState(false);

  const insights = useMemo(() => {
    const global = data?.global;
    const fearGreed = data?.fearGreedIndex || 50;
    const topCoins = data?.topCoins || [];
    
    const bullishCount = topCoins.filter(c => c.change24h > 0).length;
    const bearishCount = topCoins.filter(c => c.change24h < 0).length;
    const avgChange = topCoins.reduce((acc, c) => acc + c.change24h, 0) / topCoins.length;
    
    const items = [];

    // Market direction insight
    if (avgChange > 2) {
      items.push({
        type: "bullish",
        title: "Strong Uptrend",
        description: `Market is showing ${bullishCount} of ${topCoins.length} coins in green. Average gain: +${avgChange.toFixed(1)}%`,
        action: "Consider taking partial profits on winners"
      });
    } else if (avgChange < -2) {
      items.push({
        type: "bearish",
        title: "Market Correction",
        description: `${bearishCount} of ${topCoins.length} coins are in red. Average loss: ${avgChange.toFixed(1)}%`,
        action: "Look for oversold opportunities"
      });
    } else {
      items.push({
        type: "neutral",
        title: "Consolidation Phase",
        description: "Market is moving sideways with mixed signals across assets",
        action: "Wait for clearer direction before major moves"
      });
    }

    // Fear & Greed insight
    if (fearGreed > 75) {
      items.push({
        type: "warning",
        title: "Extreme Greed Detected",
        description: `Fear & Greed at ${fearGreed} - historically a time when corrections occur`,
        action: "Be cautious with new positions"
      });
    } else if (fearGreed < 25) {
      items.push({
        type: "opportunity",
        title: "Extreme Fear = Opportunity?",
        description: `Fear & Greed at ${fearGreed} - historically a good accumulation zone`,
        action: "Consider gradual DCA into strong projects"
      });
    }

    // Volume insight
    if (global?.totalVolume24h && global?.totalMarketCap) {
      const volToMcap = (global.totalVolume24h / global.totalMarketCap) * 100;
      if (volToMcap > 5) {
        items.push({
          type: "activity",
          title: "High Trading Activity",
          description: `24h volume is ${volToMcap.toFixed(1)}% of market cap - above average`,
          action: "Increased volatility expected"
        });
      }
    }

    // BTC dominance insight
    if (global?.btcDominance) {
      if (global.btcDominance > 55) {
        items.push({
          type: "info",
          title: "BTC Dominance Rising",
          description: `At ${global.btcDominance.toFixed(1)}% - capital flowing to Bitcoin`,
          action: "Altcoins may underperform short-term"
        });
      } else if (global.btcDominance < 45) {
        items.push({
          type: "opportunity",
          title: "Alt Season Signals",
          description: `BTC dominance at ${global.btcDominance.toFixed(1)}% - altcoins gaining`,
          action: "Look for quality altcoin opportunities"
        });
      }
    }

    return items;
  }, [data]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "bullish": return { color: "text-success", bg: "bg-success/10", border: "border-success/30" };
      case "bearish": return { color: "text-danger", bg: "bg-danger/10", border: "border-danger/30" };
      case "warning": return { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" };
      case "opportunity": return { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" };
      default: return { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" };
    }
  };

  const displayedInsights = expanded ? insights : insights.slice(0, 2);

  return (
    <div className="holo-card p-4 md:p-6">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        AI MARKET INSIGHTS
        <Sparkles className="w-4 h-4 text-warning ml-auto" />
      </h3>

      <div className="space-y-3">
        {displayedInsights.map((insight, i) => {
          const style = getTypeStyle(insight.type);
          return (
            <div 
              key={i}
              className={cn(
                "p-4 rounded-lg border transition-all hover:scale-[1.01]",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={cn("font-display font-bold text-sm", style.color)}>
                  {insight.title}
                </h4>
                {insight.type === "bullish" && <TrendingUp className="w-4 h-4 text-success" />}
                {insight.type === "bearish" && <TrendingDown className="w-4 h-4 text-danger" />}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Sparkles className="w-3 h-3" />
                {insight.action}
              </div>
            </div>
          );
        })}
      </div>

      {insights.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1"
        >
          {expanded ? "Show Less" : `Show ${insights.length - 2} More Insights`}
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
  );
}
