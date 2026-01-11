import { useState, useEffect, useMemo } from "react";
import { Fish, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhaleMove {
  type: "buy" | "sell";
  asset: string;
  amount: string;
  value: string;
  source: string;
  time: string;
  impact: string;
}

export function WhaleActivityPanel() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { whales, netflow, inflow, outflow } = useMemo(() => {
    const moves: WhaleMove[] = [
      { type: "buy", asset: "ETH", amount: "15,000", value: "$45.6M", source: "From Binance to cold wallet", time: "2 min ago", impact: "Accumulation" },
      { type: "sell", asset: "BTC", amount: "2,500", value: "$225M", source: "To Coinbase", time: "12 min ago", impact: "Distribution" },
      { type: "buy", asset: "SOL", amount: "85,000", value: "$16.2M", source: "From OKX to unknown", time: "18 min ago", impact: "Accumulation" },
      { type: "sell", asset: "XRP", amount: "50M", value: "$117M", source: "To Kraken", time: "25 min ago", impact: "Distribution" },
    ];

    return {
      whales: moves,
      netflow: "+$340M",
      inflow: "$1.2B",
      outflow: "$1.54B"
    };
  }, [lastUpdate]);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          WHALE ACTIVITY
        </h3>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Live tracking</span>
        </div>
      </div>

      {/* Whale Movements */}
      <div className="space-y-2 sm:space-y-3 mb-4">
        {whales.map((whale, i) => (
          <div 
            key={i}
            className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
              whale.type === "buy" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
            )}>
              {whale.type}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs sm:text-sm">{whale.amount} {whale.asset}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{whale.source} • {whale.time}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={cn("font-medium text-xs sm:text-sm flex items-center gap-1", 
                whale.type === "buy" ? "text-success" : "text-danger"
              )}>
                {whale.type === "buy" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {whale.value}
              </div>
              <div className={cn("text-[10px]", whale.type === "buy" ? "text-success" : "text-danger")}>
                {whale.impact}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="pt-3 border-t border-border space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Whale Netflow (24h)</span>
          <span className="text-success font-medium">{netflow}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Exchange Inflow</span>
          <span className="text-danger font-medium">{inflow}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Exchange Outflow</span>
          <span className="text-success font-medium">{outflow}</span>
        </div>
      </div>
    </div>
  );
}
