import { ReactNode, Suspense } from "react";
import { Navbar } from "./Navbar";
import { CryptoTicker } from "./CryptoTicker";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { CookieBanner } from "../legal/CookieBanner";
import { AdUnit } from "../ads/AdUnit";
import { AdsterraNative } from "../ads/AdsterraNative";
import { AdsterraBanner } from "../ads/AdsterraBanner";
import { AdsterraBanner300 } from "../ads/AdsterraBanner300";
import { AdsterraBanner320 } from "../ads/AdsterraBanner320";
import { AdsterraSmartlink } from "../ads/AdsterraSmartlink";
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
        <AdUnit format="horizontal" className="my-2 max-w-5xl mx-auto px-4" />
        <AdsterraSmartlink variant="banner" className="my-3 max-w-5xl mx-auto px-4" />
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
        <AdsterraNative className="my-4 max-w-5xl mx-auto px-4" />
        <AdsterraBanner className="my-4" />
        <AdsterraBanner300 className="my-4" />
        <AdsterraBanner320 className="my-4" />
        <AdsterraSmartlink variant="button" className="my-4" />
        <AdUnit format="horizontal" className="mt-6 mb-2 max-w-5xl mx-auto px-4" />
      </main>
      
      <Footer />
      <MobileBottomNav />
      <CookieBanner />
    </div>
  );
}
