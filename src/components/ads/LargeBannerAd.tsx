import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LargeBannerAdProps {
  className?: string;
}

// Track global initialization to prevent duplicate script injections across
// route changes (singleton pattern — the ad network script is injected once
// into the container and never removed/re-added on navigation).
let largeBannerInitialized = false;

export function LargeBannerAd({ className }: LargeBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (largeBannerInitialized || !containerRef.current) return;
    largeBannerInitialized = true;

    // Set atOptions immediately before loading this ad's invoke script
    // to avoid collision with other HighPerformanceFormat ads.
    const configScript = document.createElement("script");
    configScript.textContent = `
      var atOptions = {
        'key' : '42c0ffb054b17a9a444907f2efaf44e8',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = "https://www.highperformanceformat.com/42c0ffb054b17a9a444907f2efaf44e8/invoke.js";
    invokeScript.async = true;

    const currentContainer = containerRef.current;
    currentContainer.appendChild(configScript);
    currentContainer.appendChild(invokeScript);

    // No cleanup — singleton pattern: the ad stays alive for the entire session
    // to prevent orphaned global state from the ad network SDK.
  }, []);

  return (
    <div 
      className={cn("hidden md:flex items-center justify-center min-h-[90px] w-[728px] max-w-full mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
