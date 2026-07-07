import { useEffect, useRef } from "react";

interface AdsterraBanner320Props {
  className?: string;
}

export function AdsterraBanner320({ className = "" }: AdsterraBanner320Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.text = `atOptions = { 'key' : '77bf78d1aee783820db24b5061eaa4e3', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };`;
    containerRef.current.appendChild(optionsScript);

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/77bf78d1aee783820db24b5061eaa4e3/invoke.js";
    containerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
