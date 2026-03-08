import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Oracle Bull and how does it work?",
    answer: "Oracle Bull is a free AI-powered cryptocurrency analytics platform that provides real-time price predictions, whale tracking, sentiment analysis, and on-chain intelligence across 18,000+ tokens and 8 blockchains. Our AI models analyze 50+ technical indicators, market sentiment, and on-chain data to generate forecasts with confidence scores.",
  },
  {
    question: "Is Oracle Bull really free? What's the catch?",
    answer: "Yes, Oracle Bull is 100% free with no signup required. All tools including AI predictions, the live dashboard, wallet scanner, and educational content are fully accessible. The platform is sustained through non-intrusive advertising partnerships. There are no premium tiers, paywalls, or hidden fees.",
  },
  {
    question: "How accurate are the AI price predictions?",
    answer: "Our AI prediction models maintain an average accuracy of approximately 85% based on 30-day rolling evaluations. Each prediction includes a confidence score (e.g., 82% confidence) and key factor analysis showing which indicators influenced the forecast. We publish our prediction leaderboard with historical accuracy data for full transparency.",
  },
  {
    question: "What cryptocurrencies and blockchains do you support?",
    answer: "Oracle Bull tracks 18,000+ cryptocurrencies across 8 major blockchains: Ethereum, Solana, Bitcoin, BNB Chain, Arbitrum, Base, Polygon, and Avalanche. We provide real-time pricing, AI predictions, whale tracking, and on-chain analytics for all supported tokens.",
  },
  {
    question: "How does the whale tracking feature work?",
    answer: "Our whale tracker monitors large wallet movements across supported blockchains in real-time. When wallets holding significant amounts of tokens make transfers, accumulate, or distribute, we detect these movements and alert users. This helps identify smart money flows before they impact market prices.",
  },
  {
    question: "Can I track my own cryptocurrency portfolio?",
    answer: "Yes! Our Wallet Scanner allows you to paste any EVM or Solana wallet address to instantly see holdings distribution, portfolio performance, AI-driven risk assessment, and trading recommendations — all without connecting your wallet or sharing private keys.",
  },
  {
    question: "How often is the market data updated?",
    answer: "Price data is updated in real-time via live feeds from major exchanges. AI predictions are refreshed every hour. Market sentiment and social data are updated every 5 minutes. On-chain metrics including TVL, gas prices, and transaction volumes update every 15 seconds.",
  },
  {
    question: "Is Oracle Bull financial advice?",
    answer: "No. Oracle Bull provides market analysis and educational insights only. All predictions, signals, and data are for informational purposes and should not be considered financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions.",
  },
];

export function HomepageFAQ() {
  // Inject FAQ schema for Google rich snippets
  useEffect(() => {
    document.querySelectorAll('script[data-schema="homepage-faq"]').forEach(el => el.remove());

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "homepage-faq");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="homepage-faq"]').forEach(el => el.remove());
    };
  }, []);

  return (
    <section className="py-12 md:py-20 border-t border-border/30" aria-labelledby="faq-heading">
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
                className="border border-border/50 rounded-xl px-5 md:px-6 bg-card/50 data-[state=open]:border-primary/30 transition-colors"
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
