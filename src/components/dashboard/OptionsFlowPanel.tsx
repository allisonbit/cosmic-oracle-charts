import { useState, useMemo } from "react";
import { LineChart, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const { trades, putCallRatio, maxPain } = useMemo(() => {
    const optionTrades: OptionTrade[] = [
      { type: "call", asset: "BTC", strike: "$95K", expiry: "31 Jan", size: "500 contracts", premium: "+$2.4M", direction: "buy" },
      { type: "put", asset: "BTC", strike: "$85K", expiry: "28 Feb", size: "1,200 contracts", premium: "-$1.8M", direction: "sell" },
      { type: "call", asset: "BTC", strike: "$100K", expiry: "31 Mar", size: "300 contracts", premium: "+$890K", direction: "buy" },
      { type: "put", asset: "ETH", strike: "$2,800", expiry: "31 Jan", size: "2,500 contracts", premium: "-$1.2M", direction: "sell" },
      { type: "call", asset: "ETH", strike: "$3,500", expiry: "28 Feb", size: "1,800 contracts", premium: "+$2.1M", direction: "buy" },
    ];

    const filtered = optionTrades.filter(t => t.asset === selectedAsset);
    const ratio = 0.75 + Math.random() * 0.3;
    const pain = selectedAsset === "BTC" ? "$92,500" : selectedAsset === "ETH" ? "$3,100" : "$190";

    return { trades: filtered, putCallRatio: ratio, maxPain: pain };
  }, [selectedAsset]);

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
            {putCallRatio.toFixed(2)}
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
