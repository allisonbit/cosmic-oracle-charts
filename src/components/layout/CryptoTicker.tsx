import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export function CryptoTicker() {
  const { data, isLoading, error } = useCryptoPrices();

  const tickerData = data?.prices || [];
  // Triple the data for smoother infinite scroll
  const duplicatedData = [...tickerData, ...tickerData, ...tickerData];

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 flex justify-center">
        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || tickerData.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 text-center text-muted-foreground text-xs md:text-sm">
        Loading market data...
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3">
      <div className="ticker flex gap-6 md:gap-12">
        {duplicatedData.map((coin, index) => (
          <div
            key={`${coin.symbol}-${index}`}
            className="flex items-center gap-2 md:gap-3 whitespace-nowrap shrink-0"
          >
            <span className="font-display font-bold text-primary text-xs md:text-sm">
              {coin.symbol}
            </span>
            <span className="text-foreground font-medium text-xs md:text-sm">
              ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                coin.change24h >= 0 ? "text-success" : "text-danger"
              )}
            >
              {coin.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {coin.change24h >= 0 ? "+" : ""}
              {coin.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
