import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { usePricePrediction, getCryptoBySlug, TOP_CRYPTOS } from "@/hooks/usePricePrediction";
import { useResolvedCoin } from "@/hooks/useResolvedCoin";

import { PredictionSEO } from "@/components/prediction/PredictionSEO";
import { PredictionHero } from "@/components/prediction/PredictionHero";
import { TechnicalIndicatorsPanel, PriceTargetsPanel, TradingZonesPanel, ScenariosPanel, RiskAssessmentPanel } from "@/components/prediction/PredictionPanels";
import { CoinList, TimeframeSelector, RelatedPredictions } from "@/components/prediction/PredictionNavigation";
import { Disclaimer, Methodology } from "@/components/prediction/PredictionContent";
import { InvestorActionSummary } from "@/components/prediction/InvestorActionSummary";
import { EnhancedFAQ } from "@/components/prediction/EnhancedFAQ";
import { MarketQuestionsLinks, RelatedToolsLinks, TimeframeCrossLinks, HighIntentCTA } from "@/components/prediction/HighIntentLinks";
import { MarketDataPanel } from "@/components/prediction/MarketDataPanel";
import { SignalChart } from "@/components/prediction/SignalChart";
import { TradeSetupCard } from "@/components/prediction/TradeSetupCard";
import { SetupTrackRecord } from "@/components/prediction/SetupTrackRecord";
import { PredictionWriteUp } from "@/components/prediction/PredictionWriteUp";
import { SetupSchema } from "@/components/prediction/SetupSchema";
import { GlobalTokenSearch } from "@/components/prediction/GlobalTokenSearch";
import { GlobalToken } from "@/hooks/useGlobalTokenSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, Radio, Clock, Activity, Globe, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function PricePrediction() {
  const { coinId, timeframe = 'daily' } = useParams<{ coinId: string; timeframe: string }>();
  const navigate = useNavigate();
  const predefinedCrypto = coinId ? getCryptoBySlug(coinId) : TOP_CRYPTOS[0];
  const [liveTime, setLiveTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenSelect = useCallback((token: GlobalToken) => {
    // Prefer the contract address as the slug for on-chain-only tokens so the
    // resolver can re-find them; otherwise use the coin id.
    const slug = (token.address || token.id || token.symbol).toString().toLowerCase().replace(/\s+/g, '-');
    navigate(`/price-prediction/${slug}/daily`);
  }, [navigate]);

  // Canonical resolution — accepts slug, symbol, EVM contract, or Solana mint.
  // Predefined top coins resolve instantly (no network call).
  const { data: resolved, isLoading: isLoadingToken } = useResolvedCoin(coinId, predefinedCrypto);

  const crypto = resolved
    ? { id: resolved.coinId, symbol: resolved.symbol, name: resolved.name }
    : (predefinedCrypto || { id: coinId || 'bitcoin', symbol: coinId?.toUpperCase() || 'BTC', name: coinId || 'Bitcoin' });
  const contractAddress = resolved?.contractAddress;
  const chain = resolved?.chain;
  const validTimeframe = ['daily', 'weekly', 'monthly'].includes(timeframe) ? timeframe as 'daily' | 'weekly' | 'monthly' : 'daily';
  const { data, isLoading, error, dataUpdatedAt } = usePricePrediction(
    crypto?.id || 'bitcoin',
    crypto?.symbol || 'btc',
    validTimeframe,
    !isLoadingToken,
    { contractAddress, chain }
  );

  const timeframeLabel = validTimeframe === 'daily' ? 'Today' : validTimeframe === 'weekly' ? 'This Week' : 'This Month';
  const refreshRate = validTimeframe === 'daily' ? '5 min' : validTimeframe === 'weekly' ? '30 min' : '1 hr';

  if (isLoadingToken) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-6 flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading token data...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PredictionSEO
        coinName={crypto.name} symbol={crypto.symbol} timeframe={validTimeframe}
        currentPrice={data?.currentPrice} bias={data?.bias} confidence={data?.confidence}
      />
      {data && (
        <SetupSchema
          coinName={crypto.name} symbol={crypto.symbol} timeframe={validTimeframe}
          bias={data.bias} confidence={data.confidence} currentPrice={data.currentPrice}
          entryLow={(data.tradingZones?.entryZone as any)?.min}
          entryHigh={(data.tradingZones?.entryZone as any)?.max}
          stopLoss={data.tradingZones?.stopLoss} takeProfit1={data.tradingZones?.takeProfit1}
          writeUp={data.writeUp}
        />
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* === STATUS BAR === */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-success">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="font-mono">LIVE</span>
          </div>
          <span className="text-muted-foreground font-mono">{liveTime.toLocaleTimeString()}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Auto-refresh: {refreshRate}</span>
          {dataUpdatedAt > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
            </>
          )}
          <Link to="/predictions" className="ml-auto text-primary hover:underline flex items-center gap-1">
            ← All Predictions
          </Link>
        </div>

        {/* === SEARCH BAR === */}
        <div className="mb-5">
          <GlobalTokenSearch
            onSelect={handleTokenSelect}
            onSearchResults={() => {}}
            placeholder="Switch token — search name, symbol, or contract address..."
          />
        </div>

        {/* === TIMEFRAME TABS === */}
        <div className="flex items-center gap-3 mb-6">
          <Tabs value={validTimeframe} className="w-full">
            <TabsList className="w-full sm:w-auto bg-muted/50">
              {[
                { id: 'daily', label: 'Daily', icon: Clock },
                { id: 'weekly', label: 'Weekly', icon: Activity },
                { id: 'monthly', label: 'Monthly', icon: Globe },
              ].map(tf => (
                <TabsTrigger
                  key={tf.id}
                  value={tf.id}
                  asChild
                >
                  <Link
                    to={`/price-prediction/${crypto.id}/${tf.id}`}
                    className="flex items-center gap-1.5"
                  >
                    <tf.icon className="w-3.5 h-3.5" />
                    {tf.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* === MAIN CONTENT === */}
          <div className="lg:col-span-8 space-y-5">
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-52 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-60 rounded-xl" />
                  <Skeleton className="h-60 rounded-xl" />
                </div>
              </div>
            ) : error ? (
              <div className="border-l-4 border-danger pl-5 py-4">
                <AlertTriangle className="h-8 w-8 text-danger mb-2" />
                <p className="text-danger font-medium">Failed to load prediction</p>
                <p className="text-sm text-muted-foreground mt-1">Please try refreshing or select another token.</p>
              </div>
            ) : data ? (
              <>
                {/* Hero */}
                <PredictionHero coinName={crypto.name} coinId={crypto.id} symbol={crypto.symbol} timeframe={validTimeframe} data={data} />
                
                {/* Action Summary */}
                <InvestorActionSummary
                  coinName={crypto.name} symbol={crypto.symbol} bias={data.bias}
                  confidence={data.confidence} riskLevel={data.riskLevel as any}
                  currentPrice={data.currentPrice} entryZone={data.tradingZones?.entryZone}
                  stopLoss={data.tradingZones?.stopLoss} takeProfit={data.tradingZones?.takeProfit1}
                  timeframe={validTimeframe}
                />

                {/* Persisted, monitored trade setup + trade buttons */}
                <TradeSetupCard
                  coinId={crypto.id} symbol={crypto.symbol} name={crypto.name}
                  timeframe={validTimeframe}
                  contractAddress={contractAddress} chain={chain} image={resolved?.image}
                  fallback={{
                    bias: data.bias,
                    confidence: data.confidence,
                    currentPrice: data.currentPrice,
                    entryLow: (data.tradingZones?.entryZone as any)?.min ?? data.currentPrice * 0.98,
                    entryHigh: (data.tradingZones?.entryZone as any)?.max ?? data.currentPrice,
                    stopLoss: data.tradingZones?.stopLoss ?? data.currentPrice * 0.95,
                    takeProfit1: data.tradingZones?.takeProfit1 ?? data.currentPrice * 1.05,
                    takeProfit2: data.tradingZones?.takeProfit2 ?? data.currentPrice * 1.10,
                    takeProfit3: data.tradingZones?.takeProfit3 ?? data.currentPrice * 1.15,
                  }}
                />

                {/* Signal Chart */}
                <SignalChart
                  symbol={crypto.symbol} name={crypto.name} currentPrice={data.currentPrice}
                  bias={data.bias} confidence={data.confidence}
                  tradingZones={data.tradingZones ? {
                    entryLow: (data.tradingZones.entryZone as any)?.low || (data.tradingZones.entryZone as any)?.min || data.currentPrice * 0.98,
                    entryHigh: (data.tradingZones.entryZone as any)?.high || (data.tradingZones.entryZone as any)?.max || data.currentPrice * 1.01,
                    stopLoss: data.tradingZones.stopLoss || data.currentPrice * 0.95,
                    takeProfit1: data.tradingZones.takeProfit1 || data.currentPrice * 1.05,
                    takeProfit2: data.tradingZones.takeProfit2 || data.currentPrice * 1.10,
                    takeProfit3: data.tradingZones.takeProfit3 || data.currentPrice * 1.15,
                  } : undefined}
                />

                {/* Honest setup track record */}
                <SetupTrackRecord coinId={crypto.id} name={crypto.name} />

                
                {/* Market Data */}
                <MarketDataPanel data={data} coinName={crypto.name} />

                {/* Longform analyst write-up (SEO depth) */}
                <PredictionWriteUp
                  coinName={crypto.name} symbol={crypto.symbol}
                  timeframe={validTimeframe} writeUp={data.writeUp}
                />
                
                {/* Analysis Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <PriceTargetsPanel data={data} timeframe={validTimeframe} />
                  <TechnicalIndicatorsPanel data={data} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <TradingZonesPanel data={data} />
                  <RiskAssessmentPanel data={data} />
                </div>
                
                <ScenariosPanel data={data} />
                
                
                <HighIntentCTA coinName={crypto.name} symbol={crypto.symbol} />
                
                <EnhancedFAQ 
                  coinName={crypto.name} symbol={crypto.symbol} timeframe={validTimeframe}
                  currentPrice={data.currentPrice} bias={data.bias} confidence={data.confidence}
                />
                
                <Methodology coinName={crypto.name} />
                <Disclaimer coinName={crypto.name} />
              </>
            ) : null}
            
            <RelatedPredictions currentCoin={crypto.id} timeframe={validTimeframe} />
          </div>
          
          {/* === SIDEBAR === */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Quick Info */}
            {data && (
              <section className="border-t border-border/30 pt-4">
                <div className="mb-3">
                  <div className="section-label mb-1">Current Price</div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    ${data.currentPrice?.toLocaleString() || '—'}
                  </div>
                </div>
                <div className="flex items-stretch divide-x divide-border/30 border-t border-border/20 pt-3">
                  <div className="flex-1 border-l-2 border-success pl-3">
                    <div className="section-label mb-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-success" /> Bullish
                    </div>
                    <div className="text-lg font-bold text-success">{data.probabilityBullish}%</div>
                  </div>
                  <div className="flex-1 border-l-2 border-danger pl-3 ml-3">
                    <div className="section-label mb-0.5 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-danger" /> Bearish
                    </div>
                    <div className="text-lg font-bold text-danger">{data.probabilityBearish}%</div>
                  </div>
                </div>
              </section>
            )}
            
            <TimeframeSelector coinId={crypto.id} coinName={crypto.name} currentTimeframe={validTimeframe} />
            <TimeframeCrossLinks coinId={crypto.id} coinName={crypto.name} currentTimeframe={validTimeframe} />
            <MarketQuestionsLinks />
            <RelatedToolsLinks />
            <CoinList currentCoin={crypto.id} currentTimeframe={validTimeframe} />
          </aside>
        </div>
      </div>
    </Layout>
  );
}
