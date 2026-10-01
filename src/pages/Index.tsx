import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccessBar } from "@/components/home/QuickAccessBar";
import { Footer } from "@/components/layout/Footer";
import { AdUnit } from "@/components/ads/AdUnit";
import { AdBreak } from "@/components/ads/AdBreak";
import { LazyAd } from "@/components/ads/LazyAd";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SkipToContent } from "@/components/system/SkipToContent";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/MainSEO";
import { ViewportSection } from "@/components/system/ViewportSection";
import { WhyFreeStrip } from "@/components/home/WhyFreeStrip";

// Above-the-fold & interactive sections (load eagerly-ish, still split).
const PlayProofBand = lazy(() => import("@/components/home/PlayProofBand").then(m => ({ default: m.PlayProofBand })));
const WatchlistStrip = lazy(() => import("@/components/home/WatchlistStrip").then(m => ({ default: m.WatchlistStrip })));
const CoinOfTheDay = lazy(() => import("@/components/home/CoinOfTheDay").then(m => ({ default: m.CoinOfTheDay })));
const HomeNews = lazy(() => import("@/components/home/HomeNews").then(m => ({ default: m.HomeNews })));
const HomePolymarket = lazy(() => import("@/components/home/HomePolymarket").then(m => ({ default: m.HomePolymarket })));
const MarketSnapshot = lazy(() => import("@/components/home/MarketSnapshot").then(m => ({ default: m.MarketSnapshot })));
const PlatformStats = lazy(() => import("@/components/home/PlatformStats").then(m => ({ default: m.PlatformStats })));
const LiveSignals = lazy(() => import("@/components/home/LiveSignals").then(m => ({ default: m.LiveSignals })));

// Below-the-fold sections.
const HowItWorks = lazy(() => import("@/components/home/HowItWorks").then(m => ({ default: m.HowItWorks })));
const FeaturesSection = lazy(() => import("@/components/home/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const SEOContentBlock = lazy(() => import("@/components/home/SEOContentBlock").then(m => ({ default: m.SEOContentBlock })));
const ChainLinks = lazy(() => import("@/components/home/ChainLinks").then(m => ({ default: m.ChainLinks })));
const MarketCategoriesHub = lazy(() => import("@/components/home/MarketCategoriesHub").then(m => ({ default: m.MarketCategoriesHub })));
const HomepageFAQ = lazy(() => import("@/components/home/HomepageFAQ").then(m => ({ default: m.HomepageFAQ })));
const NewsletterCTASection = lazy(() => import("@/components/home/NewsletterCTASection").then(m => ({ default: m.NewsletterCTASection })));

// Skeleton height tuned to the average rendered section (~500px) so the
// home page doesn't shift when ViewportSection swaps the fallback for the
// real lazy-loaded section. Keeps CLS well under the 0.1 "Good" threshold.
const SectionFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-[480px] w-full rounded-xl" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      <SEO />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Oracle Bull",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web Browser",
          "url": "https://oraclebull.com",
          "description": "Free AI-powered cryptocurrency analytics platform with price predictions, whale tracking, sentiment analysis, and trading tools for 1000+ tokens.",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "provider": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" },
          "featureList": [
            "AI crypto price predictions",
            "Public accuracy track record",
            "Daily BTC prediction game",
            "Fear & Greed Index",
            "Whale & on-chain signals",
            "Token explorer",
            "DCA & profit calculators"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Oracle Bull",
          "alternateName": "OracleBull",
          "url": "https://oraclebull.com",
          "description": "Free AI-powered cryptocurrency price predictions, market analysis, whale tracking, and sentiment analysis for 300+ tokens.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://oraclebull.com/price-prediction/{search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Oracle Bull",
            "url": "https://oraclebull.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://oraclebull.com/oracle-bot-mascot.jpg"
            }
          }
        })}</script>
      </Helmet>

      <header>
        <Navbar />
        <div className="mt-14 md:mt-16" aria-label="Live cryptocurrency prices">
          <QuickAccessBar />
          <CryptoTicker />
        </div>
      </header>

      <main id="main-content">
        {/* 1. HERO — value prop, live market pulse, search, CTAs */}
        <HeroSection />

        {/* 2. YOUR WATCHLIST — personal strip, directly under the hero */}
        <Suspense fallback={null}>
          <WatchlistStrip />
        </Suspense>

        {/* 3. LIVE STATS BAND — real global numbers as immediate proof */}
        <Suspense fallback={null}>
          <PlatformStats />
        </Suspense>

        {/* 4. PLAY & PROVE — the daily game + the engine's public track record */}
        <Suspense fallback={<SectionFallback />}>
          <PlayProofBand />
        </Suspense>

        {/* 5. THE NEWSROOM — latest crypto news leads */}
        <Suspense fallback={<SectionFallback />}>
          <HomeNews />
        </Suspense>

        {/* Mid-content ad break — the page's first ad, after real value */}
        <AdBreak variant="compact" />

        {/* 6. DAILY ROTATION — a fresh deep-dive every day */}
        <CoinOfTheDay />

        {/* 7. LIVE AI SIGNALS — high-conviction trade setups */}
        <Suspense fallback={<SectionFallback />}>
          <LiveSignals />
        </Suspense>

        {/* 8. MARKET SNAPSHOT — gainers/losers/trending + sentiment */}
        <Suspense fallback={<SectionFallback />}>
          <MarketSnapshot />
        </Suspense>

        {/* 9. PREDICTION MARKETS — what the crowd is betting on */}
        <Suspense fallback={<SectionFallback />}>
          <HomePolymarket />
        </Suspense>

        {/* 10. HOW IT WORKS — 3-step onboarding */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HowItWorks />
          </Suspense>
        </ViewportSection>

        {/* 11. FEATURES GRID */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <FeaturesSection />
          </Suspense>
        </ViewportSection>

        {/* 12. EXPLORE — chains + categories (internal linking) */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <ChainLinks />
          </Suspense>
        </ViewportSection>
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <MarketCategoriesHub />
          </Suspense>
        </ViewportSection>

        {/* 13. WHY IT'S FREE — the honest one-liner */}
        <WhyFreeStrip />

        {/* 14. DEEP EXPLAINER — SEO content block */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <SEOContentBlock />
          </Suspense>
        </ViewportSection>

        {/* 15. FAQ */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HomepageFAQ />
          </Suspense>
        </ViewportSection>

        {/* 16. FINAL CONVERSION CTA */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <NewsletterCTASection />
          </Suspense>
        </ViewportSection>
      </main>

      <LazyAd className="space-y-1">
        <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
      </LazyAd>
      <Footer />
      <MobileBottomNav />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
};

export default Index;
