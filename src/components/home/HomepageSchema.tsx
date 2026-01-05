import { useEffect } from "react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

const baseUrl = "https://oraclebull.com";

export function HomepageSchema() {
  const { data } = useCryptoPrices();
  const prices = data?.prices || [];

  useEffect(() => {
    // Remove any existing homepage-specific schemas
    document.querySelectorAll('script[data-schema="homepage"]').forEach(el => el.remove());

    const schemas: object[] = [];

    // ItemList schema for cryptocurrency prices
    if (prices.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Live Cryptocurrency Prices",
        "description": "Real-time cryptocurrency prices updated every second",
        "numberOfItems": prices.length,
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "itemListElement": prices.slice(0, 20).map((coin, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "FinancialProduct",
            "name": coin.name,
            "description": `${coin.symbol} cryptocurrency with real-time price data`,
            "url": `${baseUrl}/markets/${coin.symbol.toLowerCase()}`,
            "offers": {
              "@type": "Offer",
              "price": coin.price,
              "priceCurrency": "USD",
              "priceValidUntil": new Date(Date.now() + 60000).toISOString() // Valid for 1 minute
            }
          }
        }))
      });
    }

    // WebPage schema specific to homepage
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${baseUrl}/`,
      "name": "Oracle Bull - AI-Powered Crypto Forecasts & Real-Time Blockchain Analytics",
      "description": "Your cosmic guide to crypto markets. Free AI predictions, real-time price charts, whale tracking, and sentiment analysis for Bitcoin, Ethereum, Solana & 1000+ tokens.",
      "url": baseUrl,
      "isPartOf": {
        "@id": `${baseUrl}/#website`
      },
      "about": [
        { "@type": "Thing", "name": "Cryptocurrency Trading" },
        { "@type": "Thing", "name": "Bitcoin Price Prediction" },
        { "@type": "Thing", "name": "Blockchain Analytics" },
        { "@type": "Thing", "name": "Crypto Market Analysis" }
      ],
      "mentions": [
        { "@type": "Thing", "name": "Bitcoin", "sameAs": "https://en.wikipedia.org/wiki/Bitcoin" },
        { "@type": "Thing", "name": "Ethereum", "sameAs": "https://en.wikipedia.org/wiki/Ethereum" },
        { "@type": "Thing", "name": "Solana", "sameAs": "https://en.wikipedia.org/wiki/Solana_(blockchain_platform)" }
      ],
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["#hero-heading", "#seo-content-heading"]
      },
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "Oracle Bull Crypto Analytics",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    });

    // Service schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Cryptocurrency Analytics Platform",
      "provider": {
        "@id": `${baseUrl}/#organization`
      },
      "name": "Oracle Bull Crypto Analytics",
      "description": "Free AI-powered cryptocurrency forecasting platform with real-time price charts, market predictions, whale tracking, and sentiment analysis.",
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Crypto Analytics Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Price Predictions",
              "description": "Daily, weekly, and monthly cryptocurrency price predictions powered by AI"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Whale Tracking",
              "description": "Real-time monitoring of large wallet movements and smart money flows"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Multi-Chain Analytics",
              "description": "Comprehensive blockchain analytics for Ethereum, Solana, Base, and more"
            }
          }
        ]
      }
    });

    // Insert all schemas
    schemas.forEach((schema, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", "homepage");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-schema="homepage"]').forEach(el => el.remove());
    };
  }, [prices]);

  return null;
}
