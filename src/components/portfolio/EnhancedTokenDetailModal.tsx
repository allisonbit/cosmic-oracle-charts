import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Copy, ExternalLink, 
  AlertTriangle, Shield, Rocket, Target, BarChart3,
  Activity, Coins, Percent, Clock, Check, Brain,
  Zap, Eye, Lock, Users, DollarSign, LineChart,
  Flame, RefreshCw, Globe, FileText, Search,
  ArrowUpRight, ArrowDownRight, Wallet, PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  pumpPotential: "high" | "medium" | "low";
  riskLevel: "low" | "medium" | "high" | "extreme";
  recommendation: "hold" | "accumulate" | "take_profit" | "exit";
  insight: string;
  contractAddress?: string;
  // Enhanced fields
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  holders?: number;
  fdv?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  ath?: number;
  atl?: number;
  athDate?: string;
  atlDate?: string;
  priceChange7d?: number;
  priceChange30d?: number;
  volumeChange24h?: number;
}

interface EnhancedTokenDetailModalProps {
  token: TokenHolding | null;
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export function EnhancedTokenDetailModal({ token, isOpen, onClose, walletAddress }: EnhancedTokenDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!token) return null;

  const copyAddress = () => {
    if (token.contractAddress && token.contractAddress !== 'native') {
      navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      toast.success("Contract address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate mock chart data for different timeframes
  const generateChartData = (days: number) => {
    const data = [];
    const change = token.change24h / 100;
    const startPrice = token.price / (1 + change);
    for (let i = 0; i <= days * 24; i += Math.max(1, Math.floor(days / 2))) {
      const progress = i / (days * 24);
      const noise = (Math.random() - 0.5) * 0.05 * startPrice;
      data.push({
        time: `${Math.floor(i / 24)}d`,
        value: startPrice + (token.price - startPrice) * progress + noise,
        volume: Math.random() * 1000000 + 500000
      });
    }
    return data;
  };

  const chartData24h = generateChartData(1);
  const chartData7d = generateChartData(7);
  const chartData30d = generateChartData(30);

  // Mock volume distribution
  const volumeData = [
    { name: 'Buy', value: 55 + Math.random() * 20, fill: 'hsl(var(--success))' },
    { name: 'Sell', value: 45 - Math.random() * 20, fill: 'hsl(var(--danger))' },
  ];

  // Mock holder distribution
  const holderData = [
    { range: 'Whales (>$100k)', pct: 35 },
    { range: 'Large ($10k-$100k)', pct: 25 },
    { range: 'Medium ($1k-$10k)', pct: 22 },
    { range: 'Small (<$1k)', pct: 18 },
  ];

  const getRecommendationDetails = (rec: string) => {
    switch (rec) {
      case "accumulate":
        return {
          icon: Rocket,
          color: "text-success",
          bg: "bg-success/20",
          label: "ACCUMULATE",
          description: "This token shows strong potential for growth. Consider adding to your position during dips.",
          strategy: "DCA (Dollar Cost Average) into position over multiple buys. Set limit orders 5-10% below current price."
        };
      case "hold":
        return {
          icon: Shield,
          color: "text-primary",
          bg: "bg-primary/20",
          label: "HOLD",
          description: "Maintain your current position. The token is performing steadily with no immediate action needed.",
          strategy: "Monitor price action and key support/resistance levels. Set alerts for significant moves."
        };
      case "take_profit":
        return {
          icon: Target,
          color: "text-warning",
          bg: "bg-warning/20",
          label: "TAKE PROFIT",
          description: "Consider selling a portion to lock in gains. The token may be approaching resistance levels.",
          strategy: "Sell 20-30% of position at current levels. Set trailing stop loss for remaining position."
        };
      case "exit":
        return {
          icon: AlertTriangle,
          color: "text-danger",
          bg: "bg-danger/20",
          label: "EXIT",
          description: "High risk detected. Consider reducing or exiting your position to protect capital.",
          strategy: "Exit majority of position immediately. Consider shorting if available or rotate into stablecoins."
        };
      default:
        return {
          icon: Shield,
          color: "text-muted-foreground",
          bg: "bg-muted",
          label: "HOLD",
          description: "Hold your position and monitor market conditions.",
          strategy: "Continue monitoring for clearer signals."
        };
    }
  };

  const getRiskDetails = (risk: string) => {
    switch (risk) {
      case "low":
        return { 
          color: "text-success", 
          score: 25,
          description: "Established token with stable price history and high liquidity.",
          factors: ["High market cap", "Strong liquidity", "Verified contract", "Long track record"]
        };
      case "medium":
        return { 
          color: "text-warning", 
          score: 50,
          description: "Moderate volatility. Some price swings expected but generally stable.",
          factors: ["Medium market cap", "Adequate liquidity", "Some volatility", "Active development"]
        };
      case "high":
        return { 
          color: "text-danger", 
          score: 75,
          description: "High volatility asset. Significant price swings possible. Manage position size carefully.",
          factors: ["Lower market cap", "Limited liquidity", "High volatility", "Newer token"]
        };
      case "extreme":
        return { 
          color: "text-danger", 
          score: 95,
          description: "Extremely volatile. Only invest what you can afford to lose. High potential for rapid gains or losses.",
          factors: ["Very low market cap", "Low liquidity risk", "Extreme volatility", "High rug risk"]
        };
      default:
        return { color: "text-muted-foreground", score: 50, description: "Risk level unknown.", factors: [] };
    }
  };

  const recommendation = getRecommendationDetails(token.recommendation);
  const riskDetails = getRiskDetails(token.riskLevel);
  const RecIcon = recommendation.icon;

  // Mock additional data
  const marketCap = token.marketCap || token.value * (1000 + Math.random() * 10000);
  const volume24h = token.volume24h || marketCap * (0.05 + Math.random() * 0.15);
  const liquidity = token.liquidity || volume24h * (0.3 + Math.random() * 0.5);
  const holders = token.holders || Math.floor(500 + Math.random() * 50000);
  const priceChange7d = token.priceChange7d || token.change24h * (1.5 + Math.random());
  const priceChange30d = token.priceChange30d || token.change24h * (2 + Math.random() * 2);

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
              <span className="font-display font-bold text-primary text-xl">
                {token.symbol[0]}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-2xl">{token.symbol}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-bold",
                  riskDetails.color,
                  token.riskLevel === 'low' ? 'bg-success/20' : 
                  token.riskLevel === 'medium' ? 'bg-warning/20' : 'bg-danger/20'
                )}>
                  {token.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <div className="text-sm text-muted-foreground font-normal">{token.name}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toLocaleString()}
              </div>
              <div className={cn(
                "flex items-center justify-end gap-1 text-sm font-medium",
                token.change24h >= 0 ? "text-success" : "text-danger"
              )}>
                {token.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}% (24h)
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6 pt-4">
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">AI Analysis</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs">Risk</TabsTrigger>
            <TabsTrigger value="links" className="text-xs">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Price Chart */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-bold flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  Price Chart (24h)
                </h4>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    token.pumpPotential === 'high' ? 'bg-success/20 text-success' :
                    token.pumpPotential === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                  )}>
                    {token.pumpPotential.toUpperCase()} PUMP
                  </span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData24h}>
                    <defs>
                      <linearGradient id={`gradient-modal-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={token.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={token.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={token.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"}
                      strokeWidth={2}
                      fill={`url(#gradient-modal-${token.symbol})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Your Holdings */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Your Holdings
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Balance</div>
                  <div className="font-bold">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {token.symbol}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Value (USD)</div>
                  <div className="font-bold text-primary">${token.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avg. Entry (Est.)</div>
                  <div className="font-bold">${(token.price * 0.9).toFixed(6)}</div>
                </div>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="font-bold">{formatLargeNumber(marketCap)}</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <Activity className="w-5 h-5 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-xs text-muted-foreground">24h Volume</div>
                <div className="font-bold">{formatLargeNumber(volume24h)}</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <Coins className="w-5 h-5 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-xs text-muted-foreground">Liquidity</div>
                <div className="font-bold">{formatLargeNumber(liquidity)}</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-xs text-muted-foreground">Holders</div>
                <div className="font-bold">{holders.toLocaleString()}</div>
              </div>
            </div>

            {/* Price Changes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                <div className={cn("font-bold flex items-center justify-center gap-1",
                  token.change24h >= 0 ? "text-success" : "text-danger"
                )}>
                  {token.change24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">7d Change</div>
                <div className={cn("font-bold flex items-center justify-center gap-1",
                  priceChange7d >= 0 ? "text-success" : "text-danger"
                )}>
                  {priceChange7d >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {priceChange7d >= 0 ? "+" : ""}{priceChange7d.toFixed(2)}%
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">30d Change</div>
                <div className={cn("font-bold flex items-center justify-center gap-1",
                  priceChange30d >= 0 ? "text-success" : "text-danger"
                )}>
                  {priceChange30d >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {priceChange30d >= 0 ? "+" : ""}{priceChange30d.toFixed(2)}%
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* AI Recommendation */}
            <div className={cn("rounded-lg p-5", recommendation.bg)}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", recommendation.bg)}>
                  <RecIcon className={cn("w-6 h-6", recommendation.color)} />
                </div>
                <div>
                  <span className={cn("font-display font-bold text-xl", recommendation.color)}>
                    {recommendation.label}
                  </span>
                  <div className="text-xs text-muted-foreground">AI Recommendation</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>
              <div className="bg-background/50 rounded-lg p-3">
                <div className="text-xs font-bold text-muted-foreground mb-1">SUGGESTED STRATEGY</div>
                <p className="text-sm">{recommendation.strategy}</p>
              </div>
            </div>

            {/* Detailed AI Insight */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Detailed AI Analysis
              </h4>
              <p className="text-sm text-muted-foreground mb-4">{token.insight}</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <Zap className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Momentum Analysis</div>
                    <div className="text-xs text-muted-foreground">
                      {token.change24h > 10 ? 'Strong bullish momentum detected. Price showing breakout pattern.' :
                       token.change24h > 0 ? 'Moderate positive momentum. Stable uptrend in progress.' :
                       token.change24h > -10 ? 'Slight correction in progress. Watch for support levels.' :
                       'Significant selling pressure. Monitor for reversal signals.'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <Eye className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Volume Analysis</div>
                    <div className="text-xs text-muted-foreground">
                      24h volume to market cap ratio: {((volume24h / marketCap) * 100).toFixed(2)}%. 
                      {(volume24h / marketCap) > 0.15 ? ' High trading activity indicates strong interest.' :
                       (volume24h / marketCap) > 0.05 ? ' Normal trading activity.' :
                       ' Low volume - liquidity may be limited.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <Target className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Price Targets</div>
                    <div className="text-xs text-muted-foreground">
                      Support: ${(token.price * 0.85).toFixed(6)} | 
                      Resistance: ${(token.price * 1.25).toFixed(6)} |
                      Target: ${(token.price * 1.5).toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buy/Sell Pressure */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Buy/Sell Pressure (24h)
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-danger/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${volumeData[0].value}%` }}
                  />
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-success font-bold">{volumeData[0].value.toFixed(0)}% Buy</span>
                  <span className="text-danger font-bold">{volumeData[1].value.toFixed(0)}% Sell</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm">Market Data</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Market Cap', value: formatLargeNumber(marketCap), icon: DollarSign },
                    { label: 'FDV', value: formatLargeNumber(marketCap * 1.2), icon: Globe },
                    { label: '24h Volume', value: formatLargeNumber(volume24h), icon: Activity },
                    { label: 'Vol/MCap', value: `${((volume24h / marketCap) * 100).toFixed(2)}%`, icon: Percent },
                    { label: 'Circulating Supply', value: `${(marketCap / token.price / 1e6).toFixed(2)}M`, icon: Coins },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <item.icon className="w-3 h-3" />
                        {item.label}
                      </div>
                      <div className="font-medium text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm">Token Info</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Holders', value: holders.toLocaleString(), icon: Users },
                    { label: 'Liquidity', value: formatLargeNumber(liquidity), icon: Lock },
                    { label: 'ATH', value: `$${(token.price * 1.8).toFixed(6)}`, icon: TrendingUp },
                    { label: 'ATL', value: `$${(token.price * 0.2).toFixed(6)}`, icon: TrendingDown },
                    { label: 'From ATH', value: `-${(Math.random() * 50 + 20).toFixed(1)}%`, icon: ArrowDownRight },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <item.icon className="w-3 h-3" />
                        {item.label}
                      </div>
                      <div className="font-medium text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Holder Distribution */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-display font-bold mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" />
                Holder Distribution
              </h4>
              <div className="space-y-2">
                {holderData.map(item => (
                  <div key={item.range} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-muted-foreground">{item.range}</div>
                    <div className="flex-1 h-3 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <div className="w-12 text-xs font-medium text-right">{item.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            {/* Risk Score */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Risk Assessment
                </h4>
                <div className={cn("text-3xl font-display font-bold", riskDetails.color)}>
                  {riskDetails.score}/100
                </div>
              </div>
              
              <div className="h-4 bg-background/50 rounded-full overflow-hidden mb-4">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    riskDetails.score < 35 ? "bg-success" :
                    riskDetails.score < 60 ? "bg-warning" : "bg-danger"
                  )}
                  style={{ width: `${riskDetails.score}%` }}
                />
              </div>

              <p className="text-sm text-muted-foreground mb-4">{riskDetails.description}</p>

              <div className="grid grid-cols-2 gap-2">
                {riskDetails.factors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      i < 2 ? "bg-success" : "bg-warning"
                    )} />
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-y-3">
              {[
                { name: 'Liquidity Risk', score: liquidity > 100000 ? 20 : 70, desc: liquidity > 100000 ? 'Good liquidity available' : 'Limited liquidity - slippage risk' },
                { name: 'Volatility Risk', score: Math.abs(token.change24h) > 20 ? 80 : Math.abs(token.change24h) > 10 ? 50 : 25, desc: `${Math.abs(token.change24h).toFixed(1)}% 24h change` },
                { name: 'Concentration Risk', score: 45, desc: 'Top holders own significant portion' },
                { name: 'Smart Contract Risk', score: token.contractAddress === 'native' ? 10 : 40, desc: token.contractAddress === 'native' ? 'Native token - no contract risk' : 'Token contract deployed' },
              ].map(risk => (
                <div key={risk.name} className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{risk.name}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      risk.score < 35 ? "text-success" : risk.score < 60 ? "text-warning" : "text-danger"
                    )}>
                      {risk.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden mb-1">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        risk.score < 35 ? "bg-success" : risk.score < 60 ? "bg-warning" : "bg-danger"
                      )}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{risk.desc}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            {/* Contract Address */}
            {token.contractAddress && token.contractAddress !== 'native' && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-display font-bold mb-2 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Contract Address
                </h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background/50 px-3 py-2 rounded overflow-x-auto font-mono">
                    {token.contractAddress}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyAddress}>
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Explorers & Info */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm">Explorers & Info</h4>
              <div className="grid grid-cols-2 gap-2">
                {(token.contractAddress && token.contractAddress !== 'native' ? [
                  { name: 'Etherscan', url: `https://etherscan.io/token/${token.contractAddress}`, iconName: 'Search' },
                  { name: 'CoinGecko', url: `https://www.coingecko.com/en/coins/${token.name.toLowerCase().replace(/\s+/g, '-')}`, iconName: 'Globe' },
                ] : [
                  { name: 'CoinGecko', url: `https://www.coingecko.com/en/coins/${token.name.toLowerCase().replace(/\s+/g, '-')}`, iconName: 'Globe' },
                ]).map(link => (
                  <Button 
                    key={link.name}
                    variant="outline" 
                    className="justify-start gap-2 h-10"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <Globe className="w-4 h-4 text-primary" />
                    {link.name}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Trade */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm">Trade</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 h-10"
                  onClick={() => window.open("/trade", "_self")}
                >
                  <RefreshCw className="w-4 h-4 text-primary" />
                  Swap
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 h-10"
                  onClick={() => window.open("/trade", "_self")}
                >
                  <Zap className="w-4 h-4 text-primary" />
                  Bridge
                </Button>
              </div>
            </div>

            {/* Wallet Analysis Links */}
            {walletAddress && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm">Wallet Analysis</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'DeBank', url: `https://debank.com/profile/${walletAddress}`, icon: Wallet },
                    { name: 'Zerion', url: `https://zerion.io/${walletAddress}`, icon: PieChart },
                    { name: 'Arkham', url: `https://platform.arkhamintelligence.com/explorer/address/${walletAddress}`, icon: Eye },
                    { name: 'Nansen', url: `https://app.nansen.ai/address/${walletAddress}`, icon: Brain },
                  ].map(link => (
                    <Button 
                      key={link.name}
                      variant="outline" 
                      className="justify-start gap-2 h-10"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <link.icon className="w-4 h-4 text-primary" />
                      {link.name}
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
