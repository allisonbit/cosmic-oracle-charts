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
import { BannerAd, InArticleAd } from "@/components/ads";
import { SEO, StructuredData } from "@/components/SEO";
import { HomepageSchema } from "@/components/home/HomepageSchema";

// Lazy load below-fold components for better LCP
const QuickStats = lazy(() => import("@/components/home/QuickStats").then(m => ({ default: m.QuickStats })));
const SocialProofBar = lazy(() => import("@/components/home/SocialProofBar").then(m => ({ default: m.SocialProofBar })));
const SEOContentBlock = lazy(() => import("@/components/home/SEOContentBlock").then(m => ({ default: m.SEOContentBlock })));
const HowItWorks = lazy(() => import("@/components/home/HowItWorks").then(m => ({ default: m.HowItWorks })));
const ChainLinks = lazy(() => import("@/components/home/ChainLinks").then(m => ({ default: m.ChainLinks })));
const TopMovers = lazy(() => import("@/components/home/TopMovers").then(m => ({ default: m.TopMovers })));
const FeaturesSection = lazy(() => import("@/components/home/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const CTASection = lazy(() => import("@/components/home/CTASection").then(m => ({ default: m.CTASection })));
const MarketOverview = lazy(() => import("@/components/home/MarketOverview").then(m => ({ default: m.MarketOverview })));
const TrendingSearches = lazy(() => import("@/components/home/TrendingSearches").then(m => ({ default: m.TrendingSearches })));
const HomepageFAQ = lazy(() => import("@/components/home/HomepageFAQ").then(m => ({ default: m.HomepageFAQ })));

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
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <StructuredData />
      <HomepageSchema />
      
      <header>
        <Navbar />
        <div className="mt-14 md:mt-16" aria-label="Live cryptocurrency prices">
          <QuickAccessBar />
          <CryptoTicker />
        </div>
      </header>
      
      <main id="main-content">
        {/* 1. Hero - first impression, trust badges, live prices */}
        <HeroSection />

        {/* 2. Quick Stats - live market data bar */}
        <Suspense fallback={<SectionFallback />}>
          <QuickStats />
        </Suspense>

        {/* 3. Social Proof - animated platform metrics */}
        <Suspense fallback={<SectionFallback />}>
          <SocialProofBar />
        </Suspense>
        
        {/* 4. How It Works - 3-step onboarding */}
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
        
        {/* 5. SEO content block with trust elements */}
        <Suspense fallback={<SectionFallback />}>
          <SEOContentBlock />
        </Suspense>
        
        {/* 6. Chain analytics cards */}
        <Suspense fallback={<SectionFallback />}>
          <ChainLinks />
        </Suspense>
        
        {/* Ad placement - below fold */}
        <BannerAd className="mt-4" />
        
        {/* 8. TopMovers - deferred chart loading */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <TopMovers />
          </Suspense>
        </ViewportSection>

        {/* 9. Platform features grid */}
        <Suspense fallback={<SectionFallback />}>
          <FeaturesSection />
        </Suspense>
        
        {/* In-article ad */}
        <InArticleAd />
        
        {/* 10. Trending Searches + Platform Stats */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <TrendingSearches />
          </Suspense>
        </ViewportSection>
        
        {/* 11. Interactive CTA tabs */}
        <Suspense fallback={<SectionFallback />}>
          <CTASection />
        </Suspense>

        {/* 12. Market Overview - deferred chart loading */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <MarketOverview />
          </Suspense>
        </ViewportSection>

        {/* 13. FAQ - SEO rich snippets */}
        <ViewportSection fallback={<SectionFallback />}>
          <Suspense fallback={<SectionFallback />}>
            <HomepageFAQ />
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
