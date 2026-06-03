import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem("oracle_bull_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("oracle_bull_cookie_consent", "accepted");
    setIsVisible(false);
    // Here you could initialize Google Analytics / AdSense scripts
  };

  const handleDecline = () => {
    localStorage.setItem("oracle_bull_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-5">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shrink-0 hidden sm:block">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                We use cookies and similar technologies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies in accordance with our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium bg-background/50 border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              Decline Optional
            </button>
            <button
              onClick={handleAccept}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:bg-muted rounded-lg sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
