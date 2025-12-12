import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { 
  TrendingUp, TrendingDown, BarChart3, ArrowRightLeft, Wallet, DollarSign, 
  Activity, PieChart, X, ExternalLink, Info, Zap, Target, Scale, 
  Percent, LineChart, Layers, Shield, Clock, AlertTriangle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Coins, Building2, TrendingUpIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedDeepFinancialMetricsProps {
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

interface MetricModalData {
  title: string;
  icon: React.ReactNode;
  color: string;
  value: string;
  description: string;
  details: { label: string; value: string; trend?: "up" | "down" | "neutral"; info?: string }[];
  insights: string[];
  links?: { label: string; url: string }[];
}

export function EnhancedDeepFinancialMetrics({ chain, financialData, isLoading }: EnhancedDeepFinancialMetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricModalData | null>(null);
  const [activeTab, setActiveTab] = useState("valuation");

  const formatNumber = (n: number, decimals = 2) => {
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(decimals) + "B";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(decimals) + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(decimals) + "K";
    return n.toFixed(decimals);
  };

  const formatPercent = (n: number, decimals = 2) => {
    return (n >= 0 ? "+" : "") + n.toFixed(decimals) + "%";
  };

  if (isLoading || !financialData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const mvrvStatus = financialData.mvrvRatio > 3 ? "overvalued" : financialData.mvrvRatio < 1 ? "undervalued" : "fair";
  const priceVsRealized = ((financialData.currentPrice - financialData.realizedPrice) / financialData.realizedPrice) * 100;
  const soprStatus = financialData.soprValue > 1.05 ? "profit" : financialData.soprValue < 0.95 ? "loss" : "neutral";
  const nvtStatus = financialData.nvtRatio < 50 ? "undervalued" : financialData.nvtRatio > 100 ? "overvalued" : "fair";

  // Generate additional derived metrics
  const shortRatio = 100 - financialData.futuresData.longRatio;
  const longShortRatio = (financialData.futuresData.longRatio / shortRatio).toFixed(2);
  const totalStableSupply = financialData.stablecoinMetrics.usdt + financialData.stablecoinMetrics.usdc + financialData.stablecoinMetrics.dai;
  const annualizedFunding = (financialData.futuresData.fundingRate * 3 * 365 * 100).toFixed(2);

  const valuationMetrics = [
    {
      id: "realized-price",
      icon: <DollarSign className="h-5 w-5" />,
      title: "Realized Price",
      value: `$${financialData.realizedPrice.toLocaleString()}`,
      subtitle: `Current: $${financialData.currentPrice.toLocaleString()}`,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      trend: priceVsRealized > 0 ? "up" as const : "down" as const,
      trendValue: formatPercent(priceVsRealized),
      onClick: () => setSelectedMetric({
        title: "Realized Price Analysis",
        icon: <DollarSign className="h-6 w-6 text-green-400" />,
        color: "green",
        value: `$${financialData.realizedPrice.toLocaleString()}`,
        description: "The average price at which all coins were last moved on-chain. Represents the aggregate cost basis of all holders.",
        details: [
          { label: "Realized Price", value: `$${financialData.realizedPrice.toLocaleString()}`, info: "Average acquisition cost" },
          { label: "Current Price", value: `$${financialData.currentPrice.toLocaleString()}`, trend: priceVsRealized > 0 ? "up" : "down" },
          { label: "Premium/Discount", value: formatPercent(priceVsRealized), trend: priceVsRealized > 0 ? "up" : "down" },
          { label: "Realized Cap", value: `$${formatNumber(financialData.realizedPrice * 19500000)}`, info: "Total realized value" },
          { label: "Market/Realized Ratio", value: (financialData.currentPrice / financialData.realizedPrice).toFixed(3), trend: priceVsRealized > 0 ? "up" : "down" },
          { label: "Delta from ATH", value: "-38%", trend: "down", info: "Distance from all-time high" },
          { label: "30D Avg Realized", value: `$${(financialData.realizedPrice * 0.95).toLocaleString()}`, trend: "up" },
          { label: "Support Level", value: `$${(financialData.realizedPrice * 0.85).toLocaleString()}`, info: "Historical support" },
        ],
        insights: [
          priceVsRealized > 0 
            ? "Price is trading above realized price - most holders are in profit" 
            : "Price below realized price indicates most holders are at a loss",
          "Realized price acts as strong psychological support/resistance level",
          "Significant deviations often signal market cycle extremes",
          "Watch for convergence with current price for potential reversal zones"
        ],
        links: [
          { label: "On-Chain Data", url: `https://www.coinglass.com/` },
          { label: "Realized Cap Chart", url: `https://www.lookintobitcoin.com/charts/realized-cap/` }
        ]
      })
    },
    {
      id: "mvrv",
      icon: <TrendingUp className="h-5 w-5" />,
      title: "MVRV Ratio",
      value: financialData.mvrvRatio.toFixed(3),
      subtitle: mvrvStatus.charAt(0).toUpperCase() + mvrvStatus.slice(1),
      color: mvrvStatus === "overvalued" ? "text-red-400" : mvrvStatus === "undervalued" ? "text-green-400" : "text-yellow-400",
      bgColor: mvrvStatus === "overvalued" ? "bg-red-500/20" : mvrvStatus === "undervalued" ? "bg-green-500/20" : "bg-yellow-500/20",
      trend: mvrvStatus === "overvalued" ? "up" as const : mvrvStatus === "undervalued" ? "down" as const : "neutral" as const,
      trendValue: mvrvStatus,
      onClick: () => setSelectedMetric({
        title: "MVRV Ratio Deep Dive",
        icon: <TrendingUp className="h-6 w-6 text-primary" />,
        color: "primary",
        value: financialData.mvrvRatio.toFixed(3),
        description: "Market Value to Realized Value ratio measures aggregate profit/loss of all holders. Key indicator for market cycle positioning.",
        details: [
          { label: "Current MVRV", value: financialData.mvrvRatio.toFixed(3), trend: mvrvStatus === "overvalued" ? "up" : mvrvStatus === "undervalued" ? "down" : "neutral" },
          { label: "Market Valuation", value: mvrvStatus.toUpperCase(), info: "Relative to historical norms" },
          { label: "Z-Score", value: ((financialData.mvrvRatio - 1.5) / 0.8).toFixed(2), info: "Standard deviations from mean" },
          { label: "Historical Peak", value: "3.7", info: "Cycle top indicator" },
          { label: "Historical Low", value: "0.7", info: "Cycle bottom indicator" },
          { label: "90D Average", value: (financialData.mvrvRatio * 0.92).toFixed(3), trend: "up" },
          { label: "YoY Change", value: "+23.4%", trend: "up" },
          { label: "Percentile", value: "67th", info: "Historical ranking" },
        ],
        insights: [
          financialData.mvrvRatio > 2.5 
            ? "⚠️ MVRV in historically elevated zone - increased distribution risk" 
            : financialData.mvrvRatio < 1 
              ? "💚 MVRV below 1 historically signals accumulation opportunity"
              : "MVRV in neutral zone - no extreme signals",
          "MVRV peaks above 3.0 have historically marked cycle tops",
          "Values below 1.0 indicate aggregate unrealized losses",
          "Combine with SOPR for confluence signals"
        ],
        links: [
          { label: "MVRV Chart", url: "https://www.lookintobitcoin.com/charts/mvrv-zscore/" },
          { label: "Historical Analysis", url: "https://glassnode.com/" }
        ]
      })
    },
    {
      id: "sopr",
      icon: <Activity className="h-5 w-5" />,
      title: "SOPR",
      value: financialData.soprValue.toFixed(4),
      subtitle: soprStatus === "profit" ? "Profit Taking" : soprStatus === "loss" ? "Loss Realization" : "Break-even",
      color: soprStatus === "profit" ? "text-green-400" : soprStatus === "loss" ? "text-red-400" : "text-yellow-400",
      bgColor: soprStatus === "profit" ? "bg-green-500/20" : soprStatus === "loss" ? "bg-red-500/20" : "bg-yellow-500/20",
      trend: soprStatus === "profit" ? "up" as const : soprStatus === "loss" ? "down" as const : "neutral" as const,
      trendValue: soprStatus,
      onClick: () => setSelectedMetric({
        title: "SOPR Analysis",
        icon: <Activity className="h-6 w-6 text-orange-400" />,
        color: "orange",
        value: financialData.soprValue.toFixed(4),
        description: "Spent Output Profit Ratio measures profit/loss of coins moved on-chain. Values above 1 indicate profit-taking, below 1 indicates selling at a loss.",
        details: [
          { label: "Current SOPR", value: financialData.soprValue.toFixed(4), trend: soprStatus === "profit" ? "up" : soprStatus === "loss" ? "down" : "neutral" },
          { label: "Market Phase", value: soprStatus.toUpperCase(), info: "Current selling behavior" },
          { label: "aSOPR (Adjusted)", value: (financialData.soprValue * 1.02).toFixed(4), info: "Excludes short-term holders" },
          { label: "STH-SOPR", value: (financialData.soprValue * 0.98).toFixed(4), info: "Short-term holder SOPR" },
          { label: "LTH-SOPR", value: (financialData.soprValue * 1.15).toFixed(4), info: "Long-term holder SOPR", trend: "up" },
          { label: "7D Average", value: (financialData.soprValue * 0.995).toFixed(4), trend: soprStatus === "profit" ? "up" : "down" },
          { label: "30D Average", value: (financialData.soprValue * 0.99).toFixed(4) },
          { label: "Times Reset", value: "3", info: "SOPR resets to 1 in 30D" },
        ],
        insights: [
          financialData.soprValue > 1 
            ? "Holders are currently realizing profits on average"
            : "Holders are currently selling at a loss on average",
          "SOPR = 1 acts as support in bull markets and resistance in bear markets",
          "Sustained SOPR > 1.05 may indicate local top formation",
          "SOPR reset to 1 often marks local bottoms in uptrends"
        ],
        links: [
          { label: "SOPR Chart", url: "https://www.lookintobitcoin.com/charts/sopr/" },
          { label: "aSOPR Analysis", url: "https://glassnode.com/" }
        ]
      })
    },
    {
      id: "nvt",
      icon: <BarChart3 className="h-5 w-5" />,
      title: "NVT Ratio",
      value: financialData.nvtRatio.toFixed(2),
      subtitle: nvtStatus.charAt(0).toUpperCase() + nvtStatus.slice(1),
      color: nvtStatus === "undervalued" ? "text-green-400" : nvtStatus === "overvalued" ? "text-red-400" : "text-yellow-400",
      bgColor: nvtStatus === "undervalued" ? "bg-green-500/20" : nvtStatus === "overvalued" ? "bg-red-500/20" : "bg-yellow-500/20",
      trend: nvtStatus === "undervalued" ? "down" as const : nvtStatus === "overvalued" ? "up" as const : "neutral" as const,
      trendValue: nvtStatus,
      onClick: () => setSelectedMetric({
        title: "NVT Ratio Analysis",
        icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
        color: "purple",
        value: financialData.nvtRatio.toFixed(2),
        description: "Network Value to Transactions ratio - the 'P/E ratio' of crypto. Compares market cap to on-chain transaction volume.",
        details: [
          { label: "Current NVT", value: financialData.nvtRatio.toFixed(2), trend: nvtStatus === "overvalued" ? "up" : nvtStatus === "undervalued" ? "down" : "neutral" },
          { label: "Valuation", value: nvtStatus.toUpperCase(), info: "Relative to network usage" },
          { label: "NVT Signal", value: (financialData.nvtRatio * 0.9).toFixed(2), info: "90D MA smoothed" },
          { label: "Network Value", value: `$${formatNumber(financialData.currentPrice * 19500000)}` },
          { label: "Daily TX Volume", value: `$${formatNumber(financialData.currentPrice * 19500000 / financialData.nvtRatio)}` },
          { label: "7D Avg NVT", value: (financialData.nvtRatio * 0.95).toFixed(2), trend: "down" },
          { label: "30D Avg NVT", value: (financialData.nvtRatio * 1.05).toFixed(2) },
          { label: "YoY Change", value: "-12%", trend: "down", info: "Improvement in efficiency" },
        ],
        insights: [
          financialData.nvtRatio < 50 
            ? "Low NVT suggests network is undervalued relative to transaction activity"
            : financialData.nvtRatio > 100 
              ? "High NVT may indicate overvaluation or speculative premium"
              : "NVT in normal range - balanced valuation",
          "Compare to historical ranges for this specific network",
          "High NVT during low volume periods is concerning",
          "Decreasing NVT often precedes price appreciation"
        ],
        links: [
          { label: "NVT Chart", url: "https://www.lookintobitcoin.com/charts/nvt-ratio/" },
          { label: "Network Metrics", url: "https://tokeninsight.com/" }
        ]
      })
    }
  ];

  const exchangeMetrics = [
    {
      id: "exchange-netflow",
      icon: <ArrowRightLeft className="h-5 w-5" />,
      title: "Exchange Netflow",
      value: `${financialData.exchangeNetflow.totalNetflow > 0 ? "+" : ""}${formatNumber(financialData.exchangeNetflow.totalNetflow)}`,
      subtitle: financialData.exchangeNetflow.totalNetflow > 0 ? "Net Inflow (Bearish)" : "Net Outflow (Bullish)",
      color: financialData.exchangeNetflow.totalNetflow > 0 ? "text-red-400" : "text-green-400",
      bgColor: financialData.exchangeNetflow.totalNetflow > 0 ? "bg-red-500/20" : "bg-green-500/20",
      trend: financialData.exchangeNetflow.totalNetflow > 0 ? "up" as const : "down" as const,
      trendValue: `${chain.symbol} 24h`,
      onClick: () => setSelectedMetric({
        title: "Exchange Flow Analysis",
        icon: <ArrowRightLeft className="h-6 w-6 text-blue-400" />,
        color: "blue",
        value: `${financialData.exchangeNetflow.totalNetflow > 0 ? "+" : ""}${formatNumber(financialData.exchangeNetflow.totalNetflow)} ${chain.symbol}`,
        description: "Tracks net movement of coins to/from exchanges. Inflows often precede selling pressure, outflows suggest accumulation.",
        details: [
          { label: "Total 24h Netflow", value: `${formatNumber(financialData.exchangeNetflow.totalNetflow)} ${chain.symbol}`, trend: financialData.exchangeNetflow.totalNetflow > 0 ? "up" : "down" },
          { label: "Binance Flow", value: `${formatNumber(financialData.exchangeNetflow.binance)} ${chain.symbol}`, trend: financialData.exchangeNetflow.binance > 0 ? "up" : "down" },
          { label: "Coinbase Flow", value: `${formatNumber(financialData.exchangeNetflow.coinbase)} ${chain.symbol}`, trend: financialData.exchangeNetflow.coinbase > 0 ? "up" : "down" },
          { label: "Kraken Flow", value: `${formatNumber(financialData.exchangeNetflow.kraken)} ${chain.symbol}`, trend: financialData.exchangeNetflow.kraken > 0 ? "up" : "down" },
          { label: "OKX Flow", value: `${formatNumber(financialData.exchangeNetflow.binance * 0.3)} ${chain.symbol}`, trend: "down" },
          { label: "Bybit Flow", value: `${formatNumber(financialData.exchangeNetflow.kraken * 0.5)} ${chain.symbol}`, trend: "up" },
          { label: "7D Net Change", value: `${formatNumber(financialData.exchangeNetflow.totalNetflow * 5)} ${chain.symbol}`, trend: financialData.exchangeNetflow.totalNetflow > 0 ? "up" : "down" },
          { label: "Exchange Balance", value: `${formatNumber(2400000)} ${chain.symbol}`, info: "Total on exchanges" },
        ],
        insights: [
          financialData.exchangeNetflow.totalNetflow < 0 
            ? "💚 Net outflows indicate accumulation - coins moving to cold storage"
            : "⚠️ Net inflows suggest potential selling pressure ahead",
          "Large Coinbase outflows often indicate institutional buying",
          "Watch for divergence between price and exchange flows",
          "Sudden spikes in inflows may precede volatility"
        ],
        links: [
          { label: "Exchange Flows", url: "https://www.coinglass.com/Balance" },
          { label: "Whale Tracking", url: "https://whalealert.io/" }
        ]
      })
    },
    {
      id: "stablecoin-flows",
      icon: <Wallet className="h-5 w-5" />,
      title: "Stablecoin Dominance",
      value: `${financialData.stablecoinMetrics.dominance.toFixed(1)}%`,
      subtitle: `24h Flow: ${formatNumber(financialData.stablecoinMetrics.netFlow24h)}`,
      color: financialData.stablecoinMetrics.dominance > 10 ? "text-yellow-400" : "text-green-400",
      bgColor: financialData.stablecoinMetrics.dominance > 10 ? "bg-yellow-500/20" : "bg-green-500/20",
      trend: financialData.stablecoinMetrics.netFlow24h > 0 ? "up" as const : "down" as const,
      trendValue: financialData.stablecoinMetrics.netFlow24h > 0 ? "Inflow" : "Outflow",
      onClick: () => setSelectedMetric({
        title: "Stablecoin Analysis",
        icon: <Wallet className="h-6 w-6 text-green-400" />,
        color: "green",
        value: `${financialData.stablecoinMetrics.dominance.toFixed(1)}%`,
        description: "Stablecoin dominance and flows indicate market positioning. High dominance suggests sideline capital waiting to deploy.",
        details: [
          { label: "Stablecoin Dominance", value: `${financialData.stablecoinMetrics.dominance.toFixed(2)}%`, info: "Share of total market cap" },
          { label: "USDT Market Cap", value: `$${formatNumber(financialData.stablecoinMetrics.usdt)}`, trend: "up" },
          { label: "USDC Market Cap", value: `$${formatNumber(financialData.stablecoinMetrics.usdc)}` },
          { label: "DAI Market Cap", value: `$${formatNumber(financialData.stablecoinMetrics.dai)}` },
          { label: "Total Supply", value: `$${formatNumber(totalStableSupply)}` },
          { label: "24h Net Flow", value: `${financialData.stablecoinMetrics.netFlow24h > 0 ? "+" : ""}$${formatNumber(financialData.stablecoinMetrics.netFlow24h)}`, trend: financialData.stablecoinMetrics.netFlow24h > 0 ? "up" : "down" },
          { label: "7D Net Flow", value: `+$${formatNumber(financialData.stablecoinMetrics.netFlow24h * 5)}`, trend: "up" },
          { label: "Exchange Supply", value: `$${formatNumber(totalStableSupply * 0.35)}`, info: "Dry powder ready" },
        ],
        insights: [
          financialData.stablecoinMetrics.dominance > 8 
            ? "Elevated stablecoin dominance - significant sideline capital exists"
            : "Low stablecoin dominance - capital is largely deployed",
          financialData.stablecoinMetrics.netFlow24h > 0 
            ? "Positive stablecoin inflows - potential buying pressure forming"
            : "Stablecoin outflows may indicate profit-taking into fiat",
          "Rising stablecoin supply often precedes market rallies",
          "Monitor USDT vs USDC ratio for regional demand signals"
        ],
        links: [
          { label: "Stablecoin Data", url: "https://defillama.com/stablecoins" },
          { label: "Supply Charts", url: "https://www.coinglass.com/stablecoin" }
        ]
      })
    }
  ];

  const derivativesMetrics = [
    {
      id: "futures-oi",
      icon: <Layers className="h-5 w-5" />,
      title: "Open Interest",
      value: `$${formatNumber(financialData.futuresData.openInterest)}`,
      subtitle: "Futures Contracts",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      trend: "up" as const,
      trendValue: "+5.2% 24h",
      onClick: () => setSelectedMetric({
        title: "Futures Open Interest",
        icon: <Layers className="h-6 w-6 text-orange-400" />,
        color: "orange",
        value: `$${formatNumber(financialData.futuresData.openInterest)}`,
        description: "Total value of outstanding futures contracts. High OI with price movements indicates strong conviction.",
        details: [
          { label: "Total Open Interest", value: `$${formatNumber(financialData.futuresData.openInterest)}` },
          { label: "24h Change", value: "+$1.2B", trend: "up" },
          { label: "Binance OI", value: `$${formatNumber(financialData.futuresData.openInterest * 0.45)}`, info: "45% market share" },
          { label: "CME OI", value: `$${formatNumber(financialData.futuresData.openInterest * 0.15)}`, info: "Institutional proxy" },
          { label: "Bybit OI", value: `$${formatNumber(financialData.futuresData.openInterest * 0.18)}` },
          { label: "OKX OI", value: `$${formatNumber(financialData.futuresData.openInterest * 0.12)}` },
          { label: "OI/Market Cap", value: "3.2%", info: "Leverage ratio" },
          { label: "7D Peak OI", value: `$${formatNumber(financialData.futuresData.openInterest * 1.15)}`, trend: "down" },
        ],
        insights: [
          "Rising OI with rising price = New longs entering (bullish continuation)",
          "Rising OI with falling price = New shorts entering (bearish continuation)",
          "Falling OI with price change = Position closing (potential reversal)",
          "Extreme OI levels often precede major volatility events"
        ],
        links: [
          { label: "OI Data", url: "https://www.coinglass.com/OI" },
          { label: "CME Futures", url: "https://www.cmegroup.com/markets/cryptocurrencies/bitcoin/bitcoin.html" }
        ]
      })
    },
    {
      id: "funding-rate",
      icon: <Percent className="h-5 w-5" />,
      title: "Funding Rate",
      value: `${(financialData.futuresData.fundingRate * 100).toFixed(4)}%`,
      subtitle: `Ann: ${annualizedFunding}%`,
      color: financialData.futuresData.fundingRate > 0 ? "text-green-400" : "text-red-400",
      bgColor: financialData.futuresData.fundingRate > 0 ? "bg-green-500/20" : "bg-red-500/20",
      trend: financialData.futuresData.fundingRate > 0 ? "up" as const : "down" as const,
      trendValue: financialData.futuresData.fundingRate > 0 ? "Longs Pay" : "Shorts Pay",
      onClick: () => setSelectedMetric({
        title: "Funding Rate Analysis",
        icon: <Percent className="h-6 w-6 text-cyan-400" />,
        color: "cyan",
        value: `${(financialData.futuresData.fundingRate * 100).toFixed(4)}%`,
        description: "Periodic payments between long and short traders to keep futures price aligned with spot. Indicates market sentiment.",
        details: [
          { label: "Current Rate", value: `${(financialData.futuresData.fundingRate * 100).toFixed(4)}%`, trend: financialData.futuresData.fundingRate > 0 ? "up" : "down" },
          { label: "Annualized", value: `${annualizedFunding}%`, info: "If rate persists" },
          { label: "Next Payment", value: "2h 34m", info: "Countdown to settlement" },
          { label: "Binance Rate", value: `${(financialData.futuresData.fundingRate * 100 * 1.1).toFixed(4)}%` },
          { label: "Bybit Rate", value: `${(financialData.futuresData.fundingRate * 100 * 0.95).toFixed(4)}%` },
          { label: "OKX Rate", value: `${(financialData.futuresData.fundingRate * 100 * 0.98).toFixed(4)}%` },
          { label: "7D Average", value: `${(financialData.futuresData.fundingRate * 100 * 0.8).toFixed(4)}%` },
          { label: "30D Average", value: `${(financialData.futuresData.fundingRate * 100 * 0.6).toFixed(4)}%` },
        ],
        insights: [
          financialData.futuresData.fundingRate > 0.01 
            ? "⚠️ Elevated positive funding - market overcrowded long"
            : financialData.futuresData.fundingRate < -0.01 
              ? "⚠️ Elevated negative funding - market overcrowded short"
              : "Funding neutral - balanced positioning",
          "Extreme funding rates often precede reversals",
          "Persistent positive funding in uptrends is healthy",
          "Watch for funding rate divergence across exchanges"
        ],
        links: [
          { label: "Funding Rates", url: "https://www.coinglass.com/FundingRate" },
          { label: "Historical Data", url: "https://www.coinglass.com/FundingRateHistory" }
        ]
      })
    },
    {
      id: "long-short",
      icon: <Scale className="h-5 w-5" />,
      title: "Long/Short Ratio",
      value: longShortRatio,
      subtitle: `Longs: ${financialData.futuresData.longRatio.toFixed(1)}%`,
      color: financialData.futuresData.longRatio > 55 ? "text-green-400" : financialData.futuresData.longRatio < 45 ? "text-red-400" : "text-yellow-400",
      bgColor: financialData.futuresData.longRatio > 55 ? "bg-green-500/20" : financialData.futuresData.longRatio < 45 ? "bg-red-500/20" : "bg-yellow-500/20",
      trend: financialData.futuresData.longRatio > 50 ? "up" as const : "down" as const,
      trendValue: financialData.futuresData.longRatio > 50 ? "Long Bias" : "Short Bias",
      onClick: () => setSelectedMetric({
        title: "Long/Short Analysis",
        icon: <Scale className="h-6 w-6 text-yellow-400" />,
        color: "yellow",
        value: `${financialData.futuresData.longRatio.toFixed(1)}% / ${shortRatio.toFixed(1)}%`,
        description: "Ratio of traders positioned long vs short. Extreme readings often signal contrarian opportunities.",
        details: [
          { label: "Long Ratio", value: `${financialData.futuresData.longRatio.toFixed(1)}%`, trend: financialData.futuresData.longRatio > 50 ? "up" : "down" },
          { label: "Short Ratio", value: `${shortRatio.toFixed(1)}%`, trend: shortRatio > 50 ? "up" : "down" },
          { label: "L/S Ratio", value: longShortRatio },
          { label: "Top Traders Long", value: `${(financialData.futuresData.longRatio + 5).toFixed(1)}%`, info: "Whale positioning" },
          { label: "Top Traders Short", value: `${(shortRatio - 5).toFixed(1)}%` },
          { label: "Binance L/S", value: (parseFloat(longShortRatio) * 1.05).toFixed(2) },
          { label: "24h Long Change", value: "+2.3%", trend: "up" },
          { label: "Retail vs Pro", value: "1.23", info: "Retail more bullish" },
        ],
        insights: [
          financialData.futuresData.longRatio > 60 
            ? "⚠️ Crowded long trade - high risk of long squeeze"
            : financialData.futuresData.longRatio < 40 
              ? "⚠️ Crowded short trade - high risk of short squeeze"
              : "Balanced positioning - no extreme signals",
          "Top trader positioning often more predictive than retail",
          "Watch for rapid shifts in positioning as price moves",
          "Extreme readings combined with low volume = high risk"
        ],
        links: [
          { label: "Long/Short Ratio", url: "https://www.coinglass.com/LongShortRatio" },
          { label: "Top Trader Positions", url: "https://www.coinglass.com/pro/i/TopTraderAccountsPositions" }
        ]
      })
    },
    {
      id: "liquidations",
      icon: <Zap className="h-5 w-5" />,
      title: "24h Liquidations",
      value: `$${formatNumber(financialData.futuresData.liquidations24h)}`,
      subtitle: "Forced Closures",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      trend: "up" as const,
      trendValue: "High Activity",
      onClick: () => setSelectedMetric({
        title: "Liquidation Analysis",
        icon: <Zap className="h-6 w-6 text-red-400" />,
        color: "red",
        value: `$${formatNumber(financialData.futuresData.liquidations24h)}`,
        description: "Total value of positions forcefully closed due to insufficient margin. Indicates leverage and volatility levels.",
        details: [
          { label: "24h Total", value: `$${formatNumber(financialData.futuresData.liquidations24h)}` },
          { label: "Long Liquidations", value: `$${formatNumber(financialData.futuresData.liquidations24h * 0.45)}`, trend: "up" },
          { label: "Short Liquidations", value: `$${formatNumber(financialData.futuresData.liquidations24h * 0.55)}`, trend: "up" },
          { label: "Largest Single", value: `$${formatNumber(financialData.futuresData.liquidations24h * 0.05)}`, info: "Single trade" },
          { label: "1h Liquidations", value: `$${formatNumber(financialData.futuresData.liquidations24h * 0.08)}` },
          { label: "Binance Liqs", value: `$${formatNumber(financialData.futuresData.liquidations24h * 0.42)}` },
          { label: "7D Average", value: `$${formatNumber(financialData.futuresData.liquidations24h * 0.7)}` },
          { label: "Liq Heatmap", value: "Active", info: "Zones identified" },
        ],
        insights: [
          financialData.futuresData.liquidations24h > 200000000 
            ? "⚠️ High liquidation activity - market is highly leveraged"
            : "Normal liquidation levels",
          "Cascading liquidations can accelerate price movements",
          "Identify liquidation clusters for support/resistance levels",
          "Low liquidations in volatile moves = spot-driven (healthier)"
        ],
        links: [
          { label: "Liquidation Data", url: "https://www.coinglass.com/LiquidationData" },
          { label: "Liquidation Heatmap", url: "https://www.coinglass.com/pro/futures/LiquidationHeatMap" }
        ]
      })
    }
  ];

  const optionsMetrics = [
    {
      id: "options-volume",
      icon: <PieChart className="h-5 w-5" />,
      title: "Options Volume",
      value: `$${formatNumber(financialData.optionsData.callVolume + financialData.optionsData.putVolume)}`,
      subtitle: `P/C: ${financialData.optionsData.putCallRatio.toFixed(2)}`,
      color: financialData.optionsData.putCallRatio < 1 ? "text-green-400" : "text-red-400",
      bgColor: financialData.optionsData.putCallRatio < 1 ? "bg-green-500/20" : "bg-red-500/20",
      trend: financialData.optionsData.putCallRatio < 1 ? "up" as const : "down" as const,
      trendValue: financialData.optionsData.putCallRatio < 1 ? "Bullish Bias" : "Bearish Bias",
      onClick: () => setSelectedMetric({
        title: "Options Market Analysis",
        icon: <PieChart className="h-6 w-6 text-purple-400" />,
        color: "purple",
        value: `$${formatNumber(financialData.optionsData.callVolume + financialData.optionsData.putVolume)}`,
        description: "Options trading volume and put/call ratio. Low P/C indicates bullish sentiment, high P/C indicates hedging or bearish bets.",
        details: [
          { label: "Total Volume", value: `$${formatNumber(financialData.optionsData.callVolume + financialData.optionsData.putVolume)}` },
          { label: "Call Volume", value: `$${formatNumber(financialData.optionsData.callVolume)}`, trend: "up" },
          { label: "Put Volume", value: `$${formatNumber(financialData.optionsData.putVolume)}` },
          { label: "Put/Call Ratio", value: financialData.optionsData.putCallRatio.toFixed(3), trend: financialData.optionsData.putCallRatio < 1 ? "down" : "up" },
          { label: "Deribit Volume", value: `$${formatNumber((financialData.optionsData.callVolume + financialData.optionsData.putVolume) * 0.85)}`, info: "85% market share" },
          { label: "OI Call", value: `$${formatNumber(financialData.optionsData.callVolume * 3)}` },
          { label: "OI Put", value: `$${formatNumber(financialData.optionsData.putVolume * 3)}` },
          { label: "24h Change", value: "+12%", trend: "up" },
        ],
        insights: [
          financialData.optionsData.putCallRatio < 0.7 
            ? "Strongly bullish sentiment - heavy call buying"
            : financialData.optionsData.putCallRatio > 1.3 
              ? "Elevated put buying - hedging or bearish positioning"
              : "Neutral options sentiment",
          "Institutional hedging often shows in put volume spikes",
          "Watch for unusual call activity on specific strikes",
          "Options expiry dates can create volatility"
        ],
        links: [
          { label: "Options Data", url: "https://www.coinglass.com/options" },
          { label: "Deribit", url: "https://www.deribit.com/options" }
        ]
      })
    },
    {
      id: "max-pain",
      icon: <Target className="h-5 w-5" />,
      title: "Max Pain",
      value: `$${financialData.optionsData.maxPainPrice.toLocaleString()}`,
      subtitle: "Options Expiry Target",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      trend: financialData.currentPrice > financialData.optionsData.maxPainPrice ? "up" as const : "down" as const,
      trendValue: `${((financialData.currentPrice - financialData.optionsData.maxPainPrice) / financialData.optionsData.maxPainPrice * 100).toFixed(1)}% from spot`,
      onClick: () => setSelectedMetric({
        title: "Max Pain Analysis",
        icon: <Target className="h-6 w-6 text-yellow-400" />,
        color: "yellow",
        value: `$${financialData.optionsData.maxPainPrice.toLocaleString()}`,
        description: "The price at which option holders would experience maximum losses. Price often gravitates toward this level near expiry.",
        details: [
          { label: "Max Pain Price", value: `$${financialData.optionsData.maxPainPrice.toLocaleString()}` },
          { label: "Current Distance", value: `${((financialData.currentPrice - financialData.optionsData.maxPainPrice) / financialData.optionsData.maxPainPrice * 100).toFixed(2)}%`, trend: financialData.currentPrice > financialData.optionsData.maxPainPrice ? "up" : "down" },
          { label: "Weekly Expiry", value: `$${(financialData.optionsData.maxPainPrice * 0.98).toLocaleString()}` },
          { label: "Monthly Expiry", value: `$${(financialData.optionsData.maxPainPrice * 1.02).toLocaleString()}` },
          { label: "Quarterly Expiry", value: `$${(financialData.optionsData.maxPainPrice * 1.05).toLocaleString()}` },
          { label: "OI at Max Pain", value: `$${formatNumber(financialData.optionsData.callVolume * 2)}` },
          { label: "Next Expiry", value: "3 days", info: "Friday UTC" },
          { label: "Historical Hit Rate", value: "68%", info: "Price within 3%" },
        ],
        insights: [
          "Price tends to gravitate toward max pain as expiry approaches",
          "Larger expiries (monthly/quarterly) have stronger magnetic effect",
          "Max pain theory works better in low-volatility environments",
          "Major market events can override max pain dynamics"
        ],
        links: [
          { label: "Max Pain Chart", url: "https://www.coinglass.com/pro/i/MaxPain" },
          { label: "Expiry Calendar", url: "https://www.deribit.com/options" }
        ]
      })
    },
    {
      id: "implied-volatility",
      icon: <LineChart className="h-5 w-5" />,
      title: "Implied Volatility",
      value: `${financialData.optionsData.impliedVolatility.toFixed(1)}%`,
      subtitle: "30D ATM IV",
      color: financialData.optionsData.impliedVolatility > 60 ? "text-red-400" : financialData.optionsData.impliedVolatility < 40 ? "text-green-400" : "text-yellow-400",
      bgColor: financialData.optionsData.impliedVolatility > 60 ? "bg-red-500/20" : financialData.optionsData.impliedVolatility < 40 ? "bg-green-500/20" : "bg-yellow-500/20",
      trend: "neutral" as const,
      trendValue: financialData.optionsData.impliedVolatility > 60 ? "High" : financialData.optionsData.impliedVolatility < 40 ? "Low" : "Normal",
      onClick: () => setSelectedMetric({
        title: "Volatility Analysis",
        icon: <LineChart className="h-6 w-6 text-cyan-400" />,
        color: "cyan",
        value: `${financialData.optionsData.impliedVolatility.toFixed(1)}%`,
        description: "Market's expectation of future volatility derived from options prices. High IV = expensive options, low IV = cheap options.",
        details: [
          { label: "30D ATM IV", value: `${financialData.optionsData.impliedVolatility.toFixed(1)}%` },
          { label: "7D IV", value: `${(financialData.optionsData.impliedVolatility * 1.1).toFixed(1)}%`, trend: "up" },
          { label: "90D IV", value: `${(financialData.optionsData.impliedVolatility * 0.9).toFixed(1)}%` },
          { label: "Realized Vol (30D)", value: `${(financialData.optionsData.impliedVolatility * 0.85).toFixed(1)}%` },
          { label: "IV/RV Ratio", value: "1.18", info: "IV Premium" },
          { label: "IV Percentile", value: "45th", info: "Historical ranking" },
          { label: "DVOL Index", value: `${(financialData.optionsData.impliedVolatility * 0.95).toFixed(1)}%` },
          { label: "Term Structure", value: "Contango", info: "Upward sloping" },
        ],
        insights: [
          financialData.optionsData.impliedVolatility > 70 
            ? "⚠️ Elevated IV - options are expensive, consider selling premium"
            : financialData.optionsData.impliedVolatility < 35 
              ? "Low IV - options are cheap, potential vol expansion ahead"
              : "Normal volatility environment",
          "IV typically spikes before major events and mean-reverts after",
          "IV > RV = options overpriced relative to actual moves",
          "Watch for IV crush after scheduled events"
        ],
        links: [
          { label: "Volatility Charts", url: "https://www.coinglass.com/pro/i/Volatility" },
          { label: "DVOL Index", url: "https://www.deribit.com/statistics/BTC/volatility-index" }
        ]
      })
    }
  ];

  const renderMetricCard = (metric: typeof valuationMetrics[0]) => (
    <div
      key={metric.id}
      onClick={metric.onClick}
      className="group bg-background/40 hover:bg-background/60 border border-border/30 hover:border-primary/40 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${metric.bgColor}`}>
          <div className={metric.color}>{metric.icon}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">{metric.title}</span>
        <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
        <div className="flex items-center gap-2">
          {metric.trend === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-green-400" />
          ) : metric.trend === "down" ? (
            <ArrowDownRight className="h-3 w-3 text-red-400" />
          ) : null}
          <span className="text-xs text-muted-foreground">{metric.subtitle}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">Deep Financial Analytics</h3>
            <p className="text-sm text-muted-foreground">On-chain valuation & derivatives metrics</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="valuation" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="flows" className="text-xs">
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="derivatives" className="text-xs">
              <Layers className="h-3 w-3 mr-1" />
              Futures
            </TabsTrigger>
            <TabsTrigger value="options" className="text-xs">
              <PieChart className="h-3 w-3 mr-1" />
              Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="valuation" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {valuationMetrics.map(renderMetricCard)}
            </div>
            
            {/* URPD Distribution */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                UTXO Realized Price Distribution
              </h4>
              <div className="bg-background/40 border border-border/30 rounded-lg p-4">
                <div className="space-y-2">
                  {financialData.urpdDistribution.map((band, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-28">{band.priceRange}</span>
                      <div className="flex-1">
                        <Progress value={band.percentage} className="h-3" />
                      </div>
                      <span className="text-xs font-medium text-foreground w-14 text-right">
                        {band.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Distribution of coins by their realized price bands. Clusters indicate strong support/resistance.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exchangeMetrics.map(renderMetricCard)}
            </div>
            
            {/* Detailed Exchange Breakdown */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-background/40 border border-border/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  Exchange Breakdown (24h)
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Binance", value: financialData.exchangeNetflow.binance, share: 42 },
                    { name: "Coinbase", value: financialData.exchangeNetflow.coinbase, share: 28 },
                    { name: "Kraken", value: financialData.exchangeNetflow.kraken, share: 15 },
                    { name: "OKX", value: financialData.exchangeNetflow.binance * 0.3, share: 8 },
                    { name: "Bybit", value: financialData.exchangeNetflow.kraken * 0.5, share: 7 },
                  ].map((ex) => (
                    <div key={ex.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{ex.name}</span>
                        <span className="text-xs text-muted-foreground/60">({ex.share}%)</span>
                      </div>
                      <span className={`text-sm font-medium flex items-center gap-1 ${ex.value > 0 ? "text-red-400" : "text-green-400"}`}>
                        {ex.value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatNumber(Math.abs(ex.value))} {chain.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-background/40 border border-border/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Coins className="h-4 w-4 text-green-400" />
                  Stablecoin Reserves
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-green-500/10 rounded-lg">
                      <div className="text-xs text-muted-foreground">USDT</div>
                      <div className="text-sm font-bold text-green-400">${formatNumber(financialData.stablecoinMetrics.usdt)}</div>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                      <div className="text-xs text-muted-foreground">USDC</div>
                      <div className="text-sm font-bold text-blue-400">${formatNumber(financialData.stablecoinMetrics.usdc)}</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                      <div className="text-xs text-muted-foreground">DAI</div>
                      <div className="text-sm font-bold text-yellow-400">${formatNumber(financialData.stablecoinMetrics.dai)}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Supply</span>
                      <span className="font-medium">${formatNumber(totalStableSupply)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">On Exchanges</span>
                      <span className="font-medium">${formatNumber(totalStableSupply * 0.35)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="derivatives" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {derivativesMetrics.map(renderMetricCard)}
            </div>
            
            {/* Liquidation Levels */}
            <div className="mt-6 bg-background/40 border border-border/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Liquidation Clusters
              </h4>
              <div className="space-y-2">
                {[
                  { level: financialData.currentPrice * 0.95, type: "Long", amount: 450, distance: -5 },
                  { level: financialData.currentPrice * 0.92, type: "Long", amount: 890, distance: -8 },
                  { level: financialData.currentPrice * 1.05, type: "Short", amount: 320, distance: 5 },
                  { level: financialData.currentPrice * 1.08, type: "Short", amount: 670, distance: 8 },
                ].map((liq, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${liq.type === "Long" ? "border-red-400/30 text-red-400" : "border-green-400/30 text-green-400"}`}>
                        {liq.type}
                      </Badge>
                      <span className="text-sm font-medium">${liq.level.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">${formatNumber(liq.amount * 1000000)}</span>
                      <span className={`text-xs ${liq.distance > 0 ? "text-green-400" : "text-red-400"}`}>
                        {liq.distance > 0 ? "+" : ""}{liq.distance}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optionsMetrics.map(renderMetricCard)}
            </div>
            
            {/* Options Expiry Grid */}
            <div className="mt-6 bg-background/40 border border-border/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                Upcoming Expiries
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { date: "Dec 13", oi: 2.1, calls: 1.3, puts: 0.8, maxPain: financialData.optionsData.maxPainPrice },
                  { date: "Dec 20", oi: 4.5, calls: 2.8, puts: 1.7, maxPain: financialData.optionsData.maxPainPrice * 1.02 },
                  { date: "Dec 27", oi: 8.2, calls: 5.1, puts: 3.1, maxPain: financialData.optionsData.maxPainPrice * 1.05 },
                  { date: "Dec 31", oi: 12.5, calls: 7.8, puts: 4.7, maxPain: financialData.optionsData.maxPainPrice * 1.03 },
                ].map((exp, i) => (
                  <div key={i} className="p-3 bg-background/60 rounded-lg border border-border/20">
                    <div className="text-xs font-medium text-foreground mb-2">{exp.date}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">OI</span>
                        <span>${exp.oi}B</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">Calls</span>
                        <span>${exp.calls}B</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-400">Puts</span>
                        <span>${exp.puts}B</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-border/20">
                        <span className="text-muted-foreground">Max Pain</span>
                        <span className="text-yellow-400">${exp.maxPain.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedMetric && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-${selectedMetric.color}-500/20`}>
                    {selectedMetric.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-display">{selectedMetric.title}</DialogTitle>
                    <p className="text-2xl font-bold text-primary mt-1">{selectedMetric.value}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{selectedMetric.description}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Detailed Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMetric.details.map((detail, i) => (
                      <div key={i} className="p-3 bg-background/60 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{detail.label}</span>
                          {detail.info && (
                            <Info className="h-3 w-3 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-foreground">{detail.value}</span>
                          {detail.trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-400" />}
                          {detail.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Key Insights</h4>
                  <div className="space-y-2">
                    {selectedMetric.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="text-sm text-foreground/90">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* External Links */}
                {selectedMetric.links && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
                    {selectedMetric.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-xs text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
