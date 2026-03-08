import { useParams, useNavigate, Link } from "react-router-dom";
import { memo, useMemo, useCallback, lazy, Suspense, useState, useEffect } from "react";
import { getChainById, CHAINS } from "@/lib/chainConfig";
import { useChainData } from "@/hooks/useChainData";
import { useChainForecast } from "@/hooks/useChainForecast";
import { useAdvancedChainData } from "@/hooks/useAdvancedChainData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { ChainSidebar } from "@/components/chain/ChainSidebar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { Footer } from "@/components/layout/Footer";
import { ChainExternalLinks } from "@/components/chain/ChainExternalLinks";
import { ChainSpecificMetrics } from "@/components/chain/ChainSpecificMetrics";
import { LiveTokenSearchPanel } from "@/components/chain/LiveTokenSearchPanel";
import { ChainFAQSchema, ChainFAQDisplay } from "@/components/chain/ChainFAQSchema";
import { ChainSEOContent } from "@/components/seo";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LazySection } from "@/components/ui/LazySection";
import { 
  ArrowLeft, Loader2, ExternalLink, RefreshCw, TrendingUp, TrendingDown, 
  Activity, Zap, Users, DollarSign, BarChart3, Clock, Globe, ChevronLeft, ChevronRight,
  Flame, Shield, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Lazy load heavy components
const EnhancedPriceAnalysis = lazy(() => import("@/components/chain/EnhancedPriceAnalysis").then(m => ({ default: m.EnhancedPriceAnalysis })));
const EnhancedPredictionDeepDive = lazy(() => import("@/components/chain/EnhancedPredictionDeepDive").then(m => ({ default: m.EnhancedPredictionDeepDive })));
const EnhancedWhaleActivityRadar = lazy(() => import("@/components/chain/EnhancedWhaleActivityRadar").then(m => ({ default: m.EnhancedWhaleActivityRadar })));
const EnhancedTokenHeatScanner = lazy(() => import("@/components/chain/EnhancedTokenHeatScanner").then(m => ({ default: m.EnhancedTokenHeatScanner })));
const EnhancedSmartMoneyFlow = lazy(() => import("@/components/chain/EnhancedSmartMoneyFlow").then(m => ({ default: m.EnhancedSmartMoneyFlow })));
const EnhancedRiskAnalyzer = lazy(() => import("@/components/chain/EnhancedRiskAnalyzer").then(m => ({ default: m.EnhancedRiskAnalyzer })));
const EnhancedSocialSentimentGalaxy = lazy(() => import("@/components/chain/EnhancedSocialSentimentGalaxy").then(m => ({ default: m.EnhancedSocialSentimentGalaxy })));
const EnhancedTokenDiscoveryEngine = lazy(() => import("@/components/chain/EnhancedTokenDiscoveryEngine").then(m => ({ default: m.EnhancedTokenDiscoveryEngine })));
const EnhancedDailySummary = lazy(() => import("@/components/chain/EnhancedDailySummary").then(m => ({ default: m.EnhancedDailySummary })));
const EnhancedChainHealthMonitor = lazy(() => import("@/components/chain/EnhancedChainHealthMonitor").then(m => ({ default: m.EnhancedChainHealthMonitor })));
const EnhancedDeepFinancialMetrics = lazy(() => import("@/components/chain/EnhancedDeepFinancialMetrics").then(m => ({ default: m.EnhancedDeepFinancialMetrics })));
const EnhancedAdvancedPredictionModels = lazy(() => import("@/components/chain/EnhancedAdvancedPredictionModels").then(m => ({ default: m.EnhancedAdvancedPredictionModels })));
const EnhancedAnomalyDetection = lazy(() => import("@/components/chain/EnhancedAnomalyDetection").then(m => ({ default: m.EnhancedAnomalyDetection })));
const EnhancedMultiChainComparison = lazy(() => import("@/components/chain/EnhancedMultiChainComparison").then(m => ({ default: m.EnhancedMultiChainComparison })));
const EnhancedInstitutionalView = lazy(() => import("@/components/chain/EnhancedInstitutionalView").then(m => ({ default: m.EnhancedInstitutionalView })));
const NetworkInfoPanel = lazy(() => import("@/components/chain/NetworkInfoPanel").then(m => ({ default: m.NetworkInfoPanel })));

const ComponentLoader = memo(function ComponentLoader() {
  return (
    <div className="holo-card p-4 sm:p-6 animate-pulse">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-32" />
    </div>
  );
});

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function formatCompact(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function formatNum(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toFixed(0);
}

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const chain = chainId ? getChainById(chainId) : undefined;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: chainData, isLoading: chainLoading, isFetching: chainFetching, refetch: refetchChainData } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: advancedData, isLoading: advancedLoading, refetch: refetchAdvanced } = useAdvancedChainData(chainId || "", !!chain);
  const { data: pricesData } = useCryptoPrices();
  const realtimePrices = useRealtimePrices(chain ? [chain.symbol] : []);

  // Chain navigation
  const currentIndex = CHAINS.findIndex(c => c.id === chainId);
  const prevChain = currentIndex > 0 ? CHAINS[currentIndex - 1] : null;
  const nextChain = currentIndex < CHAINS.length - 1 ? CHAINS[currentIndex + 1] : null;

  if (!chain) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <div className="holo-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-display text-foreground mb-4">Chain Not Found</h2>
          <p className="text-muted-foreground mb-6">The blockchain you're looking for doesn't exist in our system.</p>
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const chainPrice = useMemo(() => 
    pricesData?.prices?.find(p => p.symbol === chain.symbol),
    [pricesData?.prices, chain.symbol]
  );

  // Get real-time price
  const livePrice = realtimeData?.prices?.[chain.symbol.toLowerCase()] || realtimeData?.prices?.[chain.id];
  const currentPrice = livePrice?.price || chainPrice?.price || chainData?.overview?.nativePrice || 0;
  const priceChange = livePrice?.change24h || chainPrice?.change24h || chainData?.overview?.priceChange24h || 0;
  const isPositive = priceChange >= 0;

  const handleRefreshAll = useCallback(() => {
    refetchChainData();
    refetchForecast();
    refetchAdvanced();
  }, [refetchChainData, refetchForecast, refetchAdvanced]);

  const overview = chainData?.overview;
  const categoryLabel = chain.category === "layer1" ? "Layer 1" : chain.category === "layer2" ? "Layer 2" : "Sidechain";
  const categoryColor = chain.category === "layer1" ? "text-chart-1" : chain.category === "layer2" ? "text-chart-2" : "text-chart-3";

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen cosmic-bg flex w-full">
        <ChainSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CryptoTicker />
          
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
              
              {/* Breadcrumb + Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />Dashboard
                  </button>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground font-medium">{chain.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    chainFetching ? "bg-warning/20 text-warning" : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", chainFetching ? "bg-warning" : "bg-emerald-400")} />
                    {chainFetching ? "Updating..." : "LIVE"}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRefreshAll} className="h-7 px-2">
                    <RefreshCw className={cn("h-3.5 w-3.5", chainFetching && "animate-spin")} />
                  </Button>
                </div>
              </div>

              {/* ═══════════ HERO SECTION ═══════════ */}
              <div className="holo-card p-4 sm:p-6 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ background: `radial-gradient(ellipse at 20% 50%, hsl(${chain.color}) 0%, transparent 70%)` }} />
                
                <div className="relative flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                  {/* Chain Identity */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl" 
                         style={{ background: `hsl(${chain.color} / 0.15)`, border: `1px solid hsl(${chain.color} / 0.25)` }}>
                      {chain.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">{chain.name}</h1>
                        <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border", categoryColor,
                          chain.category === "layer1" ? "bg-chart-1/10 border-chart-1/20" :
                          chain.category === "layer2" ? "bg-chart-2/10 border-chart-2/20" : "bg-chart-3/10 border-chart-3/20"
                        )}>
                          {categoryLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-muted-foreground text-sm font-mono">{chain.symbol}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground text-xs">{chain.consensus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-baseline gap-3 lg:ml-auto">
                    <div>
                      <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                        {currentPrice > 0 ? formatPrice(currentPrice) : <Skeleton className="h-8 w-32 inline-block" />}
                      </div>
                      {currentPrice > 0 && (
                        <div className={cn("flex items-center gap-1 text-sm font-medium mt-0.5", isPositive ? "text-emerald-400" : "text-red-400")}>
                          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          <span>{isPositive ? "+" : ""}{priceChange.toFixed(2)}%</span>
                          <span className="text-muted-foreground text-xs ml-1">24h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="relative grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-border/30">
                  {[
                    { label: "Market Cap", value: overview ? formatCompact(overview.marketCap) : "—", icon: DollarSign },
                    { label: "24h Volume", value: overview ? formatCompact(overview.volume24h) : "—", icon: BarChart3 },
                    { label: "TPS", value: overview ? `${formatNum(overview.tps)}` : "—", icon: Zap },
                    { label: "Active Wallets", value: overview ? formatNum(overview.activeWallets) : "—", icon: Users },
                    { label: "DeFi TVL", value: overview ? formatCompact(overview.defiTvl) : "—", icon: Layers },
                    { label: "Gas", value: overview ? `$${overview.gasFees < 0.01 ? overview.gasFees.toFixed(4) : overview.gasFees.toFixed(2)}` : "—", icon: Flame },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <stat.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                        <div className="text-sm font-semibold text-foreground">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain Selector Pills */}
              <div className="flex items-center gap-2">
                {prevChain && (
                  <Link to={`/chain/${prevChain.id}`} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all text-xs flex-shrink-0">
                    <ChevronLeft className="h-3 w-3" /><span className="hidden sm:inline">{prevChain.name}</span>
                  </Link>
                )}
                <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {CHAINS.map((c) => (
                    <Link key={c.id} to={`/chain/${c.id}`}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                        c.id === chainId
                          ? "text-foreground border" 
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      style={c.id === chainId ? { 
                        background: `hsl(${c.color} / 0.15)`, 
                        borderColor: `hsl(${c.color} / 0.3)`,
                        color: `hsl(${c.color})`
                      } : undefined}
                    >
                      <span className="text-sm">{c.icon}</span>
                      <span className="hidden sm:inline">{c.name}</span>
                      <span className="sm:hidden">{c.symbol}</span>
                    </Link>
                  ))}
                </div>
                {nextChain && (
                  <Link to={`/chain/${nextChain.id}`} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all text-xs flex-shrink-0">
                    <span className="hidden sm:inline">{nextChain.name}</span><ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {/* External Links */}
              <ChainExternalLinks chain={chain} />

              {/* Schema */}
              <ChainFAQSchema chain={chain} priceData={chainPrice} />

              {/* ═══════════ TABBED CONTENT ═══════════ */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/20 border border-border/30 h-auto flex-wrap">
                  {[
                    { value: "overview", label: "Overview", icon: Activity },
                    { value: "tokens", label: "Tokens", icon: Flame },
                    { value: "analytics", label: "Analytics", icon: BarChart3 },
                    { value: "health", label: "Health", icon: Shield },
                    { value: "whales", label: "Whales", icon: TrendingUp },
                    { value: "predictions", label: "AI Predictions", icon: Zap },
                  ].map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
                  <ChainSpecificMetrics chain={chain} chainSpecificData={chainData?.chainSpecificData} />
                  
                  <Suspense fallback={<ComponentLoader />}>
                    <NetworkInfoPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />
                  </Suspense>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedPriceAnalysis chain={chain} priceData={chainPrice} />
                    </Suspense>
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedDailySummary chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                    </Suspense>
                  </div>

                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedMultiChainComparison chain={chain} comparisonData={advancedData?.comparisonData} isLoading={advancedLoading} />
                  </Suspense>
                </TabsContent>

                {/* TOKENS TAB */}
                <TabsContent value="tokens" className="space-y-4 sm:space-y-6 mt-4">
                  <LiveTokenSearchPanel chain={chain} />
                  
                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedTokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />
                    </Suspense>
                  </LazySection>

                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedTokenDiscoveryEngine chain={chain} />
                    </Suspense>
                  </LazySection>
                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4">
                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedDeepFinancialMetrics chain={chain} financialData={advancedData?.financialData} isLoading={advancedLoading} />
                    </Suspense>
                  </LazySection>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <LazySection fallbackHeight="h-64">
                      <Suspense fallback={<ComponentLoader />}>
                        <EnhancedSmartMoneyFlow chain={chain} smartMoneyFlow={chainData?.smartMoneyFlow} isLoading={chainLoading} />
                      </Suspense>
                    </LazySection>
                    <LazySection fallbackHeight="h-64">
                      <Suspense fallback={<ComponentLoader />}>
                        <EnhancedRiskAnalyzer chain={chain} />
                      </Suspense>
                    </LazySection>
                  </div>

                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedInstitutionalView chain={chain} institutionalData={advancedData?.institutionalData} isLoading={advancedLoading} />
                    </Suspense>
                  </LazySection>
                </TabsContent>

                {/* HEALTH TAB */}
                <TabsContent value="health" className="space-y-4 sm:space-y-6 mt-4">
                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedChainHealthMonitor chain={chain} healthData={advancedData?.healthData} isLoading={advancedLoading} onRefresh={refetchAdvanced} />
                    </Suspense>
                  </LazySection>

                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedAnomalyDetection chain={chain} anomalyData={advancedData?.anomalyData} isLoading={advancedLoading} />
                    </Suspense>
                  </LazySection>
                </TabsContent>

                {/* WHALES TAB */}
                <TabsContent value="whales" className="space-y-4 sm:space-y-6 mt-4">
                  <LazySection fallbackHeight="h-80">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedWhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} />
                    </Suspense>
                  </LazySection>

                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedSocialSentimentGalaxy chain={chain} socialSentiment={forecastData?.socialSentiment} isLoading={forecastLoading} />
                    </Suspense>
                  </LazySection>
                </TabsContent>

                {/* PREDICTIONS TAB */}
                <TabsContent value="predictions" className="space-y-4 sm:space-y-6 mt-4">
                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedPredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                    </Suspense>
                  </LazySection>

                  <LazySection fallbackHeight="h-64">
                    <Suspense fallback={<ComponentLoader />}>
                      <EnhancedAdvancedPredictionModels chain={chain} predictionData={advancedData?.predictionData} isLoading={advancedLoading} />
                    </Suspense>
                  </LazySection>
                </TabsContent>
              </Tabs>

              {/* FAQ + SEO — always visible */}
              <LazySection fallbackHeight="h-48">
                <ChainFAQDisplay chain={chain} priceData={chainPrice} />
              </LazySection>
              
              <LazySection fallbackHeight="h-48">
                <ChainSEOContent chainName={chain.name} chainSymbol={chain.symbol} chainId={chain.id} />
              </LazySection>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
