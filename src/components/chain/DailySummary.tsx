import { ChainConfig } from "@/lib/chainConfig";
import { ChainForecast } from "@/hooks/useChainForecast";
import { Sparkles, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailySummaryProps {
  chain: ChainConfig;
  forecast: ChainForecast | undefined;
  isLoading: boolean;
}

export function DailySummary({ chain, forecast, isLoading }: DailySummaryProps) {
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
        <div className="flex items-center gap-3 mb-4">
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

        {/* Timestamp */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
