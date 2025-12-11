import { ChainForecast } from "@/hooks/useChainForecast";
import { ChainConfig } from "@/lib/chainConfig";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Clock, Zap, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PredictionDeepDiveProps {
  chain: ChainConfig;
  forecast: ChainForecast | undefined;
  isLoading: boolean;
}

export function PredictionDeepDive({ chain, forecast, isLoading }: PredictionDeepDiveProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (forecast) {
      setAnimateIn(true);
    }
  }, [forecast]);

  const getTrendIcon = (prediction: string) => {
    switch (prediction) {
      case "bullish": return <TrendingUp className="h-5 w-5 text-success" />;
      case "bearish": return <TrendingDown className="h-5 w-5 text-danger" />;
      default: return <Minus className="h-5 w-5 text-warning" />;
    }
  };

  const getTrendColor = (prediction: string) => {
    switch (prediction) {
      case "bullish": return "success";
      case "bearish": return "danger";
      default: return "warning";
    }
  };

  const getGradientStyle = (prediction: string) => {
    switch (prediction) {
      case "bullish": return "linear-gradient(135deg, hsl(160 84% 39% / 0.15), transparent)";
      case "bearish": return "linear-gradient(135deg, hsl(0 84% 60% / 0.15), transparent)";
      default: return "linear-gradient(135deg, hsl(38 92% 50% / 0.15), transparent)";
    }
  };

  const timeframes = [
    { key: "shortTerm", label: "Short-Term", timeframe: "1-4 hours", icon: Zap },
    { key: "midTerm", label: "Mid-Term", timeframe: "24-48 hours", icon: Clock },
    { key: "longTerm", label: "Long-Term", timeframe: "3-7 days", icon: Target },
  ] as const;

  // Loading skeleton
  if (isLoading && !forecast) {
    return (
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-display text-foreground">AI Prediction Deep Dive</h3>
            <p className="text-sm text-muted-foreground">Analyzing {chain.name}...</p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading predictions</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-3 bg-muted rounded w-16 mb-4" />
              <div className="h-8 bg-muted rounded w-20 mb-3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4 mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-display text-foreground">AI Prediction Deep Dive</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Multi-timeframe analysis for {chain.name}</p>
        </div>

        {forecast && (
          <div className="flex items-center gap-2 justify-end sm:justify-start">
            <span className="text-xs text-muted-foreground hidden sm:block">Confidence</span>
            <div className="relative">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-muted sm:hidden"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${(forecast.overallConfidence / 100) * 100.5} 100.5`}
                  className="text-primary transition-all duration-1000 sm:hidden"
                  style={{
                    filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))",
                  }}
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-muted hidden sm:block"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${(forecast.overallConfidence / 100) * 125.6} 125.6`}
                  className="text-primary transition-all duration-1000 hidden sm:block"
                  style={{
                    filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-display text-primary">{forecast.overallConfidence}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeframe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {timeframes.map((tf, index) => {
          const data = forecast?.[tf.key];
          const colorClass = data ? getTrendColor(data.prediction) : "muted";

          return (
            <div
              key={tf.key}
              className={cn(
                "relative p-4 rounded-xl border transition-all duration-500",
                animateIn && "animate-in fade-in slide-in-from-bottom-4",
                data ? "border-border/50" : "border-border/30 bg-muted/10"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                background: data ? getGradientStyle(data.prediction) : undefined,
              }}
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      data?.prediction === "bullish" && "bg-success/20",
                      data?.prediction === "bearish" && "bg-danger/20",
                      data?.prediction === "neutral" && "bg-warning/20",
                      !data && "bg-muted/30"
                    )}>
                      <tf.icon className={cn(
                        "h-4 w-4",
                        data?.prediction === "bullish" && "text-success",
                        data?.prediction === "bearish" && "text-danger",
                        data?.prediction === "neutral" && "text-warning",
                        !data && "text-muted-foreground"
                      )} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{tf.label}</span>
                  </div>
                  {data && getTrendIcon(data.prediction)}
                </div>

                <p className="text-xs text-muted-foreground mb-2">{tf.timeframe}</p>

                {data ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-xl font-display capitalize",
                        data.prediction === "bullish" && "text-success",
                        data.prediction === "bearish" && "text-danger",
                        data.prediction === "neutral" && "text-warning"
                      )}
                      style={{
                        textShadow: data.prediction === "bullish" 
                          ? "0 0 10px hsl(160 84% 39% / 0.5)"
                          : data.prediction === "bearish"
                          ? "0 0 10px hsl(0 84% 60% / 0.5)"
                          : "0 0 10px hsl(38 92% 50% / 0.5)"
                      }}>
                        {data.prediction}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className={cn(
                          data.prediction === "bullish" && "text-success",
                          data.prediction === "bearish" && "text-danger",
                          data.prediction === "neutral" && "text-warning"
                        )}>{data.confidence}%</span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            data.prediction === "bullish" && "bg-success",
                            data.prediction === "bearish" && "bg-danger",
                            data.prediction === "neutral" && "bg-warning"
                          )}
                          style={{ 
                            width: animateIn ? `${data.confidence}%` : "0%",
                            boxShadow: `0 0 8px currentColor`
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {data.reasoning}
                    </p>

                    {data.priceTarget > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">Target: </span>
                        <span className="text-sm font-display text-primary glow-text">
                          ${data.priceTarget.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No data available</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Triggers & Risk */}
      {forecast && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-gradient-to-br from-warning/5 to-transparent">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-1 sm:p-1.5 rounded-lg bg-warning/20">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-foreground">Key Triggers</h4>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {forecast.keyTriggers.slice(0, 4).map((trigger, i) => (
                <li 
                  key={i} 
                  className={cn(
                    "flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground",
                    animateIn && "animate-in fade-in slide-in-from-left-2"
                  )}
                  style={{ animationDelay: `${(i + 3) * 100}ms` }}
                >
                  <span className="text-primary mt-0.5">◆</span>
                  <span className="line-clamp-2">{trigger}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-1 sm:p-1.5 rounded-lg bg-primary/20">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-foreground">Risk Assessment</h4>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Risk Level</span>
                  <span className={cn(
                    "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full",
                    forecast.riskLevel < 30 && "bg-success/20 text-success",
                    forecast.riskLevel >= 30 && forecast.riskLevel < 60 && "bg-warning/20 text-warning",
                    forecast.riskLevel >= 60 && "bg-danger/20 text-danger"
                  )}>
                    {forecast.riskLevel < 30 ? "Low" : forecast.riskLevel < 60 ? "Medium" : "High"}
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      forecast.riskLevel < 30 && "bg-success",
                      forecast.riskLevel >= 30 && forecast.riskLevel < 60 && "bg-warning",
                      forecast.riskLevel >= 60 && "bg-danger"
                    )}
                    style={{ 
                      width: animateIn ? `${forecast.riskLevel}%` : "0%",
                      boxShadow: `0 0 8px currentColor`
                    }}
                  />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-display text-foreground" style={{
                textShadow: forecast.riskLevel < 30 
                  ? "0 0 10px hsl(160 84% 39% / 0.4)"
                  : forecast.riskLevel < 60
                  ? "0 0 10px hsl(38 92% 50% / 0.4)"
                  : "0 0 10px hsl(0 84% 60% / 0.4)"
              }}>
                {forecast.riskLevel}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
