import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, TrendingUp, ShieldCheck, Zap, Star, ChevronDown } from "lucide-react";
import { COIN_META } from "./HowToBuyCoin";

// Search-volume + difficulty hints for the most popular coins. Anything not
// listed here falls back to a sensible default. The GRID itself is sourced from
// COIN_META (the single source of truth for which /how-to-buy/:coin pages exist)
// so the hub can never link to a guide that has no page — and never omits one.
const GUIDE_HINTS: Record<string, { difficulty: string; readTime: string; searches: string }> = {
  bitcoin: { difficulty: "Beginner", readTime: "5 min", searches: "2.4M/mo" },
  ethereum: { difficulty: "Beginner", readTime: "5 min", searches: "1.8M/mo" },
  solana: { difficulty: "Beginner", readTime: "4 min", searches: "980K/mo" },
  ripple: { difficulty: "Beginner", readTime: "4 min", searches: "850K/mo" },
  dogecoin: { difficulty: "Beginner", readTime: "4 min", searches: "720K/mo" },
  cardano: { difficulty: "Beginner", readTime: "5 min", searches: "560K/mo" },
  "shiba-inu": { difficulty: "Beginner", readTime: "4 min", searches: "490K/mo" },
  binancecoin: { difficulty: "Intermediate", readTime: "5 min", searches: "430K/mo" },
  polkadot: { difficulty: "Intermediate", readTime: "5 min", searches: "380K/mo" },
  chainlink: { difficulty: "Intermediate", readTime: "5 min", searches: "310K/mo" },
  "avalanche-2": { difficulty: "Intermediate", readTime: "5 min", searches: "290K/mo" },
  pepe: { difficulty: "Beginner", readTime: "3 min", searches: "270K/mo" },
  arbitrum: { difficulty: "Intermediate", readTime: "6 min", searches: "220K/mo" },
  near: { difficulty: "Intermediate", readTime: "5 min", searches: "180K/mo" },
  aptos: { difficulty: "Intermediate", readTime: "5 min", searches: "170K/mo" },
  sui: { difficulty: "Intermediate", readTime: "5 min", searches: "165K/mo" },
  "render-token": { difficulty: "Advanced", readTime: "6 min", searches: "150K/mo" },
  bittensor: { difficulty: "Advanced", readTime: "6 min", searches: "140K/mo" },
  "injective-protocol": { difficulty: "Advanced", readTime: "6 min", searches: "130K/mo" },
};

// Every guide that actually has a page, ordered by search volume (known coins
// first, then the rest alphabetically by name).
const GUIDES = Object.entries(COIN_META)
  .map(([id, meta]) => ({
    id,
    name: meta.name,
    ticker: meta.ticker,
    ...(GUIDE_HINTS[id] ?? { difficulty: "Beginner", readTime: "5 min", searches: "" }),
  }))
  .sort((a, b) => {
    const av = parseSearches(a.searches);
    const bv = parseSearches(b.searches);
    if (av !== bv) return bv - av;
    return a.name.localeCompare(b.name);
  });

function parseSearches(s: string): number {
  if (!s) return 0;
  const n = parseFloat(s);
  if (s.includes("M")) return n * 1_000_000;
  if (s.includes("K")) return n * 1_000;
  return n;
}

const difficultyColor: Record<string, string> = {
  Beginner: "text-success border-success/30 bg-success/10",
  Intermediate: "text-warning border-warning/30 bg-warning/10",
  Advanced: "text-danger border-danger/30 bg-danger/10",
};

