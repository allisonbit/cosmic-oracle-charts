import { Link } from "react-router-dom";
import { Flame, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CryptoChart } from "./CryptoChart";
import { formatDashboardNumber } from "./utils";
import { CoinImage } from "@/components/ui/CoinImage";


export function DashboardTopCryptos({ topCoins }: { topCoins: any[] }) {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
        <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
        TOP CRYPTOS
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal hidden sm:inline">Click for details</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {topCoins.map((coin) => {
          const trend = coin.change24h >= 2 ? "BULLISH" : coin.change24h <= -2 ? "BEARISH" : "NEUTRAL";
          
          return (
            <Link 
              key={coin.symbol} 
              to={`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`}
              className="holo-card p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-3 card-touch text-left group block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <CoinImage symbol={coin.symbol} image={coin.image} size={28} className="sm:w-7 sm:h-7" />
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-primary text-xs sm:text-sm truncate">{coin.symbol}</h3>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">{coin.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="min-w-0">
                  <div className="text-sm sm:text-base md:text-lg font-bold truncate">${(coin.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                    coin.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {coin.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                    {coin.change24h >= 0 ? "+" : ""}{(coin.change24h ?? 0).toFixed(2)}%
                  </div>
                </div>
                <span className={cn(
                  "text-[8px] sm:text-[10px] font-display font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0",
                  trend === "BULLISH" ? "text-success bg-success/20" : trend === "BEARISH" ? "text-danger bg-danger/20" : "text-warning bg-warning/20"
                )}>
                  {trend}
                </span>
              </div>

              <div className="hidden sm:block">
                <CryptoChart price={coin.price} isPositive={coin.change24h >= 0} symbol={coin.symbol} />
              </div>

              <div className="flex justify-between text-[8px] sm:text-[10px] text-muted-foreground pt-1.5 sm:pt-2 border-t border-border/50">
                <span className="truncate">Vol: {formatDashboardNumber(coin.volume)}</span>
                <span className="truncate ml-1">MCap: {formatDashboardNumber(coin.marketCap)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
