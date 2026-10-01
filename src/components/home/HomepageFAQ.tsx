import { ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Oracle Bull's prediction engine work?",
    answer: "Every forecast is computed in your browser from real market history — no black box. The engine ingests live OHLC price series and computes actual technical indicators: RSI(14) for momentum extremes, MACD for trend direction, MA20/MA50 crossovers for trend structure, Bollinger Bands for volatility positioning, and realized volatility to size every entry zone, stop and target to the coin's true behavior. Each prediction ships with a bias, a confidence score, and a plain-English summary naming the exact numbers behind the read. If there isn't enough history to compute a real forecast, the engine refuses to show one — we never fabricate a prediction from thin data.",
  },
  {
    question: "How do you prove the predictions are any good?",
    answer: "We publish the engine's full track record on the Accuracy leaderboard. The same prediction function that powers today's live calls is replayed over the last 90 days of real price history for the major coins — roughly 4,000 graded calls — and every outcome is counted: hits and misses alike. You can sort by hit rate, sample size and confidence, and refresh the backtest yourself to verify the numbers. Most sites never show you their misses; we count them.",
  },
  {
    question: "What is the Daily Prediction Game?",
    answer: "One free call per day: will Bitcoin close up or down today? Lock your pick, come back tomorrow, and it's graded against the real closing price. Build a streak, earn badges and levels — all stored on your device, no signup, no wallet connection. It's the fastest way to test your own market read against ours.",
  },
  {
    question: "Which blockchains does Oracle Bull cover?",
    answer: "We track eight major networks — Ethereum, Solana, Bitcoin, BNB Chain, Arbitrum, Base, Polygon and Avalanche — with side-by-side comparisons of transactions per second, fees, finality time, TVL and active users on the dashboard. Because capital rotates between chains, watching where flows move next often explains the price action before it happens on any single token.",
  },
  {
    question: "Is Oracle Bull free to use?",
    answer: "Yes. Oracle Bull is 100% free with no signup required — including AI predictions, whale tracking, sentiment analysis and blockchain dashboards. The platform is sustained through non-intrusive advertising partnerships. There are no premium tiers, paywalls, or hidden fees.",
  },
  {
    question: "How accurate are the crypto predictions?",
    answer: "Honestly: close to a coin flip on direction — and we publish that. Our live 90-day backtest of the major coins runs right around 50% hit rate, which is what most short-horizon directional models achieve and why position sizing matters more than any single call. Every prediction includes a confidence score and the exact indicators behind it, and the full per-coin breakdown lives on the Accuracy page. Treat every signal as a research input, never financial advice.",
  },
  {
    question: "Which cryptocurrencies are covered?",
    answer: "Bitcoin, Ethereum, Solana, XRP, BNB and 1,000+ tokens, with dedicated AI prediction pages for the top coins. We provide real-time pricing, whale tracking and on-chain analytics across all supported assets.",
  },
  {
    question: "What is Oracle Bull and how does it work?",
    answer: "Oracle Bull is a free AI-powered cryptocurrency analytics platform that provides real-time price predictions, whale tracking, sentiment analysis, and on-chain intelligence across 1,000+ tokens and 8 blockchains. Our technical engine computes RSI, MACD, moving averages and volatility from real market history to generate forecasts with confidence scores.",
  },
  {
    question: "What cryptocurrencies and blockchains do you support?",
    answer: "Oracle Bull tracks 1,000+ cryptocurrencies across 8 major blockchains: Ethereum, Solana, Bitcoin, BNB Chain, Arbitrum, Base, Polygon, and Avalanche. We provide real-time pricing, AI predictions, whale tracking, and on-chain analytics for all supported tokens.",
  },
  {
    question: "How does the whale tracking feature work?",
    answer: "Our whale tracker monitors large wallet movements across supported blockchains in real-time. When wallets holding significant amounts of tokens make transfers, accumulate, or distribute, we detect these movements and surface them. This helps identify smart money flows before they impact market prices.",
  },
  {
    question: "Can I track my own cryptocurrency portfolio?",
    answer: "Yes! Our Wallet Scanner allows you to paste any EVM or Solana wallet address to instantly see holdings distribution, portfolio performance, AI-driven risk assessment, and trading recommendations — all without connecting your wallet or sharing private keys.",
  },
  {
    question: "How often is the market data updated?",
    answer: "Prices and market stats come from CoinGecko's live feeds and refresh roughly every 1–2 minutes. Prediction pages compute fresh forecasts from the latest 90-day history, and the Fear & Greed Index updates daily at its source. Frequently-viewed data is cached briefly on your device so pages load instantly without hammering the free APIs that make the site possible.",
  },
  {
    question: "Is Oracle Bull financial advice?",
    answer: "No. Oracle Bull provides market analysis and educational insights only. All predictions, signals, and data are for informational purposes and should not be considered financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions.",
  },
];

export function HomepageFAQ() {
  // FAQ schema for Google rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <section className="py-10 md:py-14 border-t border-border/30" aria-labelledby="faq-heading">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase mb-4">
            FAQ
          </span>
          <h2 id="faq-heading" className="text-[clamp(1.25rem,4vw,2.25rem)] font-display font-bold">
            Frequently Asked <span className="text-gradient-cosmic">Questions</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm md:text-base">
            Everything you need to know about Oracle Bull's free crypto analytics platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-b border-border/30 last:border-b-0"
              >
                <AccordionTrigger className="text-sm md:text-base font-medium text-foreground hover:text-primary py-4 md:py-5 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 md:pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
