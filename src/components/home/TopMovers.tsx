import { TrendingUp, TrendingDown, Flame, Loader2, Star, ArrowRight, Zap, BellRing, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useMemo, useEffect, useState } from "react";
import { toast } from "sonner";

// Animated mini sparkline component
const Sparkline = ({ isPositive }: { isPositive: boolean }) => {
  // Generate random data points for the sparkline that trend generally up or down
  const points = useMemo(() => {
    let currentY = 20;
    return Array.from({ length: 15 }).map((_, i) => {
      const change = (Math.random() * 10 - 5) + (isPositive ? -1 : 1);
      currentY = Math.max(2, Math.min(38, currentY + change));
      return `${i * (100 / 14)},${currentY}`;
    }).join(' L');
  }, [isPositive]);

  const color = isPositive ? 'var(--success)' : 'var(--danger)';

  return (
    <div className="w-16 h-8 opacity-60">
      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
        <path
          d={`M0,${isPositive ? 30 : 10} L${points}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[dash_3s_ease-out_forwards]"
          strokeDasharray="200"
          strokeDashoffset="0"
        />
      </svg>
    </div>
  );
};

// AI Marquee Alert Bar
const AIAlertMarquee = ({ prices = [] }: { prices: any[] }) => {
  // Generate dynamic alerts based on live price data
  const alerts = useMemo(() => {
    if (!prices || prices.length === 0) {
      return [
        { coin: "BTC", msg: "Market analysis in progress...", type: "neutral" },
        { coin: "ETH", msg: "Gathering network data...", type: "neutral" }
      ];
    }
    
    return prices.slice(0, 8).map(coin => {
      const isPositive = coin.change24h > 0;
      const type = isPositive ? "bullish" : coin.change24h < -5 ? "bearish" : "neutral";
      
      // Dynamic messages based on price action
      let msg = "";
      if (coin.change24h > 5) msg = `Surging +${coin.change24h.toFixed(1)}% in 24h`;
      else if (coin.change24h > 2) msg = `Steady uptrend detected`;
      else if (coin.change24h < -5) msg = `Sharp correction -${Math.abs(coin.change24h).toFixed(1)}%`;
      else if (coin.change24h < 0) msg = `Minor pullback forming`;
      else msg = `Consolidating at current levels`;

      return { coin: coin.symbol, msg, type };
    });
  }, [prices]);

  return (
    <div className="w-full bg-card border-y border-border/50 overflow-hidden py-2 mb-12 flex items-center">
      <div className="flex items-center px-4 border-r border-border/50 z-10 bg-card">
        <Zap className="w-4 h-4 text-warning mr-2 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Live AI Alerts</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
          {[...alerts, ...alerts, ...alerts].map((alert, i) => (
            <div key={i} className="flex items-center mx-6 gap-2">
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded uppercase",
                alert.type === 'bullish' ? "bg-success/10 text-success" : 
                alert.type === 'bearish' ? "bg-danger/10 text-danger" : "bg-muted text-foreground"
              )}>
                {alert.coin}
              </span>
              <span className="text-sm text-foreground">{alert.msg}</span>
              <span className="text-muted-foreground/30 mx-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


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
    <section className="pb-16 md:pb-24 pt-8" aria-labelledby="top-movers-heading">
      
      <AIAlertMarquee prices={data?.prices || []} />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-warning/10 text-warning mb-4 ring-1 ring-warning/20">
            <Activity className="w-6 h-6" />
          </div>
          <h2 id="top-movers-heading" className="text-[clamp(1.5rem,4vw,2.5rem)] font-display font-bold">
            Live Market <span className="text-warning">Pulse</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto mt-3">
            Real-time tracking of the most volatile assets across all blockchains.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Top Gainers */}
          <div className="glass-panel p-6 rounded-3xl border border-border/40 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-success/[0.03] to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold">Top Gainers (24h)</h3>
              </div>
              <Badge pulse color="success" />
            </div>
            
            <div className="space-y-3 relative">
              {gainers.map((coin) => (
                <MoverRow 
                  key={coin.symbol} 
                  coin={coin} 
                  isFavorite={isFavorite(coin.symbol)} 
                  onFavorite={() => handleFavoriteClick(coin.symbol, coin.name)} 
                  isPositive={true}
                />
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="glass-panel p-6 rounded-3xl border border-border/40 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-danger/[0.03] to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-danger/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-danger" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold">Top Losers (24h)</h3>
              </div>
              <Badge pulse color="danger" />
            </div>
            
            <div className="space-y-3 relative">
              {losers.map((coin) => (
                <MoverRow 
                  key={coin.symbol} 
                  coin={coin} 
                  isFavorite={isFavorite(coin.symbol)} 
                  onFavorite={() => handleFavoriteClick(coin.symbol, coin.name)} 
                  isPositive={false}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full px-6 hover:bg-muted/50 border-border/50 bg-card/40 backdrop-blur-md">
            <Link to="/explorer">
              View All Market Data
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Mini glowing badge helper
function Badge({ pulse, color }: { pulse?: boolean, color: 'success' | 'danger' }) {
  const isSuccess = color === 'success';
  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase", 
      isSuccess ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
    )}>
      {pulse && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isSuccess ? "bg-success" : "bg-danger")} />}
      Live
    </div>
  );
}

interface MoverRowProps {
  coin: any;
  isFavorite: boolean;
  onFavorite: () => void;
  isPositive: boolean;
}

function MoverRow({ coin, isFavorite, onFavorite, isPositive }: MoverRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors group/row">
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite();
          }}
          className="p-1.5 hover:bg-background rounded-md transition-colors"
          aria-label={isFavorite ? `Remove ${coin.name} from favorites` : `Add ${coin.name} to favorites`}
        >
          <Star className={cn("w-4 h-4 transition-colors", isFavorite ? "fill-warning text-warning" : "text-muted-foreground")} />
        </button>
        <Link to={`/price-prediction/${coin.name.toLowerCase()}/daily`} className="flex items-center gap-2">
          {coin.image && (
            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
          )}
          <div>
            <div className="font-bold text-sm text-foreground group-hover/row:text-primary transition-colors">{coin.symbol}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-none">{coin.name}</div>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Sparkline visualization */}
        <div className="hidden sm:block">
          <Sparkline isPositive={isPositive} />
        </div>
        
        <div className="text-right">
          <div className="font-mono text-sm font-medium text-foreground">
            ${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price > 100 ? 0 : 4 })}
          </div>
          <div className={cn("text-xs font-medium flex items-center justify-end gap-1 mt-0.5", isPositive ? "text-success" : "text-danger")}>
            {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}
