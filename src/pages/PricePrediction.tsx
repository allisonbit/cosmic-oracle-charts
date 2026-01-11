import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { usePricePrediction, getCryptoBySlug, TOP_CRYPTOS } from "@/hooks/usePricePrediction";

import { PredictionSEO } from "@/components/prediction/PredictionSEO";
import { PredictionHero } from "@/components/prediction/PredictionHero";
import { TechnicalIndicatorsPanel, PriceTargetsPanel, TradingZonesPanel, ScenariosPanel, RiskAssessmentPanel } from "@/components/prediction/PredictionPanels";
import { CoinList, TimeframeSelector, RelatedPredictions } from "@/components/prediction/PredictionNavigation";
import { Disclaimer, Methodology } from "@/components/prediction/PredictionContent";
import { InvestorActionSummary } from "@/components/prediction/InvestorActionSummary";
import { EnhancedFAQ } from "@/components/prediction/EnhancedFAQ";
import { MarketQuestionsLinks, RelatedToolsLinks, TimeframeCrossLinks, HighIntentCTA } from "@/components/prediction/HighIntentLinks";
import { SignalChart } from "@/components/prediction/SignalChart";
import { GlobalTokenSearch } from "@/components/prediction/GlobalTokenSearch";
import { GlobalToken } from "@/hooks/useGlobalTokenSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { InArticleAd } from "@/components/ads";

interface DynamicToken {
  id: string;
  symbol: string;
  name: string;
}

