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

// Wait for Bitmedia script to load once
function initBitmedia() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__bitmedia_init) return;
  w.__bitmedia_init = true;

  try {
    void function(){
      void function e(n: any, c: any, t: string, o: string, r: string[], m: number, d: number, s?: any, a?: any){
        s=c.getElementsByTagName(t)[0];
        if(!s) return;
        a=c.createElement(t);
        a.async=!0;
        a.src="https://"+r[m]+"/js/"+o+".js?v="+d;
        a.onerror=function(){a.remove(); if (++m < r.length) { e(n,c,t,o,r,m,d,s,a); }};
        s.parentNode?.insertBefore(a,s);
      }(window,document,"script","6a22a70dfb44766f7a7d8425",["cdn.bmcdn6.com"], 0, new Date().getTime())
    }();
  } catch (err) {
    console.error("Bitmedia init error:", err);
  }
}

export const AdPlacement = memo(function AdPlacement({ 
  size, 
  className, 
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

  // Initialize Bitmedia when visible
  useEffect(() => {
    if (!isVisible || hasInitialized.current) return;
    hasInitialized.current = true;
    initBitmedia();
  }, [isVisible]);

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

  // Bitmedia tag
  const BitmediaIns = () => (
    <ins 
      className="6a22a70dfb44766f7a7d8425" 
      style={{ display: "inline-block", width: "1px", height: "1px" }}
    />
  );

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
        <BitmediaIns />
      </div>
    );
  }

  // Standard placement
  return (
    <div
      ref={adRef}
      className={cn(
        "flex items-center justify-center bg-muted/5 rounded-lg border border-border/20",
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
      <BitmediaIns />
    </div>
  );
});

export default AdPlacement;
