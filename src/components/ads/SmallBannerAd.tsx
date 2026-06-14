import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SmallBannerAdProps {
  className?: string;
}

// Singleton pattern — inject once, never cleanup on navigation
let smallBannerInitialized = false;

export function SmallBannerAd({ className }: SmallBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (smallBannerInitialized || !containerRef.current) return;
    smallBannerInitialized = true;

    // Set atOptions immediately before loading this ad's invoke script
    // to avoid collision with other HighPerformanceFormat ads.
    const configScript = document.createElement("script");
    configScript.textContent = `
      var atOptions = {
        'key' : '77bf78d1aee783820db24b5061eaa4e3',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = "https://www.highperformanceformat.com/77bf78d1aee783820db24b5061eaa4e3/invoke.js";
    invokeScript.async = true;

    const currentContainer = containerRef.current;
    currentContainer.appendChild(configScript);
    currentContainer.appendChild(invokeScript);
  }, []);

  return (
    <div 
      className={cn("flex md:hidden items-center justify-center min-h-[50px] w-[320px] mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
