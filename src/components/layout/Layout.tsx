import { ReactNode, Suspense } from "react";
import { Navbar } from "./Navbar";
import { CryptoTicker } from "./CryptoTicker";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  showTicker?: boolean;
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-display">Loading...</p>
      </div>
    </div>
  );
}

export function Layout({ children, showTicker = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col cosmic-bg w-full overflow-x-hidden stable-layout">
      <Navbar />
      {showTicker && (
        <div className="mt-14 md:mt-16 gpu-accelerated">
          <CryptoTicker />
        </div>
      )}
      <main className={`flex-1 ${showTicker ? "" : "mt-14 md:mt-16"} pb-20 md:pb-0 scroll-smooth-touch`}>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
