import { PredictionData } from "@/hooks/usePricePrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketDataPanelProps {
  data: PredictionData;
  coinName: string;
}

function formatNum(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatPrice(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(8)}`;
}

export function MarketDataPanel({ data, coinName }: MarketDataPanelProps) {
  const md = (data as any)?.marketData;
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {coinName} Market Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Current Price */}
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Price</span>
            </div>
            <p className="font-mono font-bold text-lg">{formatPrice(data.currentPrice)}</p>
          </div>

          {/* 24h Volume */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">24h Volume</span>
            </div>
            <p className="font-mono font-semibold">{formatNum(md?.volume24h)}</p>
          </div>

          {/* Market Cap */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Market Cap</span>
            </div>
            <p className="font-mono font-semibold">{formatNum(md?.marketCap)}</p>
          </div>

          {/* 24h Range */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">24h Range</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="text-red-400">{formatPrice(md?.low24h)}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-green-400">{formatPrice(md?.high24h)}</span>
            </div>
          </div>

          {/* 7d Change */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              {(md?.change7d ?? 0) >= 0 
                ? <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
              <span className="text-xs text-muted-foreground">7d Change</span>
            </div>
            <p className={cn("font-mono font-semibold", (md?.change7d ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
              {md?.change7d != null ? `${md.change7d >= 0 ? '+' : ''}${md.change7d.toFixed(2)}%` : "—"}
            </p>
          </div>

          {/* 30d Change */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              {(md?.change30d ?? 0) >= 0 
                ? <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
              <span className="text-xs text-muted-foreground">30d Change</span>
            </div>
            <p className={cn("font-mono font-semibold", (md?.change30d ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
              {md?.change30d != null ? `${md.change30d >= 0 ? '+' : ''}${md.change30d.toFixed(2)}%` : "—"}
            </p>
          </div>

          {/* ATH */}
          {md?.ath > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg col-span-2 sm:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">All-Time High</span>
                  <p className="font-mono font-semibold">{formatPrice(md.ath)}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {data.currentPrice && md.ath ? `${((data.currentPrice / md.ath) * 100).toFixed(1)}% of ATH` : "—"}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
