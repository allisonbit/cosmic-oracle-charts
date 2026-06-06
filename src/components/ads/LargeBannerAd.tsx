import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LargeBannerAdProps {
  className?: string;
}

export function LargeBannerAd({ className }: LargeBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    // Define the required global configuration object
    (window as any).atOptions = {
      'key' : '42c0ffb054b17a9a444907f2efaf44e8',
      'format' : 'iframe',
      'height' : 90,
      'width' : 728,
      'params' : {}
    };

    // Create the script element
    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/42c0ffb054b17a9a444907f2efaf44e8/invoke.js";
    script.async = true;

    const currentContainer = containerRef.current;
    // Append the script directly inside the container
    currentContainer.appendChild(script);

    return () => {
      if (currentContainer && script.parentNode === currentContainer) {
        currentContainer.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      className={cn("flex items-center justify-center min-h-[90px] w-[728px] max-w-full mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
