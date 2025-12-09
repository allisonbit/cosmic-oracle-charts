import { ChainForecast } from "@/hooks/useChainForecast";
import { ChainConfig } from "@/lib/chainConfig";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionDeepDiveProps {
  chain: ChainConfig;
  forecast: ChainForecast | undefined;
  isLoading: boolean;
}

export function PredictionDeepDive({ chain, forecast, isLoading }: PredictionDeepDiveProps) {
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

  const timeframes = [
    { key: "shortTerm", label: "Short-Term", timeframe: "1-4 hours", icon: Zap },
    { key: "midTerm", label: "Mid-Term", timeframe: "24-48 hours", icon: Clock },
    { key: "longTerm", label: "Long-Term", timeframe: "3-7 days", icon: Target },
  ] as const;

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">AI Prediction Deep Dive</h3>
          <p className="text-sm text-muted-foreground">Multi-timeframe analysis for {chain.name}</p>
        </div>

        {forecast && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Overall Confidence</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${forecast.overallConfidence}%, transparent 0)`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-card flex items-center justify-center text-xs">
                  {forecast.overallConfidence}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeframe Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {timeframes.map((tf) => {
          const data = forecast?.[tf.key];
          const colorClass = data ? getTrendColor(data.prediction) : "muted";

          return (
            <div
              key={tf.key}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                isLoading && "animate-pulse",
                data ? `border-${colorClass}/30 bg-${colorClass}/5` : "border-border/50 bg-muted/20"
              )}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-20"
                style={{
                  background: data?.prediction === "bullish"
                    ? "linear-gradient(135deg, hsl(160 84% 39% / 0.2), transparent)"
                    : data?.prediction === "bearish"
                    ? "linear-gradient(135deg, hsl(0 84% 60% / 0.2), transparent)"
                    : "linear-gradient(135deg, hsl(38 92% 50% / 0.2), transparent)",
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <tf.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{tf.label}</span>
                  </div>
                  {data && getTrendIcon(data.prediction)}
                </div>

                <p className="text-xs text-muted-foreground mb-2">{tf.timeframe}</p>

                {data ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-lg font-display capitalize",
                        data.prediction === "bullish" && "text-success",
                        data.prediction === "bearish" && "text-danger",
                        data.prediction === "neutral" && "text-warning"
                      )}>
                        {data.prediction}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({data.confidence}% confidence)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {data.reasoning}
                    </p>

                    {data.priceTarget > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Target: </span>
                        <span className="text-sm font-display text-primary">
                          ${data.priceTarget.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Triggers */}
      {forecast && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h4 className="text-sm font-medium text-foreground">Key Triggers</h4>
            </div>
            <ul className="space-y-2">
              {forecast.keyTriggers.map((trigger, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {trigger}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium text-foreground">Risk Assessment</h4>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Risk Level</span>
                  <span className={cn(
                    "text-xs font-medium",
                    forecast.riskLevel < 30 && "text-success",
                    forecast.riskLevel >= 30 && forecast.riskLevel < 60 && "text-warning",
                    forecast.riskLevel >= 60 && "text-danger"
                  )}>
                    {forecast.riskLevel < 30 ? "Low" : forecast.riskLevel < 60 ? "Medium" : "High"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      forecast.riskLevel < 30 && "bg-success",
                      forecast.riskLevel >= 30 && forecast.riskLevel < 60 && "bg-warning",
                      forecast.riskLevel >= 60 && "bg-danger"
                    )}
                    style={{ width: `${forecast.riskLevel}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-display text-foreground">{forecast.riskLevel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
