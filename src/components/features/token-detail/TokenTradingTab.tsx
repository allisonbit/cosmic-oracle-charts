import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCompact, formatChange } from "@/lib/formatters";

interface TokenTradingTabProps {
  token: any;
  derivedMetrics: any;
}

export function TokenTradingTab({ token, derivedMetrics }: TokenTradingTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buy/Sell Ratio */}
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Buy/Sell Pressure (24h)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(token.buys24h || token.sells24h) ? (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-success font-medium">Buys: {(token.buys24h || 0).toLocaleString()}</span>
                  <span className="text-danger font-medium">Sells: {(token.sells24h || 0).toLocaleString()}</span>
                </div>
                <div className="h-4 rounded-full bg-danger/30 overflow-hidden">
                  <div className="h-full bg-success rounded-full transition-all duration-700"
                    style={{ width: `${((token.buys24h || 0) / Math.max(1, (token.buys24h || 0) + (token.sells24h || 0))) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-2 rounded bg-success/5 border border-success/20 text-center">
                    <p className="text-xs text-success">Buy Pressure</p>
                    <p className="text-lg font-bold text-success">{(derivedMetrics?.buyPressure ?? 50).toFixed(1)}%</p>
                  </div>
                  <div className="p-2 rounded bg-danger/5 border border-danger/20 text-center">
                    <p className="text-xs text-danger">Sell Pressure</p>
                    <p className="text-lg font-bold text-danger">{(100 - (derivedMetrics?.buyPressure || 50)).toFixed(1)}%</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Transaction data not available</p>
            )}
          </CardContent>
        </Card>

        {/* Liquidity & Volume Deep Dive */}
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Liquidity & Volume</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Liquidity</span>
              <span className="text-sm font-mono font-medium">{formatCompact(token.liquidity)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">24h Volume</span>
              <span className="text-sm font-mono font-medium">{formatCompact(token.volume24h)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Vol/Liq Ratio</span>
              <span className={cn("text-sm font-mono font-medium",
                derivedMetrics && derivedMetrics.volLiqRatio > 1 ? "text-warning" : "text-foreground"
              )}>
                {derivedMetrics ? (derivedMetrics.volLiqRatio * 100).toFixed(1) + '%' : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Avg Tx Size</span>
              <span className="text-sm font-mono font-medium">{formatCompact(derivedMetrics?.avgTxSize)}</span>
            </div>
            {token.dexId && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">DEX</span>
                <span className="text-sm font-medium capitalize">{token.dexId}</span>
              </div>
            )}
            <div className="p-2 rounded bg-muted/50 mt-2">
              <p className="text-[10px] text-muted-foreground">
                {derivedMetrics && derivedMetrics.volLiqRatio > 2
                  ? '⚠️ Volume significantly exceeds liquidity — potential for high slippage'
                  : derivedMetrics && derivedMetrics.volLiqRatio > 0.5
                  ? '📊 Healthy volume-to-liquidity ratio'
                  : '💤 Low trading activity relative to liquidity'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-timeframe changes */}
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Price Changes</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '5m', val: token.change5m },
              { label: '1h', val: token.change1h },
              { label: '24h', val: token.change24h },
            ].map(t => (
              <div key={t.label} className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">{t.label}</p>
                <p className={cn("text-sm font-bold font-mono", (t.val || 0) >= 0 ? "text-success" : "text-danger")}>
                  {formatChange(t.val)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
