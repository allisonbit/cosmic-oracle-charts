import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, memo } from "react";

type AdSize =
  | "banner"        // 728x90 - top/bottom of pages
  | "leaderboard"   // 970x90 - wide banner
  | "rectangle"     // 300x250 - sidebar/in-content
  | "skyscraper"    // 160x600 - sidebar vertical
  | "mobile-banner" // 320x50 - mobile header/footer
  | "in-article"    // responsive - between content
  | "sticky-footer"; // 320x50/728x90 - sticky bottom

interface AdPlacementProps {
  size: AdSize;
  className?: string;
  slot?: string;
  lazyLoad?: boolean;
}

// Fixed dimensions for CLS prevention - CRITICAL for viewability & RPM
const sizeConfig: Record<AdSize, { 
  width: string; 
  height: string; 
  minHeight: string;
  mobileWidth?: string;
  mobileHeight?: string;
}> = {
  banner: { 
    width: "728px", 
    height: "90px", 
    minHeight: "90px",
    mobileWidth: "320px",
    mobileHeight: "50px"
  },
  leaderboard: { 
    width: "970px", 
    height: "90px", 
    minHeight: "90px",
    mobileWidth: "320px",
    mobileHeight: "50px"
  },
  rectangle: { 
    width: "300px", 
    height: "250px", 
    minHeight: "250px" 
  },
  skyscraper: { 
    width: "160px", 
    height: "600px", 
    minHeight: "600px" 
  },
  "mobile-banner": { 
    width: "320px", 
    height: "50px", 
    minHeight: "50px" 
  },
  "in-article": { 
    width: "100%", 
    height: "auto", 
    minHeight: "120px" // Fixed minimum to prevent CLS
  },
  "sticky-footer": { 
    width: "100%", 
    height: "auto", 
    minHeight: "50px",
    mobileHeight: "50px"
  },
};

// No artificial ad budget limit - let AdSense handle ad density optimization
function allocateAdBudget(): boolean {
  return true;
}

// Wait for AdSense script to be ready then fire callback
function scheduleAdInit(cb: () => void) {
  if (typeof window === "undefined") return;

  const w = window as Window & { adsbygoogle?: unknown[] };

  // If adsbygoogle array already exists the script is loaded — fire immediately
  if (Array.isArray(w.adsbygoogle)) {
    cb();
    return;
  }

  // Otherwise wait up to 5 seconds for script to load
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (Array.isArray((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle)) {
      clearInterval(interval);
      cb();
    } else if (attempts >= 50) {
      // 5 s timeout — try anyway
      clearInterval(interval);
      cb();
    }
  }, 100);
}

