import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, Bell, Bookmark, TrendingUp, Mail, ArrowRight, Check } from "lucide-react";

const STEPS = [
  {
    icon: TrendingUp,
    title: "Read your first AI prediction",
    body: "Every top coin has a daily / weekly / monthly AI forecast with a target price band and confidence score. Start with Bitcoin.",
    cta: "Open Bitcoin Prediction",
    to: "/price-prediction/bitcoin/daily",
  },
  {
    icon: Sparkles,
    title: "Learn how to read the chart",
    body: "A 2-minute interactive tour that highlights the bias badge, price band, technical stack, and accuracy score.",
    cta: "Start interactive tour",
    to: "/tutorial/interactive",
  },
  {
    icon: Bookmark,
    title: "Save coins to your watchlist",
    body: "Pin your favorite tokens for one-click access. Your watchlist syncs across devices when your wallet is connected.",
    cta: "Open Watchlist",
    to: "/my/watchlist",
  },
  {
    icon: Bell,
    title: "Set a price alert",
    body: "Get an email the moment a coin crosses your target — powered by the same alert engine that fires our own daily digest.",
    cta: "Create alert",
    to: "/my/alerts",
  },
  {
    icon: Mail,
    title: "Subscribe to the daily digest",
    body: "One email each morning with top movers, AI signal highlights, and whale flows. Unsubscribe in one click.",
    cta: "Subscribe",
    to: "/#digest",
  },
];

export default function Welcome() {
  useEffect(() => {
    try { localStorage.setItem("ob_welcomed_at", new Date().toISOString()); } catch {}
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Welcome to Oracle Bull — Your 5-Step Quick Start</title>
        <meta name="description" content="New to Oracle Bull? Follow this 5-step tour to read your first AI prediction, save coins, set alerts, and subscribe to the daily digest." />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium mb-3">
          <Check className="w-3.5 h-3.5" /> Wallet connected
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Welcome to Oracle Bull</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Five quick steps to get real value in under 5 minutes. Do them in order or jump around.
        </p>

        <ol className="space-y-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={i} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Step {i + 1}</div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h2>
                    <p className="text-sm text-slate-600 mb-3">{s.body}</p>
                    <Link to={s.to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800">
                      {s.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 p-5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-sm text-slate-600 mb-3">Prefer to dive straight in?</p>
          <Link to="/my" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
            Go to your Hub <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </Layout>
  );
}
