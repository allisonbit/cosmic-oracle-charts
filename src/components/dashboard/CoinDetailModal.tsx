import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Activity, Clock, AlertTriangle, Target, BarChart3, Zap, Brain, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  rank?: number;
}

interface CoinDetailModalProps {
  coin: CoinData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export function CoinDetailModal({ coin, open, onOpenChange }: CoinDetailModalProps) {
  if (!coin) return null;

  const trend = coin.change24h >= 2 ? "BULLISH" : coin.change24h <= -2 ? "BEARISH" : "NEUTRAL";
  const isPositive = coin.change24h >= 0;

  // Generate mock chart data
  const chartData = useMemo(() => {
    const points = Array.from({ length: 48 }, (_, i) => ({
      time: `${i}h`,
      price: coin.price * (0.92 + Math.random() * 0.16),
    }));
    points[points.length - 1].price = coin.price;
    return points;
  }, [coin.price]);

  // Generate analysis based on the coin's performance
  const analysis = useMemo(() => {
    const volatility = Math.abs(coin.change24h) > 5 ? "high" : Math.abs(coin.change24h) > 2 ? "moderate" : "low";
    const volumeToMcap = (coin.volume / coin.marketCap) * 100;
    const liquiditySignal = volumeToMcap > 10 ? "high" : volumeToMcap > 3 ? "normal" : "low";
    
    const whyMoving = [];
    if (coin.change24h > 5) {
      whyMoving.push("Strong buying pressure detected across exchanges");
      whyMoving.push("Positive momentum from recent market sentiment");
    } else if (coin.change24h > 2) {
      whyMoving.push("Gradual accumulation pattern observed");
      whyMoving.push("Market showing healthy interest");
    } else if (coin.change24h < -5) {
      whyMoving.push("Significant sell pressure from large holders");
      whyMoving.push("Market correction in progress");
    } else if (coin.change24h < -2) {
      whyMoving.push("Profit-taking activity detected");
      whyMoving.push("Short-term consolidation phase");
    } else {
      whyMoving.push("Price consolidating within range");
      whyMoving.push("Waiting for market direction signal");
    }

    return { volatility, liquiditySignal, volumeToMcap, whyMoving };
  }, [coin]);

  // Support and resistance levels
  const levels = useMemo(() => ({
    strongSupport: coin.price * 0.85,
    support: coin.price * 0.95,
    resistance: coin.price * 1.05,
    strongResistance: coin.price * 1.15,
  }), [coin.price]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-display font-bold text-primary">{coin.symbol[0]}</span>
            </div>
            <div>
              <span className="font-display text-xl">{coin.symbol}</span>
              <span className="text-muted-foreground ml-2 text-sm">{coin.name}</span>
            </div>
            <span className={cn(
              "ml-auto text-sm font-display font-bold px-3 py-1 rounded-full",
              trend === "BULLISH" ? "text-success bg-success/20" : trend === "BEARISH" ? "text-danger bg-danger/20" : "text-warning bg-warning/20"
            )}>
              {trend}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Price & Change */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="holo-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Current Price</div>
              <div className="text-xl font-bold">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="holo-card p-4">
              <div className="text-xs text-muted-foreground mb-1">24h Change</div>
              <div className={cn("text-xl font-bold flex items-center gap-1", isPositive ? "text-success" : "text-danger")}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
              </div>
            </div>
            <div className="holo-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Volume 24h</div>
              <div className="text-xl font-bold">{formatNumber(coin.volume)}</div>
            </div>
            <div className="holo-card p-4">
              <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
              <div className="text-xl font-bold">{formatNumber(coin.marketCap)}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="holo-card p-4">
            <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              48H PRICE CHART
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="detailColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(230, 30%, 8%)",
                    border: "1px solid hsl(190, 100%, 50%, 0.3)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"}
                  strokeWidth={2}
                  fill="url(#detailColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Why is it moving */}
          <div className="holo-card p-4">
            <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              WHY IS {coin.symbol} MOVING?
            </h4>
            <div className="space-y-2">
              {analysis.whyMoving.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Levels */}
          <div className="holo-card p-4">
            <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              KEY LEVELS
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Support Levels</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-success/10 border border-success/20">
                    <span className="text-xs text-success">Strong Support</span>
                    <span className="font-bold text-sm">${levels.strongSupport.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-success/5 border border-success/10">
                    <span className="text-xs text-success/70">Support</span>
                    <span className="font-bold text-sm">${levels.support.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Resistance Levels</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-danger/5 border border-danger/10">
                    <span className="text-xs text-danger/70">Resistance</span>
                    <span className="font-bold text-sm">${levels.resistance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-danger/10 border border-danger/20">
                    <span className="text-xs text-danger">Strong Resistance</span>
                    <span className="font-bold text-sm">${levels.strongResistance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="holo-card p-4">
            <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              RISK ANALYSIS
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Volatility</div>
                <div className={cn(
                  "text-sm font-bold uppercase",
                  analysis.volatility === "high" ? "text-danger" : analysis.volatility === "moderate" ? "text-warning" : "text-success"
                )}>
                  {analysis.volatility}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Liquidity</div>
                <div className={cn(
                  "text-sm font-bold uppercase",
                  analysis.liquiditySignal === "high" ? "text-success" : analysis.liquiditySignal === "normal" ? "text-primary" : "text-warning"
                )}>
                  {analysis.liquiditySignal}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Vol/MCap</div>
                <div className="text-sm font-bold text-primary">
                  {analysis.volumeToMcap.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Timing Info */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Data refreshes automatically • Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
