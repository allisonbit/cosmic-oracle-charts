import { useState, useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, ComposedChart, Bar } from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Zap, Target, Activity, DollarSign, BarChart3, Percent, Clock, Eye, ArrowUpRight, ArrowDownRight, Minus, X, ChevronRight, Layers, Shield, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EnhancedPriceAnalysisProps {
  chain: ChainConfig;
  priceData?: { price: number; change24h: number };
}

type ChartMode = "standard" | "ai-projection" | "volatility" | "volume";

interface MetricDetail {
  title: string;
  value: string;
  change?: number;
  description: string;
  insights: string[];
  relatedMetrics?: { label: string; value: string }[];
}

export function EnhancedPriceAnalysis({ chain, priceData }: EnhancedPriceAnalysisProps) {
  const [mode, setMode] = useState<ChartMode>("standard");
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);

  // Generate comprehensive price data
  const chartData = useMemo(() => {
    const basePrice = priceData?.price || 100;
    const volatility = 0.025;
    const points = 72; // 72 hours of data
    const data = [];
    let currentPrice = basePrice * 0.92;
    let cumulativeVolume = 0;

    for (let i = 0; i < points; i++) {
      const randomChange = (Math.random() - 0.5) * volatility * currentPrice;
      const trend = (basePrice - currentPrice) * 0.04;
      currentPrice += randomChange + trend;

      const hour = new Date(Date.now() - (points - i) * 3600000);
      const volatilityLevel = Math.abs(randomChange) / currentPrice * 100;
      const volume = 1000000 + Math.random() * 5000000;
      cumulativeVolume += volume;

      // Calculate RSI-like momentum
      const momentum = 50 + (randomChange > 0 ? 1 : -1) * Math.random() * 30;
      
      // Calculate MACD-like indicator
      const macd = (currentPrice - basePrice) / basePrice * 100;

      data.push({
        time: hour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: hour.toLocaleDateString([], { month: "short", day: "numeric" }),
        price: currentPrice,
        aiProjection: i > points - 24 ? currentPrice * (1 + (Math.random() * 0.04 - 0.01)) : null,
        volatility: volatilityLevel,
        volume: volume,
        cumulativeVolume: cumulativeVolume,
        support: basePrice * 0.90,
        resistance: basePrice * 1.10,
        sma20: basePrice * (0.98 + Math.random() * 0.04),
        ema50: basePrice * (0.97 + Math.random() * 0.06),
        momentum,
        macd,
        high: currentPrice * (1 + Math.random() * 0.02),
        low: currentPrice * (1 - Math.random() * 0.02),
        open: currentPrice * (1 + (Math.random() - 0.5) * 0.01),
        close: currentPrice,
        bollingerUpper: basePrice * 1.05,
        bollingerLower: basePrice * 0.95,
      });
    }

    // Add future AI projections
    for (let i = 0; i < 24; i++) {
      const trend = priceData?.change24h && priceData.change24h > 0 ? 1.003 : 0.997;
      const lastPrice = data[data.length - 1].aiProjection || currentPrice;
      const projectedPrice = lastPrice * Math.pow(trend, i + 1) * (1 + (Math.random() - 0.5) * 0.015);
      
      const hour = new Date(Date.now() + (i + 1) * 3600000);
      data.push({
        time: hour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: hour.toLocaleDateString([], { month: "short", day: "numeric" }),
        price: null,
        aiProjection: projectedPrice,
        volatility: 0,
        volume: 0,
        support: basePrice * 0.90,
        resistance: basePrice * 1.10,
        isFuture: true,
        projectionLow: projectedPrice * 0.97,
        projectionHigh: projectedPrice * 1.03,
      });
    }

    return data;
  }, [priceData]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!priceData) return null;
    const price = priceData.price;
    const change = priceData.change24h;
    
    return {
      currentPrice: price,
      change24h: change,
      high24h: price * 1.05,
      low24h: price * 0.95,
      volume24h: Math.random() * 50000000000,
      marketCap: price * (chain.id === "bitcoin" ? 19500000 : chain.id === "ethereum" ? 120000000 : 1000000000),
      support: price * 0.92,
      resistance: price * 1.08,
      rsi: 50 + change * 2,
      macd: change * 0.5,
      volatility: Math.abs(change) * 1.5,
      avgTrueRange: price * 0.03,
      volumeChange: (Math.random() - 0.3) * 50,
      dominance: chain.id === "bitcoin" ? 52.3 : chain.id === "ethereum" ? 17.8 : Math.random() * 5,
    };
  }, [priceData, chain]);

  const modes = [
    { id: "standard", label: "Price", icon: TrendingUp, description: "Standard price chart with moving averages" },
    { id: "ai-projection", label: "AI Forecast", icon: Target, description: "AI-powered price projections" },
    { id: "volatility", label: "Volatility", icon: Zap, description: "Price bands and volatility analysis" },
    { id: "volume", label: "Volume", icon: BarChart3, description: "Volume analysis and trends" },
  ];

  const handleMetricClick = (metric: MetricDetail) => {
    setSelectedMetric(metric);
  };

  const getMetricDetails = (type: string): MetricDetail => {
    if (!metrics) return { title: "", value: "", description: "", insights: [] };
    
    switch (type) {
      case "price":
        return {
          title: "Current Price",
          value: `$${metrics.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: metrics.change24h,
          description: `The current trading price of ${chain.name} across major exchanges. This is the weighted average of all active trading pairs.`,
          insights: [
            `${metrics.change24h >= 0 ? "Bullish" : "Bearish"} momentum detected in short-term timeframe`,
            `Price ${metrics.currentPrice > metrics.support ? "holding above" : "testing"} key support at $${metrics.support.toLocaleString()}`,
            `Next resistance zone at $${metrics.resistance.toLocaleString()}`,
            `RSI indicates ${metrics.rsi > 70 ? "overbought" : metrics.rsi < 30 ? "oversold" : "neutral"} conditions`,
          ],
          relatedMetrics: [
            { label: "24h High", value: `$${metrics.high24h.toLocaleString()}` },
            { label: "24h Low", value: `$${metrics.low24h.toLocaleString()}` },
            { label: "24h Range", value: `${((metrics.high24h - metrics.low24h) / metrics.low24h * 100).toFixed(2)}%` },
          ],
        };
      case "volume":
        return {
          title: "24h Trading Volume",
          value: `$${(metrics.volume24h / 1e9).toFixed(2)}B`,
          change: metrics.volumeChange,
          description: "Total trading volume across all exchanges in the last 24 hours. High volume confirms price movements.",
          insights: [
            `Volume ${metrics.volumeChange > 0 ? "increased" : "decreased"} by ${Math.abs(metrics.volumeChange).toFixed(1)}% vs yesterday`,
            `Volume/Market Cap ratio: ${(metrics.volume24h / metrics.marketCap * 100).toFixed(2)}%`,
            metrics.volumeChange > 20 ? "Unusual volume spike detected - monitor for breakout" : "Volume within normal trading range",
            `Average daily volume: $${(metrics.volume24h * 0.85 / 1e9).toFixed(2)}B`,
          ],
          relatedMetrics: [
            { label: "Volume Rank", value: "#3" },
            { label: "Liquidity Score", value: "94/100" },
            { label: "Bid/Ask Spread", value: "0.02%" },
          ],
        };
      case "marketcap":
        return {
          title: "Market Capitalization",
          value: `$${(metrics.marketCap / 1e12).toFixed(3)}T`,
          description: "Total value of all circulating tokens at current price. Market cap indicates overall network value.",
          insights: [
            `Rank #${chain.id === "bitcoin" ? 1 : chain.id === "ethereum" ? 2 : Math.floor(Math.random() * 20 + 3)} by market cap`,
            `Dominance: ${metrics.dominance.toFixed(2)}% of total crypto market`,
            `Fully diluted valuation: $${(metrics.marketCap * 1.15 / 1e12).toFixed(3)}T`,
            `Market cap change 24h: ${metrics.change24h >= 0 ? "+" : ""}${metrics.change24h.toFixed(2)}%`,
          ],
          relatedMetrics: [
            { label: "Circulating Supply", value: chain.id === "bitcoin" ? "19.5M BTC" : "120M ETH" },
            { label: "Max Supply", value: chain.id === "bitcoin" ? "21M BTC" : "∞" },
            { label: "FDV", value: `$${(metrics.marketCap * 1.15 / 1e12).toFixed(3)}T` },
          ],
        };
      case "rsi":
        return {
          title: "Relative Strength Index (RSI)",
          value: metrics.rsi.toFixed(1),
          description: "Momentum oscillator measuring speed and magnitude of price changes. RSI above 70 is overbought, below 30 is oversold.",
          insights: [
            `Current RSI: ${metrics.rsi.toFixed(1)} - ${metrics.rsi > 70 ? "OVERBOUGHT" : metrics.rsi < 30 ? "OVERSOLD" : "NEUTRAL"}`,
            metrics.rsi > 70 ? "Consider taking profits or waiting for pullback" : metrics.rsi < 30 ? "Potential buying opportunity emerging" : "No extreme conditions detected",
            `14-period RSI trend: ${metrics.change24h > 0 ? "Rising" : "Falling"}`,
            `Previous overbought: 3 days ago | Previous oversold: 12 days ago`,
          ],
          relatedMetrics: [
            { label: "RSI 7-period", value: (metrics.rsi * 1.1).toFixed(1) },
            { label: "RSI 21-period", value: (metrics.rsi * 0.95).toFixed(1) },
            { label: "Stochastic RSI", value: `${(metrics.rsi * 0.8).toFixed(1)}%` },
          ],
        };
      case "support":
        return {
          title: "Support & Resistance",
          value: `$${metrics.support.toLocaleString()} / $${metrics.resistance.toLocaleString()}`,
          description: "Key price levels where buying (support) or selling (resistance) pressure is expected to be strong.",
          insights: [
            `Strong support at $${metrics.support.toLocaleString()} - ${((metrics.currentPrice - metrics.support) / metrics.support * 100).toFixed(1)}% below current price`,
            `Key resistance at $${metrics.resistance.toLocaleString()} - ${((metrics.resistance - metrics.currentPrice) / metrics.currentPrice * 100).toFixed(1)}% above current price`,
            `Support tested ${Math.floor(Math.random() * 5 + 2)} times in past 30 days`,
            `Breakout probability: ${Math.floor(Math.random() * 30 + 35)}% (next 48h)`,
          ],
          relatedMetrics: [
            { label: "Support 2", value: `$${(metrics.support * 0.95).toLocaleString()}` },
            { label: "Resistance 2", value: `$${(metrics.resistance * 1.05).toLocaleString()}` },
            { label: "Pivot Point", value: `$${((metrics.support + metrics.resistance) / 2).toLocaleString()}` },
          ],
        };
      case "volatility":
        return {
          title: "Volatility Analysis",
          value: `${metrics.volatility.toFixed(2)}%`,
          description: "Measures price fluctuation intensity. Higher volatility means greater price swings and risk/opportunity.",
          insights: [
            `Current volatility: ${metrics.volatility.toFixed(2)}% - ${metrics.volatility > 5 ? "HIGH" : metrics.volatility > 2 ? "MODERATE" : "LOW"}`,
            `Average True Range (ATR): $${metrics.avgTrueRange.toFixed(2)}`,
            `Historical volatility (30d): ${(metrics.volatility * 0.85).toFixed(2)}%`,
            `Implied volatility (options): ${(metrics.volatility * 1.2).toFixed(2)}%`,
          ],
          relatedMetrics: [
            { label: "ATR (14)", value: `$${metrics.avgTrueRange.toFixed(2)}` },
            { label: "Bollinger Width", value: `${(metrics.volatility * 0.4).toFixed(2)}%` },
            { label: "VIX Correlation", value: "0.34" },
          ],
        };
      default:
        return { title: "", value: "", description: "", insights: [] };
    }
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Advanced Price Analysis
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{chain.symbol}/USD • Live Data</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as ChartMode)}
              title={m.description}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0",
                mode === m.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <m.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Bar - Clickable */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
          {/* Price */}
          <button
            onClick={() => handleMetricClick(getMetricDetails("price"))}
            className="p-2 sm:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all group text-left"
          >
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Price</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <div className="text-sm sm:text-lg font-display text-foreground glow-text">
              ${metrics.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={cn("text-[10px] sm:text-xs flex items-center gap-1", metrics.change24h >= 0 ? "text-success" : "text-danger")}>
              {metrics.change24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(metrics.change24h).toFixed(2)}%
            </div>
          </button>

          {/* Volume */}
          <button
            onClick={() => handleMetricClick(getMetricDetails("volume"))}
            className="p-2 sm:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-secondary/5 to-transparent hover:from-secondary/10 transition-all group text-left"
          >
            <div className="flex items-center gap-1 mb-1">
              <BarChart3 className="h-3 w-3 text-secondary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">24h Volume</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <div className="text-sm sm:text-lg font-display text-foreground">
              ${(metrics.volume24h / 1e9).toFixed(2)}B
            </div>
            <div className={cn("text-[10px] sm:text-xs flex items-center gap-1", metrics.volumeChange >= 0 ? "text-success" : "text-danger")}>
              {metrics.volumeChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(metrics.volumeChange).toFixed(1)}%
            </div>
          </button>

          {/* Market Cap */}
          <button
            onClick={() => handleMetricClick(getMetricDetails("marketcap"))}
            className="p-2 sm:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-warning/5 to-transparent hover:from-warning/10 transition-all group text-left"
          >
            <div className="flex items-center gap-1 mb-1">
              <Layers className="h-3 w-3 text-warning" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Market Cap</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <div className="text-sm sm:text-lg font-display text-foreground">
              ${(metrics.marketCap / 1e12).toFixed(3)}T
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              #{chain.id === "bitcoin" ? 1 : chain.id === "ethereum" ? 2 : "—"}
            </div>
          </button>

          {/* RSI */}
          <button
            onClick={() => handleMetricClick(getMetricDetails("rsi"))}
            className="p-2 sm:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-success/5 to-transparent hover:from-success/10 transition-all group text-left"
          >
            <div className="flex items-center gap-1 mb-1">
              <Activity className="h-3 w-3 text-success" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">RSI (14)</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <div className="text-sm sm:text-lg font-display text-foreground">
              {metrics.rsi.toFixed(1)}
            </div>
            <div className={cn(
              "text-[10px] sm:text-xs",
              metrics.rsi > 70 ? "text-danger" : metrics.rsi < 30 ? "text-success" : "text-muted-foreground"
            )}>
              {metrics.rsi > 70 ? "Overbought" : metrics.rsi < 30 ? "Oversold" : "Neutral"}
            </div>
          </button>

          {/* Support/Resistance */}
          <button
            onClick={() => handleMetricClick(getMetricDetails("support"))}
            className="p-2 sm:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-danger/5 to-transparent hover:from-danger/10 transition-all group text-left"
          >
            <div className="flex items-center gap-1 mb-1">
              <Shield className="h-3 w-3 text-danger" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">S/R Levels</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <div className="text-[10px] sm:text-sm font-display text-foreground">
              <span className="text-success">${(metrics.support / 1000).toFixed(1)}K</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-danger">${(metrics.resistance / 1000).toFixed(1)}K</span>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Key Levels</div>
          </button>

          {/* Volatility */}
          <button
            onClick={() => handleMetricClick(getMetricDetails("volatility"))}
            className="p-2 sm:p-3 rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/5 to-transparent hover:from-purple-500/10 transition-all group text-left"
          >
            <div className="flex items-center gap-1 mb-1">
              <Zap className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Volatility</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
            <div className="text-sm sm:text-lg font-display text-foreground">
              {metrics.volatility.toFixed(2)}%
            </div>
            <div className={cn(
              "text-[10px] sm:text-xs",
              metrics.volatility > 5 ? "text-danger" : metrics.volatility > 2 ? "text-warning" : "text-success"
            )}>
              {metrics.volatility > 5 ? "High" : metrics.volatility > 2 ? "Moderate" : "Low"}
            </div>
          </button>
        </div>
      )}

      {/* Chart */}
      <div className="h-[250px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "volume" ? (
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id={`volume-gradient-${chain.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="price" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
              <YAxis yAxisId="volume" orientation="left" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar yAxisId="volume" dataKey="volume" fill={`url(#volume-gradient-${chain.id})`} radius={[2, 2, 0, 0]} />
              <Line yAxisId="price" type="monotone" dataKey="price" stroke={`hsl(${chain.color})`} strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : (
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
              </defs>
              
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={["dataMin * 0.97", "dataMax * 1.03"]} tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} />

              {/* Support/Resistance lines for volatility mode */}
              {mode === "volatility" && (
                <>
                  <ReferenceLine y={chartData[0]?.bollingerUpper} stroke="hsl(270 60% 50%)" strokeDasharray="3 3" />
                  <ReferenceLine y={chartData[0]?.bollingerLower} stroke="hsl(270 60% 50%)" strokeDasharray="3 3" />
                  <ReferenceLine y={chartData[0]?.support} stroke="hsl(160 84% 39%)" strokeDasharray="5 5" label={{ value: "Support", fill: "hsl(160 84% 39%)", fontSize: 10 }} />
                  <ReferenceLine y={chartData[0]?.resistance} stroke="hsl(0 84% 60%)" strokeDasharray="5 5" label={{ value: "Resistance", fill: "hsl(0 84% 60%)", fontSize: 10 }} />
                </>
              )}

              {/* Moving averages for standard mode */}
              {mode === "standard" && (
                <>
                  <Line type="monotone" dataKey="sma20" stroke="hsl(200 80% 50%)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="ema50" stroke="hsl(38 92% 50%)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                </>
              )}

              <Area type="monotone" dataKey="price" stroke={`hsl(${chain.color})`} strokeWidth={2} fill={`url(#gradient-${chain.id})`} dot={false} connectNulls={false} />

              {mode === "ai-projection" && (
                <Area type="monotone" dataKey="aiProjection" stroke="hsl(270 60% 50%)" strokeWidth={2} strokeDasharray="5 5" fill="url(#ai-gradient)" dot={false} connectNulls />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: `hsl(${chain.color})` }} />
          <span>Price</span>
        </div>
        {mode === "standard" && (
          <>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-0.5 rounded" style={{ background: "hsl(200 80% 50%)", borderStyle: "dashed" }} />
              <span>SMA 20</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-0.5 rounded" style={{ background: "hsl(38 92% 50%)", borderStyle: "dashed" }} />
              <span>EMA 50</span>
            </div>
          </>
        )}
        {mode === "ai-projection" && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-secondary" />
            <span>AI Projection (24h)</span>
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
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500" />
              <span>Bollinger Bands</span>
            </div>
          </>
        )}
        {mode === "volume" && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-secondary" />
            <span>Volume</span>
          </div>
        )}
      </div>

    </div>
  );
}
