import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="bg-gradient-primary rounded-3xl p-10 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Ready to Trade Like a Pro?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-[600px] mx-auto mb-8">
            Join 12,000+ traders who wake up to profitable signals every morning. No experience needed. No risk to try.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground font-semibold rounded-lg hover:bg-background/90 transition-colors text-lg"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link
              to="/track-record"
              className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/30 text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/10 transition-colors text-lg"
            >
              View Track Record
            </Link>
          </div>
          <p className="text-sm text-primary-foreground/60">⚡ Takes less than 60 seconds to set up</p>
        </div>
      </div>
    </section>
  );
}
