import { useState } from "react";
import { 
  Wallet, AlertTriangle, BarChart3, Rocket, TrendingUp, TrendingDown,
  Shield, DollarSign, PieChart, Activity, Zap, Brain, Target,
  Clock, ExternalLink, ChevronRight, Info, Coins, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletStatsProps {
  analysis: {
    address: string;
    totalValue: number;
    holdings: any[];
    riskScore: number;
    diversificationScore: number;
    overallInsight: string;
    topPicks: string[];
    warnings: string[];
  };
}

export function EnhancedWalletStats({ analysis }: WalletStatsProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Calculate additional metrics
  const totalTokens = analysis.holdings.length;
  const positiveTokens = analysis.holdings.filter(h => h.change24h > 0).length;
  const negativeTokens = analysis.holdings.filter(h => h.change24h < 0).length;
  const avgChange24h = analysis.holdings.length > 0 
    ? analysis.holdings.reduce((sum, h) => sum + h.change24h, 0) / analysis.holdings.length 
    : 0;
  const highRiskCount = analysis.holdings.filter(h => h.riskLevel === 'high' || h.riskLevel === 'extreme').length;
  const highPumpCount = analysis.holdings.filter(h => h.pumpPotential === 'high').length;
  const stablecoins = analysis.holdings.filter(h => ['USDT', 'USDC', 'DAI', 'BUSD'].includes(h.symbol.toUpperCase()));
  const stablecoinValue = stablecoins.reduce((sum, h) => sum + h.value, 0);
  const stablecoinPct = analysis.totalValue > 0 ? (stablecoinValue / analysis.totalValue) * 100 : 0;
  const largestHolding = analysis.holdings[0];
  const concentrationPct = largestHolding && analysis.totalValue > 0 
    ? (largestHolding.value / analysis.totalValue) * 100 
    : 0;

  const stats = [
    {
      id: 'total-value',
      label: 'Total Value',
      value: formatNumber(analysis.totalValue),
      subtext: `${totalTokens} tokens`,
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary/20',
      details: {
        title: 'Portfolio Value Breakdown',
        content: [
          { label: 'Total Portfolio Value', value: formatNumber(analysis.totalValue) },
          { label: 'Number of Tokens', value: totalTokens.toString() },
          { label: 'Largest Holding', value: `${largestHolding?.symbol || 'N/A'} (${formatNumber(largestHolding?.value || 0)})` },
          { label: 'Stablecoin Holdings', value: `${formatNumber(stablecoinValue)} (${stablecoinPct.toFixed(1)}%)` },
          { label: '24h PnL (Est.)', value: `${avgChange24h >= 0 ? '+' : ''}${formatNumber(analysis.totalValue * avgChange24h / 100)}` },
        ]
      }
    },
    {
      id: 'risk-score',
      label: 'Risk Score',
      value: `${analysis.riskScore}/100`,
      subtext: analysis.riskScore > 70 ? 'High Risk' : analysis.riskScore > 40 ? 'Moderate' : 'Low Risk',
      icon: AlertTriangle,
      color: analysis.riskScore > 70 ? 'text-danger' : analysis.riskScore > 40 ? 'text-warning' : 'text-success',
      bg: analysis.riskScore > 70 ? 'bg-danger/20' : analysis.riskScore > 40 ? 'bg-warning/20' : 'bg-success/20',
      details: {
        title: 'Risk Analysis',
        content: [
          { label: 'Overall Risk Score', value: `${analysis.riskScore}/100` },
          { label: 'High/Extreme Risk Tokens', value: `${highRiskCount} of ${totalTokens}` },
          { label: 'Concentration Risk', value: concentrationPct > 50 ? 'High' : concentrationPct > 30 ? 'Medium' : 'Low' },
          { label: 'Stablecoin Buffer', value: stablecoinPct > 20 ? 'Good' : stablecoinPct > 10 ? 'Low' : 'Minimal' },
          { label: 'Risk Rating', value: analysis.riskScore > 70 ? 'Aggressive' : analysis.riskScore > 40 ? 'Balanced' : 'Conservative' },
        ]
      }
    },
    {
      id: 'diversification',
      label: 'Diversification',
      value: `${analysis.diversificationScore}/100`,
      subtext: analysis.diversificationScore > 70 ? 'Well Diversified' : analysis.diversificationScore > 40 ? 'Moderate' : 'Concentrated',
      icon: BarChart3,
      color: analysis.diversificationScore > 70 ? 'text-success' : analysis.diversificationScore > 40 ? 'text-warning' : 'text-danger',
      bg: analysis.diversificationScore > 70 ? 'bg-success/20' : analysis.diversificationScore > 40 ? 'bg-warning/20' : 'bg-danger/20',
      details: {
        title: 'Diversification Analysis',
        content: [
          { label: 'Diversification Score', value: `${analysis.diversificationScore}/100` },
          { label: 'Total Positions', value: totalTokens.toString() },
          { label: 'Top Holding Concentration', value: `${concentrationPct.toFixed(1)}%` },
          { label: 'Unique Sectors', value: `${Math.min(totalTokens, 5)}+` },
          { label: 'Recommendation', value: concentrationPct > 50 ? 'Consider rebalancing' : 'Portfolio is balanced' },
        ]
      }
    },
    {
      id: 'top-picks',
      label: 'Top Picks',
      value: analysis.topPicks.length > 0 ? analysis.topPicks.slice(0, 2).join(', ') : 'None',
      subtext: `${highPumpCount} high potential`,
      icon: Rocket,
      color: 'text-success',
      bg: 'bg-success/20',
      details: {
        title: 'Top Picks Analysis',
        content: [
          { label: 'Top Picks', value: analysis.topPicks.join(', ') || 'None identified' },
          { label: 'High Pump Potential', value: `${highPumpCount} tokens` },
          { label: 'Accumulate Signals', value: `${analysis.holdings.filter(h => h.recommendation === 'accumulate').length} tokens` },
          { label: 'Best Performer 24h', value: analysis.holdings.length > 0 ? `${analysis.holdings.reduce((best, h) => h.change24h > best.change24h ? h : best).symbol}` : 'N/A' },
          { label: 'Strategy', value: 'Focus on high-conviction plays' },
        ]
      }
    },
    {
      id: 'performance',
      label: '24h Change',
      value: `${avgChange24h >= 0 ? '+' : ''}${avgChange24h.toFixed(2)}%`,
      subtext: `${positiveTokens}↑ ${negativeTokens}↓`,
      icon: avgChange24h >= 0 ? TrendingUp : TrendingDown,
      color: avgChange24h >= 0 ? 'text-success' : 'text-danger',
      bg: avgChange24h >= 0 ? 'bg-success/20' : 'bg-danger/20',
      details: {
        title: 'Performance Analysis',
        content: [
          { label: 'Average 24h Change', value: `${avgChange24h >= 0 ? '+' : ''}${avgChange24h.toFixed(2)}%` },
          { label: 'Tokens in Green', value: `${positiveTokens} of ${totalTokens}` },
          { label: 'Tokens in Red', value: `${negativeTokens} of ${totalTokens}` },
          { label: 'Best Performer', value: analysis.holdings.length > 0 ? `${analysis.holdings.reduce((best, h) => h.change24h > best.change24h ? h : best).symbol} (+${analysis.holdings.reduce((best, h) => h.change24h > best.change24h ? h : best).change24h.toFixed(1)}%)` : 'N/A' },
          { label: 'Worst Performer', value: analysis.holdings.length > 0 ? `${analysis.holdings.reduce((worst, h) => h.change24h < worst.change24h ? h : worst).symbol} (${analysis.holdings.reduce((worst, h) => h.change24h < worst.change24h ? h : worst).change24h.toFixed(1)}%)` : 'N/A' },
        ]
      }
    },
    {
      id: 'health',
      label: 'Portfolio Health',
      value: analysis.warnings.length === 0 ? 'Good' : analysis.warnings.length <= 2 ? 'Fair' : 'Needs Attention',
      subtext: `${analysis.warnings.length} warnings`,
      icon: Shield,
      color: analysis.warnings.length === 0 ? 'text-success' : analysis.warnings.length <= 2 ? 'text-warning' : 'text-danger',
      bg: analysis.warnings.length === 0 ? 'bg-success/20' : analysis.warnings.length <= 2 ? 'bg-warning/20' : 'bg-danger/20',
      details: {
        title: 'Portfolio Health Check',
        content: [
          { label: 'Overall Health', value: analysis.warnings.length === 0 ? 'Healthy' : analysis.warnings.length <= 2 ? 'Minor Issues' : 'Needs Review' },
          { label: 'Active Warnings', value: analysis.warnings.length.toString() },
          { label: 'Exit Signals', value: `${analysis.holdings.filter(h => h.recommendation === 'exit').length} tokens` },
          { label: 'Take Profit Signals', value: `${analysis.holdings.filter(h => h.recommendation === 'take_profit').length} tokens` },
          { label: 'Recommendation', value: analysis.warnings.length > 2 ? 'Review portfolio immediately' : 'Continue monitoring' },
        ]
      }
    },
  ];

  const selectedStatData = stats.find(s => s.id === selectedStat);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.id}
              onClick={() => setSelectedStat(stat.id)}
              className="holo-card p-4 hover:border-primary/50 transition-all hover:scale-[1.02] text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <Info className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <div className={cn("text-xl font-display font-bold", stat.color)}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.subtext}</div>
            </button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStatData && <selectedStatData.icon className={cn("w-5 h-5", selectedStatData.color)} />}
              {selectedStatData?.details.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedStatData?.details.content.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-medium text-sm">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                {selectedStat === 'total-value' && "Your portfolio value is calculated from real-time prices across all detected tokens."}
                {selectedStat === 'risk-score' && "Risk score considers token volatility, liquidity, and concentration. Lower is better."}
                {selectedStat === 'diversification' && "A well-diversified portfolio reduces overall risk. Aim for multiple uncorrelated assets."}
                {selectedStat === 'top-picks' && "Top picks are tokens with high pump potential and acceptable risk levels."}
                {selectedStat === 'performance' && "24h change shows portfolio performance. Compare against market benchmarks."}
                {selectedStat === 'health' && "Portfolio health considers all warnings and risk factors for overall assessment."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
