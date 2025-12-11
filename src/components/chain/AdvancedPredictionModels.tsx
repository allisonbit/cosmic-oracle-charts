import { ChainConfig } from "@/lib/chainConfig";
import { Brain, Cpu, GitBranch, Gauge, Fuel, ImageIcon, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AdvancedPredictionModelsProps {
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

export function AdvancedPredictionModels({ chain, predictionData, isLoading }: AdvancedPredictionModelsProps) {
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
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Brain className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">AI Prediction Models</h3>
          <p className="text-sm text-muted-foreground">Multi-model ensemble forecasting</p>
        </div>
      </div>

      {/* Ensemble Models */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          Model Ensemble Predictions
        </h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { name: "LSTM", data: predictionData.ensembleModels.lstm },
            { name: "Transformer", data: predictionData.ensembleModels.transformer },
            { name: "Prophet", data: predictionData.ensembleModels.prophet },
          ].map((model) => (
            <div key={model.name} className="bg-background/40 border border-border/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{model.name}</span>
                {getPredictionIcon(model.data.prediction)}
              </div>
              <div className={`text-lg font-bold ${model.data.prediction === "bullish" ? "text-green-400" : model.data.prediction === "bearish" ? "text-red-400" : "text-yellow-400"}`}>
                {model.data.prediction.toUpperCase()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="text-sm font-medium text-foreground">{model.data.confidence}%</span>
              </div>
              <Progress value={model.data.confidence} className="h-1 mt-1" />
              <div className="mt-2 text-xs text-muted-foreground">
                Target: <span className="text-foreground">${model.data.priceTarget.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`border rounded-lg p-4 ${getPredictionColor(predictionData.ensembleModels.consensus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <span className="font-medium">Consensus Signal</span>
            </div>
            <Badge className={getPredictionColor(predictionData.ensembleModels.consensus)}>
              {predictionData.ensembleModels.consensus.toUpperCase()} • {predictionData.ensembleModels.consensusConfidence}%
            </Badge>
          </div>
        </div>
      </div>

      {/* On-Chain Signals */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-cyan-400" />
            On-Chain Predictive Signals
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Current Signal</span>
              <Badge className={getPredictionColor(predictionData.onChainSignals.currentSignal)}>
                {predictionData.onChainSignals.currentSignal.toUpperCase()}
              </Badge>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Signal Strength</span>
                <span className="font-medium text-foreground">{predictionData.onChainSignals.signalStrength}%</span>
              </div>
              <Progress value={predictionData.onChainSignals.signalStrength} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2">Historical Accuracy</div>
              {predictionData.onChainSignals.historicalAccuracy.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{h.period}</span>
                  <span className={`font-medium ${h.accuracy >= 70 ? "text-green-400" : h.accuracy >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {h.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-400" />
            Whale Clustering Analysis
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="space-y-3">
              {[
                { name: "Exchanges", value: predictionData.whaleClustering.exchanges, color: "bg-blue-500" },
                { name: "Institutions", value: predictionData.whaleClustering.institutions, color: "bg-purple-500" },
                { name: "Whales", value: predictionData.whaleClustering.whales, color: "bg-orange-500" },
                { name: "DeFi Protocols", value: predictionData.whaleClustering.defi, color: "bg-green-500" },
                { name: "Smart Money", value: predictionData.whaleClustering.smartMoney, color: "bg-cyan-500" },
              ].map((cluster) => (
                <div key={cluster.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cluster.color}`} />
                  <span className="text-sm text-muted-foreground flex-1">{cluster.name}</span>
                  <span className="text-sm font-medium text-foreground">{cluster.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Risk Scoring */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          Smart Contract Risk Analysis
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {predictionData.contractRiskScoring.slice(0, 4).map((contract, i) => (
              <div key={i} className="bg-background/40 border border-border/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{contract.token}</span>
                  {contract.audited ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
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
                    className={`h-1 ${contract.score >= 80 ? "[&>div]:bg-green-400" : contract.score >= 50 ? "[&>div]:bg-yellow-400" : "[&>div]:bg-red-400"}`} 
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {contract.issues.length > 0 ? contract.issues[0] : "No major issues"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gas Prediction */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Fuel className="h-4 w-4 text-orange-400" />
            Gas Price Prediction
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Now</div>
                <div className="text-lg font-bold text-foreground">{predictionData.gasPrediction.current}</div>
                <div className="text-xs text-muted-foreground">Gwei</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">1h</div>
                <div className={`text-lg font-bold ${predictionData.gasPrediction.oneHour < predictionData.gasPrediction.current ? "text-green-400" : "text-red-400"}`}>
                  {predictionData.gasPrediction.oneHour}
                </div>
                <div className="text-xs text-muted-foreground">Gwei</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">6h</div>
                <div className={`text-lg font-bold ${predictionData.gasPrediction.sixHour < predictionData.gasPrediction.current ? "text-green-400" : "text-red-400"}`}>
                  {predictionData.gasPrediction.sixHour}
                </div>
                <div className="text-xs text-muted-foreground">Gwei</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">24h</div>
                <div className={`text-lg font-bold ${predictionData.gasPrediction.twentyFourHour < predictionData.gasPrediction.current ? "text-green-400" : "text-red-400"}`}>
                  {predictionData.gasPrediction.twentyFourHour}
                </div>
                <div className="text-xs text-muted-foreground">Gwei</div>
              </div>
            </div>
            <div className="text-sm text-primary font-medium text-center">
              💡 {predictionData.gasPrediction.recommendation}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-purple-400" />
            NFT Floor Predictions
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="space-y-3">
              {predictionData.nftPredictors.slice(0, 4).map((nft, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{nft.collection}</div>
                    <div className="text-xs text-muted-foreground">
                      Current: {nft.currentFloor.toFixed(2)} ETH
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold flex items-center gap-1 ${nft.trend === "up" ? "text-green-400" : nft.trend === "down" ? "text-red-400" : "text-yellow-400"}`}>
                      {nft.trend === "up" ? <TrendingUp className="h-3 w-3" /> : nft.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                      {nft.predictedFloor.toFixed(2)} ETH
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {nft.confidence}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}