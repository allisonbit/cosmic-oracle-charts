import { ReactNode, Suspense } from "react";
import { Navbar } from "./Navbar";
import { CryptoTicker } from "./CryptoTicker";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { CookieBanner } from "../legal/CookieBanner";
import { NativeBannerAd } from "@/components/ads";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  showTicker?: boolean;
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]" role="status" aria-label="Loading content">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function Layout({ children, showTicker = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col cosmic-bg w-full overflow-x-hidden stable-layout">
      <header>
        <Navbar />
        {showTicker && (
          <div className="mt-14 md:mt-16 gpu-accelerated" aria-label="Live cryptocurrency prices">
            <CryptoTicker />
          </div>
        )}
      </header>
      
      <main id="main-content" className={`flex-1 ${showTicker ? "" : "mt-14 md:mt-16"} pb-36 md:pb-28 scroll-smooth-touch`}>
        <BreadcrumbNav />
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
        {/* Content-first ad: a single native banner AFTER the page content (not a
            top-of-page stack). Container-id based, so it never collides with any
            in-page HighPerformanceFormat unit. Covers all pages that use Layout. */}
        <div className="container mx-auto px-4 max-w-5xl">
          <NativeBannerAd />
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
      <CookieBanner />
    </div>
  );
}
