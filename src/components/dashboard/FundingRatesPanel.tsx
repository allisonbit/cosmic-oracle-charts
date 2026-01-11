import { DollarSign, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFundingRates } from "@/hooks/useFundingRates";

export function FundingRatesPanel() {
  const { data, isLoading, error } = useFundingRates({
    refreshInterval: 30000
  });

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
          <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          <span className="hidden sm:inline">Live</span>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">Failed to load funding rates</span>
        </div>
      ) : (
        <>
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
                {(data?.fundingRates || []).map((item) => (
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
                {(!data?.fundingRates || data.fundingRates.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-foreground">
                      Loading funding rates...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.sources && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[10px] sm:text-xs text-muted-foreground">
              <span>Sources:</span>
              <div className="flex items-center gap-1">
                {data.sources.binance ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-danger" />
                )}
                <span>Binance</span>
              </div>
              <div className="flex items-center gap-1">
                {data.sources.bybit ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-danger" />
                )}
                <span>Bybit</span>
              </div>
              <div className="flex items-center gap-1">
                {data.sources.okx ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-danger" />
                )}
                <span>OKX</span>
              </div>
            </div>
          )}

          <div className="mt-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className="text-success">Positive</span> = Longs pay Shorts | <span className="text-danger">Negative</span> = Shorts pay Longs
          </div>
        </>
      )}
    </div>
  );
}
