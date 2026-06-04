import { useState } from "react";
import { LineChart, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OptionTrade {
  type: "call" | "put";
  asset: string;
  strike: string;
  expiry: string;
  size: string;
  premium: string;
  direction: "buy" | "sell";
}

export function OptionsFlowPanel() {
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const { data } = useQuery({
    queryKey: ["options-flow", selectedAsset],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke(`options-flow?asset=${selectedAsset}`);
      return data as { trades: OptionTrade[]; putCallRatio: number; maxPain: string };
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    staleTime: 30_000,
  });
  const trades = data?.trades ?? [];
  const putCallRatio = data?.putCallRatio ?? 0;
  const maxPain = data?.maxPain ?? "—";

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          OPTIONS FLOW
        </h3>
        <span className="text-[10px] sm:text-xs text-muted-foreground">Large trades & OI</span>
      </div>

      {/* Asset Filter */}
      <div className="flex gap-2 mb-4">
        {["BTC", "ETH", "SOL"].map(asset => (
          <button
            key={asset}
            onClick={() => setSelectedAsset(asset)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
              selectedAsset === asset 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {asset}
          </button>
        ))}
      </div>

      {/* Trades List */}
      <div className="space-y-2 sm:space-y-3 mb-4">
        {trades.length > 0 ? trades.map((trade, i) => (
          <div key={i} className="p-2 sm:p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                    trade.type === "call" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                  )}>
                    {trade.type}
                  </span>
                  <span className="font-medium text-xs sm:text-sm">{trade.asset} {trade.strike}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Expiry: {trade.expiry} • {trade.size}
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "font-medium text-xs sm:text-sm flex items-center gap-1",
                  trade.direction === "buy" ? "text-success" : "text-danger"
                )}>
                  {trade.direction === "buy" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trade.premium}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No recent options flow for {selectedAsset}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
        <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg">
          <div className="text-[10px] sm:text-xs text-muted-foreground">Put/Call Ratio</div>
          <div className={cn(
            "text-lg sm:text-xl font-bold",
            putCallRatio > 1 ? "text-danger" : putCallRatio < 0.8 ? "text-success" : "text-warning"
          )}>
            {(putCallRatio ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="text-center p-2 sm:p-3 bg-muted/30 rounded-lg">
          <div className="text-[10px] sm:text-xs text-muted-foreground">Max Pain</div>
          <div className="text-lg sm:text-xl font-bold text-foreground">{maxPain}</div>
        </div>
      </div>
    </div>
  );
}
