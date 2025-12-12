import { useState } from "react";
import { 
  Brain, AlertTriangle, Zap, Target, Shield, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Lightbulb, BarChart3, Rocket, DollarSign,
  Activity, ExternalLink, Copy, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EnhancedAIAnalysisProps {
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

export function EnhancedAIAnalysis({ analysis }: EnhancedAIAnalysisProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(analysis.address);
    setCopiedAddress(true);
    toast.success("Address copied!");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Generate additional AI insights
  const generateStrengths = () => {
    const strengths = [];
    if (analysis.diversificationScore > 60) strengths.push("Well-diversified portfolio reduces concentration risk");
    if (analysis.riskScore < 40) strengths.push("Conservative risk profile protects capital");
    if (analysis.topPicks.length > 0) strengths.push(`Strong performers: ${analysis.topPicks.join(', ')}`);
    if (analysis.holdings.filter(h => h.recommendation === 'accumulate').length > 0) strengths.push("Multiple accumulation opportunities identified");
    if (analysis.holdings.some(h => ['USDT', 'USDC', 'DAI'].includes(h.symbol.toUpperCase()))) strengths.push("Stablecoin buffer provides dry powder");
    return strengths.length > 0 ? strengths : ["Portfolio has room for strategic improvements"];
  };

  const generateWeaknesses = () => {
    const weaknesses = [];
    if (analysis.diversificationScore < 40) weaknesses.push("High concentration - consider diversifying");
    if (analysis.riskScore > 70) weaknesses.push("Elevated risk exposure - review high-risk positions");
    if (analysis.holdings.filter(h => h.riskLevel === 'extreme').length > 0) weaknesses.push("Contains extreme-risk assets");
    if (analysis.holdings.length < 5) weaknesses.push("Limited number of positions");
    if (analysis.holdings.filter(h => h.recommendation === 'exit').length > 0) weaknesses.push("Some positions flagged for exit");
    return weaknesses.length > 0 ? weaknesses : ["No major weaknesses detected"];
  };

  const generateOpportunities = () => {
    const opportunities = [];
    const accumulates = analysis.holdings.filter(h => h.recommendation === 'accumulate');
    if (accumulates.length > 0) opportunities.push(`Consider adding to: ${accumulates.map(h => h.symbol).slice(0, 3).join(', ')}`);
    if (analysis.holdings.some(h => h.change24h < -10)) opportunities.push("Dip opportunities in oversold tokens");
    if (analysis.diversificationScore < 60) opportunities.push("Explore new sectors for better diversification");
    opportunities.push("Set price alerts for key support/resistance levels");
    return opportunities;
  };

  const generateThreats = () => {
    const threats = [];
    if (analysis.riskScore > 60) threats.push("Market volatility could impact high-risk positions");
    const extremeRisk = analysis.holdings.filter(h => h.riskLevel === 'extreme');
    if (extremeRisk.length > 0) threats.push(`Extreme risk: ${extremeRisk.map(h => h.symbol).join(', ')}`);
    if (analysis.holdings.some(h => h.change24h > 30)) threats.push("Overextended positions may see corrections");
    threats.push("Monitor macro conditions and BTC correlation");
    return threats;
  };

  const strengths = generateStrengths();
  const weaknesses = generateWeaknesses();
  const opportunities = generateOpportunities();
  const threats = generateThreats();

  // Action items
  const actionItems = [
    ...analysis.holdings.filter(h => h.recommendation === 'exit').map(h => ({
      type: 'danger' as const,
      action: `EXIT ${h.symbol}`,
      reason: h.insight,
      icon: AlertTriangle
    })),
    ...analysis.holdings.filter(h => h.recommendation === 'take_profit').slice(0, 2).map(h => ({
      type: 'warning' as const,
      action: `Take profits on ${h.symbol}`,
      reason: `Up ${h.change24h.toFixed(1)}% - consider partial exit`,
      icon: Target
    })),
    ...analysis.holdings.filter(h => h.recommendation === 'accumulate').slice(0, 2).map(h => ({
      type: 'success' as const,
      action: `Accumulate ${h.symbol}`,
      reason: h.insight,
      icon: Rocket
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Main AI Insight Card */}
      <div className="holo-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-primary/30">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-xl">AI Portfolio Analysis</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Wallet:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {analysis.address.slice(0, 6)}...{analysis.address.slice(-4)}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                  {copiedAddress ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{analysis.overallInsight}</p>

            {/* Quick Scores */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
                <div className={cn(
                  "font-display font-bold text-lg",
                  analysis.riskScore > 70 ? "text-danger" : analysis.riskScore > 40 ? "text-warning" : "text-success"
                )}>
                  {analysis.riskScore > 70 ? "HIGH" : analysis.riskScore > 40 ? "MEDIUM" : "LOW"}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Diversification</div>
                <div className={cn(
                  "font-display font-bold text-lg",
                  analysis.diversificationScore > 70 ? "text-success" : analysis.diversificationScore > 40 ? "text-warning" : "text-danger"
                )}>
                  {analysis.diversificationScore > 70 ? "GOOD" : analysis.diversificationScore > 40 ? "FAIR" : "LOW"}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Outlook</div>
                <div className={cn(
                  "font-display font-bold text-lg",
                  analysis.topPicks.length > 0 ? "text-success" : "text-warning"
                )}>
                  {analysis.topPicks.length > 0 ? "BULLISH" : "NEUTRAL"}
                </div>
              </div>
            </div>

            {/* Expand Button */}
            <Button 
              variant="ghost" 
              className="w-full gap-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Detailed SWOT Analysis
                </>
              )}
            </Button>

            {/* Expanded SWOT Analysis */}
            {expanded && (
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-success/10 rounded-lg p-4 border border-success/20">
                  <h4 className="font-display font-bold text-success mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-danger/10 rounded-lg p-4 border border-danger/20">
                  <h4 className="font-display font-bold text-danger mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-danger">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-display font-bold text-primary mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {opportunities.map((o, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
                  <h4 className="font-display font-bold text-warning mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Threats
                  </h4>
                  <ul className="space-y-2">
                    {threats.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {analysis.warnings.length > 0 && (
        <div className="holo-card p-4 border-warning/30 bg-warning/5">
          <h4 className="font-display font-bold text-warning mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Warnings ({analysis.warnings.length})
          </h4>
          <div className="space-y-2">
            {analysis.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="holo-card p-4">
          <h4 className="font-display font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Recommended Actions
          </h4>
          <div className="space-y-3">
            {actionItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    item.type === 'danger' ? "bg-danger/10 border-danger/20" :
                    item.type === 'warning' ? "bg-warning/10 border-warning/20" :
                    "bg-success/10 border-success/20"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 mt-0.5",
                    item.type === 'danger' ? "text-danger" :
                    item.type === 'warning' ? "text-warning" :
                    "text-success"
                  )} />
                  <div className="flex-1">
                    <div className={cn(
                      "font-medium text-sm",
                      item.type === 'danger' ? "text-danger" :
                      item.type === 'warning' ? "text-warning" :
                      "text-success"
                    )}>
                      {item.action}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{item.reason}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* External Analysis Links */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => window.open(`https://debank.com/profile/${analysis.address}`, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          DeBank Analysis
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => window.open(`https://zerion.io/${analysis.address}`, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Zerion
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => window.open(`https://platform.arkhamintelligence.com/explorer/address/${analysis.address}`, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Arkham Intel
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => window.open(`https://etherscan.io/address/${analysis.address}`, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Etherscan
        </Button>
      </div>
    </div>
  );
}
