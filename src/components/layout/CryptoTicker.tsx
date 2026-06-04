import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { CoinImage } from "@/components/ui/CoinImage";
import { memo, useMemo, useState } from "react";


interface TickerItemProps {
  symbol: string;
  coinId: string;
  price: number;
  change24h: number;
  image?: string;
}

const TickerItem = memo(function TickerItem({ symbol, coinId, price, change24h, image }: TickerItemProps) {
  const isPositive = change24h >= 0;

  const formattedPrice = price >= 1
    ? (price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : (price ?? 0).toLocaleString(undefined, { maximumSignificantDigits: 4 });

  return (
    <Link
      to={`/price-prediction/${coinId}/daily`}
      className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap shrink-0 touch-manipulation hover:opacity-75 transition-opacity cursor-pointer"
      title={`${symbol} prediction`}
      tabIndex={-1} // ticker items don't need tab focus
    >
      <CoinImage symbol={symbol} image={image} size={16} className="hidden sm:block" />
      <span className="font-display font-bold text-primary text-xs md:text-sm">{symbol}</span>
      <span className="text-foreground font-medium text-xs md:text-sm tabular-nums">${formattedPrice}</span>
      <span className={cn(
        "flex items-center gap-0.5 text-xs font-medium tabular-nums",
        isPositive ? "text-success" : "text-danger"
      )}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? "+" : ""}{(change24h ?? 0).toFixed(2)}%
      </span>
    </Link>
  );
});


export function CryptoTicker() {
  const { data: pricesData, isLoading: pricesLoading } = useCryptoPrices();
  const { data: marketData, isLoading: marketLoading } = useMarketData();

  const tickerData = useMemo(() => {
    const seen = new Set<string>();
    const coins: { symbol: string; coinId: string; price: number; change24h: number; image?: string }[] = [];

    // Primary source: crypto-prices (more accurate per-coin data)
    if (pricesData?.prices) {
      for (const coin of pricesData.prices) {
        if (coin.price > 0 && coin.change24h !== 0 && !seen.has(coin.symbol)) {
          seen.add(coin.symbol);
          coins.push({ symbol: coin.symbol, coinId: (coin as any).id || coin.symbol.toLowerCase(), price: coin.price, change24h: coin.change24h, image: (coin as any).image });
        }
      }
    }

    // Secondary source: market data top coins (fills up to 50)
    if (marketData?.topCoins) {
      for (const coin of marketData.topCoins) {
        if (coin.price > 0 && !seen.has(coin.symbol) && coins.length < 50) {
          const skipSymbols = ['USDT', 'USDC', 'USDS', 'DAI', 'USDE', 'PYUSD', 'USD1', 'USDG', 'USDF', 'BUIDL', 'USYC', 'FIGR_HELOC', 'XAUT', 'PAXG'];
          if (skipSymbols.includes(coin.symbol)) continue;
          seen.add(coin.symbol);
          coins.push({ symbol: coin.symbol, coinId: (coin as any).id || coin.name?.toLowerCase() || coin.symbol.toLowerCase(), price: coin.price, change24h: coin.change24h });
        }
      }
    }

    return coins;
  }, [pricesData, marketData]);

  const duplicatedData = useMemo(() => [...tickerData, ...tickerData], [tickerData]);
  const [paused, setPaused] = useState(false);
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
    <div
      className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-2 md:py-3 stable-layout touch-action-pan scroll-smooth-touch group/ticker"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      title="Hover to pause • Click any coin to see prediction"
    >
      <div
        className="ticker flex gap-6 md:gap-10 gpu-accelerated will-change-transform"
        style={{ animationPlayState: paused ? 'paused' : 'running' }}
      >
        {duplicatedData.map((coin, index) => (
          <TickerItem
            key={`${coin.symbol}-${index}`}
            symbol={coin.symbol}
            coinId={coin.coinId}
            price={coin.price}
            change24h={coin.change24h}
            image={coin.image}
          />
        ))}
      </div>
    </div>
  );
}
