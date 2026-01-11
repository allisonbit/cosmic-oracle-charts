import { useState } from "react";
import { Book, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderBook } from "@/hooks/useOrderBook";

const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT"];
const EXCHANGES = ["binance", "coinbase", "kraken"];

const PAIR_LABELS: Record<string, string> = {
  BTCUSDT: "BTC/USDT",
  ETHUSDT: "ETH/USDT",
  SOLUSDT: "SOL/USDT",
  XRPUSDT: "XRP/USDT"
};

const EXCHANGE_LABELS: Record<string, string> = {
  binance: "Binance",
  coinbase: "Coinbase",
  kraken: "Kraken"
};

export function OrderBookPanel() {
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");
  const [selectedExchange, setSelectedExchange] = useState("binance");

  const { data, isLoading, error } = useOrderBook({
    pair: selectedPair,
    exchange: selectedExchange,
    limit: 8,
    refreshInterval: 3000
  });

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const maxTotal = Math.max(
    data?.bids[data.bids.length - 1]?.total || 0, 
    data?.asks[data.asks.length - 1]?.total || 0
  );

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Book className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          ORDER BOOK DEPTH
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PAIRS.map(pair => (
              <option key={pair} value={pair}>{PAIR_LABELS[pair]}</option>
            ))}
          </select>
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {EXCHANGES.map(ex => (
              <option key={ex} value={ex}>{EXCHANGE_LABELS[ex]}</option>
            ))}
          </select>
          <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isLoading && "animate-spin")} />
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">Failed to load order book</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Bids */}
            <div>
              <div className="text-xs sm:text-sm text-success font-medium mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                BIDS
              </div>
              <div className="space-y-0.5">
                {(data?.bids || []).map((bid, i) => (
                  <div key={i} className="relative flex justify-between text-[10px] sm:text-xs font-mono py-1 px-1">
                    <div 
                      className="absolute inset-0 bg-success/10" 
                      style={{ width: `${maxTotal > 0 ? (bid.total / maxTotal) * 100 : 0}%` }}
                    />
                    <span className="relative text-success">{formatPrice(bid.price)}</span>
                    <span className="relative text-muted-foreground">{bid.amount.toFixed(4)}</span>
                  </div>
                ))}
                {(!data?.bids || data.bids.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground text-xs">Loading...</div>
                )}
              </div>
            </div>

            {/* Asks */}
            <div>
              <div className="text-xs sm:text-sm text-danger font-medium mb-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                ASKS
              </div>
              <div className="space-y-0.5">
                {(data?.asks || []).map((ask, i) => (
                  <div key={i} className="relative flex justify-between text-[10px] sm:text-xs font-mono py-1 px-1">
                    <div 
                      className="absolute inset-0 bg-danger/10 right-0 left-auto" 
                      style={{ width: `${maxTotal > 0 ? (ask.total / maxTotal) * 100 : 0}%` }}
                    />
                    <span className="relative text-danger">{formatPrice(ask.price)}</span>
                    <span className="relative text-muted-foreground">{ask.amount.toFixed(4)}</span>
                  </div>
                ))}
                {(!data?.asks || data.asks.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground text-xs">Loading...</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground">Spread: </span>
              <span className="text-foreground font-medium">${(data?.spread || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Depth: </span>
              <span className="text-foreground font-medium">${((data?.totalDepth || 0) / 1e6).toFixed(2)}M</span>
            </div>
            <div>
              <span className="text-muted-foreground">Imbalance: </span>
              <span className={cn("font-medium", (data?.imbalance || 0) >= 0 ? "text-success" : "text-danger")}>
                {(data?.imbalance || 0) >= 0 ? "+" : ""}{(data?.imbalance || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
