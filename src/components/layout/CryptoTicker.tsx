import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const tickerData = [
  { symbol: "BTC", name: "Bitcoin", price: 67842.50, change: 2.34 },
  { symbol: "ETH", name: "Ethereum", price: 3521.80, change: -0.87 },
  { symbol: "BNB", name: "BNB", price: 584.20, change: 1.45 },
  { symbol: "SOL", name: "Solana", price: 142.30, change: 5.67 },
  { symbol: "XRP", name: "Ripple", price: 0.62, change: -1.23 },
  { symbol: "ADA", name: "Cardano", price: 0.45, change: 3.21 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.12, change: 8.90 },
  { symbol: "DOT", name: "Polkadot", price: 7.85, change: -2.15 },
];

export function CryptoTicker() {
  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div className="w-full overflow-hidden bg-muted/50 border-y border-primary/20 py-3">
      <div className="ticker flex gap-12">
        {duplicatedData.map((coin, index) => (
          <div
            key={`${coin.symbol}-${index}`}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <span className="font-display font-bold text-primary">
              {coin.symbol}
            </span>
            <span className="text-foreground font-medium">
              ${coin.price.toLocaleString()}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                coin.change >= 0 ? "text-success" : "text-danger"
              )}
            >
              {coin.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {coin.change >= 0 ? "+" : ""}
              {coin.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
