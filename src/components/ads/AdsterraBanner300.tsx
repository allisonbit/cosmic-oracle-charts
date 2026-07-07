import { useEffect, useRef } from "react";

interface AdsterraBanner300Props {
  className?: string;
}

export function AdsterraBanner300({ className = "" }: AdsterraBanner300Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.text = `atOptions = { 'key' : 'c6b1e8444b3a7f06380d0d84798b4b5c', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
    containerRef.current.appendChild(optionsScript);

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/c6b1e8444b3a7f06380d0d84798b4b5c/invoke.js";
    containerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
