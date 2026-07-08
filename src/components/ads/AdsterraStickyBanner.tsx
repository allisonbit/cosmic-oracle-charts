import { useEffect, useRef, useState } from "react";

export function AdsterraStickyBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const isMobile = window.innerWidth < 768;

    const key = isMobile
      ? "77bf78d1aee783820db24b5061eaa4e3"
      : "42c0ffb054b17a9a444907f2efaf44e8";
    const height = isMobile ? 50 : 90;
    const width = isMobile ? 320 : 728;

    const opts = document.createElement("script");
    opts.type = "text/javascript";
    opts.text = `atOptions = { 'key' : '${key}', 'format' : 'iframe', 'height' : ${height}, 'width' : ${width}, 'params' : {} };`;
    containerRef.current.appendChild(opts);

    const invoke = document.createElement("script");
    invoke.type = "text/javascript";
    invoke.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
    containerRef.current.appendChild(invoke);

    const observer = new MutationObserver(() => {
      const el = containerRef.current;
      if (!el) return;
      const iframe = el.querySelector("iframe");
      if (iframe) {
        setHasAd(true);
        observer.disconnect();
      }
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });

    const timeout = setTimeout(() => {
      observer.disconnect();
    }, 10000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobileView ? 56 : 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        display: hasAd ? "block" : "none",
        textAlign: "center",
        backgroundColor: "#000",
      }}
    >
      <div ref={containerRef} />
    </div>
  );
}
