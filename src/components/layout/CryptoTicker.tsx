import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { memo, useMemo } from "react";

interface TickerItemProps {
  symbol: string;
  price: number;
  change24h: number;
}

const TickerItem = memo(function TickerItem({ symbol, price, change24h }: TickerItemProps) {
  const isPositive = change24h >= 0;
  
  const formattedPrice = price >= 1
    ? price.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : price.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  
  return (
    <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap shrink-0 touch-manipulation">
      <span className="font-display font-bold text-primary text-xs md:text-sm">
        {symbol}
      </span>
      <span className="text-foreground font-medium text-xs md:text-sm tabular-nums">
        ${formattedPrice}
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
  const { data: pricesData, isLoading: pricesLoading } = useCryptoPrices();
  const { data: marketData, isLoading: marketLoading } = useMarketData();

  const tickerData = useMemo(() => {
    const seen = new Set<string>();
    const coins: { symbol: string; price: number; change24h: number }[] = [];

    // Primary source: crypto-prices (more accurate per-coin data)
    if (pricesData?.prices) {
      for (const coin of pricesData.prices) {
        if (coin.price > 0 && !seen.has(coin.symbol)) {
          seen.add(coin.symbol);
          coins.push({ symbol: coin.symbol, price: coin.price, change24h: coin.change24h });
        }
      }
    }

    // Secondary source: market data top coins (fills up to 50)
    if (marketData?.topCoins) {
      for (const coin of marketData.topCoins) {
        if (coin.price > 0 && !seen.has(coin.symbol) && coins.length < 50) {
          // Skip stablecoins and obscure tokens for the ticker
          const skipSymbols = ['USDT', 'USDC', 'USDS', 'DAI', 'USDE', 'PYUSD', 'USD1', 'USDG', 'USDF', 'BUIDL', 'USYC', 'FIGR_HELOC', 'XAUT', 'PAXG'];
          if (skipSymbols.includes(coin.symbol)) continue;
          seen.add(coin.symbol);
          coins.push({ symbol: coin.symbol, price: coin.price, change24h: coin.change24h });
        }
      }
    }

    return coins;
  }, [pricesData, marketData]);

  // Duplicate twice for seamless infinite scroll
  const duplicatedData = useMemo(() => [...tickerData, ...tickerData], [tickerData]);

  const isLoading = pricesLoading && marketLoading;

  if (isLoading && tickerData.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 flex justify-center stable-layout">
        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (tickerData.length === 0) {
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
