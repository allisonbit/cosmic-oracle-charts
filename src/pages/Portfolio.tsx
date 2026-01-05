import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Wallet, TrendingUp, TrendingDown, 
  AlertTriangle, Zap, Loader2, Brain, Target, 
  Rocket, Shield, BarChart3, Clock, ExternalLink,
  Copy, Check, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { TokenDetailModal } from "@/components/portfolio/TokenDetailModal";
import { HoldingsDistribution } from "@/components/portfolio/HoldingsDistribution";
import { PortfolioSchema, PortfolioSEOContent } from "@/components/seo";

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
  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null);
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const analyzeWallet = async () => {
    if (!address.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/) && !address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      toast.error("Please enter a valid EVM or Solana wallet address");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    
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

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopiedAddress(false), 2000);
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

  const displayedHoldings = showAllHoldings ? analysis?.holdings : analysis?.holdings.slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col">
      <PortfolioSchema />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20 pb-24 sm:pb-12 cosmic-bg">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-2 sm:mb-4">
              <span className="glow-text">WALLET</span>{" "}
              <span className="text-gradient-cosmic">SCANNER</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
              AI-powered analysis to find pumping tokens, assess risk, and get actionable insights for any wallet
            </p>
          </div>

          {/* SEO Content Block - shown when no analysis */}
          {!analysis && <PortfolioSEOContent />}

          {/* Search */}
          <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
            <div className="holo-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Wallet className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter wallet address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base"
                    onKeyDown={(e) => e.key === "Enter" && analyzeWallet()}
                  />
                </div>
                <Button 
                  onClick={analyzeWallet} 
                  disabled={isAnalyzing}
                  className="h-11 sm:h-12 px-6 sm:px-8 gap-2 w-full sm:w-auto touch-manipulation active:scale-95"
                  variant="cosmic"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="text-sm sm:text-base">Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Scan Wallet</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3 text-center">
                Supports Ethereum, Polygon, Arbitrum, Base, and Solana wallets
              </p>
            </div>
          </div>

          {/* Results */}
          {analysis && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              {/* Wallet Info Bar */}
              <div className="holo-card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Wallet Address</div>
                    <div className="font-mono text-xs sm:text-sm flex items-center gap-2">
                      <span className="hidden md:inline">{analysis.address}</span>
                      <span className="md:hidden">{analysis.address.slice(0, 8)}...{analysis.address.slice(-6)}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6" onClick={copyWalletAddress}>
                        {copiedAddress ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-success" /> : <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  Scanned {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="holo-card p-4 sm:p-6 hover:border-primary/50 transition-colors">
                  <div className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Total Value</span>
                    <span className="sm:hidden">Value</span>
                  </div>
                  <div className="text-lg sm:text-2xl md:text-3xl font-display font-bold">
                    ${analysis.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    {analysis.holdings.length} tokens
                  </div>
                </div>
                <div className="holo-card p-4 sm:p-6 hover:border-primary/50 transition-colors">
                  <div className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Risk Score</span>
                    <span className="sm:hidden">Risk</span>
                  </div>
                  <div className={cn(
                    "text-lg sm:text-2xl md:text-3xl font-display font-bold",
                    analysis.riskScore > 70 ? "text-danger" : analysis.riskScore > 40 ? "text-warning" : "text-success"
                  )}>
                    {analysis.riskScore}/100
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    {analysis.riskScore > 70 ? "High Risk" : analysis.riskScore > 40 ? "Moderate" : "Low Risk"}
                  </div>
                </div>
                <div className="holo-card p-4 sm:p-6 hover:border-primary/50 transition-colors">
                  <div className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Diversification</span>
                    <span className="sm:hidden">Diverse</span>
                  </div>
                  <div className={cn(
                    "text-lg sm:text-2xl md:text-3xl font-display font-bold",
                    analysis.diversificationScore > 70 ? "text-success" : analysis.diversificationScore > 40 ? "text-warning" : "text-danger"
                  )}>
                    {analysis.diversificationScore}/100
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    {analysis.diversificationScore > 70 ? "Well Diversified" : analysis.diversificationScore > 40 ? "Moderate" : "Concentrated"}
                  </div>
                </div>
                <div className="holo-card p-4 sm:p-6 hover:border-primary/50 transition-colors">
                  <div className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
                    Top Picks
                  </div>
                  <div className="text-sm sm:text-xl md:text-2xl font-display font-bold text-success truncate">
                    {analysis.topPicks.length > 0 ? analysis.topPicks.slice(0, 2).join(", ") : "None"}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    High potential
                  </div>
                </div>
              </div>

              {/* Portfolio Chart */}
              <PortfolioChart totalValue={analysis.totalValue} holdings={analysis.holdings} />

              {/* Holdings Distribution */}
              <HoldingsDistribution holdings={analysis.holdings} totalValue={analysis.totalValue} />

              {/* AI Insight */}
              <div className="holo-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg mb-2">AI Portfolio Analysis</h3>
                    <p className="text-muted-foreground">{analysis.overallInsight}</p>
                    {analysis.warnings.length > 0 && (
                      <div className="mt-4 space-y-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="text-sm font-medium text-warning flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Warnings
                        </div>
                        {analysis.warnings.map((warning, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground pl-6">
                            <span>•</span>
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Holdings - Mobile Cards + Desktop Table */}
              <div className="holo-card overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="font-display font-bold text-lg sm:text-xl flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Holdings Analysis
                  </h2>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Tap any token for details
                  </div>
                </div>
                
                {/* Mobile Cards View */}
                <div className="block sm:hidden p-3 space-y-3">
                  {displayedHoldings?.map((holding, index) => {
                    const rec = getRecommendationStyle(holding.recommendation);
                    const RecIcon = rec.icon;
                    return (
                      <button
                        key={`mobile-${holding.symbol}-${index}`}
                        className="w-full p-4 rounded-lg bg-muted/20 border border-border/50 active:border-primary/50 active:scale-[0.98] transition-all text-left touch-manipulation"
                        onClick={() => setSelectedToken(holding)}
                      >
                        <div className="flex items-center justify-between mb-3">
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
                          <div className={cn("flex items-center gap-1 font-medium text-sm", holding.change24h >= 0 ? "text-success" : "text-danger")}>
                            {holding.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {holding.change24h >= 0 ? "+" : ""}{holding.change24h.toFixed(2)}%
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Price</div>
                            <div className="font-medium text-sm">${holding.price < 0.01 ? holding.price.toFixed(6) : holding.price.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Value</div>
                            <div className="font-bold text-sm">${holding.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", getPumpPotentialColor(holding.pumpPotential))}>
                              {holding.pumpPotential}
                            </span>
                            <span className={cn("text-[10px] font-bold uppercase", getRiskColor(holding.riskLevel))}>
                              {holding.riskLevel} RISK
                            </span>
                          </div>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", rec.bg, rec.color)}>
                            <RecIcon className="w-2.5 h-2.5" />
                            {rec.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-display text-xs text-muted-foreground">TOKEN</th>
                        <th className="text-right p-4 font-display text-xs text-muted-foreground">PRICE</th>
                        <th className="text-right p-4 font-display text-xs text-muted-foreground">VALUE</th>
                        <th className="text-right p-4 font-display text-xs text-muted-foreground">24H</th>
                        <th className="text-center p-4 font-display text-xs text-muted-foreground">PUMP</th>
                        <th className="text-center p-4 font-display text-xs text-muted-foreground">RISK</th>
                        <th className="text-center p-4 font-display text-xs text-muted-foreground">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedHoldings?.map((holding, index) => {
                        const rec = getRecommendationStyle(holding.recommendation);
                        const RecIcon = rec.icon;
                        return (
                          <tr 
                            key={`${holding.symbol}-${index}`} 
                            className="border-b border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
                            onClick={() => setSelectedToken(holding)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="font-display font-bold text-primary text-sm">
                                    {holding.symbol[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-display font-bold flex items-center gap-2">
                                    {holding.symbol}
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  <div className="text-xs text-muted-foreground">{holding.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-medium">
                                ${holding.price < 0.01 ? holding.price.toFixed(6) : holding.price.toLocaleString()}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-bold">${holding.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                              <div className="text-xs text-muted-foreground">
                                {holding.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {holding.symbol}
                              </div>
                            </td>
                            <td className={cn("p-4 text-right font-medium", holding.change24h >= 0 ? "text-success" : "text-danger")}>
                              <div className="flex items-center justify-end gap-1">
                                {holding.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {holding.change24h >= 0 ? "+" : ""}{holding.change24h.toFixed(2)}%
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
                {analysis.holdings.length > 10 && (
                  <div className="p-4 border-t border-border text-center">
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={() => setShowAllHoldings(!showAllHoldings)}
                    >
                      {showAllHoldings ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show All {analysis.holdings.length} Holdings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Token Insights */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Token-by-Token Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.holdings.slice(0, 6).map((holding, index) => (
                    <div 
                      key={`${holding.symbol}-insight-${index}`} 
                      className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedToken(holding)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-display font-bold text-primary text-xs">
                              {holding.symbol[0]}
                            </span>
                          </div>
                          <span className="font-display font-bold text-primary">{holding.symbol}</span>
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded", getPumpPotentialColor(holding.pumpPotential))}>
                          {holding.pumpPotential.toUpperCase()} PUMP
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{holding.insight}</p>
                      <div className="mt-2 text-xs text-primary hover:underline">Click for full analysis →</div>
                    </div>
                  ))}
                </div>
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
                <Button variant="outline" className="gap-2" onClick={() => window.open(`https://etherscan.io/address/${address}`, "_blank")}>
                  <ExternalLink className="w-4 h-4" />
                  Etherscan
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => window.open(`https://arbiscan.io/address/${address}`, "_blank")}>
                  <ExternalLink className="w-4 h-4" />
                  Arbiscan
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!analysis && !isAnalyzing && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-12 h-12 text-primary/50" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Enter a Wallet to Analyze</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Get AI-powered insights on any wallet's holdings, find tokens with pump potential, and see actionable recommendations
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Real-time data
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  AI-powered analysis
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  Multi-chain support
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Scanning Wallet...</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Fetching token balances across Ethereum, Polygon, Arbitrum, and Base networks
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Token Detail Modal */}
      <TokenDetailModal
        token={selectedToken}
        isOpen={!!selectedToken}
        onClose={() => setSelectedToken(null)}
      />
    </div>
  );
}
