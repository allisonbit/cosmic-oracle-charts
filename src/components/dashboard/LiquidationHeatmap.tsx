import { useMemo } from "react";
import { Flame, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiquidationLevel {
  asset: string;
  price: string;
  amount: string;
  type: "long" | "short" | "balanced";
}

export function LiquidationHeatmap() {
  const { longPercentage, liquidationLevels } = useMemo(() => {
    const levels: LiquidationLevel[] = [
      { asset: "BTC", price: "$89,500", amount: "$42M", type: "short" },
      { asset: "ETH", price: "$3,050", amount: "$18M", type: "long" },
      { asset: "SOL", price: "$185", amount: "$9.5M", type: "balanced" },
      { asset: "XRP", price: "$2.25", amount: "$5.2M", type: "short" },
      { asset: "BNB", price: "$680", amount: "$3.8M", type: "long" },
    ];

    const longPct = 35 + Math.random() * 10;

    return { longPercentage: longPct, liquidationLevels: levels };
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "long": return { text: "LONG HEAVY", color: "text-success" };
      case "short": return { text: "SHORT HEAVY", color: "text-danger" };
      default: return { text: "BALANCED", color: "text-warning" };
    }
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          LIQUIDATION HEATMAP
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Price levels with high liquidation risk</p>
      </div>

      {/* Long/Short Balance Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs sm:text-sm mb-2">
          <span className="text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Long Liquidations
          </span>
          <span className="text-danger flex items-center gap-1">
            Short Liquidations
            <TrendingDown className="w-3 h-3" />
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-muted">
          <div 
            className="bg-gradient-to-r from-success to-success/70 transition-all"
            style={{ width: `${longPercentage}%` }}
          />
          <div 
            className="bg-gradient-to-l from-danger to-danger/70 transition-all"
            style={{ width: `${100 - longPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{longPercentage.toFixed(0)}%</span>
          <span>{(100 - longPercentage).toFixed(0)}%</span>
        </div>
      </div>

      {/* Liquidation Levels */}
      <div className="space-y-2 sm:space-y-3">
        {liquidationLevels.map((level, i) => {
          const typeInfo = getTypeLabel(level.type);
          return (
            <div 
              key={i}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div>
                <div className="font-medium text-sm">{level.asset}: {level.price}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{level.amount} in liquidations</div>
              </div>
              <div className={cn("text-[10px] sm:text-xs font-bold", typeInfo.color)}>
                {typeInfo.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-3 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-danger/50" />
          <span>High liquidation zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success/50" />
          <span>Support zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warning/50" />
          <span>Neutral zone</span>
        </div>
      </div>
    </div>
  );
}
