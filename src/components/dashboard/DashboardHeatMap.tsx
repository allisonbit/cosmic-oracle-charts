import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardHeatMap({ topCoins }: { topCoins: any[] }) {
  return (
    <div className="holo-card p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <h2 className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        MARKET HEAT MAP
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal hidden sm:inline">Click any coin</span>
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        The heat map provides a visual overview of market performance. Green indicates positive 24-hour price changes (bullish), 
        while red indicates negative changes (bearish). Color intensity reflects the magnitude of the price movement.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2">
        {topCoins.slice(0, 16).map((coin) => (
          <Link
            key={coin.symbol}
            to={`/price-prediction/${coin.symbol.toLowerCase()}/daily`}
            className={cn(
              "p-1.5 sm:p-2 md:p-3 rounded-lg text-center transition-all card-touch",
              coin.change24h >= 3 ? "bg-success/30 border border-success/50" :
              coin.change24h >= 0 ? "bg-success/20 border border-success/30" :
              coin.change24h >= -3 ? "bg-danger/20 border border-danger/30" :
              "bg-danger/30 border border-danger/50"
            )}
          >
            <div className="font-display font-bold text-[10px] sm:text-xs truncate">{coin.symbol}</div>
            <div className={cn(
              "text-[9px] sm:text-[10px] md:text-xs font-medium",
              coin.change24h >= 0 ? "text-success" : "text-danger"
            )}>
              {coin.change24h >= 0 ? "+" : ""}{(coin.change24h ?? 0).toFixed(1)}%
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
