import { Link } from "react-router-dom";
import { ArrowRight, Zap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsletterCTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" aria-labelledby="newsletter-cta-heading">
      {/* Deep glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-10 md:p-16 text-center shadow-[0_0_80px_-30px_hsl(var(--primary))]">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8">
            <Bell className="w-3.5 h-3.5" />
            Start for Free — No Card Required
          </div>

          <h2 id="newsletter-cta-heading" className="text-[clamp(2rem,5vw,3.5rem)] font-display font-extrabold leading-tight mb-6">
            Your Next Winning Trade<br />
            <span className="text-gradient-cosmic">Starts Here.</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Access AI-powered predictions, whale alerts, real-time dashboards, and multi-chain analytics — all completely free.
            Join 100,000+ traders who have already made the switch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-10 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:scale-[1.02] transition-all active:scale-[0.98]">
              <Link to="/dashboard">
                <Zap className="w-5 h-5 mr-2" />
                Launch Free Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-base font-semibold rounded-2xl border-border/50 bg-background/50 backdrop-blur-md hover:bg-accent transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/predictions">
                View AI Predictions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Trust micro-copy */}
          <p className="text-muted-foreground/60 text-xs mt-8">
            No signup · No credit card · 100% free forever
          </p>
        </div>
      </div>
    </section>
  );
}
