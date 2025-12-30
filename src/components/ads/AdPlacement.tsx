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
  slot?: string; // Google AdSense slot ID
  lazyLoad?: boolean; // Enable lazy loading (default true)
  priority?: 'low' | 'medium' | 'high'; // Loading priority
}

const sizeConfig: Record<AdSize, { width: string; height: string; label: string; minHeight: string }> = {
  banner: { width: "728px", height: "90px", label: "Banner", minHeight: "90px" },
  leaderboard: { width: "970px", height: "90px", label: "Leaderboard", minHeight: "90px" },
  rectangle: { width: "300px", height: "250px", label: "Rectangle", minHeight: "250px" },
  skyscraper: { width: "160px", height: "600px", label: "Skyscraper", minHeight: "600px" },
  "mobile-banner": { width: "320px", height: "50px", label: "Mobile Banner", minHeight: "50px" },
  "in-article": { width: "100%", height: "auto", label: "In-Article", minHeight: "250px" },
  "sticky-footer": { width: "100%", height: "auto", label: "Sticky Footer", minHeight: "50px" },
};

// Maximum 3-4 ads per page - AdSense compliance
const MAX_ADS_PER_PAGE = 4;
let activeAdCount = 0;

export const AdPlacement = memo(function AdPlacement({ 
  size, 
  className, 
  slot,
  lazyLoad = true,
  priority = 'low'
}: AdPlacementProps) {
  const config = sizeConfig[size];
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!lazyLoad) {
      setIsVisible(true);
      return;
    }

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && activeAdCount < MAX_ADS_PER_PAGE) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: priority === 'high' ? '200px' : priority === 'medium' ? '100px' : '50px',
        threshold: 0.1,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, priority]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      activeAdCount++;
      setIsLoaded(true);
      
      // Defer ad initialization to prevent heavy CPU usage
      const timeoutId = setTimeout(() => {
        // Push ad to AdSense if available
        try {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle && slot) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          }
        } catch (e) {
          console.warn('AdSense push error:', e);
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        activeAdCount = Math.max(0, activeAdCount - 1);
      };
    }
  }, [isVisible, isLoaded, slot]);

  // Don't render if max ads reached
  if (activeAdCount >= MAX_ADS_PER_PAGE && !isLoaded) {
    return null;
  }

  // Placeholder component - shows when not loaded yet
  if (!isVisible) {
    return (
      <div
        ref={adRef}
        className={cn(
          "flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden",
          className
        )}
        style={{
          maxWidth: config.width,
          minHeight: config.minHeight,
        }}
        aria-hidden="true"
      />
    );
  }

  // Sticky footer has special positioning
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
          <div className="text-muted-foreground/30 text-xs">Ad</div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={cn(
        "flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden",
        size === "in-article" && "my-6",
        className
      )}
      style={{
        maxWidth: config.width,
        minHeight: config.minHeight,
      }}
      data-ad-slot={slot}
      data-ad-size={size}
      aria-label="Advertisement"
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
        <div className="text-muted-foreground/30 text-xs">{config.label}</div>
      )}
    </div>
  );
});

export default AdPlacement;