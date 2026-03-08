import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Star, Bell, PieChart, Settings, Sparkles, MessageCircle, Crown, ArrowRight, Wallet, Zap, DollarSign, Users, BookOpen, Newspaper, Repeat, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const hubPages = [
  { path: "/my/watchlist", label: "Watchlist", desc: "Track your favorite coins with live prices", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { path: "/my/portfolio", label: "Portfolio", desc: "Monitor holdings & allocation overview", icon: PieChart, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { path: "/my/tracker", label: "P&L Tracker", desc: "Track buy prices & real profit/loss", icon: DollarSign, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { path: "/my/journal", label: "Trade Journal", desc: "Log trades, track win rate & performance", icon: BookOpen, color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/20" },
  { path: "/my/alerts", label: "Price Alerts", desc: "Set targets & get notified when they trigger", icon: Bell, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { path: "/my/signals", label: "AI Signals", desc: "AI-powered buy/sell signals for your coins", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { path: "/my/news", label: "News Feed", desc: "Personalized alerts, whale moves & market news", icon: Newspaper, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  { path: "/my/dca", label: "DCA Planner", desc: "Dollar-cost average plans & performance", icon: Repeat, color: "text-lime-500", bg: "bg-lime-500/10 border-lime-500/20" },
  { path: "/my/copy", label: "Copy Trading", desc: "Follow top traders & copy their strategies", icon: Copy, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  { path: "/my/scanner", label: "Wallet Scanner", desc: "Analyze any wallet — holdings & risk", icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { path: "/my/social", label: "Social & Leaderboard", desc: "Share predictions, compete on accuracy", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { path: "/my/settings", label: "Settings", desc: "Profile, notifications & plan management", icon: Settings, color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
];

function HubContent() {
  const { profile } = useAuth();
  const isPremium = (profile as any)?.is_premium === true;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.display_name ? `Welcome, ${profile.display_name.split(" ")[0]}` : "My Hub"}
              </h1>
              <p className="text-sm text-muted-foreground">Your personal crypto command center</p>
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-accent">Premium</span>
            </div>
          )}
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubPages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className={cn(
                "group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                page.bg
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", page.bg)}>
                <page.icon className={cn("w-6 h-6", page.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground">{page.label}</h2>
                <p className="text-sm text-muted-foreground">{page.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {/* AI Chat callout */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">Oracle Bull AI Chat</h2>
            <p className="text-sm text-muted-foreground">Ask anything about crypto — powered by live market data. Use the chat bubble in the bottom-right corner.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function MyHub() {
  return (
    <ProtectedRoute>
      <HubContent />
    </ProtectedRoute>
  );
}
