import { lazy, Suspense, memo } from "react";
import { cn } from "@/lib/utils";

// Lazy load the ad component itself
const AdPlacement = lazy(() => import("./AdPlacement"));

interface LazyAdProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper" | "mobile-banner" | "in-article" | "sticky-footer";
  className?: string;
  slot?: string;
}

// Fixed placeholder dimensions to prevent CLS
const AdPlaceholder = memo(function AdPlaceholder({ 
  size, 
  className 
}: { 
  size: string; 
  className?: string;
}) {
  // Fixed heights matching AdPlacement for zero CLS
  const dimensions: Record<string, { height: string; mobileHeight?: string }> = {
    banner: { height: "90px", mobileHeight: "50px" },
    leaderboard: { height: "90px", mobileHeight: "50px" },
    rectangle: { height: "250px" },
    skyscraper: { height: "600px" },
    "mobile-banner": { height: "50px" },
    "in-article": { height: "120px" },
    "sticky-footer": { height: "50px" },
  };

  const config = dimensions[size] || { height: "90px" };
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const height = isMobile && config.mobileHeight ? config.mobileHeight : config.height;

  return (
    <div 
      className={cn(
        "bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg border border-primary/10 flex items-center justify-center overflow-hidden relative group cursor-pointer",
        className
      )}
      style={{ 
        minHeight: height,
        contain: "layout style",
      }}
      aria-hidden="true"
      onClick={() => window.location.href = '/advertise'}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      <div className="flex flex-col items-center justify-center gap-1">
        <span className="text-primary/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
          Advertisement Space
        </span>
        {parseInt(height) > 50 && (
          <span className="text-muted-foreground/40 text-[10px]">Click to advertise with Oracle Bull</span>
        )}
      </div>
    </div>
  );
});

export const LazyAd = memo(function LazyAd({ size, className, slot }: LazyAdProps) {
  return (
    <Suspense fallback={<AdPlaceholder size={size} className={className} />}>
      <AdPlacement 
        size={size} 
        className={className} 
        slot={slot} 
        lazyLoad={true}
      />
    </Suspense>
  );
});

export default LazyAd;
