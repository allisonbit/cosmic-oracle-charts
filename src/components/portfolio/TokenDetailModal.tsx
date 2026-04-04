import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Copy, ExternalLink, 
  AlertTriangle, Shield, Rocket, Target, BarChart3,
  Activity, Coins, Percent, Clock, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

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
}

interface TokenDetailModalProps {
  token: TokenHolding | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TokenDetailModal({ token, isOpen, onClose }: TokenDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const copyAddress = () => {
    if (token.contractAddress && token.contractAddress !== 'native') {
      navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      toast.success("Contract address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate mock price chart data
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const change = token.change24h / 100;
    const startPrice = token.price / (1 + change);
    const progress = i / 23;
    const noise = (Math.random() - 0.5) * 0.02 * startPrice;
    return {
      value: startPrice + (token.price - startPrice) * progress + noise
    };
  });

  const getRecommendationDetails = (rec: string) => {
    switch (rec) {
      case "accumulate":
        return {
          icon: Rocket,
          color: "text-success",
          bg: "bg-success/20",
          label: "ACCUMULATE",
          description: "This token shows strong potential for growth. Consider adding to your position during dips."
        };
      case "hold":
        return {
          icon: Shield,
          color: "text-primary",
          bg: "bg-primary/20",
          label: "HOLD",
          description: "Maintain your current position. The token is performing steadily with no immediate action needed."
        };
      case "take_profit":
        return {
          icon: Target,
          color: "text-warning",
          bg: "bg-warning/20",
          label: "TAKE PROFIT",
          description: "Consider selling a portion to lock in gains. The token may be approaching resistance levels."
        };
      case "exit":
        return {
          icon: AlertTriangle,
          color: "text-danger",
          bg: "bg-danger/20",
          label: "EXIT",
          description: "High risk detected. Consider reducing or exiting your position to protect capital."
        };
      default:
        return {
          icon: Shield,
          color: "text-muted-foreground",
          bg: "bg-muted",
          label: "HOLD",
          description: "Hold your position and monitor market conditions."
        };
    }
  };

  const getRiskDetails = (risk: string) => {
    switch (risk) {
      case "low":
        return { color: "text-success", description: "Established token with stable price history and high liquidity." };
      case "medium":
        return { color: "text-warning", description: "Moderate volatility. Some price swings expected but generally stable." };
      case "high":
        return { color: "text-danger", description: "High volatility asset. Significant price swings possible. Manage position size carefully." };
      case "extreme":
        return { color: "text-danger", description: "Extremely volatile. Only invest what you can afford to lose. High potential for rapid gains or losses." };
      default:
        return { color: "text-muted-foreground", description: "Risk level unknown." };
    }
  };

  const recommendation = getRecommendationDetails(token.recommendation);
  const riskDetails = getRiskDetails(token.riskLevel);
  const RecIcon = recommendation.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-display font-bold text-primary text-lg">
                {token.symbol[0]}
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-xl">{token.symbol}</div>
              <div className="text-sm text-muted-foreground font-normal">{token.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Price Chart */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">
                  ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toLocaleString()}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  token.change24h >= 0 ? "text-success" : "text-danger"
                )}>
                  {token.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}% (24h)
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Your Holdings</div>
                <div className="font-bold">${token.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{token.balance.toLocaleString()} {token.symbol}</div>
              </div>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={token.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={token.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={token.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"}
                    strokeWidth={2}
                    fill={`url(#gradient-${token.symbol})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Coins className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Value</div>
              <div className="font-bold">${token.value.toLocaleString()}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Percent className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">24h Change</div>
              <div className={cn("font-bold", token.change24h >= 0 ? "text-success" : "text-danger")}>
                {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Pump Potential</div>
              <div className={cn("font-bold uppercase", 
                token.pumpPotential === "high" ? "text-success" : 
                token.pumpPotential === "medium" ? "text-warning" : "text-muted-foreground"
              )}>
                {token.pumpPotential}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Risk Level</div>
              <div className={cn("font-bold uppercase", riskDetails.color)}>
                {token.riskLevel}
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className={cn("rounded-lg p-4", recommendation.bg)}>
            <div className="flex items-center gap-3 mb-2">
              <RecIcon className={cn("w-6 h-6", recommendation.color)} />
              <span className={cn("font-display font-bold", recommendation.color)}>
                {recommendation.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{recommendation.description}</p>
          </div>

          {/* AI Insight */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-display font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              AI Analysis
            </h4>
            <p className="text-sm text-muted-foreground">{token.insight}</p>
          </div>

          {/* Risk Analysis */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-display font-bold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Risk Analysis
            </h4>
            <p className="text-sm text-muted-foreground">{riskDetails.description}</p>
          </div>

          {/* Contract Address */}
          {token.contractAddress && token.contractAddress !== 'native' && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-display font-bold mb-2 text-sm">Contract Address</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background/50 px-3 py-2 rounded overflow-x-auto">
                  {token.contractAddress}
                </code>
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-wrap gap-2">
            {token.contractAddress && token.contractAddress !== 'native' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open(`https://etherscan.io/token/${token.contractAddress}`, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                  Etherscan
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open("/trade", "_self")}
                >
                  <ArrowDownUp className="w-3 h-3" />
                  Trade
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open(`https://www.coingecko.com/en/coins/${token.name.toLowerCase().replace(/\s+/g, '-')}`, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                  Details
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
