import { Activity, ArrowUpRight, ArrowDownRight, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Trade {
  symbol: string;
  side: "buy" | "sell";
  price: number;
  amount: number;
  value: number;
  time: Date;
  exchange: string;
}

export function RecentTradesPanel() {
  const { data } = useMarketData();
  const topCoins = data?.topCoins || [];
  const [trades, setTrades] = useState<Trade[]>([]);

  // Simulate live trades from market data
  useEffect(() => {
    if (topCoins.length === 0) return;
    
    const generateTrades = () => {
      const newTrades: Trade[] = Array.from({ length: 15 }, () => {
        const coin = topCoins[Math.floor(Math.random() * Math.min(topCoins.length, 20))];
        if (!coin) return null;
        const side: "buy" | "sell" = Math.random() > 0.45 ? "buy" : "sell";
        const amount = (Math.random() * 50 + 0.1) * (100000 / coin.price);
        const exchanges = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit"];
        return {
          symbol: coin.symbol,
          side,
          price: coin.price * (1 + (Math.random() - 0.5) * 0.002),
          amount,
          value: amount * coin.price,
          time: new Date(Date.now() - Math.random() * 60000),
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        };
      }).filter(Boolean) as Trade[];
      
      setTrades(newTrades.sort((a, b) => b.time.getTime() - a.time.getTime()));
    };

    generateTrades();
    const interval = setInterval(generateTrades, 8000);
    return () => clearInterval(interval);
  }, [topCoins]);

  function formatValue(num: number): string {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  }

  return (
    <div className="holo-card p-4 sm:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
        LIVE TRADE FLOW
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">Streaming</span>
        </div>
      </h3>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {trades.map((trade, i) => (
          <Link
            key={`${trade.symbol}-${i}`}
            to={`/price-prediction/${trade.symbol.toLowerCase()}/daily`}
            className={cn(
              "flex items-center gap-2 sm:gap-3 p-2 rounded-lg text-xs sm:text-sm hover:bg-muted/30 transition-all animate-fade-in",
              i === 0 && "bg-muted/10"
            )}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
              trade.side === "buy" ? "bg-success/20" : "bg-danger/20"
            )}>
              {trade.side === "buy" 
                ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                : <ArrowDownRight className="w-3.5 h-3.5 text-danger" />
              }
            </div>
            
            <span className="font-display font-bold text-primary w-12 sm:w-14">{trade.symbol}</span>
            
            <span className={cn(
              "font-bold w-10 text-center flex-shrink-0",
              trade.side === "buy" ? "text-success" : "text-danger"
            )}>
              {trade.side.toUpperCase()}
            </span>
            
            <span className="text-muted-foreground flex-1 text-right hidden sm:block">
              {formatValue(trade.value)}
            </span>
            
            <span className="text-muted-foreground w-14 sm:w-16 text-right text-[10px] sm:text-xs">{trade.exchange}</span>
            
            <span className="text-muted-foreground text-[10px] w-8 text-right flex-shrink-0">
              {Math.floor((Date.now() - trade.time.getTime()) / 1000)}s
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}