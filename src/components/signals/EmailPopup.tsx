import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function EmailPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const dismissed = localStorage.getItem("ob-popup-dismissed");
    if (dismissed) return;

    // Show after 30s
    const timer = setTimeout(() => setShow(true), 30000);

    // Exit intent
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem("ob-popup-dismissed")) {
        setShow(true);
      }
    };
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("ob-popup-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X size={20} />
        </button>
        <h3 className="text-2xl font-bold text-foreground mb-2">Get 3 Free Signals This Week 📈</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Join 12,000+ traders receiving our best signals and market analysis. No spam. Unsubscribe anytime.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={dismiss}
            className="px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Send Me Signals →
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">🔒 We respect your privacy. No spam ever.</p>
      </div>
    </div>
  );
}