/**
 * Professional AdPlacement component optimized for:
 * - Core Web Vitals (CLS = 0 with fixed dimensions)
 * - Active View / Viewability (≥50% visible tracking)
 * - Heavy-ad intervention prevention (budget system)
 * - Responsive design (mobile/desktop dimensions)
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
  const [isViewable, setIsViewable] = useState(false);
  const hasInitialized = useRef(false);
  const isAllowedRef = useRef<boolean | null>(null);
  const viewabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive dimension detection
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveWidth = isMobile && config.mobileWidth ? config.mobileWidth : config.width;
  const effectiveHeight = isMobile && config.mobileHeight ? config.mobileHeight : config.height;
  const effectiveMinHeight = isMobile && config.mobileHeight ? config.mobileHeight : config.minHeight;

  // Lazy load + viewability tracking with Intersection Observer
  useEffect(() => {
    if (!lazyLoad || isVisible) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Load when entering viewport
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            // Track viewability (≥50% visible for ≥1 second)
            if (entry.intersectionRatio >= 0.5) {
              if (!viewabilityTimerRef.current) {
                viewabilityTimerRef.current = setTimeout(() => {
                  setIsViewable(true);
                }, 1000);
              }
            }
          } else {
            // Clear viewability timer if not visible
            if (viewabilityTimerRef.current) {
              clearTimeout(viewabilityTimerRef.current);
              viewabilityTimerRef.current = null;
            }
          }
        });
      },
      {
        rootMargin: "200px 0px", // Preload 200px before viewport
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    if (adRef.current) observer.observe(adRef.current);

    return () => {
      observer.disconnect();
      if (viewabilityTimerRef.current) {
        clearTimeout(viewabilityTimerRef.current);
      }
    };
  }, [lazyLoad, isVisible]);

  // Initialize AdSense slot when visible (works for both slotted and auto ads)
  useEffect(() => {
    if (!isVisible || hasInitialized.current) return;
    if (isAllowedRef.current === false) return;

    const ins = adRef.current?.querySelector("ins.adsbygoogle");
    if (!ins) return;

    const alreadyInitialized =
      !!ins.getAttribute("data-adsbygoogle-status") || !!ins.getAttribute("data-ad-status");

    if (alreadyInitialized) {
      hasInitialized.current = true;
      return;
    }

    hasInitialized.current = true;

    scheduleAdInit(() => {
      try {
        const w = window as Window & { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      } catch (e) {
        const w = window as Window & { __oracle_ad_init_warned?: boolean };
        if (!w.__oracle_ad_init_warned) {
          w.__oracle_ad_init_warned = true;
          console.debug("AdSense init info:", e);
        }
      }
    });
  }, [isVisible]);

  // Placeholder with fixed dimensions (CLS prevention)
  if (!isVisible) {
    return (
      <div
        ref={adRef}
        className={cn(
          "flex items-center justify-center bg-muted/10 rounded-lg",
          "transition-opacity duration-300",
          className
        )}
        style={{
          width: effectiveWidth === "100%" ? "100%" : undefined,
          maxWidth: effectiveWidth,
          height: effectiveHeight === "auto" ? undefined : effectiveHeight,
          minHeight: effectiveMinHeight,
          contain: "layout style",
        }}
        aria-hidden="true"
        data-ad-placeholder="true"
      />
    );
  }

  // Allocate per-route ad budget
  if (isAllowedRef.current === null) {
    isAllowedRef.current = allocateAdBudget();
  }

  // Suppress extra placements but keep layout stable
  if (isAllowedRef.current === false) {
    if (size === "sticky-footer") return null;

    return (
      <div
        ref={adRef}
        className={cn(
          "flex items-center justify-center bg-muted/5 rounded-lg",
          size === "in-article" && "my-6 w-full",
          className
        )}
        style={{
          maxWidth: size === "in-article" ? "100%" : effectiveWidth,
          minHeight: effectiveMinHeight,
          contain: "layout style",
        }}
        aria-hidden="true"
        data-ad-suppressed="true"
      />
    );
  }

  // Sticky footer with fixed positioning
  if (size === "sticky-footer") {
    return (
      <div
        ref={adRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "bg-background/95 backdrop-blur-sm border-t border-border/50",
          "flex items-center justify-center py-2 pb-safe",
          className
        )}
        style={{ 
          minHeight: parseInt(effectiveMinHeight) + 16,
          contain: "layout style",
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
              display: "block", 
              textAlign: "center",
              width: isMobile ? "320px" : "728px",
              height: isMobile ? "50px" : "90px",
            }}
            data-ad-client="ca-pub-1336344158133611"
            data-ad-slot={slot}
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
        ) : (
          <div 
            className="w-full max-w-3xl mx-auto" 
            data-ad-container="auto"
            style={{ height: isMobile ? "50px" : "90px" }}
          />
        )}
      </div>
    );
  }

  // Standard ad placement — NO overflow-hidden (clips ad iframes)
  return (
    <div
      ref={adRef}
      className={cn(
        "flex items-center justify-center bg-muted/5 rounded-lg",
        "border border-border/20",
        size === "in-article" && "my-6 w-full",
        className
      )}
      style={{
        width: effectiveWidth === "100%" ? "100%" : undefined,
        maxWidth: size === "in-article" ? "100%" : effectiveWidth,
        height: effectiveHeight === "auto" ? undefined : effectiveHeight,
        minHeight: effectiveMinHeight,
        position: "relative",
        zIndex: 1,
      }}
      data-ad-slot={slot}
      data-ad-size={size}
      data-ad-viewable={isViewable}
      aria-label="Advertisement"
      role="complementary"
    >
      {slot ? (
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            height: effectiveHeight === "auto" ? "auto" : effectiveHeight,
            minHeight: effectiveMinHeight,
          }}
          data-ad-client="ca-pub-1336344158133611"
          data-ad-slot={slot}
          data-ad-format={size === "in-article" ? "fluid" : "auto"}
          data-full-width-responsive={size === "in-article" ? "true" : "false"}
        />
      ) : (
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            minHeight: effectiveMinHeight,
          }}
          data-ad-client="ca-pub-1336344158133611"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
});

export default AdPlacement;
