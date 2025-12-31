import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, memo } from "react";

type AdSize = 
  | "banner" // 728x90 - top/bottom of pages
  | "leaderboard" // 970x90 - wide banner
  | "rectangle" // 300x250 - sidebar/in-content
  | "skyscraper" // 160x600 - sidebar vertical
  | "mobile-banner" // 320x50 - mobile header/footer
  | "in-article" // responsive - between content
  | "sticky-footer"; // 320x50/728x90 - sticky bottom

interface AdPlacementProps {
  size: AdSize;
  className?: string;
  slot?: string; // Google AdSense slot ID (optional - Auto Ads handles most placements)
  lazyLoad?: boolean; // Enable lazy loading (default true for performance)
}

const sizeConfig: Record<AdSize, { width: string; height: string; label: string; minHeight: string }> = {
  banner: { width: "728px", height: "90px", label: "Banner", minHeight: "90px" },
  leaderboard: { width: "970px", height: "90px", label: "Leaderboard", minHeight: "90px" },
  rectangle: { width: "300px", height: "250px", label: "Rectangle", minHeight: "250px" },
  skyscraper: { width: "160px", height: "600px", label: "Skyscraper", minHeight: "600px" },
  "mobile-banner": { width: "320px", height: "50px", label: "Mobile Banner", minHeight: "50px" },
  "in-article": { width: "100%", height: "auto", label: "In-Article", minHeight: "100px" },
  "sticky-footer": { width: "100%", height: "auto", label: "Sticky Footer", minHeight: "50px" },
};

/**
 * AdPlacement Component
 * 
 * This component provides ad slot containers that work with Google AdSense Auto Ads.
 * Auto Ads automatically determines the best placement and number of ads.
 * We only provide hints via data attributes - Google handles the rest.
 * 
 * NO artificial ad limits - AdSense Auto Ads self-regulates for policy compliance.
 */
export const AdPlacement = memo(function AdPlacement({ 
  size, 
  className, 
  slot,
  lazyLoad = true
}: AdPlacementProps) {
  const config = sizeConfig[size];
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const hasInitialized = useRef(false);

  // Lazy load using Intersection Observer for Core Web Vitals
  useEffect(() => {
    if (!lazyLoad || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Load 200px before entering viewport
        threshold: 0,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, isVisible]);

  // Initialize AdSense slot when visible (for manual slot placements)
  useEffect(() => {
    if (!isVisible || hasInitialized.current || !slot) return;
    
    hasInitialized.current = true;
    
    // Defer initialization to avoid blocking main thread
    requestIdleCallback?.(() => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (e) {
        // AdSense errors are non-critical
      }
    }) ?? setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (e) {
        // AdSense errors are non-critical
      }
    }, 100);
  }, [isVisible, slot]);

  // Placeholder when lazy loading
  if (!isVisible) {
    return (
      <div
        ref={adRef}
        className={cn(
          "flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden",
          className
        )}
        style={{
          maxWidth: config.width,
          minHeight: config.minHeight,
        }}
        aria-hidden="true"
        data-ad-placeholder="true"
      />
    );
  }

  // Sticky footer has special fixed positioning
  if (size === "sticky-footer") {
    return (
      <div
        ref={adRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50",
          "flex items-center justify-center py-2 safe-area-bottom",
          className
        )}
        data-ad-slot={slot}
        data-ad-size={size}
        aria-label="Advertisement"
        role="complementary"
      >
        {slot ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client="ca-pub-1336344158133611"
            data-ad-slot={slot}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        ) : (
          // Auto Ads will fill this container if appropriate
          <div className="w-full max-w-3xl mx-auto" data-ad-container="auto" />
        )}
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={cn(
        "flex items-center justify-center bg-muted/5 rounded-lg overflow-hidden",
        size === "in-article" && "my-6 w-full",
        className
      )}
      style={{
        maxWidth: size === "in-article" ? "100%" : config.width,
        minHeight: config.minHeight,
      }}
      data-ad-slot={slot}
      data-ad-size={size}
      aria-label="Advertisement"
      role="complementary"
    >
      {slot ? (
        <ins
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: 'auto',
            minHeight: config.minHeight
          }}
          data-ad-client="ca-pub-1336344158133611"
          data-ad-slot={slot}
          data-ad-format={size === 'in-article' ? 'fluid' : 'auto'}
          data-full-width-responsive="true"
        />
      ) : (
        // Auto Ads placeholder - Google will fill if appropriate
        <div 
          className="w-full h-full" 
          data-ad-container="auto"
          style={{ minHeight: config.minHeight }}
        />
      )}
    </div>
  );
});

export default AdPlacement;