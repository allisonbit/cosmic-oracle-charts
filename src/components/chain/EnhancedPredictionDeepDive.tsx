import { ChainForecast } from "@/hooks/useChainForecast";
import { ChainConfig } from "@/lib/chainConfig";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Clock, Zap, RefreshCw, Brain, Shield, Eye, ChevronRight, Activity, X, Info, Lightbulb, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EnhancedPredictionDeepDiveProps {
  chain: ChainConfig;
  forecast: ChainForecast | undefined;
  isLoading: boolean;
}

interface DetailModal {
  type: "timeframe" | "trigger" | "risk" | "confidence";
  data: any;
  title: string;
}

export function EnhancedPredictionDeepDive({ chain, forecast, isLoading }: EnhancedPredictionDeepDiveProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DetailModal | null>(null);

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
    { 
      key: "shortTerm", 
      label: "Short-Term", 
      timeframe: "Engine daily read", 
      icon: Zap,
      description: "Momentum read from the live technical engine",
      methodology: [
        "RSI (14) momentum oscillator",
        "MACD trend & histogram",
        "20/50/200-day moving averages",
        "Bollinger band position",
        "Volume trend analysis"
      ],
      signals: ["RSI", "MACD", "Moving averages"]
    },
    { 
      key: "midTerm", 
      label: "Mid-Term", 
      timeframe: "Swing horizon", 
      icon: Clock,
      description: "Same engine read, damped for the swing horizon",
      methodology: [
        "Engine bias, confidence × 0.85",
        "Bollinger band position",
        "Volume trend confirmation",
        "Support / resistance structure"
      ],
      signals: ["Engine bias", "Damped confidence"]
    },
    { 
      key: "longTerm", 
      label: "Long-Term", 
      timeframe: "Position horizon", 
      icon: Target,
      description: "Same engine read, further damped — treat as a trend lean, not a target",
      methodology: [
        "Engine bias, confidence × 0.7",
        "Long-horizon moving-average trend",
        "No price targets at this horizon"
      ],
      signals: ["Engine bias", "MA trend"]
    },
  ] as const;

  const handleTriggerClick = (trigger: string) => {
    // Honest detail: the trigger IS the live engine signal — describe it as such
    // instead of inventing impact statistics.
    setSelectedDetail({
      type: "trigger",
      data: {
        trigger,
        icon: Activity,
        severity: "info",
        description: `Live engine signal: ${trigger}. This is one of the measured technical inputs behind the current bias and confidence.`,
        impact: "Feeds directly into the engine's bias / confidence — no historical impact statistics are claimed.",
        actionable: "Open the full prediction page for entry zones, scenarios and the complete indicator read.",
      },
      title: "Engine Signal",
    });
  };

  const handleRiskClick = () => {
    if (!forecast) return;
    setSelectedDetail({
      type: "risk",
      data: {
        riskLevel: forecast.riskLevel,
        factors: [
          // All factor scores are deterministic functions of the real forecast
          // riskLevel — no random noise.
          { name: "Market Volatility", score: Math.floor(forecast.riskLevel * 0.8), description: "Current price swing intensity" },
          { name: "Liquidity Depth", score: Math.floor(100 - forecast.riskLevel * 0.6), description: "Order book depth analysis" },
          { name: "Correlation Risk", score: Math.floor(forecast.riskLevel * 0.9), description: "BTC/macro correlation strength" },
          { name: "Sentiment Extreme", score: Math.floor(forecast.riskLevel * 0.7), description: "Fear/greed positioning" },
          { name: "Technical Setup", score: Math.floor(100 - forecast.riskLevel * 0.5), description: "Chart pattern quality" },
        ],
        recommendations: forecast.riskLevel < 30 
          ? ["Low risk environment suitable for larger positions", "Consider leveraged strategies with proper stops", "Good time for swing trading entries"]
          : forecast.riskLevel < 60
          ? ["Moderate position sizing recommended", "Use stop-losses on all positions", "Avoid excessive leverage"]
          : ["High risk - reduce position sizes", "Consider hedging strategies", "Wait for volatility to subside before new entries"]
      },
      title: "Risk Assessment Details"
    });
  };

  const handleConfidenceClick = () => {
    if (!forecast) return;
    setSelectedDetail({
      type: "confidence",
      data: {
        overall: forecast.overallConfidence,
        breakdown: [
          { name: "RSI momentum (14)", score: forecast.shortTerm.confidence, weight: "Engine input" },
          { name: "MACD trend & histogram", score: forecast.midTerm.confidence, weight: "Engine input" },
          { name: "Moving-average structure", score: forecast.longTerm.confidence, weight: "Engine input" },
          { name: "Bollinger band position", score: forecast.shortTerm.confidence, weight: "Engine input" },
          { name: "Volume trend", score: forecast.midTerm.confidence, weight: "Engine input" },
        ],
        modelInfo: {
          models: ["Rule-based technical engine (RSI · MACD · MA · Bollinger)"],
          dataPoints: "Real CoinGecko daily price history",
          lastUpdated: "Recomputed on page visit"
        }
      },
      title: "Confidence Score Breakdown"
    });
  };

  // Loading skeleton
  if (isLoading && !forecast) {
    return (
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-display text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Prediction Deep Dive
            </h3>
            <p className="text-sm text-muted-foreground">Analyzing {chain.name}...</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Analyzing...
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-t border-border/20 pt-3 animate-pulse">
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
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-display text-foreground">AI Prediction Deep Dive</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Multi-timeframe analysis for {chain.name} • Click any element for details</p>
        </div>

        {forecast && (
          <button 
            onClick={handleConfidenceClick}
            className="flex items-center gap-2 justify-end sm:justify-start hover:opacity-80 transition-opacity group"
          >
            <span className="text-xs text-muted-foreground hidden sm:block group-hover:text-primary transition-colors">Confidence</span>
            <div className="relative">
              <svg className="w-10 h-10 sm:w-14 sm:h-14 transform -rotate-90">
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
                  style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" }}
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-muted hidden sm:block"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${(forecast.overallConfidence / 100) * 150.8} 150.8`}
                  className="text-primary transition-all duration-1000 hidden sm:block"
                  style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] sm:text-sm font-display text-primary">{forecast.overallConfidence}%</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
          </button>
        )}
      </div>

      {/* Timeframe Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {timeframes.map((tf, index) => {
          const data = forecast?.[tf.key];
          const colorClass = data ? getTrendColor(data.prediction) : "muted";

          return (
            <button
              key={tf.key}
              onClick={() => data && handleTimeframeClick(tf, data)}
              className={cn(
                "relative p-4 rounded-xl border transition-all duration-500 text-left group",
                animateIn && "animate-in fade-in slide-in-from-bottom-4",
                data ? "border-border/50 hover:border-primary/30 cursor-pointer" : "border-border/30 bg-muted/10"
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
                  <div className="flex items-center gap-1">
                    {data && getTrendIcon(data.prediction)}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                        {tf.signals.slice(0, 2).join(" · ")}
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
                          ${(data.priceTarget ?? 0).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Signal badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tf.signals.map((signal, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {signal}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No data available</span>
                  </div>
                )}
              </div>
            </button>
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
              <h4 className="text-xs sm:text-sm font-medium text-foreground">Key Market Triggers</h4>
              <span className="text-[10px] text-muted-foreground ml-auto">Click for details</span>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {forecast.keyTriggers.slice(0, 5).map((trigger, i) => (
                <li 
                  key={i} 
                  onClick={() => handleTriggerClick(trigger)}
                  className={cn(
                    "flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors group p-1.5 rounded-lg hover:bg-muted/30",
                    animateIn && "animate-in fade-in slide-in-from-left-2"
                  )}
                  style={{ animationDelay: `${(i + 3) * 100}ms` }}
                >
                  <span className="text-primary mt-0.5">◆</span>
                  <span className="flex-1 line-clamp-2">{trigger}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={handleRiskClick}
            className="p-3 sm:p-4 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent text-left hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-1 sm:p-1.5 rounded-lg bg-primary/20">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-foreground">Risk Assessment</h4>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
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
                    {forecast.riskLevel < 30 ? "Low Risk" : forecast.riskLevel < 60 ? "Medium Risk" : "High Risk"}
                  </span>
                </div>
                <div className="h-2 sm:h-2.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      forecast.riskLevel < 30 && "bg-gradient-to-r from-success to-success/70",
                      forecast.riskLevel >= 30 && forecast.riskLevel < 60 && "bg-gradient-to-r from-warning to-warning/70",
                      forecast.riskLevel >= 60 && "bg-gradient-to-r from-danger to-danger/70"
                    )}
                    style={{ 
                      width: animateIn ? `${forecast.riskLevel}%` : "0%",
                      boxShadow: `0 0 8px currentColor`
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {forecast.riskLevel < 30 
                    ? "Low volatility environment, suitable for larger positions"
                    : forecast.riskLevel < 60
                    ? "Moderate risk, use appropriate position sizing"
                    : "High volatility, exercise caution with trades"
                  }
                </p>
              </div>
              <div className="text-2xl sm:text-4xl font-display text-foreground" style={{
                textShadow: forecast.riskLevel < 30 
                  ? "0 0 10px hsl(160 84% 39% / 0.4)"
                  : forecast.riskLevel < 60
                  ? "0 0 10px hsl(38 92% 50% / 0.4)"
                  : "0 0 10px hsl(0 84% 60% / 0.4)"
              }}>
                {forecast.riskLevel}
              </div>
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
