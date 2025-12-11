import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Wallet, TrendingUp, TrendingDown, 
  AlertTriangle, Zap, Loader2, Brain, Target, 
  Rocket, Shield, BarChart3, Clock, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface WalletAnalysis {
  address: string;
  totalValue: number;
  holdings: TokenHolding[];
  riskScore: number;
  diversificationScore: number;
  overallInsight: string;
  topPicks: string[];
  warnings: string[];
}

export default function Portfolio() {
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);

  const analyzeWallet = async () => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    // Validate address format (basic check)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/) && !address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      toast.error("Please enter a valid EVM or Solana wallet address");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("wallet-scanner", {
        body: { address: address.trim() }
      });

      if (error) throw error;
      
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      
      setAnalysis(data as WalletAnalysis);
      toast.success(`Found ${data.holdings?.length || 0} tokens worth $${data.totalValue?.toLocaleString() || 0}`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to scan wallet. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPumpPotentialColor = (potential: string) => {
    switch (potential) {
      case "high": return "text-success bg-success/20";
      case "medium": return "text-warning bg-warning/20";
      case "low": return "text-muted-foreground bg-muted";
      default: return "text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-danger";
      case "extreme": return "text-danger animate-pulse";
      default: return "text-muted-foreground";
    }
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "accumulate": return { icon: Rocket, color: "text-success", bg: "bg-success/20", label: "ACCUMULATE" };
      case "hold": return { icon: Shield, color: "text-primary", bg: "bg-primary/20", label: "HOLD" };
      case "take_profit": return { icon: Target, color: "text-warning", bg: "bg-warning/20", label: "TAKE PROFIT" };
      case "exit": return { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/20", label: "EXIT" };
      default: return { icon: Shield, color: "text-muted-foreground", bg: "bg-muted", label: "HOLD" };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 cosmic-bg">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              <span className="glow-text">WALLET</span>{" "}
              <span className="text-gradient-cosmic">SCANNER</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered analysis to find pumping tokens, assess risk, and get actionable insights for any wallet
            </p>
          </div>

          {/* Search */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="holo-card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter wallet address (EVM or Solana)..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-12 h-12 text-base"
                    onKeyDown={(e) => e.key === "Enter" && analyzeWallet()}
                  />
                </div>
                <Button 
                  onClick={analyzeWallet} 
                  disabled={isAnalyzing}
                  className="h-12 px-8 gap-2"
                  variant="cosmic"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Scan Wallet
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Supports Ethereum, BSC, Polygon, Arbitrum, Base, and Solana wallets
              </p>
            </div>
          </div>

          {/* Results */}
          {analysis && (
            <div className="space-y-6 animate-fade-in">
              {/* Overview Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="holo-card p-6">
                  <div className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Total Value
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold">
                    ${analysis.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="holo-card p-6">
                  <div className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Score
                  </div>
                  <div className={cn(
                    "text-2xl md:text-3xl font-display font-bold",
                    analysis.riskScore > 70 ? "text-danger" : analysis.riskScore > 40 ? "text-warning" : "text-success"
                  )}>
                    {analysis.riskScore}/100
                  </div>
                </div>
                <div className="holo-card p-6">
                  <div className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Diversification
                  </div>
                  <div className={cn(
                    "text-2xl md:text-3xl font-display font-bold",
                    analysis.diversificationScore > 70 ? "text-success" : analysis.diversificationScore > 40 ? "text-warning" : "text-danger"
                  )}>
                    {analysis.diversificationScore}/100
                  </div>
                </div>
                <div className="holo-card p-6">
                  <div className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Top Picks
                  </div>
                  <div className="text-xl md:text-2xl font-display font-bold text-success">
                    {analysis.topPicks.join(", ")}
                  </div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="holo-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">AI Analysis</h3>
                    <p className="text-muted-foreground">{analysis.overallInsight}</p>
                    {analysis.warnings.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {analysis.warnings.map((warning, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-warning">
                            <AlertTriangle className="w-4 h-4" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="holo-card overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="font-display font-bold text-xl flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Holdings Analysis
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-display text-xs text-muted-foreground">TOKEN</th>
                        <th className="text-right p-4 font-display text-xs text-muted-foreground">VALUE</th>
                        <th className="text-right p-4 font-display text-xs text-muted-foreground">24H</th>
                        <th className="text-center p-4 font-display text-xs text-muted-foreground">PUMP POTENTIAL</th>
                        <th className="text-center p-4 font-display text-xs text-muted-foreground">RISK</th>
                        <th className="text-center p-4 font-display text-xs text-muted-foreground">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.holdings.map((holding) => {
                        const rec = getRecommendationStyle(holding.recommendation);
                        const RecIcon = rec.icon;
                        return (
                          <tr key={holding.symbol} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="font-display font-bold text-primary text-sm">
                                    {holding.symbol[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-display font-bold">{holding.symbol}</div>
                                  <div className="text-xs text-muted-foreground">{holding.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-bold">${holding.value.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {holding.balance.toLocaleString()} {holding.symbol}
                              </div>
                            </td>
                            <td className={cn("p-4 text-right font-medium", holding.change24h >= 0 ? "text-success" : "text-danger")}>
                              <div className="flex items-center justify-end gap-1">
                                {holding.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {holding.change24h >= 0 ? "+" : ""}{holding.change24h.toFixed(1)}%
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", getPumpPotentialColor(holding.pumpPotential))}>
                                {holding.pumpPotential}
                              </span>
                            </td>
                            <td className={cn("p-4 text-center font-bold uppercase text-sm", getRiskColor(holding.riskLevel))}>
                              {holding.riskLevel}
                            </td>
                            <td className="p-4 text-center">
                              <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold", rec.bg, rec.color)}>
                                <RecIcon className="w-3 h-3" />
                                {rec.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Token Insights */}
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.holdings.map((holding) => (
                  <div key={holding.symbol} className="holo-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-display font-bold text-primary">{holding.symbol}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded", getPumpPotentialColor(holding.pumpPotential))}>
                        {holding.pumpPotential.toUpperCase()} PUMP
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{holding.insight}</p>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="gap-2" onClick={() => window.open(`https://debank.com/profile/${address}`, "_blank")}>
                  <ExternalLink className="w-4 h-4" />
                  View on DeBank
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => window.open(`https://zerion.io/${address}`, "_blank")}>
                  <ExternalLink className="w-4 h-4" />
                  View on Zerion
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!analysis && !isAnalyzing && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Enter a Wallet to Analyze</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get AI-powered insights on any wallet's holdings, find tokens with pump potential, and see actionable recommendations
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
