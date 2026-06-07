import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("oracle_bull_cookie_consent");
    if (!consent) setIsVisible(true);
  }, []);

  const setConsent = (value: "accepted" | "declined") => {
    localStorage.setItem("oracle_bull_cookie_consent", value);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-[68px] md:bottom-0 z-[100] px-3 pb-3 animate-in slide-in-from-bottom-3 fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-3">
          <Cookie className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
          <p className="text-xs text-muted-foreground leading-snug flex-1 min-w-0">
            We use cookies to improve your experience and serve ads. See our{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConsent("declined")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => setConsent("accepted")}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => setConsent("declined")}
              aria-label="Dismiss"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
