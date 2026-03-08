import { useState, useEffect } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("ob-cookies");
    if (!accepted) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    setShow(false);
    localStorage.setItem("ob-cookies", "accepted");
  };

  const decline = () => {
    setShow(false);
    localStorage.setItem("ob-cookies", "declined");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={decline} className="px-4 py-2 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors">
            Decline
          </button>
          <button onClick={accept} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
