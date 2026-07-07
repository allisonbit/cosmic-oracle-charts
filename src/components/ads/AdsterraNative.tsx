import { useEffect, useRef } from "react";

interface AdsterraNativeProps {
  className?: string;
}

export function AdsterraNative({ className = "" }: AdsterraNativeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://pl29658578.effectivecpmnetwork.com/112d36e242e4511b336ebcf2ab32171f/invoke.js";
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className={className}>
      <div id="container-112d36e242e4511b336ebcf2ab32171f" ref={containerRef} />
    </div>
  );
}
