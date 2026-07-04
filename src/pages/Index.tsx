import { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccessBar } from "@/components/home/QuickAccessBar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/MainSEO";
import { ViewportSection } from "@/components/system/ViewportSection";

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

      <header>
        <Navbar />
        <div className="mt-14 md:mt-16" aria-label="Live cryptocurrency prices">
          <QuickAccessBar />
          <CryptoTicker />
        </div>
      </header>

      <main id="main-content">
        {/* 1. Hero — H1, prominent search, live price chips */}
        <HeroSection />

        {/* 2. Latest crypto news — attractive, dynamic lead */}
        <Suspense fallback={<SectionFallback />}>
          <HomeNews />
        </Suspense>

        {/* 3. Prediction markets — what the crowd is betting on (hook) */}
        <Suspense fallback={<SectionFallback />}>
          <HomePolymarket />
        </Suspense>

        {/* 4. Live AI Signals — high-conviction trade setups */}
        <Suspense fallback={<SectionFallback />}>
          <LiveSignals />
        </Suspense>

        {/* 5. Crypto market at a glance — live snapshot */}
        <Suspense fallback={<SectionFallback />}>
          <MarketSnapshot />
        </Suspense>

        {/* 6. Honest platform stats — single live strip */}
        <Suspense fallback={<SectionFallback />}>
          <PlatformStats />
        </Suspense>

        {/* 5. How It Works — 3-step onboarding */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HowItWorks />
          </Suspense>
        </ViewportSection>

        {/* 6a. Platform features grid */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <FeaturesSection />
          </Suspense>
        </ViewportSection>

        {/* 6b. Why traders use us + why-free explainer */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <SEOContentBlock />
          </Suspense>
        </ViewportSection>

        {/* 7. Explore chains — internal linking */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <ChainLinks />
          </Suspense>
        </ViewportSection>

        {/* 8. Market categories hub — internal linking */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <MarketCategoriesHub />
          </Suspense>
        </ViewportSection>

        {/* 9. FAQ — SEO rich snippets (aligned with prerender) */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HomepageFAQ />
          </Suspense>
        </ViewportSection>

        {/* 10. Final conversion CTA */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <NewsletterCTASection />
          </Suspense>
        </ViewportSection>
      </main>

      <Footer />
      <MobileBottomNav />
      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
};

export default Index;
