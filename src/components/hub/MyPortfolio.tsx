import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { PieChart, Wallet, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["hsl(220, 80%, 50%)", "hsl(200, 60%, 45%)", "hsl(160, 84%, 32%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(280, 60%, 50%)", "hsl(30, 80%, 55%)", "hsl(170, 50%, 40%)"];

export function MyPortfolio() {
  const { profile } = useAuth();
  const { data: prices } = useCryptoPrices();

  const watchlist: string[] = profile?.watchlist || [];

  // Derive portfolio from watchlist with simulated holdings
  const holdings = watchlist.map((symbol, i) => {
    const coin = prices ? Object.values(prices as Record<string, any>).find(
      (c: any) => c.symbol?.toUpperCase() === symbol
    ) : null;
    const price = coin?.current_price || coin?.usd || 0;
    const change = coin?.price_change_percentage_24h || 0;
    const qty = 1; // placeholder quantity
    return { symbol, price, change, qty, value: price * qty, name: coin?.name || symbol };
  });

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalChange = holdings.length > 0
    ? holdings.reduce((sum, h) => sum + h.change * (h.value / Math.max(totalValue, 1)), 0)
    : 0;

  const chartData = holdings.map(h => ({ name: h.symbol, value: h.value }));

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">No holdings yet</h3>
          <p className="text-muted-foreground">Add coins to your watchlist to see portfolio analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="p-5 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">24h Change</p>
          <p className={cn("text-2xl font-bold flex items-center gap-2", totalChange >= 0 ? "text-success" : "text-destructive")}>
            {totalChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)}%
          </p>
        </div>
        <div className="p-5 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Assets</p>
          <p className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> {holdings.length}
          </p>
        </div>
      </div>

      {/* Chart + Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {holdings.map((h, i) => (
              <div key={h.symbol} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{h.symbol}</span>
                <span className="font-medium text-foreground">
                  {totalValue > 0 ? ((h.value / totalValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings list */}
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Holdings</h3>
          <div className="space-y-3">
            {holdings.map(h => (
              <div key={h.symbol} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-bold text-foreground">{h.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-2">{h.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-foreground">${h.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  <p className={cn("text-xs", h.change >= 0 ? "text-success" : "text-destructive")}>
                    {h.change >= 0 ? "+" : ""}{h.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
