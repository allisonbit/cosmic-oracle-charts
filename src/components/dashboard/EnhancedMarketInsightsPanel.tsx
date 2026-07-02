import {
  Brain, TrendingUp, TrendingDown, Clock, Sparkles, ArrowRight,
  Activity, Target, AlertTriangle,
  Info, Lightbulb, ChevronRight
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
      items.push({ type: "bullish", title: "Strong Uptrend Active", description: `Market is showing ${bullishCount} of ${topCoins.length} coins in green. Average gain: +${(avgChange ?? 0).toFixed(1)}%.`, action: "Consider taking partial profits on winners", importance: "high", category: "Market Direction", details: ["Momentum indicators suggest continuation", "Volume supporting the upward move", "Watch for resistance levels on major coins"], links: [{ label: "TradingView", url: "https://www.tradingview.com/chart/?symbol=CRYPTOCAP:TOTAL" }] });
    } else if (avgChange < -3) {
      items.push({ type: "bearish", title: "Market Correction", description: `${bearishCount} of ${topCoins.length} coins are in red. Average loss: ${(avgChange ?? 0).toFixed(1)}%.`, action: "Look for oversold opportunities", importance: "high", category: "Market Direction", details: ["Check if this is a healthy correction or trend reversal", "Monitor key support levels", "Wait for volume confirmation before buying dips"], links: [{ label: "Fear & Greed", url: "https://alternative.me/crypto/fear-and-greed-index/" }] });
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
        items.push({ type: "activity", title: "Unusually High Trading Activity", description: `24h volume is ${(volToMcap ?? 0).toFixed(1)}% of market cap - significantly above average.`, action: "Increased volatility expected", importance: "high", category: "Volume" });
      }
    }

    if (global?.btcDominance && global.btcDominance > 58) {
      items.push({ type: "warning", title: "BTC Dominance Rising", description: `At ${(global.btcDominance ?? 0).toFixed(1)}% - Capital flowing to Bitcoin.`, action: "Altcoins may underperform short-term", importance: "medium", category: "Dominance" });
    }

    if (strongGainers > 5) items.push({ type: "bullish", title: "Strong Momentum", description: `${strongGainers} coins showing gains over 5%.`, action: "Momentum favors continuation", importance: "medium", category: "Momentum" });
    if (strongLosers > 5) items.push({ type: "bearish", title: "Widespread Selling", description: `${strongLosers} coins down more than 5%.`, action: "Caution advised", importance: "medium", category: "Momentum" });

    return items;
  }, [data]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "bullish":    return { color: "text-success",           dot: "bg-success",          icon: TrendingUp };
      case "bearish":    return { color: "text-danger",            dot: "bg-danger",           icon: TrendingDown };
      case "warning":    return { color: "text-warning",           dot: "bg-warning",          icon: AlertTriangle };
      case "opportunity":return { color: "text-primary",           dot: "bg-primary",          icon: Lightbulb };
      case "activity":   return { color: "text-secondary",         dot: "bg-secondary",        icon: Activity };
      default:           return { color: "text-muted-foreground",  dot: "bg-muted-foreground", icon: Info };
    }
  };

  const displayedInsights = expanded ? insights : insights.slice(0, 3);

  return (
    <div className="border-t border-border/30 pt-5 pb-5">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          <Brain className="w-3 h-3 text-primary" />
          AI Market Insights
          <span className={cn("w-2 h-2 rounded-full animate-pulse ml-1", isLoading ? "bg-warning" : "bg-success")} />
        </span>
        <Sparkles className="w-3.5 h-3.5 text-warning" />
      </div>

      <h3 className="font-display font-bold text-base md:text-lg mb-4">
        Market <span className="text-gradient-cosmic">Intelligence</span>
      </h3>

      <div>
        {displayedInsights.map((insight, i) => {
          const style = getTypeStyle(insight.type);
          const TypeIcon = style.icon;
          const isExpanded = expandedInsight === i;

          return (
            <div key={i} className="border-b border-border/20 last:border-b-0">
              <button
                onClick={() => setExpandedInsight(isExpanded ? null : i)}
                className="w-full py-3.5 text-left group flex items-start gap-3 hover:opacity-80 transition-opacity"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", style.dot)} />
                <TypeIcon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", style.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("font-display font-bold text-sm", style.color)}>
                      {insight.title}
                    </span>
                    {insight.importance === "high" && (
                      <span className="text-[9px] font-bold uppercase text-primary">KEY</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{insight.description}</p>
                  <div className="flex items-center gap-1 text-xs text-primary mt-1">
                    <Target className="w-3 h-3" /> {insight.action}
                  </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform", isExpanded && "rotate-90")} />
              </button>

              {isExpanded && insight.details && (
                <div className="ml-8 pb-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  <ul className="space-y-1.5 mb-2">
                    {insight.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                  {insight.links && insight.links.length > 0 && (
                    <div className="flex flex-wrap gap-3">
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
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-3 border-t border-border/30 text-xs text-primary font-semibold flex items-center gap-1"
        >
          {expanded ? "Show Less" : `Show ${insights.length - 3} More Insights`}
          <ArrowRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
        </button>
      )}

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> Updated just now
        </span>
        <Link to="/sentiment" className="text-xs text-primary hover:underline flex items-center gap-1">
          Deep Analysis <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
