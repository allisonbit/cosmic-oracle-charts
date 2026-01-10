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
        "bg-muted/10 rounded-lg flex items-center justify-center",
        className
      )}
      style={{ 
        minHeight: height,
        contain: "layout style",
      }}
      aria-hidden="true"
    >
      <span className="text-muted-foreground/20 text-xs animate-pulse">Loading...</span>
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