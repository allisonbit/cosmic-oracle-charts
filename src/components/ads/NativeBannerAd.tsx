import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NativeBannerAdProps {
  className?: string;
}

// Singleton pattern — inject once, never cleanup on navigation
let nativeBannerInitialized = false;

export function NativeBannerAd({ className }: NativeBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nativeBannerInitialized || !containerRef.current) return;
    nativeBannerInitialized = true;

    // Create the script element
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://pl29658578.effectivecpmnetwork.com/112d36e242e4511b336ebcf2ab32171f/invoke.js";

    // Append the script to document body (EffectiveCPM targets by container ID)
    document.body.appendChild(script);

    // No cleanup — singleton pattern: the ad stays alive for the entire session
    // to prevent orphaned global state from the ad network SDK.
  }, []);

  return (
    <div 
      className={cn("flex items-center justify-center min-h-[90px] w-full my-4", className)}
      ref={containerRef}
    >
      <div id="container-112d36e242e4511b336ebcf2ab32171f"></div>
    </div>
  );
}
