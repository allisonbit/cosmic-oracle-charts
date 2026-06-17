import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MediumRectangleAdProps {
  className?: string;
}

// 300x250 rectangle (Adsterra HighPerformanceFormat). Reads the GLOBAL `atOptions`
// var — keep to at most ONE HPF ad (Large/Medium/Small) per page. See LargeBannerAd.
const HPF_KEY = "c6b1e8444b3a7f06380d0d84798b4b5c";

export function MediumRectangleAd({ className }: MediumRectangleAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;
    if (typeof window !== "undefined") (window as any).__hpfMounted = true;

    const container = containerRef.current;
    const configScript = document.createElement("script");
    configScript.textContent = `
      var atOptions = {
        'key' : '${HPF_KEY}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highperformanceformat.com/${HPF_KEY}/invoke.js`;
    invokeScript.async = true;

    container.appendChild(configScript);
    container.appendChild(invokeScript);

    return () => {
      container.innerHTML = "";
      injected.current = false;
      if (typeof window !== "undefined") (window as any).__hpfMounted = false;
    };
  }, []);

  return (
    <div
      className={cn("flex items-center justify-center min-h-[250px] w-[300px] max-w-full mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
