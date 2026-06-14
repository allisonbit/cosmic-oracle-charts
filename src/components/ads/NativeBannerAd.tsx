import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NativeBannerAdProps {
  className?: string;
}

// EffectiveCPM/Adsterra "native banner". This network targets a fixed container
// id (#container-<key>) and is NOT driven by the global `atOptions` var, so it
// never collides with the HighPerformanceFormat banners — safe to render
// alongside one of them on the same page.
const NATIVE_KEY = "112d36e242e4511b336ebcf2ab32171f";

export function NativeBannerAd({ className }: NativeBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Per-mount guard: prevents React StrictMode's double-invoke from injecting
  // the loader twice in one mount, while still re-injecting on each real mount
  // (i.e. each page view) so a fresh ad is requested after SPA navigation.
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = `https://pl29658578.effectivecpmnetwork.com/${NATIVE_KEY}/invoke.js`;
    document.body.appendChild(script);

    return () => {
      // Tear down on navigation so the next page view gets a clean re-inject
      // instead of an orphaned, never-refilled container (the old singleton
      // showed an ad once, then left a blank box for the rest of the session).
      script.remove();
      injected.current = false;
    };
  }, []);

  return (
    <div
      className={cn("flex items-center justify-center min-h-[90px] w-full my-4", className)}
      ref={containerRef}
    >
      <div id={`container-${NATIVE_KEY}`}></div>
    </div>
  );
}
