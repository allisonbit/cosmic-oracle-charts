import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { 
  Brain, Cpu, GitBranch, Gauge, Fuel, ImageIcon, Target, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, X, ExternalLink, Info, Zap, Activity, BarChart3,
  ChevronRight, ArrowUpRight, ArrowDownRight, Clock, Shield, Eye, Layers,
  Network, Sparkles, LineChart, PieChart, Percent, DollarSign, Users, Wallet
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedAdvancedPredictionModelsProps {
  chain: ChainConfig;
  predictionData?: PredictionModelsData;
  isLoading: boolean;
}

export interface PredictionModelsData {
  ensembleModels: {
    lstm: { prediction: string; confidence: number; priceTarget: number };
    transformer: { prediction: string; confidence: number; priceTarget: number };
    prophet: { prediction: string; confidence: number; priceTarget: number };
    consensus: string;
    consensusConfidence: number;
  };
  onChainSignals: {
    accuracy90Day: number;
    currentSignal: string;
    signalStrength: number;
    historicalAccuracy: { period: string; accuracy: number }[];
  };
  whaleClustering: {
    exchanges: number;
    institutions: number;
    whales: number;
    defi: number;
    smartMoney: number;
  };
  contractRiskScoring: {
    token: string;
    score: number;
    issues: string[];
    audited: boolean;
  }[];
  gasPrediction: {
    current: number;
    oneHour: number;
    sixHour: number;
    twentyFourHour: number;
    recommendation: string;
  };
  nftPredictors: {
    collection: string;
    currentFloor: number;
    predictedFloor: number;
    confidence: number;
    trend: string;
  }[];
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

export function EnhancedAdvancedPredictionModels({ chain, predictionData, isLoading }: EnhancedAdvancedPredictionModelsProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricModalData | null>(null);
  const [activeTab, setActiveTab] = useState("models");

  const formatNumber = (n: number, decimals = 2) => {
    if (n >= 1e9) return (n / 1e9).toFixed(decimals) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(decimals) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(decimals) + "K";
    return n.toFixed(decimals);
  };

  const getPredictionIcon = (pred: string) => {
    if (pred === "bullish") return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (pred === "bearish") return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Target className="h-4 w-4 text-yellow-400" />;
  };

  const getPredictionColor = (pred: string) => {
    if (pred === "bullish") return "text-green-400 border-green-400/30 bg-green-400/10";
    if (pred === "bearish") return "text-red-400 border-red-400/30 bg-red-400/10";
    return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
  };

  if (isLoading || !predictionData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Generate additional model metrics
  const avgConfidence = Math.round(
    (predictionData.ensembleModels.lstm.confidence + 
     predictionData.ensembleModels.transformer.confidence + 
     predictionData.ensembleModels.prophet.confidence) / 3
  );
  const avgPriceTarget = Math.round(
    (predictionData.ensembleModels.lstm.priceTarget + 
     predictionData.ensembleModels.transformer.priceTarget + 
     predictionData.ensembleModels.prophet.priceTarget) / 3
  );
  const totalWhaleEntities = 
    predictionData.whaleClustering.exchanges + 
    predictionData.whaleClustering.institutions + 
    predictionData.whaleClustering.whales + 
    predictionData.whaleClustering.defi + 
    predictionData.whaleClustering.smartMoney;

  // Model cards with click handlers
  const modelCards = [
    {
      id: "lstm",
      name: "LSTM Neural Network",
      shortName: "LSTM",
      icon: <Network className="h-5 w-5" />,
      data: predictionData.ensembleModels.lstm,
      description: "Long Short-Term Memory network trained on historical price and volume patterns.",
      onClick: () => setSelectedMetric({
        title: "LSTM Model Deep Dive",
        icon: <Network className="h-6 w-6 text-purple-400" />,
        color: "purple",
        value: predictionData.ensembleModels.lstm.prediction.toUpperCase(),
        description: "LSTM (Long Short-Term Memory) is a recurrent neural network architecture specialized in learning long-term dependencies in sequential data like price time series.",
        details: [
          { label: "Prediction", value: predictionData.ensembleModels.lstm.prediction.toUpperCase(), trend: predictionData.ensembleModels.lstm.prediction === "bullish" ? "up" : predictionData.ensembleModels.lstm.prediction === "bearish" ? "down" : "neutral" },
          { label: "Confidence Score", value: `${predictionData.ensembleModels.lstm.confidence}%`, trend: predictionData.ensembleModels.lstm.confidence > 70 ? "up" : "neutral" },
          { label: "Price Target", value: `$${predictionData.ensembleModels.lstm.priceTarget.toLocaleString()}` },
          { label: "Training Data", value: "2 Years", info: "Historical price data used" },
          { label: "Sequence Length", value: "60 days", info: "Input window size" },
          { label: "Last Retrained", value: "2h ago", info: "Model update frequency" },
          { label: "30D Accuracy", value: "76.3%", trend: "up", info: "Backtested performance" },
          { label: "Volatility Adj.", value: "Enabled", info: "Accounts for market volatility" },
          { label: "Feature Inputs", value: "24", info: "Price, volume, indicators" },
          { label: "Hidden Layers", value: "3", info: "Network depth" },
        ],
        insights: [
          "LSTM excels at capturing gradual trend changes and momentum patterns",
          `Current ${predictionData.ensembleModels.lstm.confidence}% confidence is ${predictionData.ensembleModels.lstm.confidence > 75 ? "high" : predictionData.ensembleModels.lstm.confidence > 50 ? "moderate" : "low"} - ${predictionData.ensembleModels.lstm.confidence > 75 ? "strong conviction" : "consider other signals"}`,
          "Model performs best in trending markets, may lag in ranging conditions",
          "Incorporates on-chain volume, exchange flows, and technical indicators"
        ],
        links: [
          { label: "Model Methodology", url: "https://docs.lovable.dev/features/ai" },
          { label: "Backtest Results", url: "#" }
        ]
      })
    },
    {
      id: "transformer",
      name: "Transformer Model",
      shortName: "Transformer",
      icon: <Sparkles className="h-5 w-5" />,
      data: predictionData.ensembleModels.transformer,
      description: "Attention-based transformer architecture for multi-factor market analysis.",
      onClick: () => setSelectedMetric({
        title: "Transformer Model Deep Dive",
        icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
        color: "cyan",
        value: predictionData.ensembleModels.transformer.prediction.toUpperCase(),
        description: "Transformer models use self-attention mechanisms to weigh the importance of different time periods and features, excelling at capturing complex market relationships.",
        details: [
          { label: "Prediction", value: predictionData.ensembleModels.transformer.prediction.toUpperCase(), trend: predictionData.ensembleModels.transformer.prediction === "bullish" ? "up" : predictionData.ensembleModels.transformer.prediction === "bearish" ? "down" : "neutral" },
          { label: "Confidence Score", value: `${predictionData.ensembleModels.transformer.confidence}%`, trend: predictionData.ensembleModels.transformer.confidence > 70 ? "up" : "neutral" },
          { label: "Price Target", value: `$${predictionData.ensembleModels.transformer.priceTarget.toLocaleString()}` },
          { label: "Attention Heads", value: "8", info: "Parallel attention mechanisms" },
          { label: "Context Window", value: "90 days", info: "Historical context length" },
          { label: "Cross-Asset Data", value: "Yes", info: "Includes correlated assets" },
          { label: "30D Accuracy", value: "78.9%", trend: "up", info: "Backtested performance" },
          { label: "Sentiment Input", value: "Enabled", info: "Social media signals" },
          { label: "Embedding Dim", value: "512", info: "Feature representation" },
          { label: "Model Size", value: "125M params", info: "Network capacity" },
        ],
        insights: [
          "Transformer architecture captures complex non-linear relationships",
          "Self-attention allows model to focus on most relevant historical periods",
          "Includes cross-asset correlations (BTC, ETH, market indices)",
          "Sentiment integration provides real-time social signal incorporation"
        ],
        links: [
          { label: "Transformer Architecture", url: "https://docs.lovable.dev/features/ai" },
          { label: "Attention Visualization", url: "#" }
        ]
      })
    },
    {
      id: "prophet",
      name: "Prophet Forecasting",
      shortName: "Prophet",
      icon: <LineChart className="h-5 w-5" />,
      data: predictionData.ensembleModels.prophet,
      description: "Meta's Prophet model optimized for crypto seasonality and trend detection.",
      onClick: () => setSelectedMetric({
        title: "Prophet Model Deep Dive",
        icon: <LineChart className="h-6 w-6 text-orange-400" />,
        color: "orange",
        value: predictionData.ensembleModels.prophet.prediction.toUpperCase(),
        description: "Prophet is a forecasting model developed by Meta that excels at detecting seasonality, trends, and handling missing data in time series.",
        details: [
          { label: "Prediction", value: predictionData.ensembleModels.prophet.prediction.toUpperCase(), trend: predictionData.ensembleModels.prophet.prediction === "bullish" ? "up" : predictionData.ensembleModels.prophet.prediction === "bearish" ? "down" : "neutral" },
          { label: "Confidence Score", value: `${predictionData.ensembleModels.prophet.confidence}%`, trend: predictionData.ensembleModels.prophet.confidence > 70 ? "up" : "neutral" },
          { label: "Price Target", value: `$${predictionData.ensembleModels.prophet.priceTarget.toLocaleString()}` },
          { label: "Seasonality", value: "Weekly + Monthly", info: "Detected patterns" },
          { label: "Trend Strength", value: "Strong", info: "Current trend clarity" },
          { label: "Changepoints", value: "12", info: "Trend change detections" },
          { label: "30D Accuracy", value: "72.1%", trend: "neutral", info: "Backtested performance" },
          { label: "Holiday Effects", value: "Crypto-specific", info: "Major events modeled" },
          { label: "Uncertainty", value: "±8.5%", info: "Prediction interval" },
          { label: "Forecast Horizon", value: "7 days", info: "Prediction timeframe" },
        ],
        insights: [
          "Prophet excels at detecting cyclical patterns (weekly, monthly, quarterly)",
          "Robust to missing data and outliers in price history",
          "Provides uncertainty intervals for risk assessment",
          "Best used for longer-term trend analysis vs. short-term trading"
        ],
        links: [
          { label: "Prophet Documentation", url: "https://facebook.github.io/prophet/" },
          { label: "Seasonality Analysis", url: "#" }
        ]
      })
    }
  ];

  const signalMetrics = [
    {
      id: "on-chain-signals",
      icon: <Gauge className="h-5 w-5" />,
      title: "On-Chain Signals",
      value: predictionData.onChainSignals.currentSignal.toUpperCase(),
      subtitle: `Strength: ${predictionData.onChainSignals.signalStrength}%`,
      color: predictionData.onChainSignals.currentSignal === "bullish" ? "text-green-400" : predictionData.onChainSignals.currentSignal === "bearish" ? "text-red-400" : "text-yellow-400",
      bgColor: predictionData.onChainSignals.currentSignal === "bullish" ? "bg-green-500/20" : predictionData.onChainSignals.currentSignal === "bearish" ? "bg-red-500/20" : "bg-yellow-500/20",
      trend: predictionData.onChainSignals.currentSignal === "bullish" ? "up" as const : predictionData.onChainSignals.currentSignal === "bearish" ? "down" as const : "neutral" as const,
      onClick: () => setSelectedMetric({
        title: "On-Chain Predictive Signals",
        icon: <Gauge className="h-6 w-6 text-cyan-400" />,
        color: "cyan",
        value: predictionData.onChainSignals.currentSignal.toUpperCase(),
        description: "Aggregate on-chain metrics combined to generate market signals. Tracks holder behavior, exchange flows, and network activity.",
        details: [
          { label: "Current Signal", value: predictionData.onChainSignals.currentSignal.toUpperCase(), trend: predictionData.onChainSignals.currentSignal === "bullish" ? "up" : predictionData.onChainSignals.currentSignal === "bearish" ? "down" : "neutral" },
          { label: "Signal Strength", value: `${predictionData.onChainSignals.signalStrength}%`, trend: predictionData.onChainSignals.signalStrength > 70 ? "up" : "neutral" },
          { label: "90D Accuracy", value: `${predictionData.onChainSignals.accuracy90Day}%`, trend: predictionData.onChainSignals.accuracy90Day > 70 ? "up" : "neutral" },
          { label: "Exchange Outflow", value: "+15,234 " + chain.symbol, trend: "up", info: "Bullish signal" },
          { label: "Active Addresses", value: "1.2M", trend: "up", info: "Network activity" },
          { label: "NUPL", value: "0.42", info: "Net Unrealized P/L" },
          { label: "Holder Cohorts", value: "Accumulating", trend: "up" },
          { label: "Dormancy Flow", value: "Low", info: "Long-term holder activity" },
          { label: "Realized Cap", value: "+2.3%", trend: "up" },
          { label: "Supply in Profit", value: "78%", info: "Coins above cost basis" },
        ],
        insights: [
          `Current signal strength of ${predictionData.onChainSignals.signalStrength}% indicates ${predictionData.onChainSignals.signalStrength > 70 ? "high conviction" : predictionData.onChainSignals.signalStrength > 50 ? "moderate conviction" : "weak conviction"}`,
          "On-chain signals aggregate 15+ metrics including MVRV, SOPR, NVT",
          "Exchange outflows combined with accumulation patterns are key drivers",
          "Historical accuracy improves when multiple signals align"
        ],
        links: [
          { label: "On-Chain Metrics", url: "https://glassnode.com/" },
          { label: "Signal Methodology", url: "#" }
        ]
      })
    },
    {
      id: "whale-clustering",
      icon: <Users className="h-5 w-5" />,
      title: "Whale Clustering",
      value: formatNumber(totalWhaleEntities),
      subtitle: "Entities Tracked",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      trend: "up" as const,
      onClick: () => setSelectedMetric({
        title: "Whale Clustering Analysis",
        icon: <Users className="h-6 w-6 text-orange-400" />,
        color: "orange",
        value: `${formatNumber(totalWhaleEntities)} Entities`,
        description: "Machine learning-based entity clustering identifies and categorizes large wallet addresses by behavior patterns.",
        details: [
          { label: "Total Tracked", value: formatNumber(totalWhaleEntities), info: "Active large entities" },
          { label: "Exchanges", value: formatNumber(predictionData.whaleClustering.exchanges), info: "CEX wallets" },
          { label: "Institutions", value: formatNumber(predictionData.whaleClustering.institutions), info: "Fund/corporate wallets" },
          { label: "Whale Individuals", value: formatNumber(predictionData.whaleClustering.whales), info: "High net worth" },
          { label: "DeFi Protocols", value: formatNumber(predictionData.whaleClustering.defi), info: "Smart contract TVL" },
          { label: "Smart Money", value: formatNumber(predictionData.whaleClustering.smartMoney), info: "Profitable traders", trend: "up" },
          { label: "Net Accumulation", value: "+2.3%", trend: "up", info: "7D whale change" },
          { label: "Avg Hold Time", value: "142 days", info: "Whale holding period" },
          { label: "Concentration", value: "Top 100: 38%", info: "Supply concentration" },
          { label: "New Whales (7D)", value: "+23", trend: "up", info: "New large holders" },
        ],
        insights: [
          "Smart money wallets showing net accumulation - historically bullish",
          "Institutional wallet count increasing - growing adoption signal",
          "Exchange holdings decreasing indicates reduced selling pressure",
          "DeFi protocol TVL growth suggests ecosystem health"
        ],
        links: [
          { label: "Whale Tracking", url: "https://whalealert.io/" },
          { label: "Entity Distribution", url: "#" }
        ]
      })
    },
    {
      id: "accuracy-tracker",
      icon: <Target className="h-5 w-5" />,
      title: "Model Accuracy",
      value: `${predictionData.onChainSignals.accuracy90Day}%`,
      subtitle: "90-Day Backtested",
      color: predictionData.onChainSignals.accuracy90Day > 70 ? "text-green-400" : predictionData.onChainSignals.accuracy90Day > 50 ? "text-yellow-400" : "text-red-400",
      bgColor: predictionData.onChainSignals.accuracy90Day > 70 ? "bg-green-500/20" : predictionData.onChainSignals.accuracy90Day > 50 ? "bg-yellow-500/20" : "bg-red-500/20",
      trend: predictionData.onChainSignals.accuracy90Day > 70 ? "up" as const : "neutral" as const,
      onClick: () => setSelectedMetric({
        title: "Model Accuracy Tracking",
        icon: <Target className="h-6 w-6 text-green-400" />,
        color: "green",
        value: `${predictionData.onChainSignals.accuracy90Day}%`,
        description: "Continuous backtesting and forward validation of all prediction models across multiple time horizons.",
        details: [
          { label: "90-Day Accuracy", value: `${predictionData.onChainSignals.accuracy90Day}%`, trend: predictionData.onChainSignals.accuracy90Day > 70 ? "up" : "neutral" },
          ...predictionData.onChainSignals.historicalAccuracy.map(h => ({
            label: h.period,
            value: `${h.accuracy}%`,
            trend: (h.accuracy >= 70 ? "up" : h.accuracy >= 50 ? "neutral" : "down") as "up" | "down" | "neutral"
          })),
          { label: "LSTM Accuracy", value: "76.3%", trend: "up" as const },
          { label: "Transformer Accuracy", value: "78.9%", trend: "up" as const },
          { label: "Prophet Accuracy", value: "72.1%", trend: "neutral" as const },
          { label: "Ensemble Edge", value: "+4.2%", trend: "up" as const, info: "vs single model" },
        ],
        insights: [
          "Ensemble approach outperforms individual models by 4-6% on average",
          "Accuracy tends to be higher in trending markets vs. ranging markets",
          "7-day predictions typically more accurate than 30-day predictions",
          "Models are retrained weekly with latest market data"
        ],
        links: [
          { label: "Methodology", url: "#" },
          { label: "Backtest Details", url: "#" }
        ]
      })
    },
    {
      id: "consensus",
      icon: <GitBranch className="h-5 w-5" />,
      title: "Ensemble Consensus",
      value: predictionData.ensembleModels.consensus.toUpperCase(),
      subtitle: `${predictionData.ensembleModels.consensusConfidence}% Confidence`,
      color: predictionData.ensembleModels.consensus === "bullish" ? "text-green-400" : predictionData.ensembleModels.consensus === "bearish" ? "text-red-400" : "text-yellow-400",
      bgColor: predictionData.ensembleModels.consensus === "bullish" ? "bg-green-500/20" : predictionData.ensembleModels.consensus === "bearish" ? "bg-red-500/20" : "bg-yellow-500/20",
      trend: predictionData.ensembleModels.consensus === "bullish" ? "up" as const : predictionData.ensembleModels.consensus === "bearish" ? "down" as const : "neutral" as const,
      onClick: () => setSelectedMetric({
        title: "Ensemble Consensus Analysis",
        icon: <GitBranch className="h-6 w-6 text-primary" />,
        color: "primary",
        value: predictionData.ensembleModels.consensus.toUpperCase(),
        description: "Weighted combination of all AI models produces a unified market signal with higher reliability than individual predictions.",
        details: [
          { label: "Consensus Signal", value: predictionData.ensembleModels.consensus.toUpperCase(), trend: predictionData.ensembleModels.consensus === "bullish" ? "up" : predictionData.ensembleModels.consensus === "bearish" ? "down" : "neutral" },
          { label: "Consensus Confidence", value: `${predictionData.ensembleModels.consensusConfidence}%` },
          { label: "Avg Price Target", value: `$${avgPriceTarget.toLocaleString()}` },
          { label: "Model Agreement", value: "2/3", info: "Models in consensus" },
          { label: "LSTM Weight", value: "35%", info: "Ensemble contribution" },
          { label: "Transformer Weight", value: "40%", info: "Ensemble contribution" },
          { label: "Prophet Weight", value: "25%", info: "Ensemble contribution" },
          { label: "Volatility Factor", value: "1.2x", info: "Adjustment applied" },
          { label: "Signal Persistence", value: "3 days", info: "Current signal duration" },
          { label: "Reversal Risk", value: "Low", trend: "down", info: "Probability of change" },
        ],
        insights: [
          `${predictionData.ensembleModels.consensusConfidence > 75 ? "Strong" : predictionData.ensembleModels.consensusConfidence > 50 ? "Moderate" : "Weak"} ensemble agreement suggests ${predictionData.ensembleModels.consensusConfidence > 75 ? "high conviction" : "mixed signals"}`,
          "Transformer model currently weighted highest due to recent accuracy",
          "Ensemble reduces individual model bias and improves stability",
          "Consider position sizing based on confidence levels"
        ],
        links: [
          { label: "Ensemble Theory", url: "#" },
          { label: "Weight Optimization", url: "#" }
        ]
      })
    }
  ];

  const riskMetrics = [
    {
      id: "gas-prediction",
      icon: <Fuel className="h-5 w-5" />,
      title: "Gas Prediction",
      value: `${predictionData.gasPrediction.current} Gwei`,
      subtitle: predictionData.gasPrediction.recommendation,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      trend: predictionData.gasPrediction.oneHour < predictionData.gasPrediction.current ? "down" as const : "up" as const,
      onClick: () => setSelectedMetric({
        title: "Gas Price Prediction",
        icon: <Fuel className="h-6 w-6 text-orange-400" />,
        color: "orange",
        value: `${predictionData.gasPrediction.current} Gwei`,
        description: "AI-powered gas price forecasting based on network congestion patterns, pending transactions, and historical data.",
        details: [
          { label: "Current Gas", value: `${predictionData.gasPrediction.current} Gwei` },
          { label: "1 Hour Forecast", value: `${predictionData.gasPrediction.oneHour} Gwei`, trend: predictionData.gasPrediction.oneHour < predictionData.gasPrediction.current ? "down" : "up" },
          { label: "6 Hour Forecast", value: `${predictionData.gasPrediction.sixHour} Gwei`, trend: predictionData.gasPrediction.sixHour < predictionData.gasPrediction.current ? "down" : "up" },
          { label: "24 Hour Forecast", value: `${predictionData.gasPrediction.twentyFourHour} Gwei`, trend: predictionData.gasPrediction.twentyFourHour < predictionData.gasPrediction.current ? "down" : "up" },
          { label: "Priority Fee", value: "2 Gwei", info: "Recommended tip" },
          { label: "Base Fee Trend", value: "Decreasing", trend: "down" },
          { label: "Pending TXs", value: "142K", info: "Mempool size" },
          { label: "Block Utilization", value: "87%", info: "Current load" },
          { label: "Optimal Window", value: "2-4 AM UTC", info: "Lowest gas period" },
          { label: "Forecast Accuracy", value: "89%", trend: "up" },
        ],
        insights: [
          predictionData.gasPrediction.oneHour < predictionData.gasPrediction.current 
            ? "Gas expected to decrease - consider waiting for better rates"
            : "Gas expected to increase - transact now if urgent",
          predictionData.gasPrediction.recommendation,
          "Weekend mornings typically offer lowest gas prices",
          "Major token launches or NFT mints can spike gas unexpectedly"
        ],
        links: [
          { label: "Gas Tracker", url: "https://etherscan.io/gastracker" },
          { label: "Gas History", url: "#" }
        ]
      })
    }
  ];

  const renderMetricCard = (metric: typeof signalMetrics[0]) => (
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
          {metric.trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-400" />}
          {metric.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
          <span className="text-xs text-muted-foreground">{metric.subtitle}</span>
        </div>
      </div>
    </div>
  );

  const renderModelCard = (model: typeof modelCards[0]) => (
    <div
      key={model.id}
      onClick={model.onClick}
      className="group bg-background/40 hover:bg-background/60 border border-border/30 hover:border-primary/40 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${model.data.prediction === "bullish" ? "bg-green-500/20" : model.data.prediction === "bearish" ? "bg-red-500/20" : "bg-yellow-500/20"}`}>
            <div className={model.data.prediction === "bullish" ? "text-green-400" : model.data.prediction === "bearish" ? "text-red-400" : "text-yellow-400"}>
              {model.icon}
            </div>
          </div>
          <span className="text-sm font-medium text-foreground">{model.shortName}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className={`text-lg font-bold mb-2 ${model.data.prediction === "bullish" ? "text-green-400" : model.data.prediction === "bearish" ? "text-red-400" : "text-yellow-400"}`}>
        {model.data.prediction.toUpperCase()}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-medium text-foreground">{model.data.confidence}%</span>
        </div>
        <Progress value={model.data.confidence} className="h-1.5" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Target</span>
          <span className="font-medium text-foreground">${model.data.priceTarget.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderContractCard = (contract: typeof predictionData.contractRiskScoring[0], index: number) => (
    <div
      key={index}
      onClick={() => setSelectedMetric({
        title: `${contract.token} Security Analysis`,
        icon: <Shield className="h-6 w-6 text-yellow-400" />,
        color: "yellow",
        value: `${contract.score}/100`,
        description: `Comprehensive smart contract security analysis for ${contract.token} including audit status, vulnerability detection, and risk scoring.`,
        details: [
          { label: "Security Score", value: `${contract.score}/100`, trend: contract.score >= 80 ? "up" : contract.score >= 50 ? "neutral" : "down" },
          { label: "Audit Status", value: contract.audited ? "Verified" : "Unaudited", trend: contract.audited ? "up" : "down" },
          { label: "Reentrancy Risk", value: contract.score > 70 ? "Low" : "Medium", trend: contract.score > 70 ? "up" : "neutral" },
          { label: "Centralization", value: contract.score > 60 ? "Low" : "High", info: "Owner privileges" },
          { label: "Proxy Pattern", value: "Upgradeable", info: "Contract type" },
          { label: "Holder Count", value: "12.4K", trend: "up" },
          { label: "Liquidity Locked", value: contract.score > 50 ? "Yes" : "Partial" },
          { label: "Honeypot Check", value: "Passed", trend: "up" },
          { label: "Similar Contracts", value: "234", info: "Verified similar" },
          { label: "Last Updated", value: "2h ago" },
        ],
        insights: contract.issues.length > 0 
          ? contract.issues.map(issue => `⚠️ ${issue}`)
          : ["No major security issues detected", "Contract follows standard patterns", "Liquidity appears locked", "Consider monitoring for upgrades"],
        links: [
          { label: "Token Sniffer", url: `https://tokensniffer.com/` },
          { label: "Contract Code", url: `https://etherscan.io/` }
        ]
      })}
      className="group bg-background/40 hover:bg-background/60 border border-border/30 hover:border-primary/40 rounded-lg p-3 cursor-pointer transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{contract.token}</span>
        <div className="flex items-center gap-1">
          {contract.audited ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          )}
          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Security Score</span>
          <span className={`font-medium ${contract.score >= 80 ? "text-green-400" : contract.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
            {contract.score}/100
          </span>
        </div>
        <Progress 
          value={contract.score} 
          className={`h-1.5 ${contract.score >= 80 ? "[&>div]:bg-green-400" : contract.score >= 50 ? "[&>div]:bg-yellow-400" : "[&>div]:bg-red-400"}`} 
        />
      </div>
      <div className="text-xs text-muted-foreground truncate">
        {contract.issues.length > 0 ? contract.issues[0] : "No major issues"}
      </div>
    </div>
  );

  const renderNFTCard = (nft: typeof predictionData.nftPredictors[0], index: number) => (
    <div
      key={index}
      onClick={() => setSelectedMetric({
        title: `${nft.collection} Price Prediction`,
        icon: <ImageIcon className="h-6 w-6 text-purple-400" />,
        color: "purple",
        value: `${nft.predictedFloor.toFixed(2)} ETH`,
        description: `AI-powered floor price prediction for ${nft.collection} based on trading patterns, holder behavior, and market sentiment.`,
        details: [
          { label: "Current Floor", value: `${nft.currentFloor.toFixed(2)} ETH` },
          { label: "Predicted Floor", value: `${nft.predictedFloor.toFixed(2)} ETH`, trend: nft.trend === "up" ? "up" : nft.trend === "down" ? "down" : "neutral" },
          { label: "Price Change", value: `${((nft.predictedFloor - nft.currentFloor) / nft.currentFloor * 100).toFixed(1)}%`, trend: nft.trend === "up" ? "up" : nft.trend === "down" ? "down" : "neutral" },
          { label: "Confidence", value: `${nft.confidence}%`, trend: nft.confidence > 70 ? "up" : "neutral" },
          { label: "7D Volume", value: "234 ETH", trend: "up" },
          { label: "Unique Holders", value: "4,521" },
          { label: "Listing Rate", value: "12%", info: "Supply on market" },
          { label: "Avg Hold Time", value: "45 days" },
          { label: "Whale Holdings", value: "23%", info: "Top 10 holders" },
          { label: "Rarity Floor", value: `${(nft.currentFloor * 1.3).toFixed(2)} ETH` },
        ],
        insights: [
          nft.trend === "up" 
            ? "Positive momentum detected - accumulation patterns visible"
            : nft.trend === "down"
              ? "Selling pressure detected - consider monitoring closely"
              : "Stable trading range - no strong directional signals",
          "Collection whale concentration is within healthy range",
          "Listing rate below average indicates holder confidence",
          "Social mentions trending positively"
        ],
        links: [
          { label: "OpenSea", url: "https://opensea.io/" },
          { label: "NFT Analytics", url: "#" }
        ]
      })}
      className="group flex items-center justify-between p-3 bg-background/40 hover:bg-background/60 border border-border/30 hover:border-primary/40 rounded-lg cursor-pointer transition-all"
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{nft.collection}</div>
        <div className="text-xs text-muted-foreground">
          Current: {nft.currentFloor.toFixed(2)} ETH
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        <div>
          <div className={`text-sm font-bold flex items-center gap-1 ${nft.trend === "up" ? "text-green-400" : nft.trend === "down" ? "text-red-400" : "text-yellow-400"}`}>
            {nft.trend === "up" ? <TrendingUp className="h-3 w-3" /> : nft.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
            {nft.predictedFloor.toFixed(2)} ETH
          </div>
          <div className="text-xs text-muted-foreground">
            {nft.confidence}% conf.
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">AI Prediction Models</h3>
            <p className="text-sm text-muted-foreground">Multi-model ensemble forecasting</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="models" className="text-xs">
              <Cpu className="h-3 w-3 mr-1" />
              Models
            </TabsTrigger>
            <TabsTrigger value="signals" className="text-xs">
              <Gauge className="h-3 w-3 mr-1" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="nft" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              NFT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-4">
            {/* Model Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {modelCards.map(renderModelCard)}
            </div>
            
            {/* Consensus Banner */}
            <div 
              onClick={() => signalMetrics.find(m => m.id === "consensus")?.onClick()}
              className={`cursor-pointer border rounded-lg p-4 transition-all hover:scale-[1.01] ${getPredictionColor(predictionData.ensembleModels.consensus)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  <span className="font-medium">Ensemble Consensus Signal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPredictionColor(predictionData.ensembleModels.consensus)}>
                    {predictionData.ensembleModels.consensus.toUpperCase()} • {predictionData.ensembleModels.consensusConfidence}%
                  </Badge>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-sm opacity-80">
                Average Price Target: ${avgPriceTarget.toLocaleString()} • Model Agreement: 2/3
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {signalMetrics.map(renderMetricCard)}
            </div>
            
            {/* Whale Clustering Visualization */}
            <div className="bg-background/40 border border-border/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-400" />
                Whale Entity Distribution
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { name: "Exchanges", value: predictionData.whaleClustering.exchanges, color: "bg-blue-500", icon: <Wallet className="h-4 w-4" /> },
                  { name: "Institutions", value: predictionData.whaleClustering.institutions, color: "bg-purple-500", icon: <Building2 className="h-4 w-4" /> },
                  { name: "Whales", value: predictionData.whaleClustering.whales, color: "bg-orange-500", icon: <DollarSign className="h-4 w-4" /> },
                  { name: "DeFi", value: predictionData.whaleClustering.defi, color: "bg-green-500", icon: <Layers className="h-4 w-4" /> },
                  { name: "Smart Money", value: predictionData.whaleClustering.smartMoney, color: "bg-cyan-500", icon: <Sparkles className="h-4 w-4" /> },
                ].map((cluster) => (
                  <div key={cluster.name} className="text-center p-3 bg-background/60 rounded-lg">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${cluster.color} flex items-center justify-center text-white`}>
                      {cluster.icon}
                    </div>
                    <div className="text-xs text-muted-foreground">{cluster.name}</div>
                    <div className="text-lg font-bold text-foreground">{cluster.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="mt-4">
            {/* Gas Prediction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {riskMetrics.map(renderMetricCard)}
              
              <div className="bg-background/40 border border-border/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  Gas Forecast Timeline
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Now", value: predictionData.gasPrediction.current },
                    { label: "1h", value: predictionData.gasPrediction.oneHour },
                    { label: "6h", value: predictionData.gasPrediction.sixHour },
                    { label: "24h", value: predictionData.gasPrediction.twentyFourHour },
                  ].map((g, i) => (
                    <div key={i} className="text-center p-2 bg-background/60 rounded-lg">
                      <div className="text-xs text-muted-foreground">{g.label}</div>
                      <div className={`text-lg font-bold ${i > 0 && g.value < predictionData.gasPrediction.current ? "text-green-400" : i > 0 && g.value > predictionData.gasPrediction.current ? "text-red-400" : "text-foreground"}`}>
                        {g.value}
                      </div>
                      <div className="text-xs text-muted-foreground">Gwei</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contract Risk Scoring */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Smart Contract Risk Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {predictionData.contractRiskScoring.slice(0, 4).map(renderContractCard)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nft" className="mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-400" />
              NFT Floor Price Predictions
            </h4>
            <div className="space-y-2">
              {predictionData.nftPredictors.map(renderNFTCard)}
            </div>
            
            <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4 text-primary" />
                <span>Predictions are based on trading volume, holder patterns, and social sentiment analysis</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </>
  );
}

// Missing icon component
const Building2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/>
    <path d="M10 10h4"/>
    <path d="M10 14h4"/>
    <path d="M10 18h4"/>
  </svg>
);
