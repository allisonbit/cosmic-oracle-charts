import { useMemo, useState } from "react";
import { 
  Area, AreaChart, XAxis, YAxis, ResponsiveContainer, 
  ReferenceLine, ReferenceArea 
} from "recharts";
import { TrendingUp, TrendingDown, Target, Shield, Activity, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradingZone {
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
}

interface SignalChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  tradingZones?: TradingZone;
}

export function SignalChart({ symbol, name, currentPrice, bias, confidence, tradingZones }: SignalChartProps) {
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  // Generate realistic price data with trends
  const chartData = useMemo(() => {
    const points = timeframe === '1h' ? 60 : timeframe === '4h' ? 48 : timeframe === '1d' ? 30 : 52;
    const data = [];
    const volatility = currentPrice * 0.02; // 2% volatility
    const trend = bias === 'bullish' ? 0.001 : bias === 'bearish' ? -0.001 : 0;
    
    let price = currentPrice * (1 - (points * trend * 0.5)); // Start price
    
    for (let i = 0; i < points; i++) {
      const noise = (Math.random() - 0.5) * volatility;
      const trendEffect = trend * price;
      price = price + noise + trendEffect;
      
      const open = price;
      const close = price + (Math.random() - 0.5) * volatility * 0.5;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      
      data.push({
        time: i,
        open,
        high,
        low,
        close,
        price: close,
        volume: 1000000 + Math.random() * 5000000,
      });
      
      price = close;
    }
    
    return data;
  }, [currentPrice, bias, timeframe]);

  // Calculate trading zones if not provided
  const zones: TradingZone = tradingZones || useMemo(() => {
    const range = currentPrice * 0.05; // 5% range
    return {
      entryLow: currentPrice * 0.98,
      entryHigh: currentPrice * 1.01,
      stopLoss: bias === 'bullish' ? currentPrice * 0.95 : currentPrice * 1.05,
      takeProfit1: bias === 'bullish' ? currentPrice * 1.05 : currentPrice * 0.95,
      takeProfit2: bias === 'bullish' ? currentPrice * 1.10 : currentPrice * 0.90,
      takeProfit3: bias === 'bullish' ? currentPrice * 1.15 : currentPrice * 0.85,
    };
  }, [currentPrice, bias]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  const priceRange = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices, zones.stopLoss) * 0.98;
    const max = Math.max(...prices, zones.takeProfit3) * 1.02;
    return { min, max };
  }, [chartData, zones]);

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {name} ({symbol.toUpperCase()}) SIGNAL CHART
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            AI-powered trading zones overlay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
            <SelectTrigger className="h-7 w-16 text-xs bg-muted/50 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1H</SelectItem>
              <SelectItem value="4h">4H</SelectItem>
              <SelectItem value="1d">1D</SelectItem>
              <SelectItem value="1w">1W</SelectItem>
            </SelectContent>
          </Select>
          <Badge 
            variant="outline"
            className={cn(
              "text-xs",
              bias === 'bullish' ? 'border-green-500/50 text-green-400' :
              bias === 'bearish' ? 'border-red-500/50 text-red-400' : 'border-yellow-500/50 text-yellow-400'
            )}
          >
            {bias === 'bullish' && <TrendingUp className="w-3 h-3 mr-1" />}
            {bias === 'bearish' && <TrendingDown className="w-3 h-3 mr-1" />}
            {confidence}% {bias.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[280px] sm:h-[320px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            {/* Entry Zone */}
            <ReferenceArea
              y1={zones.entryLow}
              y2={zones.entryHigh}
              fill="rgba(34, 197, 94, 0.1)"
              strokeDasharray="3 3"
              label={{ value: 'ENTRY ZONE', position: 'insideRight', fontSize: 10, fill: '#22c55e' }}
            />
            
            {/* Stop Loss Line */}
            <ReferenceLine
              y={zones.stopLoss}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: `SL: ${formatPrice(zones.stopLoss)}`, position: 'right', fontSize: 10, fill: '#ef4444' }}
            />
            
            {/* Take Profit Lines */}
            <ReferenceLine
              y={zones.takeProfit1}
              stroke="#22c55e"
              strokeDasharray="3 3"
              label={{ value: `TP1: ${formatPrice(zones.takeProfit1)}`, position: 'right', fontSize: 9, fill: '#22c55e' }}
            />
            <ReferenceLine
              y={zones.takeProfit2}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: `TP2: ${formatPrice(zones.takeProfit2)}`, position: 'right', fontSize: 9, fill: '#10b981' }}
            />
            <ReferenceLine
              y={zones.takeProfit3}
              stroke="#059669"
              strokeDasharray="3 3"
              label={{ value: `TP3: ${formatPrice(zones.takeProfit3)}`, position: 'right', fontSize: 9, fill: '#059669' }}
            />
            
            {/* Current Price Line */}
            <ReferenceLine
              y={currentPrice}
              stroke="#6366f1"
              strokeWidth={2}
              label={{ value: `Now: ${formatPrice(currentPrice)}`, position: 'left', fontSize: 10, fill: '#6366f1' }}
            />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={[priceRange.min, priceRange.max]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              tickFormatter={(v) => formatPrice(v)}
              width={65}
            />
            
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bias === 'bullish' ? '#22c55e' : bias === 'bearish' ? '#ef4444' : '#6366f1'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={bias === 'bullish' ? '#22c55e' : bias === 'bearish' ? '#ef4444' : '#6366f1'} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <Area
              type="monotone"
              dataKey="price"
              stroke={bias === 'bullish' ? '#22c55e' : bias === 'bearish' ? '#ef4444' : '#6366f1'}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trading Zones Summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Target className="w-3 h-3 text-green-400" />
            Entry Zone
          </div>
          <div className="text-xs font-mono font-medium text-green-400">
            {formatPrice(zones.entryLow)} - {formatPrice(zones.entryHigh)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-red-400" />
            Stop Loss
          </div>
          <div className="text-xs font-mono font-medium text-red-400">
            {formatPrice(zones.stopLoss)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <div className="text-[10px] text-muted-foreground">TP1</div>
          <div className="text-xs font-mono font-medium text-primary">
            {formatPrice(zones.takeProfit1)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <div className="text-[10px] text-muted-foreground">TP2 / TP3</div>
          <div className="text-xs font-mono font-medium text-primary">
            {formatPrice(zones.takeProfit2)} / {formatPrice(zones.takeProfit3)}
          </div>
        </div>
      </div>

      {/* Risk/Reward Ratio */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <div>
          <span className="text-muted-foreground">Risk/Reward: </span>
          <span className="text-primary font-medium">
            1:{((zones.takeProfit1 - currentPrice) / (currentPrice - zones.stopLoss)).toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
