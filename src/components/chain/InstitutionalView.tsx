import { ChainConfig } from "@/lib/chainConfig";
import { Building2, TrendingUp, TrendingDown, BarChart3, DollarSign, Pickaxe, PieChart, LineChart, ArrowUpDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface InstitutionalViewProps {
  chain: ChainConfig;
  institutionalData?: InstitutionalData;
  isLoading: boolean;
}

export interface InstitutionalData {
  grayscalePremium: {
    product: string;
    nav: number;
    marketPrice: number;
    premiumDiscount: number;
    aum: number;
  }[];
  etfFlows: {
    etf: string;
    flow24h: number;
    flow7d: number;
    totalAum: number;
    correlation: number;
  }[];
  cmeFuturesAnalysis: {
    openInterest: number;
    volume24h: number;
    basis: number;
    basisAnnualized: number;
    spotPrice: number;
    frontMonthPrice: number;
    institutionalLongRatio: number;
  };
  minerProfitability: {
    metric: string;
    value: number | string;
    change24h: number;
    status: "profitable" | "marginal" | "unprofitable";
  }[];
  validatorEconomics: {
    totalValidators: number;
    stakingYield: number;
    mevRevenue: number;
    avgValidatorBalance: number;
    profitabilityScore: number;
    breakEvenPrice: number;
  };
  institutionalHoldings: {
    holder: string;
    holdings: number;
    percentSupply: number;
    change30d: number;
  }[];
}

export function InstitutionalView({ chain, institutionalData, isLoading }: InstitutionalViewProps) {
  const formatNumber = (n: number, decimals = 2) => {
    if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(decimals) + "B";
    if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(decimals) + "M";
    if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(decimals) + "K";
    return "$" + n.toFixed(decimals);
  };

  if (isLoading || !institutionalData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="holo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Building2 className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">Institutional Analytics</h3>
          <p className="text-sm text-muted-foreground">Professional-grade market intelligence</p>
        </div>
      </div>

      {/* Grayscale Premium/Discount */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-blue-400" />
          Grayscale Premium/Discount Tracker
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Product</th>
                <th className="text-right p-3 text-muted-foreground font-medium">NAV</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Market Price</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Premium/Discount</th>
                <th className="text-right p-3 text-muted-foreground font-medium">AUM</th>
              </tr>
            </thead>
            <tbody>
              {institutionalData.grayscalePremium.map((product, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0">
                  <td className="p-3 font-medium text-foreground">{product.product}</td>
                  <td className="p-3 text-right text-foreground">${product.nav.toFixed(2)}</td>
                  <td className="p-3 text-right text-foreground">${product.marketPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className={`font-medium ${product.premiumDiscount > 0 ? "text-green-400" : "text-red-400"}`}>
                      {product.premiumDiscount > 0 ? "+" : ""}{product.premiumDiscount.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-3 text-right text-foreground">{formatNumber(product.aum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ETF Flow Correlations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <LineChart className="h-4 w-4 text-green-400" />
          ETF Flow Correlations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {institutionalData.etfFlows.map((etf, i) => (
            <div key={i} className="bg-background/40 border border-border/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{etf.etf}</span>
                <Badge variant="outline" className={`text-xs ${etf.correlation > 0.7 ? "text-green-400 border-green-400/30" : "text-yellow-400 border-yellow-400/30"}`}>
                  {(etf.correlation * 100).toFixed(0)}% corr
                </Badge>
              </div>
              <div className="text-lg font-bold text-foreground mb-2">{formatNumber(etf.totalAum)}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">24h Flow</span>
                  <div className={`font-medium ${etf.flow24h > 0 ? "text-green-400" : "text-red-400"}`}>
                    {etf.flow24h > 0 ? "+" : ""}{formatNumber(etf.flow24h)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">7d Flow</span>
                  <div className={`font-medium ${etf.flow7d > 0 ? "text-green-400" : "text-red-400"}`}>
                    {etf.flow7d > 0 ? "+" : ""}{formatNumber(etf.flow7d)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CME Futures vs Spot */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-400" />
            CME Futures vs Spot Analysis
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-muted-foreground block">Open Interest</span>
                <span className="text-xl font-bold text-foreground">{formatNumber(institutionalData.cmeFuturesAnalysis.openInterest)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">24h Volume</span>
                <span className="text-xl font-bold text-foreground">{formatNumber(institutionalData.cmeFuturesAnalysis.volume24h)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Spot Price</span>
                <span className="text-sm font-medium text-foreground">${institutionalData.cmeFuturesAnalysis.spotPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Front Month</span>
                <span className="text-sm font-medium text-foreground">${institutionalData.cmeFuturesAnalysis.frontMonthPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Basis</span>
                <span className={`text-sm font-medium ${institutionalData.cmeFuturesAnalysis.basis > 0 ? "text-green-400" : "text-red-400"}`}>
                  {institutionalData.cmeFuturesAnalysis.basis > 0 ? "+" : ""}{institutionalData.cmeFuturesAnalysis.basis.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Annualized Basis</span>
                <span className={`text-sm font-medium ${institutionalData.cmeFuturesAnalysis.basisAnnualized > 0 ? "text-green-400" : "text-red-400"}`}>
                  {institutionalData.cmeFuturesAnalysis.basisAnnualized.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Institutional Long Ratio</span>
                <span className="text-lg font-bold text-foreground">{institutionalData.cmeFuturesAnalysis.institutionalLongRatio}%</span>
              </div>
              <Progress value={institutionalData.cmeFuturesAnalysis.institutionalLongRatio} className="h-2 mt-2" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Pickaxe className="h-4 w-4 text-yellow-400" />
            Validator Economics
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-muted-foreground block">Total Validators</span>
                <span className="text-xl font-bold text-foreground">{institutionalData.validatorEconomics.totalValidators.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Profitability Score</span>
                <span className={`text-xl font-bold ${institutionalData.validatorEconomics.profitabilityScore > 70 ? "text-green-400" : institutionalData.validatorEconomics.profitabilityScore > 40 ? "text-yellow-400" : "text-red-400"}`}>
                  {institutionalData.validatorEconomics.profitabilityScore}/100
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staking Yield</span>
                <span className="text-sm font-medium text-green-400">{institutionalData.validatorEconomics.stakingYield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MEV Revenue (avg)</span>
                <span className="text-sm font-medium text-foreground">{formatNumber(institutionalData.validatorEconomics.mevRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Validator Balance</span>
                <span className="text-sm font-medium text-foreground">{institutionalData.validatorEconomics.avgValidatorBalance.toFixed(2)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Break-Even Price</span>
                <span className="text-sm font-medium text-yellow-400">${institutionalData.validatorEconomics.breakEvenPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Miner/Validator Profitability */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-400" />
          Mining/Staking Profitability Calculator
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {institutionalData.minerProfitability.map((metric, i) => (
            <div key={i} className={`bg-background/40 border rounded-lg p-4 ${
              metric.status === "profitable" ? "border-green-400/30" : 
              metric.status === "marginal" ? "border-yellow-400/30" : "border-red-400/30"
            }`}>
              <span className="text-xs text-muted-foreground block mb-1">{metric.metric}</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  {typeof metric.value === "number" ? formatNumber(metric.value) : metric.value}
                </span>
                <span className={`text-xs ${metric.change24h > 0 ? "text-green-400" : "text-red-400"}`}>
                  {metric.change24h > 0 ? "↑" : "↓"} {Math.abs(metric.change24h).toFixed(1)}%
                </span>
              </div>
              <Badge variant="outline" className={`text-xs mt-2 ${
                metric.status === "profitable" ? "text-green-400 border-green-400/30" : 
                metric.status === "marginal" ? "text-yellow-400 border-yellow-400/30" : "text-red-400 border-red-400/30"
              }`}>
                {metric.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Holdings */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-purple-400" />
          Top Institutional Holdings
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Institution</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Holdings</th>
                <th className="text-right p-3 text-muted-foreground font-medium">% Supply</th>
                <th className="text-right p-3 text-muted-foreground font-medium">30d Change</th>
              </tr>
            </thead>
            <tbody>
              {institutionalData.institutionalHoldings.map((holder, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0">
                  <td className="p-3 font-medium text-foreground">{holder.holder}</td>
                  <td className="p-3 text-right text-foreground">{holder.holdings.toLocaleString()} {chain.symbol}</td>
                  <td className="p-3 text-right text-foreground">{holder.percentSupply.toFixed(2)}%</td>
                  <td className="p-3 text-right">
                    <span className={`flex items-center justify-end gap-1 ${holder.change30d > 0 ? "text-green-400" : "text-red-400"}`}>
                      {holder.change30d > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {holder.change30d > 0 ? "+" : ""}{holder.change30d.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
