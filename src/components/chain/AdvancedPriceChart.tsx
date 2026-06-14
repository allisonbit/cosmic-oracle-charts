import { useState, useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, Zap, Target } from "lucide-react";
import { usePriceSeries } from "@/hooks/usePriceSeries";

interface AdvancedPriceChartProps {
  chain: ChainConfig;
  priceData?: { price: number; change24h: number };
}

type ChartMode = "standard" | "ai-projection" | "volatility";

export function AdvancedPriceChart({ chain, priceData }: AdvancedPriceChartProps) {
  const [mode, setMode] = useState<ChartMode>("standard");
  const { data: series } = usePriceSeries(chain.symbol, 2, 48);

  // Real price series → real chart, real volatility, real support/resistance.
  // No Math.random.
  const chartData = useMemo(() => {
    if (!series || series.length === 0) return [] as any[];
    const prices = series.map((p) => p.price);
    const support = Math.min(...prices);
    const resistance = Math.max(...prices);

    const hist: any[] = series.map((pt, i) => {
      const d = new Date(pt.time);
      const prev = i > 0 ? prices[i - 1] : prices[i];
      const vol = i > 0 && prev ? Math.abs((pt.price - prev) / prev) * 100 : 0;
      return {
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        price: pt.price,
        aiProjection: null as number | null,
        volatility: vol,
        support,
        resistance,
        breakoutZone: vol > 1.5,
        dangerZone: vol > 2,
        isFuture: false,
      };
    });

    // Deterministic forward projection from the recent average REAL return.
    const n = prices.length;
    const lastPrice = prices[n - 1];
    const lookback = Math.min(12, n - 1);
    let avgRet = 0;
    for (let i = n - lookback; i < n; i++) avgRet += (prices[i] - prices[i - 1]) / prices[i - 1];
    avgRet = lookback > 0 ? avgRet / lookback : 0;
    if (hist.length) hist[hist.length - 1].aiProjection = lastPrice;

    const lastTime = new Date(series[n - 1].time).getTime();
    let proj = lastPrice;
    const future: any[] = [];
    for (let i = 1; i <= 12; i++) {
      proj = proj * (1 + avgRet);
      const d = new Date(lastTime + i * 3600000);
      future.push({
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        price: null,
        aiProjection: proj,
        volatility: 0,
        support,
        resistance,
        isFuture: true,
      });
    }
    return [...hist, ...future];
  }, [series]);

  const modes = [
    { id: "standard", label: "Standard", icon: TrendingUp },
    { id: "ai-projection", label: "AI Projection", icon: Target },
    { id: "volatility", label: "Volatility", icon: Zap },
  ];

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground">Price Analysis</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{chain.symbol}/USD</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as ChartMode)}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0",
                mode === m.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <m.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Price */}
      {priceData && (
        <div className="flex items-baseline gap-2 sm:gap-4 mb-3 sm:mb-4">
          <span className="text-xl sm:text-3xl font-display text-foreground glow-text">
            ${(priceData.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={cn(
            "text-sm sm:text-lg font-medium",
            priceData.change24h >= 0 ? "text-success" : "text-danger"
          )}>
            {priceData.change24h >= 0 ? "+" : ""}{(priceData.change24h ?? 0).toFixed(2)}%
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-[200px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${chain.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`hsl(${chain.color})`} stopOpacity={0.3} />
                <stop offset="100%" stopColor={`hsl(${chain.color})`} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ai-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(270 60% 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(270 60% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="volatility-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["dataMin * 0.98", "dataMax * 1.02"]}
              tickFormatter={(value) => `$${(value ?? 0).toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 0 20px hsl(var(--primary) / 0.2)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />

            {/* Support/Resistance lines for volatility mode */}
            {mode === "volatility" && (
              <>
                <ReferenceLine
                  y={chartData[0]?.support}
                  stroke="hsl(160 84% 39%)"
                  strokeDasharray="5 5"
                  label={{ value: "Support", fill: "hsl(160 84% 39%)", fontSize: 10 }}
                />
                <ReferenceLine
                  y={chartData[0]?.resistance}
                  stroke="hsl(0 84% 60%)"
                  strokeDasharray="5 5"
                  label={{ value: "Resistance", fill: "hsl(0 84% 60%)", fontSize: 10 }}
                />
              </>
            )}

            {/* Main price line */}
            <Area
              type="monotone"
              dataKey="price"
              stroke={`hsl(${chain.color})`}
              strokeWidth={2}
              fill={`url(#gradient-${chain.id})`}
              dot={false}
              connectNulls={false}
            />

            {/* AI Projection line */}
            {mode === "ai-projection" && (
              <Area
                type="monotone"
                dataKey="aiProjection"
                stroke="hsl(270 60% 50%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#ai-gradient)"
                dot={false}
                connectNulls
              />
            )}

            {/* Volatility overlay */}
            {mode === "volatility" && (
              <Area
                type="monotone"
                dataKey="volatility"
                stroke="hsl(38 92% 50%)"
                strokeWidth={1}
                fill="url(#volatility-gradient)"
                dot={false}
                yAxisId="volatility"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: `hsl(${chain.color})` }} />
          <span>Price</span>
        </div>
        {mode === "ai-projection" && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-secondary" />
            <span>AI Projection</span>
          </div>
        )}
        {mode === "volatility" && (
          <>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success" />
              <span>Support</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-danger" />
              <span>Resistance</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
