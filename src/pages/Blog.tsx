import { SignalsLayout } from "@/components/signals/SignalsLayout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const posts = [
  { slug: "bitcoin-weekly-analysis-bull-run", category: "Market Analysis", title: "Bitcoin Weekly Analysis: Is the Bull Run Just Getting Started?", excerpt: "Our technical breakdown of BTC's current structure and where we see it heading...", date: "June 10, 2025", readTime: "8 min read", author: "Alex Mercer", initials: "AM" },
  { slug: "crypto-trading-beginners-guide-2025", category: "Education", title: "Crypto Trading for Beginners: The Complete 2025 Guide", excerpt: "Everything you need to know to start trading cryptocurrency, from zero...", date: "June 7, 2025", readTime: "15 min read", author: "Ryan Chen", initials: "RC" },
  { slug: "may-2025-performance-report", category: "Signal Review", title: "May 2025 Performance Report: +38.9% Return", excerpt: "Complete breakdown of every signal we sent in May, including what worked and what didn't...", date: "June 2, 2025", readTime: "6 min read", author: "Alex Mercer", initials: "AM" },
  { slug: "risk-management-winners-losers", category: "Education", title: "Risk Management: The Skill That Separates Winners From Losers", excerpt: "Why position sizing and stop-losses matter more than your win rate...", date: "May 28, 2025", readTime: "10 min read", author: "Ryan Chen", initials: "RC" },
  { slug: "top-5-altcoins-watch", category: "Market Analysis", title: "Top 5 Altcoins to Watch This Month", excerpt: "Our analysts break down the most promising setups across major altcoins...", date: "May 22, 2025", readTime: "7 min read", author: "Alex Mercer", initials: "AM" },
  { slug: "how-to-use-crypto-signals", category: "Guide", title: "How to Use Crypto Signals to Make Money (Step-by-Step)", excerpt: "A practical walkthrough of how to receive, interpret, and execute trading signals...", date: "May 18, 2025", readTime: "12 min read", author: "Lisa Park", initials: "LP" },
];

export default function Blog() {
  return (
    <SignalsLayout>
      <Helmet>
        <title>Blog — OracleBull Market Insights & Education</title>
        <meta name="description" content="Free crypto analysis, trading tutorials, and market commentary from OracleBull's expert team." />
      </Helmet>

      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Market Insights & Education</h1>
            <p className="text-lg text-muted-foreground">Free analysis, tutorials, and market commentary from our team</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="bg-card border border-border rounded-xl overflow-hidden card-glow group">
                  <div className="h-40 bg-muted flex items-center justify-center text-4xl">📊</div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{post.category}</span>
                    <h3 className="text-lg font-bold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{post.initials}</div>
                      <span className="text-xs text-muted-foreground">{post.author}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 hidden lg:block">
              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-bold text-foreground mb-3">Subscribe to Newsletter</h4>
                <p className="text-sm text-muted-foreground mb-4">Weekly market insights delivered to your inbox</p>
                <input type="email" placeholder="Your email" className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground mb-3 placeholder:text-muted-foreground" />
                <button className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90">Subscribe</button>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-bold text-foreground mb-3">Popular Posts</h4>
                <ul className="space-y-3">
                  {posts.slice(0, 3).map((p) => (
                    <li key={p.slug}>
                      <Link to={`/blog/${p.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-2">{p.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SignalsLayout>
  );
}
