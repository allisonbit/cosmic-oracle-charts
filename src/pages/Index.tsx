import { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccessBar } from "@/components/home/QuickAccessBar";
import { Footer } from "@/components/layout/Footer";
import { AdsterraNative } from "@/components/ads/AdsterraNative";
import { AdUnit } from "@/components/ads/AdUnit";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { AdsterraBanner300 } from "@/components/ads/AdsterraBanner300";
import { AdsterraBanner320 } from "@/components/ads/AdsterraBanner320";
import { AdsterraSmartlink } from "@/components/ads/AdsterraSmartlink";

import { AdBreak } from "@/components/ads/AdBreak";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/MainSEO";
import { ViewportSection } from "@/components/system/ViewportSection";
import { TrustStrip, ValueStrip, WhyFreeStrip, CoverageStrip } from "@/components/home/InterstitialStrips";

// Above-the-fold, live-data-first sections (eager-ish, but still split).
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
  const { loading, ready, authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once Privy is ready to avoid flash
    if (ready && authenticated) {
      navigate("/my", { replace: true });
    }
  }, [ready, authenticated, navigate]);

  // Show nothing while Privy is initializing so the login modal
  // doesn't flash over the home page content
  if (!ready || loading) {
    return null;
  }

  // If already logged in, don't render home page (redirect is in flight)
  if (authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
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
            "Real-time whale tracking",
            "Fear & Greed Index",
            "Crypto strength meter",
            "Token explorer",
            "DCA & profit calculators"
          ]
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
        {/* Top ad zone */}
        <AdsterraSmartlink variant="banner" className="my-3 max-w-5xl mx-auto px-4" />
        <div className="hidden md:block"><AdsterraBanner className="my-2" /></div>
        <div className="block md:hidden"><AdsterraBanner320 className="my-2" /></div>
        <AdUnit format="horizontal" className="my-2 max-w-5xl mx-auto px-4" />

        <HeroSection />

        {/* ═══ 1. THE NEWSROOM — latest crypto news leads, first thing seen ═══ */}
        <Suspense fallback={<SectionFallback />}>
          <HomeNews />
        </Suspense>

        {/* Scatter: trust signals as a thin strip right after the lead */}
        <TrustStrip />

        {/* Mid-content ad break */}
        <AdBreak variant="compact" />

        {/* ═══ 2. Prediction markets — what the crowd is betting on ═══ */}
        <Suspense fallback={<SectionFallback />}>
          <HomePolymarket />
        </Suspense>

        {/* ═══ 3. Live AI signals — high-conviction trade setups ═══ */}
        <Suspense fallback={<SectionFallback />}>
          <LiveSignals />
        </Suspense>

        {/* Scatter: value proposition pull-quote (old hero paragraph) */}
        <ValueStrip />

        {/* ═══ 4. Live market data — snapshot of gainers/losers/F&G ═══ */}
        <Suspense fallback={<SectionFallback />}>
          <MarketSnapshot />
        </Suspense>

        {/* ═══ 5. Honest platform stats — single live strip ═══ */}
        <Suspense fallback={<SectionFallback />}>
          <PlatformStats />
        </Suspense>

        {/* Scatter: coverage / real-time claim */}
        <CoverageStrip />

        {/* Mid-content ad break */}
        <AdBreak variant="full" />

        {/* Explore chains — internal linking */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <ChainLinks />
          </Suspense>
        </ViewportSection>

        {/* Market categories hub — internal linking */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <MarketCategoriesHub />
          </Suspense>
        </ViewportSection>

        {/* Scatter: why it's free */}
        <WhyFreeStrip />

        {/* How It Works — 3-step onboarding */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HowItWorks />
          </Suspense>
        </ViewportSection>

        {/* Why traders use us + deeper explainer */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <SEOContentBlock />
          </Suspense>
        </ViewportSection>

        {/* Platform features grid */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <FeaturesSection />
          </Suspense>
        </ViewportSection>

        {/* FAQ */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HomepageFAQ />
          </Suspense>
        </ViewportSection>

        {/* Final conversion CTA */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <NewsletterCTASection />
          </Suspense>
        </ViewportSection>
      </main>

      <AdsterraNative className="my-4 max-w-5xl mx-auto px-4" />
      <AdsterraBanner300 className="my-4" />
      <div className="hidden md:block"><AdsterraBanner className="my-4" /></div>
      <div className="block md:hidden"><AdsterraBanner320 className="my-4" /></div>
      <AdsterraSmartlink variant="button" className="my-4" />
      <AdUnit format="horizontal" className="mt-6 mb-2 max-w-5xl mx-auto px-4" />
      <Footer />
      <MobileBottomNav />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
};

export default Index;
