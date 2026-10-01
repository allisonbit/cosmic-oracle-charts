import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";

// Why-free — an honest one-liner with a link.
export function WhyFreeStrip() {
  return (
    <section className="border-y border-border/30" aria-label="Why it's free">
      <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Heart className="w-4 h-4 text-primary" />
          <span className="section-label">Why it's free</span>
        </div>
        <p className="text-sm text-muted-foreground flex-1">
          We believe market intelligence shouldn't be gated behind paywalls or logins. Oracle Bull stays free so anyone can make informed decisions.
        </p>
        <Link to="/about" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline shrink-0">
          Learn more <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
