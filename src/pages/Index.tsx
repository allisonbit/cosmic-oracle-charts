import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load below-fold components for better LCP
const QuickStats = lazy(() => import("@/components/home/QuickStats").then(m => ({ default: m.QuickStats })));
const ChainLinks = lazy(() => import("@/components/home/ChainLinks").then(m => ({ default: m.ChainLinks })));
const TopMovers = lazy(() => import("@/components/home/TopMovers").then(m => ({ default: m.TopMovers })));
const FeaturesSection = lazy(() => import("@/components/home/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const CTASection = lazy(() => import("@/components/home/CTASection").then(m => ({ default: m.CTASection })));
const MarketOverview = lazy(() => import("@/components/home/MarketOverview").then(m => ({ default: m.MarketOverview })));

const SectionFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <Navbar />
        <div className="mt-16" aria-label="Live cryptocurrency prices">
          <CryptoTicker />
        </div>
      </header>
      
      <main id="main-content">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <QuickStats />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ChainLinks />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <TopMovers />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CTASection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <MarketOverview />
        </Suspense>
      </main>
      
      <Footer />
      <MobileBottomNav />
      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
};

export default Index;
