import { TrendingUp, TrendingDown, Flame, Loader2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { toast } from "sonner";

export function TopMovers() {
  const { data, isLoading } = useCryptoPrices();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteClick = (symbol: string, name: string) => {
    toggleFavorite(symbol);
    const wasFavorite = isFavorite(symbol);
    toast.success(
      wasFavorite 
        ? `${name} removed from watchlist` 
        : `${name} added to watchlist`,
      { duration: 2000 }
    );
  };

  const { gainers, losers } = useMemo(() => {
    const prices = data?.prices || [];
    if (!prices.length) return { gainers: [], losers: [] };
    
    const sorted = [...prices].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [data]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 cosmic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[clamp(1.25rem,4vw,2.25rem)] font-display font-bold">
            TOP <span className="glow-text">MOVERS</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Biggest gainers and losers in the last 24 hours
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Gainers */}
          <div className="holo-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="font-display font-bold text-lg">TOP GAINERS</h3>
              <Flame className="w-4 h-4 text-warning ml-auto" />
            </div>
            <div className="space-y-4">
              {gainers.map((coin, index) => (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20 hover:border-success/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleFavoriteClick(coin.symbol, coin.name)}
                      className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center hover:bg-warning/20 transition-colors tap-highlight-none touch-manipulation"
                      aria-label={isFavorite(coin.symbol) ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
                    >
                      <Star 
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isFavorite(coin.symbol) ? "fill-warning text-warning" : "text-muted-foreground hover:text-warning"
                        )} 
                      />
                    </button>
                    <span className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-xs font-bold text-success">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-display font-bold">{coin.symbol}</span>
                      <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">
                        {coin.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-success font-bold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +{coin.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div className="holo-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-danger" />
              <h3 className="font-display font-bold text-lg">TOP LOSERS</h3>
            </div>
            <div className="space-y-4">
              {losers.map((coin, index) => (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/20 hover:border-danger/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleFavoriteClick(coin.symbol, coin.name)}
                      className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center hover:bg-warning/20 transition-colors tap-highlight-none touch-manipulation"
                      aria-label={isFavorite(coin.symbol) ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
                    >
                      <Star 
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isFavorite(coin.symbol) ? "fill-warning text-warning" : "text-muted-foreground hover:text-warning"
                        )} 
                      />
                    </button>
                    <span className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center text-xs font-bold text-danger">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-display font-bold">{coin.symbol}</span>
                      <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">
                        {coin.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-danger font-bold flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {coin.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="glow">
            <Link to="/explorer">View All Tokens</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
