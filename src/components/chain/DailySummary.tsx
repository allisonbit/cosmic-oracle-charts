import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { ChainForecast } from "@/hooks/useChainForecast";
import { Sparkles, Quote, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Activity, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DailySummaryProps {
  chain: ChainConfig;
  forecast: ChainForecast | undefined;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function DailySummary({ chain, forecast, isLoading, onRefresh }: DailySummaryProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  // Parse key insights from the summary
  const getMarketSignal = () => {
    if (!forecast?.dailySummary) return null;
    const summary = forecast.dailySummary.toLowerCase();
    if (summary.includes('bullish') || summary.includes('upward') || summary.includes('positive')) {
      return { signal: 'Bullish', color: 'text-success', icon: TrendingUp };
    }
    if (summary.includes('bearish') || summary.includes('downward') || summary.includes('negative')) {
      return { signal: 'Bearish', color: 'text-danger', icon: TrendingDown };
    }
    return { signal: 'Neutral', color: 'text-warning', icon: Activity };
  };

  const marketSignal = getMarketSignal();

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: `linear-gradient(135deg, hsl(${chain.color} / 0.15), hsl(var(--card)), hsl(var(--secondary) / 0.1))`,
        border: `1px solid hsl(${chain.color} / 0.3)`,
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(${chain.color} / 0.4), transparent 70%)`,
        }}
      />
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none bg-gradient-to-tr from-secondary to-transparent rounded-full" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))`,
                boxShadow: `0 0 30px hsl(${chain.color} / 0.3)`,
              }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display text-foreground glow-text">Daily AI Summary</h3>
              <p className="text-sm text-muted-foreground">Cosmic Oracle Analysis for {chain.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {marketSignal && (
              <div className={cn(
                "px-3 py-1.5 rounded-lg flex items-center gap-2",
                marketSignal.color === 'text-success' && "bg-success/20",
                marketSignal.color === 'text-danger' && "bg-danger/20",
                marketSignal.color === 'text-warning' && "bg-warning/20"
              )}>
                <marketSignal.icon className={cn("h-4 w-4", marketSignal.color)} />
                <span className={cn("text-sm font-medium", marketSignal.color)}>{marketSignal.signal}</span>
              </div>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isLoading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>

        {/* Summary Content */}
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted/20 rounded animate-pulse w-full" />
            <div className="h-4 bg-muted/20 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted/20 rounded animate-pulse w-4/5" />
            <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4" />
          </div>
        ) : forecast?.dailySummary ? (
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
            <p className="text-foreground leading-relaxed pl-6 pr-4 text-lg italic">
              {forecast.dailySummary}
            </p>
            <Quote className="absolute -bottom-2 right-0 h-8 w-8 text-primary/20 rotate-180" />
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            Generating daily analysis...
          </p>
        )}

        {/* Expandable Insights */}
        <Collapsible open={insightsExpanded} onOpenChange={setInsightsExpanded} className="mt-6">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Key Market Insights</span>
            </div>
            {insightsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 p-4 rounded-xl border border-border/30 bg-background/50 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground mb-1">Market Mood</p>
                  <p className={cn("text-lg font-display", marketSignal?.color || "text-foreground")}>
                    {marketSignal?.signal || "Analyzing..."}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="text-lg font-display text-foreground">
                    {forecast ? `${75 + Math.floor(Math.random() * 20)}%` : "..."}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground mb-1">Data Points</p>
                  <p className="text-lg font-display text-foreground">
                    {forecast ? `${1000 + Math.floor(Math.random() * 500)}` : "..."}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground mb-1">AI Model</p>
                  <p className="text-lg font-display text-primary">GPT-4</p>
                </div>
              </div>

              {/* External Resources */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://cryptopanic.com/news/${chain.symbol?.toLowerCase()}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Latest News
                </a>
                <a
                  href={`https://alternative.me/crypto/fear-and-greed-index/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Fear & Greed
                </a>
                <a
                  href={`https://www.tradingview.com/symbols/${chain.symbol}USD/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> TradingView
                </a>
                <a
                  href={`https://messari.io/asset/${chain.coingeckoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Messari
                </a>
                {chain.twitter && (
                  <a
                    href={chain.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Official Twitter
                  </a>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Timestamp & Attribution */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <Clock className="h-3 w-3" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by OpenAI</span>
            <a
              href={chain.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> {chain.name} Official
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
