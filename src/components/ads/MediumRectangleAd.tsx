import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MediumRectangleAdProps {
  className?: string;
}

// Singleton pattern — inject once, never cleanup on navigation
let mediumRectangleInitialized = false;

export function MediumRectangleAd({ className }: MediumRectangleAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mediumRectangleInitialized || !containerRef.current) return;
    mediumRectangleInitialized = true;

    // Set atOptions immediately before loading this ad's invoke script
    // to avoid collision with other HighPerformanceFormat ads.
    const configScript = document.createElement("script");
    configScript.textContent = `
      var atOptions = {
        'key' : 'c6b1e8444b3a7f06380d0d84798b4b5c',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = "https://www.highperformanceformat.com/c6b1e8444b3a7f06380d0d84798b4b5c/invoke.js";
    invokeScript.async = true;

    const currentContainer = containerRef.current;
    currentContainer.appendChild(configScript);
    currentContainer.appendChild(invokeScript);
  }, []);

  return (
    <div 
      className={cn("flex items-center justify-center min-h-[250px] w-[300px] max-w-full mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
