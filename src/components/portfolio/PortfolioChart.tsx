import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface PortfolioChartProps {
  totalValue: number;
  holdings: Array<{
    symbol: string;
    value: number;
    change24h: number;
  }>;
}

type TimeRange = "24h" | "7d" | "30d";

export function PortfolioChart({ totalValue, holdings }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Generate simulated historical data based on current value and 24h change
  const chartData = useMemo(() => {
    const avgChange = holdings.length > 0
      ? holdings.reduce((sum, h) => sum + (h.change24h * h.value), 0) / Math.max(totalValue, 1)
      : 0;

    const points: { time: string; value: number; label: string }[] = [];
    const now = new Date();
    
    let numPoints: number;
    let intervalMs: number;
    let formatTime: (date: Date) => string;
    let multiplier: number;

    switch (timeRange) {
      case "24h":
        numPoints = 24;
        intervalMs = 60 * 60 * 1000; // 1 hour
        formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        multiplier = 1;
        break;
      case "7d":
        numPoints = 7;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        formatTime = (d) => d.toLocaleDateString([], { weekday: 'short' });
        multiplier = 3;
        break;
      case "30d":
        numPoints = 30;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        formatTime = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        multiplier = 7;
        break;
    }

    // Calculate starting value based on change
    const totalChange = (avgChange / 100) * multiplier;
    const startValue = totalValue / (1 + totalChange);

    for (let i = numPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * intervalMs));
      const progress = (numPoints - i) / numPoints;
      
      // Add some randomness for realistic chart
      const noise = (Math.random() - 0.5) * 0.02 * startValue;
      const value = startValue + (totalValue - startValue) * progress + noise;
      
      points.push({
        time: formatTime(date),
        value: Math.max(0, value),
        label: `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      });
    }

    return points;
  }, [totalValue, holdings, timeRange]);

  const startValue = chartData[0]?.value || 0;
  const endValue = chartData[chartData.length - 1]?.value || 0;
  const changePercent = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="holo-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-lg mb-1">Portfolio Performance</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded",
              isPositive ? "text-success bg-success/20" : "text-danger bg-danger/20"
            )}>
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {(["24h", "7d", "30d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                timeRange === range 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"} stopOpacity={0.4} />
                <stop offset="100%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"}
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
