import { lazy, Suspense, memo } from "react";
import { cn } from "@/lib/utils";

// Lazy load the ad component itself
const AdPlacement = lazy(() => import("./AdPlacement"));

interface LazyAdProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper" | "mobile-banner" | "in-article" | "sticky-footer";
  className?: string;
  slot?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Minimal placeholder that reserves space to prevent CLS
const AdPlaceholder = memo(function AdPlaceholder({ 
  size, 
  className 
}: { 
  size: string; 
  className?: string;
}) {
  const heights: Record<string, string> = {
    banner: "90px",
    leaderboard: "90px",
    rectangle: "250px",
    skyscraper: "600px",
    "mobile-banner": "50px",
    "in-article": "250px",
    "sticky-footer": "50px",
  };

  return (
    <div 
      className={cn("bg-muted/10 rounded-lg", className)}
      style={{ minHeight: heights[size] || "90px" }}
      aria-hidden="true"
    />
  );
});

export const LazyAd = memo(function LazyAd({ size, className, slot, priority = 'low' }: LazyAdProps) {
  return (
    <Suspense fallback={<AdPlaceholder size={size} className={className} />}>
      <AdPlacement 
        size={size} 
        className={className} 
        slot={slot} 
        lazyLoad={true}
        priority={priority}
      />
    </Suspense>
  );
});

export default LazyAd;