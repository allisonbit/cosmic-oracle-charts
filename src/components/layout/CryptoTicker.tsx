import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { memo } from "react";

interface TickerItemProps {
  symbol: string;
  price: number;
  change24h: number;
}

const TickerItem = memo(function TickerItem({ symbol, price, change24h }: TickerItemProps) {
  const isPositive = change24h >= 0;
  
  return (
    <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap shrink-0 touch-manipulation">
      <span className="font-display font-bold text-primary text-xs md:text-sm">
        {symbol}
      </span>
      <span className="text-foreground font-medium text-xs md:text-sm tabular-nums">
        ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      <span
        className={cn(
          "flex items-center gap-1 text-xs font-medium tabular-nums",
          isPositive ? "text-success" : "text-danger"
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {isPositive ? "+" : ""}
        {change24h.toFixed(2)}%
      </span>
    </div>
  );
});

export function CryptoTicker() {
  const { data, isLoading, error } = useCryptoPrices();

  const tickerData = data?.prices || [];
  // Triple the data for smoother infinite scroll
  const duplicatedData = [...tickerData, ...tickerData, ...tickerData];

  if (isLoading && tickerData.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 flex justify-center stable-layout">
        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error && tickerData.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 text-center text-muted-foreground text-xs md:text-sm stable-layout">
        Loading market data...
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 stable-layout">
      <div className="ticker flex gap-6 md:gap-12 gpu-accelerated will-change-transform">
        {duplicatedData.map((coin, index) => (
          <TickerItem
            key={`${coin.symbol}-${index}`}
            symbol={coin.symbol}
            price={coin.price}
            change24h={coin.change24h}
          />
        ))}
      </div>
    </div>
  );
}
