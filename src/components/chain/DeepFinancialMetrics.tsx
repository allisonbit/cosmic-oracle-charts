import { ChainConfig } from "@/lib/chainConfig";
import { TrendingUp, TrendingDown, BarChart3, ArrowRightLeft, Wallet, DollarSign, Activity, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DeepFinancialMetricsProps {
  chain: ChainConfig;
  financialData?: FinancialMetricsData;
  isLoading: boolean;
}

export interface FinancialMetricsData {
  realizedPrice: number;
  currentPrice: number;
  urpdDistribution: { priceRange: string; percentage: number }[];
  mvrvRatio: number;
  soprValue: number;
  nvtRatio: number;
  exchangeNetflow: {
    binance: number;
    coinbase: number;
    kraken: number;
    totalNetflow: number;
  };
  stablecoinMetrics: {
    dominance: number;
    usdt: number;
    usdc: number;
    dai: number;
    netFlow24h: number;
  };
  futuresData: {
    openInterest: number;
    fundingRate: number;
    longRatio: number;
    liquidations24h: number;
  };
  optionsData: {
    callVolume: number;
    putVolume: number;
    putCallRatio: number;
    maxPainPrice: number;
    impliedVolatility: number;
  };
}

export function DeepFinancialMetrics({ chain, financialData, isLoading }: DeepFinancialMetricsProps) {
  const formatNumber = (n: number, decimals = 2) => {
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(decimals) + "B";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(decimals) + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(decimals) + "K";
    return n.toFixed(decimals);
  };

  if (isLoading || !financialData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const mvrvStatus = financialData.mvrvRatio > 3 ? "overvalued" : financialData.mvrvRatio < 1 ? "undervalued" : "fair";

  return (
    <div className="holo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">Deep Financial Analytics</h3>
          <p className="text-sm text-muted-foreground">On-chain valuation metrics</p>
        </div>
      </div>

      {/* Key Ratios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Realized Price</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            ${financialData.realizedPrice.toLocaleString()}
          </div>
          <span className={`text-xs ${financialData.currentPrice > financialData.realizedPrice ? "text-green-400" : "text-red-400"}`}>
            Current: ${financialData.currentPrice.toLocaleString()}
          </span>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">MVRV Ratio</span>
          </div>
          <div className={`text-xl font-bold ${mvrvStatus === "overvalued" ? "text-red-400" : mvrvStatus === "undervalued" ? "text-green-400" : "text-yellow-400"}`}>
            {financialData.mvrvRatio.toFixed(2)}
          </div>
          <Badge variant="outline" className={`text-xs ${mvrvStatus === "overvalued" ? "border-red-400/30 text-red-400" : mvrvStatus === "undervalued" ? "border-green-400/30 text-green-400" : "border-yellow-400/30 text-yellow-400"}`}>
            {mvrvStatus}
          </Badge>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">SOPR</span>
          </div>
          <div className={`text-xl font-bold ${financialData.soprValue > 1 ? "text-green-400" : "text-red-400"}`}>
            {financialData.soprValue.toFixed(3)}
          </div>
          <span className="text-xs text-muted-foreground">
            {financialData.soprValue > 1 ? "Profit taking" : "Loss realization"}
          </span>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-muted-foreground">NVT Ratio</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {financialData.nvtRatio.toFixed(1)}
          </div>
          <span className={`text-xs ${financialData.nvtRatio < 50 ? "text-green-400" : financialData.nvtRatio > 100 ? "text-red-400" : "text-yellow-400"}`}>
            {financialData.nvtRatio < 50 ? "Undervalued" : financialData.nvtRatio > 100 ? "Overvalued" : "Fair Value"}
          </span>
        </div>
      </div>

      {/* URPD Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">UTXO Realized Price Distribution</h4>
        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="space-y-2">
            {financialData.urpdDistribution.map((band, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24">{band.priceRange}</span>
                <div className="flex-1">
                  <Progress value={band.percentage} className="h-3" />
                </div>
                <span className="text-xs font-medium text-foreground w-12 text-right">
                  {band.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exchange Netflow */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-blue-400" />
            Exchange Netflow (24h)
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="space-y-3">
              {[
                { name: "Binance", value: financialData.exchangeNetflow.binance },
                { name: "Coinbase", value: financialData.exchangeNetflow.coinbase },
                { name: "Kraken", value: financialData.exchangeNetflow.kraken },
              ].map((ex) => (
                <div key={ex.name} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{ex.name}</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${ex.value > 0 ? "text-red-400" : "text-green-400"}`}>
                    {ex.value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatNumber(Math.abs(ex.value))} {chain.symbol}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Netflow</span>
                <span className={`text-lg font-bold ${financialData.exchangeNetflow.totalNetflow > 0 ? "text-red-400" : "text-green-400"}`}>
                  {financialData.exchangeNetflow.totalNetflow > 0 ? "+" : ""}
                  {formatNumber(financialData.exchangeNetflow.totalNetflow)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-green-400" />
            Stablecoin Flows
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Dominance</span>
              <span className="text-lg font-bold text-foreground">{financialData.stablecoinMetrics.dominance.toFixed(1)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">USDT</div>
                <div className="text-sm font-medium text-green-400">${formatNumber(financialData.stablecoinMetrics.usdt)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">USDC</div>
                <div className="text-sm font-medium text-blue-400">${formatNumber(financialData.stablecoinMetrics.usdc)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">DAI</div>
                <div className="text-sm font-medium text-yellow-400">${formatNumber(financialData.stablecoinMetrics.dai)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="text-sm text-muted-foreground">24h Net Flow</span>
              <span className={`font-medium ${financialData.stablecoinMetrics.netFlow24h > 0 ? "text-green-400" : "text-red-400"}`}>
                {financialData.stablecoinMetrics.netFlow24h > 0 ? "+" : ""}${formatNumber(financialData.stablecoinMetrics.netFlow24h)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Futures & Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            Futures Market
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground block">Open Interest</span>
                <span className="text-lg font-bold text-foreground">${formatNumber(financialData.futuresData.openInterest)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Funding Rate</span>
                <span className={`text-lg font-bold ${financialData.futuresData.fundingRate > 0 ? "text-green-400" : "text-red-400"}`}>
                  {financialData.futuresData.fundingRate > 0 ? "+" : ""}{(financialData.futuresData.fundingRate * 100).toFixed(4)}%
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Long Ratio</span>
                <span className="text-lg font-bold text-foreground">{financialData.futuresData.longRatio.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">24h Liquidations</span>
                <span className="text-lg font-bold text-red-400">${formatNumber(financialData.futuresData.liquidations24h)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-purple-400" />
            Options Market
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground block">Call Volume</span>
                <span className="text-lg font-bold text-green-400">${formatNumber(financialData.optionsData.callVolume)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Put Volume</span>
                <span className="text-lg font-bold text-red-400">${formatNumber(financialData.optionsData.putVolume)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Put/Call Ratio</span>
                <span className={`text-lg font-bold ${financialData.optionsData.putCallRatio > 1 ? "text-red-400" : "text-green-400"}`}>
                  {financialData.optionsData.putCallRatio.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Max Pain</span>
                <span className="text-lg font-bold text-yellow-400">${financialData.optionsData.maxPainPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Implied Volatility</span>
              <span className="text-lg font-bold text-foreground">{financialData.optionsData.impliedVolatility.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}