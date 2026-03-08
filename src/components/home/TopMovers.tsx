import { TrendingUp, TrendingDown, Flame, Loader2, Star, ArrowRight } from "lucide-react";
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
    <section className="py-12 md:py-20" aria-labelledby="top-movers-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-medium tracking-wide uppercase mb-4">
            Live Market Data
          </span>
          <h2 id="top-movers-heading" className="text-[clamp(1.25rem,4vw,2.25rem)] font-display font-bold">
            Top <span className="text-gradient-cosmic">Movers</span> — 24h
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Biggest gainers and losers in the last 24 hours
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Gainers */}
          <div className="holo-card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <h3 className="font-display font-bold text-lg">TOP GAINERS</h3>
              <Flame className="w-4 h-4 text-warning ml-auto" />
            </div>
            <div className="space-y-3">
              {gainers.map((coin, index) => (
                <Link
                  key={coin.symbol}
                  to={`/price-prediction/${coin.name.toLowerCase()}/daily`}
                  className="flex items-center justify-between p-3 rounded-xl bg-success/[0.03] border border-success/15 hover:border-success/30 hover:bg-success/[0.06] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.preventDefault(); handleFavoriteClick(coin.symbol, coin.name); }}
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
                    <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center text-xs font-bold text-success">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-display font-bold text-foreground">{coin.symbol}</span>
                      <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">{coin.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-success font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{coin.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div className="holo-card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-danger" />
              </div>
              <h3 className="font-display font-bold text-lg">TOP LOSERS</h3>
            </div>
            <div className="space-y-3">
              {losers.map((coin, index) => (
                <Link
                  key={coin.symbol}
                  to={`/price-prediction/${coin.name.toLowerCase()}/daily`}
                  className="flex items-center justify-between p-3 rounded-xl bg-danger/[0.03] border border-danger/15 hover:border-danger/30 hover:bg-danger/[0.06] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.preventDefault(); handleFavoriteClick(coin.symbol, coin.name); }}
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
                    <span className="w-6 h-6 rounded-full bg-danger/15 flex items-center justify-center text-xs font-bold text-danger">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-display font-bold text-foreground">{coin.symbol}</span>
                      <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">{coin.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-danger font-bold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {coin.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="glow" size="lg">
            <Link to="/explorer" className="inline-flex items-center gap-2">
              View All Tokens
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
