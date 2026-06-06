import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, memo } from "react";

type AdSize =
  | "banner"        // 728x90
  | "leaderboard"   // 970x90
  | "rectangle"     // 300x250
  | "skyscraper"    // 160x600
  | "mobile-banner" // 320x50
  | "in-article"    // responsive
  | "sticky-footer"; // sticky bottom

interface AdPlacementProps {
  size: AdSize;
  className?: string;
  slot?: string;
  lazyLoad?: boolean;
}

const sizeConfig: Record<AdSize, { 
  width: string; 
  height: string; 
  minHeight: string;
  mobileWidth?: string;
  mobileHeight?: string;
}> = {
  banner: { width: "728px", height: "90px", minHeight: "90px", mobileWidth: "320px", mobileHeight: "50px" },
  leaderboard: { width: "970px", height: "90px", minHeight: "90px", mobileWidth: "320px", mobileHeight: "50px" },
  rectangle: { width: "300px", height: "250px", minHeight: "250px" },
  skyscraper: { width: "160px", height: "600px", minHeight: "600px" },
  "mobile-banner": { width: "320px", height: "50px", minHeight: "50px" },
  "in-article": { width: "100%", height: "auto", minHeight: "120px" },
  "sticky-footer": { width: "100%", height: "auto", minHeight: "50px", mobileHeight: "50px" },
};

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

  // Responsive dimension detection
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveWidth = isMobile && config.mobileWidth ? config.mobileWidth : config.width;
  const effectiveHeight = isMobile && config.mobileHeight ? config.mobileHeight : config.height;
  const effectiveMinHeight = isMobile && config.mobileHeight ? config.mobileHeight : config.minHeight;

  // Lazy load + viewability tracking
  useEffect(() => {
    if (!lazyLoad || isVisible) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (entry.intersectionRatio >= 0.5) setIsViewable(true);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: [0, 0.5] }
    );

    if (adRef.current) observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [lazyLoad, isVisible]);

  // Push AdSense when visible
  useEffect(() => {
    if (!isVisible || hasInitialized.current) return;
    hasInitialized.current = true;
    
    // For manual AdSense units (if slot is provided)
    if (slot && typeof window !== "undefined") {
      try {
        const w = window as any;
        (w.adsbygoogle = w.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }
  }, [isVisible, slot]);

  // Placeholder
  if (!isVisible) {
    return (
      <div
        ref={adRef}
        className={cn("flex items-center justify-center bg-muted/10 rounded-lg transition-opacity duration-300", className)}
        style={{
          width: effectiveWidth === "100%" ? "100%" : undefined,
          maxWidth: effectiveWidth,
          height: effectiveHeight === "auto" ? undefined : effectiveHeight,
          minHeight: effectiveMinHeight,
          contain: "layout style",
        }}
        aria-hidden="true"
      />
    );
  }

  // Google AdSense Tag
  const AdSenseIns = () => {
    if (!slot) return null; // Let Auto Ads handle it if no slot
    return (
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight: effectiveMinHeight }}
        data-ad-client="ca-pub-1336344158133611"
        data-ad-slot={slot}
        data-ad-format={size === "in-article" ? "fluid" : "auto"}
        data-full-width-responsive={isMobile ? "true" : "false"}
      />
    );
  };

  // Sticky footer
  if (size === "sticky-footer") {
    return (
      <div
        ref={adRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50 flex items-center justify-center py-2 pb-safe",
          className
        )}
        style={{ minHeight: parseInt(effectiveMinHeight) + 16, contain: "layout style" }}
        role="complementary"
      >
        {slot ? <AdSenseIns /> : null}
      </div>
    );
  }

  // Standard placement
  return (
    <div
      ref={adRef}
      className={cn(
        "flex items-center justify-center overflow-hidden",
        !slot && "bg-muted/5 rounded-lg border border-border/20",
        size === "in-article" && "my-6 w-full",
        className
      )}
      style={{
        width: effectiveWidth === "100%" ? "100%" : undefined,
        maxWidth: size === "in-article" ? "100%" : effectiveWidth,
        minHeight: effectiveMinHeight,
        position: "relative",
        zIndex: 1,
      }}
      role="complementary"
    >
      {slot ? <AdSenseIns /> : null}
    </div>
  );
});

export default AdPlacement;
