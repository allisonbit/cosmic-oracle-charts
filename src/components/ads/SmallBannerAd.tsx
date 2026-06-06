import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SmallBannerAdProps {
  className?: string;
}

export function SmallBannerAd({ className }: SmallBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    // Define the required global configuration object
    (window as any).atOptions = {
      'key' : '77bf78d1aee783820db24b5061eaa4e3',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };

    // Create the script element
    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/77bf78d1aee783820db24b5061eaa4e3/invoke.js";
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
      className={cn("flex items-center justify-center min-h-[50px] w-[320px] mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
