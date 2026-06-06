import { Activity, ArrowUpRight, ArrowDownRight, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

interface Trade {
  id: number;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  amount: number;
  value: number;
  time: number;
  exchange: string;
}

export function RecentTradesPanel() {
  const { data } = useQuery({
    queryKey: ["live-trades"],
    queryFn: async () => {
      const { data, error } = await invokeFunction("live-trades", { body: {} });
      if (error) throw error;
      return (data?.trades ?? []) as Trade[];
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 4000,
  });
  const trades = data ?? [];

  function formatValue(num: number): string {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${(num ?? 0).toFixed(0)}`;
  }

  return (
    <div className="holo-card p-4 sm:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
        LIVE TRADE FLOW
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">Streaming</span>
        </div>
      </h3>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {trades.length === 0 && (
          <div className="space-y-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-muted/20 animate-pulse" />
            ))}
          </div>
        )}
        {trades.map((trade, i) => (
          <Link
            key={`${trade.symbol}-${trade.id}-${i}`}
            to={`/price-prediction/${trade.symbol.toLowerCase()}/daily`}
            className={cn(
              "flex items-center gap-2 sm:gap-3 p-2 rounded-lg text-xs sm:text-sm hover:bg-muted/30 transition-all animate-fade-in",
              i === 0 && "bg-muted/10"
            )}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
              trade.side === "buy" ? "bg-success/20" : "bg-danger/20"
            )}>
              {trade.side === "buy" 
                ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                : <ArrowDownRight className="w-3.5 h-3.5 text-danger" />
              }
            </div>
            
            <span className="font-display font-bold text-primary w-12 sm:w-14">{trade.symbol}</span>
            
            <span className={cn(
              "font-bold w-10 text-center flex-shrink-0",
              trade.side === "buy" ? "text-success" : "text-danger"
            )}>
              {trade.side.toUpperCase()}
            </span>
            
            <span className="text-muted-foreground flex-1 text-right hidden sm:block">
              {formatValue(trade.value)}
            </span>
            
            <span className="text-muted-foreground w-14 sm:w-16 text-right text-[10px] sm:text-xs">{trade.exchange}</span>
            
            <span className="text-muted-foreground text-[10px] w-8 text-right flex-shrink-0">
              {Math.max(0, Math.floor((Date.now() - trade.time) / 1000))}s
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
