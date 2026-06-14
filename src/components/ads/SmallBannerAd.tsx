import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SmallBannerAdProps {
  className?: string;
}

// 320x50 mobile banner (Adsterra HighPerformanceFormat). Reads the GLOBAL
// `atOptions` var — keep to at most ONE HPF ad (Large/Medium/Small) per page.
// Mobile-only (md:hidden). See LargeBannerAd for the collision note.
const HPF_KEY = "77bf78d1aee783820db24b5061eaa4e3";

export function SmallBannerAd({ className }: SmallBannerAdProps) {
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
        'height' : 50,
        'width' : 320,
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
    };
  }, []);

  return (
    <div
      className={cn("flex md:hidden items-center justify-center min-h-[50px] w-[320px] mx-auto my-4 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
