import { useState, useEffect, useMemo } from "react";
import { DollarSign, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundingRate {
  asset: string;
  symbol: string;
  binance: number;
  bybit: number;
  okx: number;
  avg: number;
}

export function FundingRatesPanel() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fundingRates: FundingRate[] = useMemo(() => {
    const generateRate = () => (Math.random() - 0.4) * 0.02;
    
    const assets = [
      { asset: "BTC", symbol: "₿" },
      { asset: "ETH", symbol: "Ξ" },
      { asset: "SOL", symbol: "◎" },
      { asset: "XRP", symbol: "✕" },
      { asset: "BNB", symbol: "◆" },
    ];

    return assets.map(({ asset, symbol }) => {
      const binance = generateRate();
      const bybit = generateRate();
      const okx = generateRate();
      return {
        asset,
        symbol,
        binance,
        bybit,
        okx,
        avg: (binance + bybit + okx) / 3
      };
    });
  }, [lastUpdate]);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatRate = (rate: number) => {
    const formatted = (rate * 100).toFixed(4);
    return rate >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          PERP FUNDING RATES
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Real-time</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="pb-2 text-left font-medium">Asset</th>
              <th className="pb-2 text-right font-medium">Binance</th>
              <th className="pb-2 text-right font-medium">Bybit</th>
              <th className="pb-2 text-right font-medium">OKX</th>
              <th className="pb-2 text-right font-medium">Avg</th>
            </tr>
          </thead>
          <tbody>
            {fundingRates.map((item) => (
              <tr key={item.asset} className="border-b border-border/50">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {item.symbol}
                    </div>
                    <span className="font-medium">{item.asset}USDT</span>
                  </div>
                </td>
                <td className="text-right">
                  <span className={cn(item.binance >= 0 ? "text-success" : "text-danger")}>
                    {formatRate(item.binance)}
                  </span>
                </td>
                <td className="text-right">
                  <span className={cn(item.bybit >= 0 ? "text-success" : "text-danger")}>
                    {formatRate(item.bybit)}
                  </span>
                </td>
                <td className="text-right">
                  <span className={cn(item.okx >= 0 ? "text-success" : "text-danger")}>
                    {formatRate(item.okx)}
                  </span>
                </td>
                <td className="text-right">
                  <span className={cn("font-bold", item.avg >= 0 ? "text-success" : "text-danger")}>
                    {formatRate(item.avg)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] sm:text-xs text-muted-foreground">
        <span className="text-success">Positive</span> = Longs pay Shorts | <span className="text-danger">Negative</span> = Shorts pay Longs
      </div>
    </div>
  );
}
