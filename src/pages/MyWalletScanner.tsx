import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Wallet, Loader2, TrendingUp, TrendingDown, AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  value_usd: number;
  price: number;
  change_24h: number;
}

interface WalletAnalysis {
  address: string;
  totalValue: number;
  holdings: TokenHolding[];
  riskScore: number;
  diversificationScore: number;
  insight: string;
  warnings: string[];
}

function ScannerContent() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);

  const scanWallet = async () => {
    if (!address.trim()) {
      toast.error("Enter a wallet address");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-scanner", {
        body: { address: address.trim() },
      });
      if (error) throw error;
      setAnalysis(data);
      toast.success("Wallet scanned successfully");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-emerald-500";
    if (score <= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return "Low Risk";
    if (score <= 60) return "Medium Risk";
    return "High Risk";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wallet Scanner</h1>
            <p className="text-sm text-muted-foreground">Analyze any wallet — holdings, risk, and AI insights</p>
          </div>
        </div>

        {/* Search */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Paste any wallet address (0x..., ENS, Solana...)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && scanWallet()}
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={scanWallet} disabled={loading} className="shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                  <p className="text-xl font-bold text-foreground">${analysis.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tokens</p>
                  <p className="text-xl font-bold text-foreground">{analysis.holdings.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <p className={cn("text-xl font-bold", getRiskColor(analysis.riskScore))}>{analysis.riskScore}/100</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{getRiskLabel(analysis.riskScore)}</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Diversity</p>
                  <p className="text-xl font-bold text-foreground">{analysis.diversificationScore}/100</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insight */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">AI Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analysis.insight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" /> Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {analysis.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {w}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Holdings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.holdings
                    .sort((a, b) => b.value_usd - a.value_usd)
                    .map((token, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{token.symbol.slice(0, 2)}</div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{token.symbol}</p>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground text-sm">${token.value_usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          <div className="flex items-center gap-1 justify-end">
                            {token.change_24h >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={cn("text-xs", token.change_24h >= 0 ? "text-emerald-500" : "text-red-500")}>
                              {token.change_24h >= 0 ? "+" : ""}{token.change_24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* External links */}
            <div className="flex flex-wrap gap-2">
              {["Etherscan", "DeBank", "Zerion"].map((label) => (
                <Button key={label} variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" /> {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function MyWalletScanner() {
  return (
    <ProtectedRoute>
      <ScannerContent />
    </ProtectedRoute>
  );
}
