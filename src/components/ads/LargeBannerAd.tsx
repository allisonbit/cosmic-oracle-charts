import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LargeBannerAdProps {
  className?: string;
}

// 728x90 leaderboard (Adsterra HighPerformanceFormat). NOTE: this network reads a
// GLOBAL `var atOptions` when invoke.js runs, so rendering two HPF ads on the same
// page makes the second overwrite the first's config. Rule: at most ONE HPF ad
// (Large/Medium/Small) per page. NativeBannerAd is container-id based and is safe
// to pair with this one.
const HPF_KEY = "42c0ffb054b17a9a444907f2efaf44e8";

export function LargeBannerAd({ className }: LargeBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const container = containerRef.current;
    const configScript = document.createElement("script");
    configScript.textContent = `
      var atOptions = {
        'key' : '${HPF_KEY}',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highperformanceformat.com/${HPF_KEY}/invoke.js`;
    invokeScript.async = true;

    container.appendChild(configScript);
    container.appendChild(invokeScript);

    return () => {
      // Clear on navigation so the next page view re-requests a fresh ad rather
      // than leaving a blank, never-refilled slot for the rest of the session.
      container.innerHTML = "";
      injected.current = false;
    };
  }, []);

  return (
    <div
      className={cn("hidden md:flex items-center justify-center min-h-[90px] w-[728px] max-w-full mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
