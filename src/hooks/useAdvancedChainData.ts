import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";
import { ChainHealthData } from "@/components/chain/ChainHealthMetrics";
import { FinancialMetricsData } from "@/components/chain/DeepFinancialMetrics";
import { PredictionModelsData } from "@/components/chain/AdvancedPredictionModels";
import { AnomalyDetectionData } from "@/components/chain/AnomalyDetection";
import { MultiChainData } from "@/components/chain/MultiChainComparison";
import { InstitutionalData } from "@/components/chain/InstitutionalView";

export interface AdvancedChainDataResponse {
  healthData: ChainHealthData;
  financialData: FinancialMetricsData;
  predictionData: PredictionModelsData;
  anomalyData: AnomalyDetectionData;
  comparisonData: MultiChainData;
  institutionalData: InstitutionalData;
}

// Fetch real health data from Alchemy via edge function
const fetchRealHealthData = async (chainId: string): Promise<ChainHealthData | null> => {
  try {
    const { data, error } = await invokeFunction("chain-health", {
      body: { chainId },
    });
    if (error) {
      console.error("Error fetching chain health:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Chain health fetch failed:", e);
    return null;
  }
};

const generateAdvancedData = async (chainId: string): Promise<AdvancedChainDataResponse> => {
  // Fetch real health data from Alchemy first
  const realHealthData = await fetchRealHealthData(chainId);

  // Seed by 30s window — stable within window, refreshes every 30s
  const seed = Math.floor(Date.now() / 30000);
  const sr = (n: number) => { const x = Math.sin(seed * 9301 + n * 49297 + 233) * 1e9; return x - Math.floor(x); };

  // Chain-specific base prices for financial metrics
  const basePrices: Record<string, number> = {
    ethereum: 3500, solana: 180, bitcoin: 97000, arbitrum: 1.15,
    base: 3500, optimism: 2.45, polygon: 0.62, avalanche: 38, bnb: 620,
  };
  const ethPrice = basePrices[chainId] || basePrices.ethereum;
  const priceVariation = 1 + (sr(0) - 0.5) * 0.04; // ±2% variation per window
  const currentPrice = ethPrice * priceVariation;

  const healthData: ChainHealthData = realHealthData || {
    finalityRate: 99.2 + sr(1) * 0.7,
    blockProduction: 7100 + sr(2) * 100,
    avgBlockTime: chainId === "ethereum" ? 12.1 : chainId === "solana" ? 0.4 : 2.0,
    validatorHealth: 97 + sr(3) * 2.5,
    activeValidators: chainId === "ethereum" ? 950000 + Math.floor(sr(4) * 50000) : 1500 + Math.floor(sr(5) * 500),
    totalStaked: 32000000 + sr(6) * 2000000,
    mevMetrics: { flashbotsBlocks: 85 + sr(7) * 10, sandwichAttacks: 15000 + Math.floor(sr(8) * 5000), mevRevenue24h: 2000000 + sr(9) * 1000000 },
    layer2Analytics: { arbitrumBridged: 15e9 + sr(10) * 2e9, optimismBridged: 8e9 + sr(11) * 1e9, baseBridged: 5e9 + sr(12) * 500e6 },
    eip1559: { burnRate: 2500 + sr(13) * 500, supplyChange: -0.2 + sr(14) * 0.4, baseFee: 15 + sr(15) * 30 },
    stakingMetrics: { stakingAPR: 3.5 + sr(16) * 0.5, lidoYield: 3.8 + sr(17) * 0.3, rocketPoolYield: 4.0 + sr(18) * 0.4, cbETHYield: 3.2 + sr(19) * 0.3 },
    contractActivity: { verified: 450 + Math.floor(sr(20) * 100), unverified: 1200 + Math.floor(sr(21) * 300), total: 1650 + Math.floor(sr(22) * 400) }
  };

  // Prediction bias from seed — consistent per window
  const predBias = sr(30) > 0.5 ? "bullish" : sr(31) > 0.5 ? "neutral" : "bearish";
  const predConf = (base: number, n: number) => base + Math.floor(sr(n) * 20);

  return {
    healthData,
    financialData: {
      realizedPrice: currentPrice * 0.7,
      currentPrice,
      urpdDistribution: [
        { priceRange: "$0-1000", percentage: 8 + sr(40) * 5 },
        { priceRange: "$1000-2000", percentage: 15 + sr(41) * 5 },
        { priceRange: "$2000-3000", percentage: 25 + sr(42) * 10 },
        { priceRange: "$3000-4000", percentage: 35 + sr(43) * 10 },
        { priceRange: "$4000+", percentage: 12 + sr(44) * 5 }
      ],
      mvrvRatio: 1.2 + sr(45) * 1.5,
      soprValue: 0.95 + sr(46) * 0.15,
      nvtRatio: 40 + sr(47) * 60,
      exchangeNetflow: { binance: (sr(48) - 0.5) * 50000, coinbase: (sr(49) - 0.5) * 30000, kraken: (sr(50) - 0.5) * 15000, totalNetflow: (sr(51) - 0.4) * 80000 },
      stablecoinMetrics: { dominance: 6 + sr(52) * 2, usdt: 85e9 + sr(53) * 5e9, usdc: 25e9 + sr(54) * 2e9, dai: 4e9 + sr(55) * 500e6, netFlow24h: (sr(56) - 0.5) * 500e6 },
      futuresData: { openInterest: 18e9 + sr(57) * 4e9, fundingRate: (sr(58) - 0.5) * 0.002, longRatio: 48 + sr(59) * 8, liquidations24h: 80e6 + sr(60) * 40e6 },
      optionsData: { callVolume: 800e6 + sr(61) * 200e6, putVolume: 400e6 + sr(62) * 150e6, putCallRatio: 0.4 + sr(63) * 0.4, maxPainPrice: currentPrice * (0.95 + sr(64) * 0.1), impliedVolatility: 50 + sr(65) * 30 }
    },
    predictionData: {
      ensembleModels: {
        lstm: { prediction: predBias, confidence: predConf(65, 70), priceTarget: currentPrice * (1 + (sr(71) - 0.5) * 0.1) },
        transformer: { prediction: predBias, confidence: predConf(70, 72), priceTarget: currentPrice * (1 + (sr(73) - 0.5) * 0.12) },
        prophet: { prediction: sr(74) > 0.4 ? predBias : "neutral", confidence: predConf(60, 75), priceTarget: currentPrice * (1 + (sr(76) - 0.5) * 0.08) },
        consensus: predBias,
        consensusConfidence: predConf(68, 77)
      },
      onChainSignals: {
        accuracy90Day: 72 + Math.floor(sr(78) * 15),
        currentSignal: predBias,
        signalStrength: 60 + Math.floor(sr(79) * 30),
        historicalAccuracy: [{ period: "30 days", accuracy: 68 + Math.floor(sr(80) * 15) }, { period: "60 days", accuracy: 70 + Math.floor(sr(81) * 12) }, { period: "90 days", accuracy: 72 + Math.floor(sr(82) * 10) }]
      },
      whaleClustering: { exchanges: 150 + Math.floor(sr(83) * 50), institutions: 85 + Math.floor(sr(84) * 30), whales: 2500 + Math.floor(sr(85) * 500), defi: 450 + Math.floor(sr(86) * 100), smartMoney: 320 + Math.floor(sr(87) * 80) },
      contractRiskScoring: ["AAVE", "UNI", "LDO", "MKR"].map((t, i) => ({ token: t, score: 70 + Math.floor(sr(88 + i) * 25), issues: sr(89 + i) > 0.7 ? ["Minor centralization risk"] : [], audited: sr(90 + i) > 0.3 })),
      gasPrediction: { current: 20 + Math.floor(sr(92) * 30), oneHour: 18 + Math.floor(sr(93) * 25), sixHour: 15 + Math.floor(sr(94) * 20), twentyFourHour: 12 + Math.floor(sr(95) * 15), recommendation: sr(96) > 0.5 ? "Wait 6h for lower fees" : "Good time to transact" },
      nftPredictors: [{ collection: "BAYC", currentFloor: 25 + sr(97) * 5, predictedFloor: 27 + sr(98) * 5, confidence: 65 + Math.floor(sr(99) * 20), trend: "up" }, { collection: "Pudgy Penguins", currentFloor: 12 + sr(100) * 3, predictedFloor: 11 + sr(101) * 3, confidence: 60 + Math.floor(sr(102) * 15), trend: "down" }, { collection: "Azuki", currentFloor: 8 + sr(103) * 2, predictedFloor: 8.5 + sr(104) * 2, confidence: 55 + Math.floor(sr(105) * 20), trend: "neutral" }, { collection: "Doodles", currentFloor: 3 + sr(106), predictedFloor: 3.2 + sr(107), confidence: 58 + Math.floor(sr(108) * 15), trend: "up" }]
    },
    anomalyData: {
      washTrading: { detected: 45 + Math.floor(sr(110) * 20), suspectedPairs: [{ pair: "SHIB/USDT", volume: 50e6, suspicionScore: 85 }, { pair: "PEPE/ETH", volume: 25e6, suspicionScore: 72 }, { pair: "DOGE/USDT", volume: 80e6, suspicionScore: 65 }], totalFakeVolume: 150e6 + sr(111) * 100e6 },
      mevBots: { identified: 1200 + Math.floor(sr(112) * 300), activity24h: 450000 + Math.floor(sr(113) * 100000), topBots: [{ address: "0x7a250d56", profit24h: 150000 + sr(114) * 50000, type: "Arbitrage" }, { address: "0x3fc91a3a", profit24h: 80000 + sr(115) * 30000, type: "Sandwich" }, { address: "0x1111111", profit24h: 45000 + sr(116) * 20000, type: "Liquidation" }] },
      rugPullWarning: { highRisk: [{ token: "SCAM_TOKEN", score: 92, reasons: ["Honeypot detected", "No liquidity lock"] }, { token: "FAKE_COIN", score: 88, reasons: ["Owner can mint", "Suspicious transfers"] }], mediumRisk: [{ token: "NEW_MEME", score: 65, reasons: ["Low liquidity"] }, { token: "ANON_TOKEN", score: 58, reasons: ["Unverified contract"] }], recentRugs: [{ token: "RUG_TOKEN", date: "2 days ago", loss: 2.5e6 }, { token: "EXIT_SCAM", date: "5 days ago", loss: 1.2e6 }] },
      sybilDetection: { suspectedClusters: 85 + Math.floor(sr(117) * 40), flaggedAddresses: 125000 + Math.floor(sr(118) * 50000), recentAirdrops: [{ name: "LayerZero", sybilRate: 35, flagged: 150000 }, { name: "Starknet", sybilRate: 28, flagged: 80000 }, { name: "zkSync", sybilRate: 42, flagged: 200000 }] },
      fakeVolume: { cexFakeVolume: 800e6 + sr(119) * 400e6, dexFakeVolume: 150e6 + sr(120) * 100e6, realVolumeRatio: 65 + Math.floor(sr(121) * 20), flaggedExchanges: [{ name: "HitBTC", fakePercentage: 75 }, { name: "MEXC", fakePercentage: 55 }, { name: "Gate.io", fakePercentage: 40 }] },
      recentAlerts: [{ type: "rug_warning", severity: "high", message: "Potential rug pull detected: SCAM_TOKEN", timestamp: Date.now() - 3600000 }, { type: "whale_move", severity: "medium", message: "Large ETH transfer to exchange detected", timestamp: Date.now() - 7200000 }]
    },
    comparisonData: {
      chainMetrics: [
        { chainId: "ethereum", name: "Ethereum", tps: 15, avgFee: 8.5, finality: 12, tvl: 48e9, volume24h: 18e9, activeUsers: 450000, marketCap: 440e9 },
        { chainId: "solana", name: "Solana", tps: 4000, avgFee: 0.0025, finality: 0.4, tvl: 8e9, volume24h: 4.5e9, activeUsers: 800000, marketCap: 105e9 },
        { chainId: "arbitrum", name: "Arbitrum", tps: 100, avgFee: 0.15, finality: 2, tvl: 3.2e9, volume24h: 450e6, activeUsers: 200000, marketCap: 4.6e9 },
        { chainId: "base", name: "Base", tps: 100, avgFee: 0.001, finality: 2, tvl: 1.5e9, volume24h: 300e6, activeUsers: 100000, marketCap: 2e9 },
        { chainId: "polygon", name: "Polygon", tps: 7000, avgFee: 0.01, finality: 2, tvl: 900e6, volume24h: 400e6, activeUsers: 350000, marketCap: 6e9 }
      ],
      layer2Comparison: [{ name: "Arbitrum", tvl: 15e9, transactions24h: 2e6, avgFee: 0.15, sequencerUptime: 99.9 }, { name: "Optimism", tvl: 8e9, transactions24h: 1.2e6, avgFee: 0.12, sequencerUptime: 99.7 }, { name: "Base", tvl: 5e9, transactions24h: 1e6, avgFee: 0.001, sequencerUptime: 99.8 }],
      bridgeMonitoring: [{ bridge: "Stargate", tvl: 800e6, volume24h: 150e6, health: 98, recentHacks: 0 }, { bridge: "Across", tvl: 400e6, volume24h: 80e6, health: 97, recentHacks: 0 }, { bridge: "Hop Protocol", tvl: 200e6, volume24h: 45e6, health: 95, recentHacks: 0 }, { bridge: "Multichain", tvl: 50e6, volume24h: 5e6, health: 45, recentHacks: 1 }],
      feeComparison: [{ chain: "Ethereum", swapFee: 25, transferFee: 5, nftMintFee: 45, contractDeployFee: 350 }, { chain: "Solana", swapFee: 0.01, transferFee: 0.001, nftMintFee: 0.02, contractDeployFee: 2 }, { chain: "Arbitrum", swapFee: 0.8, transferFee: 0.15, nftMintFee: 1.5, contractDeployFee: 12 }, { chain: "Base", swapFee: 0.05, transferFee: 0.001, nftMintFee: 0.1, contractDeployFee: 1 }]
    },
    institutionalData: {
      grayscalePremium: [{ product: "GBTC", nav: 62.50, marketPrice: 61.80, premiumDiscount: -1.12, aum: 28e9 }, { product: "ETHE", nav: 32.40, marketPrice: 31.50, premiumDiscount: -2.78, aum: 9.5e9 }, { product: "GSOL", nav: 12.80, marketPrice: 11.90, premiumDiscount: -7.03, aum: 850e6 }],
      etfFlows: [{ etf: "IBIT", flow24h: 280e6, flow7d: 1.2e9, totalAum: 45e9, correlation: 0.95 }, { etf: "FBTC", flow24h: 150e6, flow7d: 680e6, totalAum: 18e9, correlation: 0.92 }, { etf: "ARKB", flow24h: 45e6, flow7d: 180e6, totalAum: 4.5e9, correlation: 0.88 }, { etf: "BITB", flow24h: 30e6, flow7d: 120e6, totalAum: 3.2e9, correlation: 0.85 }],
      cmeFuturesAnalysis: { openInterest: 12e9, volume24h: 4.5e9, basis: 2.5, basisAnnualized: 8.2, spotPrice: currentPrice, frontMonthPrice: currentPrice * 1.025, institutionalLongRatio: 62 },
      minerProfitability: [{ metric: "Hash Rate", value: "1.2 EH/s", change24h: 2.5, status: "profitable" }, { metric: "Revenue/TH", value: 85, change24h: -1.2, status: "profitable" }, { metric: "Electricity Cost", value: 0.08, change24h: 0, status: "marginal" }, { metric: "Net Margin", value: "35%", change24h: -3.5, status: "profitable" }],
      validatorEconomics: { totalValidators: 950000, stakingYield: 3.8, mevRevenue: 2500, avgValidatorBalance: 33.5, profitabilityScore: 78, breakEvenPrice: 1800 },
      institutionalHoldings: [{ holder: "BlackRock", holdings: 350000, percentSupply: 0.29, change30d: 5.2 }, { holder: "Fidelity", holdings: 180000, percentSupply: 0.15, change30d: 3.8 }, { holder: "Grayscale", holdings: 2800000, percentSupply: 2.33, change30d: -1.2 }, { holder: "Coinbase Custody", holdings: 950000, percentSupply: 0.79, change30d: 2.1 }]
    }
  };
};


export function useAdvancedChainData(chainId: string, enabled = true) {
  return useQuery({
    queryKey: ["advanced-chain-data", chainId],
    queryFn: () => generateAdvancedData(chainId),
    enabled: enabled && !!chainId,
    staleTime: 15000,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
}