export default function HowToBuyHub() {
  return (
    <Layout>
      <Helmet>
        <title>How to Buy Crypto | Step-by-Step Guides | Oracle Bull</title>
        <meta name="description" content="Learn how to buy Bitcoin, Ethereum, Solana & 30+ cryptos safely. Step-by-step beginner guides with the best exchanges and AI timing tips. Start now." />
        
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <BookOpen className="w-4 h-4" />
              <span>STEP-BY-STEP BUYING GUIDES</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              How to Buy Crypto
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Simple, accurate, up-to-date guides for buying any cryptocurrency safely - with AI-powered tips on <em>when</em> to buy, not just <em>how</em>.
            </p>
            <div className="inline-block px-4 py-2 bg-background/50 border border-border text-xs text-muted-foreground/80 max-w-2xl mx-auto">
              <strong>Advertiser Disclosure:</strong> Oracle Bull is an independent platform. We may receive compensation from the cryptocurrency exchanges or brokers recommended in these guides at no additional cost to you. This compensation does not impact our AI-driven market analysis or ratings.
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { icon: ShieldCheck, label: "Safe Exchanges Only", desc: "We only recommend regulated, insured platforms" },
              { icon: Zap, label: "AI Buy Timing", desc: "Each guide links to live AI signals for entry points" },
              { icon: TrendingUp, label: "Always Updated", desc: "Guides are refreshed with current fee and rate data" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="border-t border-border/30 pt-4 text-center">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-bold text-sm mb-1">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>

          {/* Guides Grid */}
          <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            All Buying Guides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GUIDES.map(guide => (
              <Link
                key={guide.id}
                to={`/how-to-buy/${guide.id}`}
                className="border-t border-border/30 pt-5 group transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold font-display text-lg group-hover:text-primary transition-colors">
                      {guide.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{guide.ticker}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${difficultyColor[guide.difficulty]}`}>
                    {guide.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{guide.readTime} read{guide.searches ? ` - ${guide.searches} searches` : ""}</div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* How to Buy Cryptocurrency: A Beginner's Guide */}
          <section className="border-t border-border/30 pt-6 mt-8">
            <h2 className="text-lg font-display font-bold mb-4">How to Buy Cryptocurrency: A Beginner's Guide</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
              <p className="leading-relaxed">
                Buying cryptocurrency for the first time can feel overwhelming, but the process is straightforward once you understand the steps. Whether you want to buy Bitcoin, Ethereum, Solana, or any of the thousands of altcoins available, the fundamentals are the same. Here is a step-by-step walkthrough to get you from zero to your first crypto purchase safely.
              </p>
              <p className="leading-relaxed">
                <strong>Step 1: Choose a reliable exchange.</strong> You have two main options — centralized exchanges (CEX) like Coinbase, Binance, and Kraken, which work similarly to traditional stock brokers, or decentralized exchanges (DEX) like Uniswap and Raydium, which let you swap tokens directly from a wallet. Beginners should start with a regulated CEX for the simplest experience and strongest buyer protections.
              </p>
              <p className="leading-relaxed">
                <strong>Step 2: Complete identity verification (KYC).</strong> Regulated exchanges require government-issued ID and sometimes a selfie or proof of address. This is a legal requirement in most jurisdictions and protects both you and the platform. Verification typically takes minutes but can take up to 48 hours during high-demand periods.
              </p>
              <p className="leading-relaxed">
                <strong>Step 3: Fund your account.</strong> Most exchanges accept bank transfers (ACH, SEPA, wire), debit and credit cards, and sometimes Apple Pay or Google Pay. Bank transfers usually have the lowest fees. Some platforms also let you deposit other cryptocurrencies if you already hold some.
              </p>
              <p className="leading-relaxed">
                <strong>Step 4: Place your first order.</strong> A <em>market order</em> buys at the current price instantly — best for beginners who want simplicity. A <em>limit order</em> lets you set the exact price you want to pay — better for experienced traders looking to enter at a specific level. Start small until you are comfortable with the process.
              </p>
              <p className="leading-relaxed">
                <strong>Step 5: Secure your crypto.</strong> Enable two-factor authentication (2FA) on your exchange account immediately. For larger holdings, consider moving your crypto to a hardware wallet like Ledger or Trezor, which keeps your private keys offline and safe from online threats. Never share your seed phrase with anyone.
              </p>
              <p className="leading-relaxed">
                <strong>Common mistakes beginners make:</strong> buying based on social media hype without research, investing more than they can afford to lose, ignoring fees that eat into small purchases, and leaving large amounts on exchanges without proper security. Use the <Link to="/tools/profit-calculator" className="text-primary hover:underline">profit calculator</Link> to understand fee impact, the <Link to="/tools/dca-calculator" className="text-primary hover:underline">DCA calculator</Link> to plan a consistent buying strategy, and check <Link to="/predictions" className="text-primary hover:underline">AI predictions</Link> for data-driven entry timing rather than guessing.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-border/30 pt-6 mt-8">
            <h2 className="text-lg font-display font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-none">
              <details className="group border-b border-border/20 py-3">
                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between">
                  What is the safest way to buy crypto?
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">The safest way is to use a regulated, well-established exchange like Coinbase, Kraken, or Binance, enable two-factor authentication, and transfer larger holdings to a hardware wallet. Avoid buying crypto through social media links, unverified apps, or peer-to-peer trades unless you fully understand the risks.</p>
              </details>
              <details className="group border-b border-border/20 py-3">
                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between">
                  How much money do I need to start?
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Most exchanges let you start with as little as $1 to $10. There is no minimum investment required to buy cryptocurrency — you can purchase fractional amounts of any coin. Start with an amount you are comfortable losing while you learn how the market works.</p>
              </details>
              <details className="group border-b border-border/20 py-3">
                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between">
                  Which exchange should I use?
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">It depends on your location and experience level. Coinbase is the most beginner-friendly option in the US and Europe. Binance offers the widest selection of tokens and lowest fees globally. Kraken is known for strong security and competitive fees. Each guide above includes exchange recommendations specific to that coin.</p>
              </details>
              <details className="group border-b border-border/20 py-3">
                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between">
                  Should I buy Bitcoin or altcoins first?
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Most experienced investors recommend starting with Bitcoin or Ethereum because they are the most established and liquid cryptocurrencies. Once you understand how the market works, you can research altcoins that align with your investment thesis. Diversifying across a few well-researched assets is generally safer than concentrating everything in one small-cap coin.</p>
              </details>
              <details className="group border-b border-border/20 py-3">
                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between">
                  How do I store my cryptocurrency safely?
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">For small amounts, keeping crypto on a reputable exchange with 2FA enabled is acceptable. For larger holdings, use a hardware wallet (Ledger, Trezor) that stores your private keys offline. Always back up your recovery seed phrase on paper and store it in a secure physical location — never digitally. Never share your seed phrase or private keys with anyone.</p>
              </details>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
