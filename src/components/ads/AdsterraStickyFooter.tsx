import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Sticky-footer Adsterra HighPerformanceFormat banner. Maximizes impressions on
// every page view (including bounce visitors) by mounting a persistent ad
// before the user can leave. Uses 728x90 on desktop, 320x50 on mobile via two
// separate HPF keys.
//
// HPF SINGLE-INSTANCE RULE: this network reads a GLOBAL `atOptions` var, so
// only ONE HPF unit can mount per page. We register a module-level flag the
// moment ANY HPF component mounts; this sticky bails out if another HPF unit
// is already on the page (e.g. Index.tsx mounts LargeBannerAd). NativeBannerAd
// and SmartlinkAd are different networks and never collide.

const DESKTOP_KEY = "42c0ffb054b17a9a444907f2efaf44e8"; // 728x90 (same as LargeBannerAd)
const MOBILE_KEY = "77bf78d1aee783820db24b5061eaa4e3";  // 320x50  (same as SmallBannerAd)

declare global {
  var __hpfMounted: boolean | undefined;
}

export function AdsterraStickyFooter({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const [dismissed, setDismissed] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    // Capture the node now so cleanup references the same element this effect
    // wired up, not whatever containerRef points at when cleanup later runs.
    const container = containerRef.current;
    // Defer a tick so any in-page HPF (LargeBannerAd / MediumRectangleAd /
    // SmallBannerAd) registers itself first on initial mount.
    const t = setTimeout(() => {
      if (typeof window !== "undefined" && window.__hpfMounted) {
        setSkip(true);
        return;
      }
      if (typeof window !== "undefined") window.__hpfMounted = true;

      if (injected.current || !container) return;
      injected.current = true;

      const isMobile = window.innerWidth < 768;
      const key = isMobile ? MOBILE_KEY : DESKTOP_KEY;
      const w = isMobile ? 320 : 728;
      const h = isMobile ? 50 : 90;

      const cfg = document.createElement("script");
      cfg.textContent = `var atOptions = { 'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{} };`;
      const inv = document.createElement("script");
      inv.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      inv.async = true;
      container.appendChild(cfg);
      container.appendChild(inv);
    }, 150);

    return () => {
      clearTimeout(t);
      if (typeof window !== "undefined" && injected.current) {
        window.__hpfMounted = false;
      }
      if (container) container.innerHTML = "";
      injected.current = false;
    };
  }, []);

  if (skip || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border",
        "bottom-[64px] md:bottom-0 flex items-center justify-center py-1 pb-safe",
        className
      )}
      role="complementary"
      aria-label="Advertisement"
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Close advertisement"
        className="absolute right-2 top-1 z-10 p-1 rounded hover:bg-muted text-muted-foreground"
      >
        <X className="h-3 w-3" />
      </button>
      <div ref={containerRef} className="flex items-center justify-center min-h-[50px] md:min-h-[90px] overflow-hidden" />
    </div>
  );
}

export default AdsterraStickyFooter;