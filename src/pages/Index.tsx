import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccessBar } from "@/components/home/QuickAccessBar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { BannerAd, InArticleAd, NativeBannerAd, MediumRectangleAd } from "@/components/ads";
import { SEO } from "@/components/MainSEO";

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

const SectionFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

// Detect if visitor is likely a bot/crawler — render everything immediately for SEO
const isBot = typeof navigator !== "undefined" &&
  /Googlebot|bingbot|Baiduspider|yandex|DuckDuckBot|Slurp|ia_archiver|AhrefsBot|facebookexternalhit|Twitterbot|LinkedInBot|GPTBot|ClaudeBot|ChatGPT/i.test(navigator.userAgent);

// Viewport-triggered lazy section — crawlers see content immediately
const ViewportSection = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(isBot); // bots see everything immediately
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return; // already visible (bot or triggered)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

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

        {/* Ad placement — below fold. BannerAd is the (dormant) AdSense unit;
            NativeBannerAd is the live Adsterra revenue unit. Container-id based,
            so it's collision-free alongside the in-article HPF rectangle below. */}
        <BannerAd className="mt-4" />
        <div className="container mx-auto px-4 max-w-5xl">
          <NativeBannerAd />
        </div>

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

        {/* In-article ad — dormant AdSense unit + live Adsterra 300x250 rectangle
            (the single HPF unit on this page; pairs safely with the native banner). */}
        <InArticleAd />
        <div className="flex justify-center my-6">
          <MediumRectangleAd />
        </div>

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
