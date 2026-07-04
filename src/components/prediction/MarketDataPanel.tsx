import { PredictionData } from "@/hooks/usePricePrediction";
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
  return `$${(n ?? 0).toFixed(2)}`;
}

function formatPrice(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1) return `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${(n ?? 0).toFixed(8)}`;
}

export function MarketDataPanel({ data, coinName }: MarketDataPanelProps) {
  const md = (data as any)?.marketData;

  return (
    <section className="border-t border-border/30 pt-5">
      <div className="section-label mb-4 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        {coinName} Market Data
      </div>

      {/* Editorial stat grid — thin dividers, no boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        {/* Current Price */}
        <div className="border-l-2 border-primary pl-3">
          <div className="section-label mb-1 flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-primary" /> Price
          </div>
          <p className="font-mono font-bold text-lg">{formatPrice(data.currentPrice)}</p>
        </div>

        {/* 24h Volume */}
        <div>
          <div className="section-label mb-1 flex items-center gap-1">
            <Activity className="h-3 w-3" /> 24h Volume
          </div>
          <p className="font-mono font-semibold">{formatNum(md?.volume24h)}</p>
        </div>

        {/* Market Cap */}
        <div>
          <div className="section-label mb-1 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> Market Cap
          </div>
          <p className="font-mono font-semibold">{formatNum(md?.marketCap)}</p>
        </div>

        {/* 24h Range */}
        <div>
          <div className="section-label mb-1 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> 24h Range
          </div>
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-red-400">{formatPrice(md?.low24h)}</span>
            <span className="text-muted-foreground">—</span>
            <span className="text-green-400">{formatPrice(md?.high24h)}</span>
          </div>
        </div>

        {/* 7d Change */}
        <div>
          <div className="section-label mb-1 flex items-center gap-1">
            {(md?.change7d ?? 0) >= 0
              ? <TrendingUp className="h-3 w-3 text-green-500" />
              : <TrendingDown className="h-3 w-3 text-red-500" />}
            7d Change
          </div>
          <p className={cn("font-mono font-semibold", (md?.change7d ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
            {md?.change7d != null ? `${md.change7d >= 0 ? '+' : ''}${(md.change7d ?? 0).toFixed(2)}%` : "—"}
          </p>
        </div>

        {/* 30d Change */}
        <div>
          <div className="section-label mb-1 flex items-center gap-1">
            {(md?.change30d ?? 0) >= 0
              ? <TrendingUp className="h-3 w-3 text-green-500" />
              : <TrendingDown className="h-3 w-3 text-red-500" />}
            30d Change
          </div>
          <p className={cn("font-mono font-semibold", (md?.change30d ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
            {md?.change30d != null ? `${md.change30d >= 0 ? '+' : ''}${(md.change30d ?? 0).toFixed(2)}%` : "—"}
          </p>
        </div>
      </div>

      {/* ATH */}
      {md?.ath > 0 && (
        <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-5">
          <div>
            <span className="section-label">All-Time High</span>
            <p className="font-mono font-semibold">{formatPrice(md.ath)}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.currentPrice && md.ath ? `${((data.currentPrice / md.ath) * 100).toFixed(1)}% of ATH` : "—"}
          </Badge>
        </div>
      )}
    </section>
  );
}
