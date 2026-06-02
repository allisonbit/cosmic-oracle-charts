import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Loader2, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatChange } from "@/lib/formatters";

interface TokenAITabProps {
  token: any;
  aiLoading: boolean;
  forecast: any;
}

export function TokenAITab({ token, aiLoading, forecast }: TokenAITabProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            AI-Powered Analysis for {token.symbol}
            {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : forecast ? (
            <>
              {/* Signal & Confidence */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold",
                  forecast.bias === 'bullish' ? "bg-success/20 text-success" :
                  forecast.bias === 'bearish' ? "bg-danger/20 text-danger" :
                  "bg-warning/20 text-warning"
                )}>
                  {(forecast.bias || 'NEUTRAL').toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold">{forecast.confidence || 50}%</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className="text-sm font-semibold">{forecast.riskLevel || 'Medium'}</p>
                </div>
              </div>

              {/* Summary */}
              {forecast.summary && (
                <div className="p-4 rounded-lg border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">AI SUMMARY</h4>
                  <p className="text-sm leading-relaxed text-foreground">{forecast.summary}</p>
                </div>
              )}

              {/* Price Targets */}
              {forecast.targets && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {forecast.targets.conservative && (
                    <div className="p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Conservative Target</p>
                      <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.conservative)}</p>
                      <p className="text-xs text-muted-foreground">{formatChange(((forecast.targets.conservative - token.price) / token.price) * 100)}</p>
                    </div>
                  )}
                  {forecast.targets.moderate && (
                    <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                      <p className="text-xs text-primary mb-1">Moderate Target</p>
                      <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.moderate)}</p>
                      <p className="text-xs text-muted-foreground">{formatChange(((forecast.targets.moderate - token.price) / token.price) * 100)}</p>
                    </div>
                  )}
                  {forecast.targets.aggressive && (
                    <div className="p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Aggressive Target</p>
                      <p className="text-lg font-bold font-mono">{formatPrice(forecast.targets.aggressive)}</p>
                      <p className="text-xs text-muted-foreground">{formatChange(((forecast.targets.aggressive - token.price) / token.price) * 100)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Key Triggers */}
              {Array.isArray(forecast.triggers) && forecast.triggers.length > 0 && (
                <div className="p-4 rounded-lg border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">KEY TRIGGERS</h4>
                  <ul className="space-y-1.5">
                    {forecast.triggers.map((t: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Zap className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Indicators */}
              {forecast.technicals && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(forecast.technicals).slice(0, 12).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm font-bold font-mono">{typeof val === 'number' ? (val as number).toFixed(2) : String(val)}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">AI analysis unavailable for this token.</p>
              <Link to={`/price-prediction/${token.symbol.toLowerCase()}/daily`}>
                <Button variant="outline" size="sm" className="mt-3 text-xs gap-1">
                  <Target className="w-3 h-3" /> Open Full Prediction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
