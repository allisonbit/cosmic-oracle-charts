import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MediumRectangleAdProps {
  className?: string;
}

export function MediumRectangleAd({ className }: MediumRectangleAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    // Define the required global configuration object
    (window as any).atOptions = {
      'key' : 'c6b1e8444b3a7f06380d0d84798b4b5c',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };

    // Create the script element
    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/c6b1e8444b3a7f06380d0d84798b4b5c/invoke.js";
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
      className={cn("flex items-center justify-center min-h-[250px] w-[300px] max-w-full mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
