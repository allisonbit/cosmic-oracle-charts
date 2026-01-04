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
 * Soft budget to prevent too many manual ad placeholders on a single route.
 * This helps reduce hangs/jank on lower-end devices when Auto Ads + multiple placements compete.
 */
const MAX_AD_PLACEMENTS_PER_PAGE = 4;

type AdBudgetState = {
  path: string;
  used: number;
};

function allocateAdBudget(): boolean {
  if (typeof window === "undefined") return true;

  const w = window as any;
  const path = window.location?.pathname || "/";
  const state: AdBudgetState | undefined = w.__oracle_ad_budget;

  if (!state || state.path !== path) {
    w.__oracle_ad_budget = { path, used: 0 } satisfies AdBudgetState;
  }

  if (w.__oracle_ad_budget.used >= MAX_AD_PLACEMENTS_PER_PAGE) return false;
  w.__oracle_ad_budget.used += 1;
  return true;
}

function scheduleAdInit(cb: () => void) {
  if (typeof window === "undefined") return;
  const w = window as any;

  const ric = w.requestIdleCallback as undefined | ((fn: () => void, opts?: { timeout: number }) => void);
  if (typeof ric === "function") {
    ric(cb, { timeout: 2000 });
    return;
  }

  setTimeout(cb, 250);
}

export const AdPlacement = memo(function AdPlacement({ size, className, slot, lazyLoad = true }: AdPlacementProps) {
  const config = sizeConfig[size];
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const hasInitialized = useRef(false);
  const isAllowedRef = useRef<boolean | null>(null);

  // Lazy load using Intersection Observer for Core Web Vitals
  useEffect(() => {
    if (!lazyLoad || isVisible) return;

    if (typeof window === "undefined") return;

    // Avoid crashes on very old browsers
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

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
        rootMargin: "200px", // Load 200px before entering viewport
        threshold: 0,
      }
    );

    if (adRef.current) observer.observe(adRef.current);

    return () => observer.disconnect();
  }, [lazyLoad, isVisible]);

  // Initialize AdSense slot when visible (for manual slot placements)
  useEffect(() => {
    if (!isVisible || hasInitialized.current || !slot) return;
    if (isAllowedRef.current === false) return;

    const ins = adRef.current?.querySelector("ins.adsbygoogle");
    const alreadyInitialized =
      !!ins?.getAttribute("data-adsbygoogle-status") || !!ins?.getAttribute("data-ad-status");

    if (alreadyInitialized) {
      hasInitialized.current = true;
      return;
    }

    hasInitialized.current = true;

    scheduleAdInit(() => {
      try {
        const w = window as any;
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      } catch (e) {
        // AdSense errors are non-critical, but don't let them spam.
        const w = window as any;
        if (!w.__oracle_ad_init_warned) {
          w.__oracle_ad_init_warned = true;
          console.warn("Ad init skipped", e);
        }
      }
    });
  }, [isVisible, slot]);

  // Placeholder when lazy loading
  if (!isVisible) {
    return (
      <div
        ref={adRef}
        className={cn("flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden", className)}
        style={{
          maxWidth: config.width,
          minHeight: config.minHeight,
          contain: "content",
        }}
        aria-hidden="true"
        data-ad-placeholder="true"
      />
    );
  }

  // Allocate per-route ad budget only when ad becomes eligible to render.
  if (isAllowedRef.current === null) {
    isAllowedRef.current = allocateAdBudget();
  }

  if (isAllowedRef.current === false) {
    // Suppress extra placements but keep layout stable (no CLS).
    if (size === "sticky-footer") return null;

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
          contain: "content",
        }}
        aria-hidden="true"
        data-ad-suppressed="true"
      />
    );
  }

  // Sticky footer has special fixed positioning
  if (size === "sticky-footer") {
    return (
      <div
        ref={adRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border/50",
          "flex items-center justify-center py-2 safe-area-bottom",
          className
        )}
        data-ad-slot={slot}
        data-ad-size={size}
        aria-label="Advertisement"
        role="complementary"
        style={{ contain: "content" }}
      >
        {slot ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
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
        contain: "content",
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
            width: "100%",
            height: "auto",
            minHeight: config.minHeight,
          }}
          data-ad-client="ca-pub-1336344158133611"
          data-ad-slot={slot}
          data-ad-format={size === "in-article" ? "fluid" : "auto"}
          data-full-width-responsive="true"
        />
      ) : (
        // Auto Ads placeholder - Google will fill if appropriate
        <div className="w-full h-full" data-ad-container="auto" style={{ minHeight: config.minHeight }} />
      )}
    </div>
  );
});

export default AdPlacement;
