import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { Calendar, ArrowRight } from "lucide-react";

function getRecentWeeks(count: number): { slug: string; label: string }[] {
  const weeks: { slug: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    const slug = `${d.getFullYear()}-w${String(week).padStart(2, "0")}`;
    const label = `Week ${week}, ${d.getFullYear()}`;
    if (!weeks.find(w => w.slug === slug)) {
      weeks.push({ slug, label });
    }
  }
  return weeks;
}

export default function ReportsIndex() {
  const weeks = getRecentWeeks(12);

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO />
      <Helmet>
        <title>Weekly Crypto Reports — State of the Market | Oracle Bull</title>
        <meta name="description" content="Weekly crypto market reports with top gainers, losers, sentiment analysis, and AI prediction accuracy. Free, auto-generated every Monday." />
        <link rel="canonical" href="https://oraclebull.com/reports" />
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Weekly Crypto Reports
          </h1>
          <p className="text-muted-foreground text-lg">
            Auto-generated State of Crypto reports covering market performance, top movers, sentiment, and asset strength.
          </p>
        </div>

        <div className="space-y-3">
          {weeks.map((week) => (
            <Link
              key={week.slug}
              to={`/reports/${week.slug}`}
              className="flex items-center justify-between bg-card rounded-xl border p-4 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">State of Crypto — {week.label}</div>
                  <div className="text-xs text-muted-foreground">{week.slug}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
