import { useEffect, useRef } from "react";

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner({ className = "" }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.text = `atOptions = { 'key' : '42c0ffb054b17a9a444907f2efaf44e8', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };`;
    containerRef.current.appendChild(optionsScript);

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/42c0ffb054b17a9a444907f2efaf44e8/invoke.js";
    containerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
