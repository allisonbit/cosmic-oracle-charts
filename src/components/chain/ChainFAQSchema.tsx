import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { ChainConfig } from "@/lib/chainConfig";

interface ChainFAQSchemaProps {
  chain: ChainConfig;
  priceData?: {
    price: number;
    change24h: number;
    marketCap: number;
  };
}

export function ChainFAQSchema({ chain, priceData }: ChainFAQSchemaProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const faqSchema = useMemo(() => {
    const price = formatPrice(priceData?.price || 0);
    const change = priceData?.change24h?.toFixed(2) || '0';
    const marketCap = formatMarketCap(priceData?.marketCap || 0);
    const trend = (priceData?.change24h || 0) >= 0 ? 'up' : 'down';
    const trendPercent = Math.abs(priceData?.change24h || 0).toFixed(2);

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `Is ${chain.name} a good investment?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${chain.name} (${chain.symbol}) is currently priced at ${price} with a market cap of ${marketCap}. The 24-hour change is ${change >= '0' ? '+' : ''}${change}%. As a ${chain.category === 'layer1' ? 'Layer 1 blockchain' : chain.category === 'layer2' ? 'Layer 2 scaling solution' : 'sidechain'}, ${chain.name} offers unique features like ${chain.consensus} consensus with approximately ${chain.tps} TPS. Always do your own research and consider the risks before investing. Updated: ${currentDate}.`
          }
        },
        {
          "@type": "Question",
          "name": `What is the ${chain.name} price prediction today?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${chain.name} (${chain.symbol}) is currently trading at ${price}, ${trend} ${trendPercent}% in the last 24 hours. For detailed ${chain.symbol} price predictions including daily, weekly, and monthly forecasts, visit our ${chain.name} prediction page on Oracle Bull.`
          }
        },
        {
          "@type": "Question",
          "name": `Will ${chain.name} go up today?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${chain.name} has ${trend === 'up' ? 'increased' : 'decreased'} by ${trendPercent}% in the last 24 hours. The current price is ${price}. Check our real-time ${chain.name} analysis and AI predictions for today's outlook.`
          }
        },
        {
          "@type": "Question",
          "name": `What is ${chain.name} used for?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${chain.name} is a ${chain.category === 'layer1' ? 'Layer 1 blockchain' : chain.category === 'layer2' ? 'Layer 2 scaling solution' : 'sidechain'} that uses ${chain.consensus} for consensus. It supports DeFi applications, NFTs, and smart contracts. Popular tokens on ${chain.name} include ${chain.tokens.slice(0, 5).join(', ')}.`
          }
        },
        {
          "@type": "Question",
          "name": `How fast is ${chain.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${chain.name} can process approximately ${chain.tps?.toLocaleString() || 'multiple'} transactions per second (TPS) using its ${chain.consensus} consensus mechanism. This makes it ${chain.tps && chain.tps > 1000 ? 'one of the faster' : 'a reliable'} blockchain networks available.`
          }
        },
        {
          "@type": "Question",
          "name": `Where can I buy ${chain.symbol}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${chain.symbol} can be purchased on major centralized exchanges like Binance, Coinbase, and Kraken, as well as decentralized exchanges. Always verify you're using official platforms and consider the risks involved in cryptocurrency trading.`
          }
        }
      ],
      "dateModified": new Date().toISOString()
    };
  }, [chain, priceData, currentDate]);

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}

// Visual FAQ component for on-page display
interface ChainFAQDisplayProps {
  chain: ChainConfig;
  priceData?: {
    price: number;
    change24h: number;
    marketCap: number;
  };
}

export function ChainFAQDisplay({ chain, priceData }: ChainFAQDisplayProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  const faqs = [
    {
      question: `Is ${chain.name} a good investment?`,
      answer: `${chain.name} is a ${chain.category === 'layer1' ? 'Layer 1 blockchain' : chain.category === 'layer2' ? 'Layer 2 solution' : 'sidechain'} with ${chain.consensus}. Current price: ${formatPrice(priceData?.price || 0)}. Always research before investing.`
    },
    {
      question: `What is the ${chain.name} price prediction today?`,
      answer: `View our detailed ${chain.symbol} predictions for daily, weekly, and monthly forecasts based on AI analysis.`
    },
    {
      question: `How fast is ${chain.name}?`,
      answer: `${chain.name} processes ~${chain.tps?.toLocaleString() || 'many'} TPS using ${chain.consensus}.`
    }
  ];

  return (
    <section className="holo-card p-6">
      <h2 className="font-display text-xl font-bold mb-4">
        Frequently Asked Questions about {chain.name}
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-border/30 pb-4 last:border-0">
            <h3 className="font-medium text-foreground mb-2">{faq.question}</h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}