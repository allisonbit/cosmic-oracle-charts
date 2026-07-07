import { useEffect, useRef, useState } from "react";

export function AdsterraStickyBanner() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const loadedDesktop = useRef(false);
  const loadedMobile = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (loadedDesktop.current || !desktopRef.current) return;
    loadedDesktop.current = true;

    const opts = document.createElement("script");
    opts.type = "text/javascript";
    opts.text = `atOptions = { 'key' : '42c0ffb054b17a9a444907f2efaf44e8', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };`;
    desktopRef.current.appendChild(opts);

    const invoke = document.createElement("script");
    invoke.type = "text/javascript";
    invoke.src = "https://www.highperformanceformat.com/42c0ffb054b17a9a444907f2efaf44e8/invoke.js";
    desktopRef.current.appendChild(invoke);
  }, []);

  useEffect(() => {
    if (loadedMobile.current || !mobileRef.current) return;
    loadedMobile.current = true;

    const opts = document.createElement("script");
    opts.type = "text/javascript";
    opts.text = `atOptions = { 'key' : '77bf78d1aee783820db24b5061eaa4e3', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };`;
    mobileRef.current.appendChild(opts);

    const invoke = document.createElement("script");
    invoke.type = "text/javascript";
    invoke.src = "https://www.highperformanceformat.com/77bf78d1aee783820db24b5061eaa4e3/invoke.js";
    mobileRef.current.appendChild(invoke);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-sm border-t border-border/50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] pb-safe">
      <button
        onClick={() => setDismissed(true)}
        className="absolute -top-6 right-2 bg-background/90 border border-border/50 rounded-t-md px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close ad"
      >
        Close
      </button>
      <div className="flex justify-center py-1">
        <div ref={desktopRef} className="hidden md:block" />
        <div ref={mobileRef} className="block md:hidden" />
      </div>
    </div>
  );
}