export default function PricePrediction() {
  const { coinId, timeframe = 'daily' } = useParams<{ coinId: string; timeframe: string }>();
  const navigate = useNavigate();
  
  // First check if token is in our predefined list
  const predefinedCrypto = coinId ? getCryptoBySlug(coinId) : TOP_CRYPTOS[0];
  
  // State for dynamically searched tokens
  const [dynamicToken, setDynamicToken] = useState<DynamicToken | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  
  // Handle token selection from search
  const handleTokenSelect = (token: GlobalToken) => {
    const tokenSlug = token.id.toLowerCase().replace(/\s+/g, '-');
    navigate(`/price-prediction/${tokenSlug}/daily`);
  };
  
  // If token not in predefined list, try to fetch it from API
  useEffect(() => {
    if (!predefinedCrypto && coinId && coinId !== 'bitcoin') {
      setIsLoadingToken(true);
      
      // Try to fetch token info from CoinGecko
      const fetchTokenInfo = async () => {
        try {
          // First try CoinGecko direct lookup
          const cgResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
          if (cgResponse.ok) {
            const data = await cgResponse.json();
            setDynamicToken({
              id: data.id,
              symbol: data.symbol?.toUpperCase() || coinId.toUpperCase(),
              name: data.name || coinId
            });
            setIsLoadingToken(false);
            return;
          }
          
          // Fallback: search by the coinId
          const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(coinId)}`);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.coins && searchData.coins.length > 0) {
              const match = searchData.coins[0];
              setDynamicToken({
                id: match.id,
                symbol: match.symbol?.toUpperCase() || coinId.toUpperCase(),
                name: match.name || coinId
              });
              setIsLoadingToken(false);
              return;
            }
          }
          
          // Last resort: use the coinId as the identifier
          // Format nicely: "pepe-2" -> "Pepe 2"
          const formattedName = coinId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setDynamicToken({
            id: coinId,
            symbol: coinId.toUpperCase().substring(0, 6),
            name: formattedName
          });
        } catch (error) {
          console.error('Error fetching token info:', error);
          // Use coinId as fallback
          const formattedName = coinId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setDynamicToken({
            id: coinId,
            symbol: coinId.toUpperCase().substring(0, 6),
            name: formattedName
          });
        }
        setIsLoadingToken(false);
      };
      
      fetchTokenInfo();
    } else {
      setDynamicToken(null);
    }
  }, [coinId, predefinedCrypto]);
  
  // Use predefined crypto or dynamic token
  const crypto = predefinedCrypto || dynamicToken || { id: coinId || 'bitcoin', symbol: coinId?.toUpperCase() || 'BTC', name: coinId || 'Bitcoin' };
  const validTimeframe = ['daily', 'weekly', 'monthly'].includes(timeframe) ? timeframe as 'daily' | 'weekly' | 'monthly' : 'daily';
  
  // Fetch prediction data for the token
  const { data, isLoading, error } = usePricePrediction(
    crypto?.id || 'bitcoin',
    crypto?.symbol || 'btc',
    validTimeframe,
    !isLoadingToken // Only enable when we have the token info
  );
  
  // Show loading state while fetching token info
  if (isLoadingToken) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Card className="bg-card/50">
            <CardContent className="p-8">
              <Skeleton className="h-48 w-full" />
              <p className="text-center text-muted-foreground mt-4">Loading token information...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <PredictionSEO 
        coinName={crypto.name}
        symbol={crypto.symbol}
        timeframe={validTimeframe}
        currentPrice={data?.currentPrice}
        bias={data?.bias}
        confidence={data?.confidence}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Hidden on mobile to prevent overlap, shown after main content */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 order-2 lg:order-1">
            <TimeframeSelector coinId={crypto.id} coinName={crypto.name} currentTimeframe={validTimeframe} />
            <TimeframeCrossLinks coinId={crypto.id} coinName={crypto.name} currentTimeframe={validTimeframe} />
            <MarketQuestionsLinks />
            <RelatedToolsLinks />
            <CoinList currentCoin={crypto.id} currentTimeframe={validTimeframe} />
          </aside>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
            {/* Token Search Bar */}
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <GlobalTokenSearch
                  onSelect={handleTokenSelect}
                  onSearchResults={() => {}}
                  placeholder="Search any token (name, symbol, or contract address)..."
                />
              </CardContent>
            </Card>
            
            {isLoading ? (
              <Card className="bg-card/50"><CardContent className="p-8"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ) : error ? (
              <Card className="bg-red-500/10 border-red-500/20"><CardContent className="p-6 text-center text-red-400">Failed to load prediction. Please try again.</CardContent></Card>
            ) : data ? (
              <>
                <PredictionHero coinName={crypto.name} symbol={crypto.symbol} timeframe={validTimeframe} data={data} />
                
                {/* Investor Action Summary - High-intent component */}
                <InvestorActionSummary
                  coinName={crypto.name}
                  symbol={crypto.symbol}
                  bias={data.bias}
                  confidence={data.confidence}
                  riskLevel={data.riskLevel as 'low' | 'medium' | 'high' | 'extreme'}
                  currentPrice={data.currentPrice}
                  entryZone={data.tradingZones?.entryZone}
                  stopLoss={data.tradingZones?.stopLoss}
                  takeProfit={data.tradingZones?.takeProfit1}
                  timeframe={validTimeframe}
                />
                
                {/* Live Signal Chart with AI Overlays */}
                <SignalChart
                  symbol={crypto.symbol}
                  name={crypto.name}
                  currentPrice={data.currentPrice}
                  bias={data.bias}
                  confidence={data.confidence}
                  tradingZones={data.tradingZones ? {
                    entryLow: (data.tradingZones.entryZone as any)?.low || (data.tradingZones.entryZone as any)?.min || data.currentPrice * 0.98,
                    entryHigh: (data.tradingZones.entryZone as any)?.high || (data.tradingZones.entryZone as any)?.max || data.currentPrice * 1.01,
                    stopLoss: data.tradingZones.stopLoss || data.currentPrice * 0.95,
                    takeProfit1: data.tradingZones.takeProfit1 || data.currentPrice * 1.05,
                    takeProfit2: data.tradingZones.takeProfit2 || data.currentPrice * 1.10,
                    takeProfit3: data.tradingZones.takeProfit3 || data.currentPrice * 1.15,
                  } : undefined}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PriceTargetsPanel data={data} timeframe={validTimeframe} />
                  <TechnicalIndicatorsPanel data={data} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TradingZonesPanel data={data} />
                  <RiskAssessmentPanel data={data} />
                </div>
                
                <ScenariosPanel data={data} />
                
                {/* Ad placement after scenarios */}
                <InArticleAd />
                
                {/* High-intent CTA */}
                <HighIntentCTA coinName={crypto.name} symbol={crypto.symbol} />
                
                {/* Enhanced money-intent FAQ */}
                <EnhancedFAQ 
                  coinName={crypto.name} 
                  symbol={crypto.symbol} 
                  timeframe={validTimeframe}
                  currentPrice={data.currentPrice}
                  bias={data.bias}
                  confidence={data.confidence}
                />
                
                <Methodology coinName={crypto.name} />
                <Disclaimer coinName={crypto.name} />
              </>
            ) : null}
            
            <RelatedPredictions currentCoin={crypto.id} timeframe={validTimeframe} />
          </div>
          
          {/* Mobile Sidebar - Shown below main content on mobile */}
          <aside className="lg:hidden space-y-6 order-3">
            <TimeframeSelector coinId={crypto.id} coinName={crypto.name} currentTimeframe={validTimeframe} />
            <MarketQuestionsLinks />
            <RelatedToolsLinks />
            <CoinList currentCoin={crypto.id} currentTimeframe={validTimeframe} />
          </aside>
        </div>
      </div>
    </Layout>
  );
}
