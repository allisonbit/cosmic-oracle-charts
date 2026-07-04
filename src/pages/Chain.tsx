import { useParams, useNavigate, Link } from "react-router-dom";
import { memo, useMemo, useCallback, lazy, Suspense, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getChainById, getChainSEO, CHAINS } from "@/lib/chainConfig";
import { SITE_URL } from "@/lib/siteConfig";
import { useChainData } from "@/hooks/useChainData";
import { useChainForecast } from "@/hooks/useChainForecast";
import { useAdvancedChainData } from "@/hooks/useAdvancedChainData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { Layout } from "@/components/layout/Layout";
import { ChainExternalLinks } from "@/components/chain/ChainExternalLinks";
import { ChainSpecificMetrics } from "@/components/chain/ChainSpecificMetrics";
import { LiveTokenSearchPanel } from "@/components/chain/LiveTokenSearchPanel";
import { ChainFAQSchema, ChainFAQDisplay } from "@/components/chain/ChainFAQSchema";
import { ChainSEOContent } from "@/components/seo/index";
import { LazySection } from "@/components/ui/LazySection";
import {
  ArrowLeft, ExternalLink, RefreshCw, TrendingUp, TrendingDown,
  Activity, Zap, Users, DollarSign, BarChart3, Globe, ChevronLeft, ChevronRight,
  Flame, Shield, Layers, Sparkles, Target, ArrowRight, Check, Coins, BookOpen,
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
  if (price >= 1000) return `$${(price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${(price ?? 0).toFixed(2)}`;
  if (price >= 0.01) return `$${(price ?? 0).toFixed(4)}`;
  return `$${(price ?? 0).toFixed(6)}`;
}
function formatCompact(num: number): string {
  if (!num) return "—";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${(num ?? 0).toFixed(0)}`;
}
function formatNum(num: number): string {
  if (!num) return "—";
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return (num ?? 0).toFixed(0);
}

const MONTH_YEAR = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const chain = chainId ? getChainById(chainId) : undefined;
  const seo = chainId ? getChainSEO(chainId) : undefined;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: chainData, isLoading: chainLoading, isFetching: chainFetching, refetch: refetchChainData } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: advancedData, isLoading: advancedLoading, refetch: refetchAdvanced } = useAdvancedChainData(chainId || "", !!chain);
  const { data: pricesData } = useCryptoPrices();
  const realtimePrices = useRealtimePrices(chain ? [chain.symbol] : []);

  const currentIndex = CHAINS.findIndex(c => c.id === chainId);
  const prevChain = currentIndex > 0 ? CHAINS[currentIndex - 1] : null;
  const nextChain = currentIndex < CHAINS.length - 1 ? CHAINS[currentIndex + 1] : null;

  const chainPrice = useMemo(() => pricesData?.prices?.find(p => p.symbol === chain?.symbol), [pricesData?.prices, chain?.symbol]);

  const handleRefreshAll = useCallback(() => {
    refetchChainData(); refetchForecast(); refetchAdvanced();
  }, [refetchChainData, refetchForecast, refetchAdvanced]);

  if (!chain) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="holo-card p-8 text-center max-w-md">
            <Globe className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">Chain Not Found</h1>
            <p className="text-muted-foreground mb-6">That blockchain isn't in our system yet. Explore the chains we cover below.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {CHAINS.slice(0, 6).map(c => (
                <Link key={c.id} to={`/chain/${c.id}`} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">{c.icon} {c.name}</Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const livePrice = realtimePrices.prices?.[chain.symbol.toLowerCase()] || realtimePrices.prices?.[chain.id];
  const currentPrice = livePrice?.price || chainPrice?.price || (chainData?.overview as any)?.nativePrice || 0;
  const priceChange = livePrice?.change24h || chainPrice?.change24h || chainData?.overview?.priceChange24h || 0;
  const isPositive = priceChange >= 0;

  const overview = chainData?.overview;
  const categoryLabel = chain.category === "layer1" ? "Layer 1" : chain.category === "layer2" ? "Layer 2" : "Sidechain";
  const accent = `hsl(${chain.color})`;
  const accentSoft = `hsl(${chain.color} / 0.12)`;

  // SEO
  const title = `${chain.name} (${chain.symbol}) Analytics — Live Price, TVL & AI Predictions (${MONTH_YEAR})`;
  const metaDescription = seo
    ? `${chain.name} (${chain.symbol}) live analytics: ${formatPrice(currentPrice || chainPrice?.price || 0)} price, market cap, DeFi TVL, on-chain activity, whale tracking and AI predictions. ${seo.tagline}. Updated ${MONTH_YEAR}.`.slice(0, 300)
    : `${chain.name} (${chain.symbol}) live analytics, on-chain metrics, whale activity and AI price predictions.`;
  const canonical = `${SITE_URL}/chain/${chain.id}`;
  const predictionHref = `/price-prediction/${chain.coingeckoId}`;

  const heroStats = [
    { label: "Market Cap", value: overview ? formatCompact(overview.marketCap) : "—", icon: DollarSign },
    { label: "24h Volume", value: overview ? formatCompact(overview.volume24h) : "—", icon: BarChart3 },
    { label: "DeFi TVL", value: overview ? formatCompact(overview.defiTvl) : "—", icon: Layers },
    { label: "TPS", value: overview?.tps ? formatNum(overview.tps) : (chain.tps ? formatNum(chain.tps) : "—"), icon: Zap },
    { label: "Active Wallets", value: overview ? formatNum(overview.activeWallets) : "—", icon: Users },
    { label: "Gas", value: overview ? `$${overview.gasFees < 0.01 ? (overview.gasFees ?? 0).toFixed(4) : (overview.gasFees ?? 0).toFixed(2)}` : "—", icon: Flame },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${chain.name} analytics, ${chain.symbol} price, ${chain.name} tvl, ${chain.name} whale activity, ${chain.symbol} prediction, ${chain.name} ecosystem, ${chain.name} on-chain data`} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "WebPage", name: title, description: metaDescription, url: canonical,
          isPartOf: { "@type": "WebSite", name: "Oracle Bull", url: SITE_URL },
          about: { "@type": "Thing", name: `${chain.name} (${chain.symbol})` }, inLanguage: "en-US",
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Chains", item: `${SITE_URL}/dashboard` },
            { "@type": "ListItem", position: 3, name: chain.name, item: canonical },
          ],
        })}</script>
      </Helmet>
      <ChainFAQSchema chain={chain} priceData={chainPrice} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 max-w-7xl">

        {/* Status bar */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> All Chains
          </button>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", chainFetching ? "bg-warning/20 text-warning" : "bg-emerald-500/20 text-emerald-400")}>
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", chainFetching ? "bg-warning" : "bg-emerald-400")} />
              {chainFetching ? "Updating" : "LIVE"}
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefreshAll} className="h-7 px-2"><RefreshCw className={cn("h-3.5 w-3.5", chainFetching && "animate-spin")} /></Button>
          </div>
        </div>

        {/* ═══════════ HERO ═══════════ */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 p-5 sm:p-8" style={{ background: `linear-gradient(135deg, ${accentSoft} 0%, transparent 60%)` }}>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: accent }} />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              {/* Identity */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-lg" style={{ background: accentSoft, border: `1px solid hsl(${chain.color} / 0.3)`, color: accent }}>
                  {chain.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground">{chain.name}</h1>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border" style={{ color: accent, borderColor: `hsl(${chain.color} / 0.3)`, background: accentSoft }}>{categoryLabel}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    <span className="font-mono font-semibold text-foreground">{chain.symbol}</span>
                    <span className="mx-1.5 text-muted-foreground/40">•</span>{chain.consensus}
                    {seo && <><span className="mx-1.5 text-muted-foreground/40">•</span>{seo.tagline}</>}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="md:ml-auto md:text-right">
                <div className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                  {currentPrice > 0 ? formatPrice(currentPrice) : <Skeleton className="h-9 w-32 inline-block" />}
                </div>
                {currentPrice > 0 && (
                  <div className={cn("flex items-center md:justify-end gap-1 text-sm font-semibold mt-1", isPositive ? "text-emerald-400" : "text-red-400")}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {isPositive ? "+" : ""}{(priceChange ?? 0).toFixed(2)}% <span className="text-muted-foreground text-xs font-normal ml-1">24h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {heroStats.map((s) => (
                <div key={s.label} className="rounded-xl bg-background/50 backdrop-blur-sm border border-border/40 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><s.icon className="h-3.5 w-3.5" /><span className="text-[10px] uppercase tracking-wider truncate">{s.label}</span></div>
                  <div className="text-base sm:text-lg font-bold font-mono text-foreground">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-1.5" style={{ background: accent, color: "hsl(var(--background))" }}>
                <Link to={predictionHref}><Target className="h-4 w-4" /> AI Price Prediction</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-1.5"><Link to="/scanner"><Activity className="h-4 w-4" /> Token Scanner</Link></Button>
              <Button asChild size="sm" variant="outline" className="gap-1.5"><a href={chain.explorerUrl} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /> Explorer <ExternalLink className="h-3 w-3" /></a></Button>
              {chain.website && <Button asChild size="sm" variant="ghost" className="gap-1.5"><a href={chain.website} target="_blank" rel="noopener noreferrer">Website <ExternalLink className="h-3 w-3" /></a></Button>}
            </div>
          </div>
        </div>

        {/* ═══════════ CHAIN SWITCHER ═══════════ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Explore Chains</span>
            <div className="flex items-center gap-1">
              {prevChain && <Link to={`/chain/${prevChain.id}`} aria-label={`Previous: ${prevChain.name}`} className="p-1.5 rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><ChevronLeft className="h-4 w-4" /></Link>}
              {nextChain && <Link to={`/chain/${nextChain.id}`} aria-label={`Next: ${nextChain.name}`} className="p-1.5 rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><ChevronRight className="h-4 w-4" /></Link>}
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {CHAINS.map((c) => {
              const active = c.id === chainId;
              return (
                <Link key={c.id} to={`/chain/${c.id}`}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 border", active ? "border-transparent" : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50")}
                  style={active ? { background: `hsl(${c.color} / 0.15)`, borderColor: `hsl(${c.color} / 0.4)`, color: `hsl(${c.color})` } : undefined}>
                  <span className="text-lg" style={{ color: active ? `hsl(${c.color})` : undefined }}>{c.icon}</span>
                  <span>{c.name}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* External links */}
        <ChainExternalLinks chain={chain} />

        {/* ═══════════ TABS ═══════════ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
            <TabsList className="inline-flex w-auto justify-start bg-muted/30 border border-border/40 p-1 h-auto rounded-xl">
              {[
                { value: "overview", label: "Overview", icon: Activity },
                { value: "tokens", label: "Tokens", icon: Flame },
                { value: "analytics", label: "Analytics", icon: BarChart3 },
                { value: "health", label: "Health", icon: Shield },
                { value: "whales", label: "Whales", icon: TrendingUp },
                { value: "predictions", label: "AI Predictions", icon: Zap },
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
                  <tab.icon className="h-3.5 w-3.5" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
            <ChainSpecificMetrics chain={chain} chainSpecificData={chainData?.chainSpecificData} />
            <Suspense fallback={<ComponentLoader />}><NetworkInfoPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} /></Suspense>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <Suspense fallback={<ComponentLoader />}><EnhancedPriceAnalysis chain={chain} priceData={chainPrice} /></Suspense>
              <Suspense fallback={<ComponentLoader />}><EnhancedDailySummary chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} /></Suspense>
            </div>
            <Suspense fallback={<ComponentLoader />}><EnhancedMultiChainComparison chain={chain} comparisonData={advancedData?.comparisonData} isLoading={advancedLoading} /></Suspense>
          </TabsContent>

          {/* TOKENS */}
          <TabsContent value="tokens" className="space-y-4 sm:space-y-6 mt-4">
            <LiveTokenSearchPanel chain={chain} />
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedTokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} /></Suspense></LazySection>
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedTokenDiscoveryEngine chain={chain} /></Suspense></LazySection>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4">
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedDeepFinancialMetrics chain={chain} financialData={advancedData?.financialData} isLoading={advancedLoading} /></Suspense></LazySection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedSmartMoneyFlow chain={chain} smartMoneyFlow={chainData?.smartMoneyFlow} isLoading={chainLoading} /></Suspense></LazySection>
              <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedRiskAnalyzer chain={chain} /></Suspense></LazySection>
            </div>
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedInstitutionalView chain={chain} institutionalData={advancedData?.institutionalData} isLoading={advancedLoading} /></Suspense></LazySection>
          </TabsContent>

          {/* HEALTH */}
          <TabsContent value="health" className="space-y-4 sm:space-y-6 mt-4">
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedChainHealthMonitor chain={chain} healthData={advancedData?.healthData} isLoading={advancedLoading} onRefresh={refetchAdvanced} /></Suspense></LazySection>
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedAnomalyDetection chain={chain} anomalyData={advancedData?.anomalyData} isLoading={advancedLoading} /></Suspense></LazySection>
          </TabsContent>

          {/* WHALES */}
          <TabsContent value="whales" className="space-y-4 sm:space-y-6 mt-4">
            <LazySection fallbackHeight="h-80"><Suspense fallback={<ComponentLoader />}><EnhancedWhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} /></Suspense></LazySection>
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedSocialSentimentGalaxy chain={chain} socialSentiment={forecastData?.socialSentiment} isLoading={forecastLoading} /></Suspense></LazySection>
          </TabsContent>

          {/* PREDICTIONS */}
          <TabsContent value="predictions" className="space-y-4 sm:space-y-6 mt-4">
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedPredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} /></Suspense></LazySection>
            <LazySection fallbackHeight="h-64"><Suspense fallback={<ComponentLoader />}><EnhancedAdvancedPredictionModels chain={chain} predictionData={advancedData?.predictionData} isLoading={advancedLoading} /></Suspense></LazySection>
          </TabsContent>
        </Tabs>


        {/* ═══════════ ABOUT / SEO CONTENT ═══════════ */}
        {seo && (
          <section className="rounded-3xl border border-border/40 p-5 sm:p-8 space-y-8" style={{ background: `linear-gradient(135deg, ${accentSoft} 0%, transparent 70%)` }}>
            <div>
              <h2 className="text-2xl font-display font-bold mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5" style={{ color: accent }} /> About {chain.name}</h2>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{seo.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
              {/* Key facts */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Key Facts</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    ["Type", categoryLabel],
                    ["Native Token", chain.symbol],
                    ["Consensus", chain.consensus || "—"],
                    ["Throughput", chain.tps ? `~${chain.tps.toLocaleString()} TPS` : "—"],
                    ["Launched", String(seo.launchYear)],
                    ["Token Decimals", String(chain.nativeDecimals ?? "—")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col border-b border-border/30 pb-2">
                      <dt className="text-[11px] text-muted-foreground uppercase tracking-wider">{k}</dt>
                      <dd className="font-semibold text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs text-muted-foreground mt-3">{seo.ecosystem}</p>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5"><Zap className="h-4 w-4" /> Highlights</h3>
                <ul className="space-y-2.5">
                  {seo.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-foreground"><Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: accent }} /><span>{h}</span></li>
                  ))}
                </ul>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-3 flex items-center gap-1.5"><Target className="h-4 w-4" /> Common Use Cases</h3>
                <div className="flex flex-wrap gap-2">
                  {seo.useCases.map((u) => <span key={u} className="text-xs font-medium px-2.5 py-1 rounded-full bg-background/60 border border-border/40 text-muted-foreground">{u}</span>)}
                </div>
              </div>
            </div>

            {/* Top tokens */}
            {chain.tokens?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5"><Coins className="h-4 w-4" /> Popular Tokens on {chain.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {chain.tokens.map((t) => (
                    <Link key={t} to={`/scanner`} className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-background/60 border border-border/40 hover:border-primary/40 hover:text-primary transition-colors">${t}</Link>
                  ))}
                </div>
              </div>
            )}

            {/* Internal links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/30">
              {[
                { to: predictionHref, label: `${chain.symbol} Prediction`, icon: Target },
                { to: "/sentiment", label: "Market Sentiment", icon: Activity },
                { to: "/scanner", label: "Token Scanner", icon: Flame },
                { to: "/strength-meter", label: "Strength Meter", icon: Zap },
              ].map(l => (
                <Link key={l.label} to={l.to} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-background/60 border border-border/40 hover:border-primary/40 hover:text-primary transition-colors group">
                  <l.icon className="h-4 w-4 shrink-0" /><span className="truncate">{l.label}</span><ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ + extra SEO */}
        <LazySection fallbackHeight="h-48"><ChainFAQDisplay chain={chain} priceData={chainPrice} /></LazySection>
        <LazySection fallbackHeight="h-48"><ChainSEOContent chainName={chain.name} chainSymbol={chain.symbol} chainId={chain.id} /></LazySection>
      </div>
    </Layout>
  );
}
