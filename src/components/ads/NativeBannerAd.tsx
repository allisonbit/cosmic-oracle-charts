import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NativeBannerAdProps {
  className?: string;
}

export function NativeBannerAd({ className }: NativeBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current) return;
    initialized.current = true;

    // Create the script element
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://pl29658578.effectivecpmnetwork.com/112d36e242e4511b336ebcf2ab32171f/invoke.js";

    // Append the script to the document body or container
    if (containerRef.current) {
      // It's usually safer to append the ad script directly to the head or body, 
      // but if it uses document.write it might need to be adjacent.
      // Ezoic / EffectiveCPM often uses targeted IDs.
      document.body.appendChild(script);
    }

    return () => {
      // Optional cleanup if necessary, but usually ad scripts are better left alone
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
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
