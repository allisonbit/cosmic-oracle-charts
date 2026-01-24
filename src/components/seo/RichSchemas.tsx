import { useEffect } from "react";

const baseUrl = "https://cosmic-oracle-charts.lovable.app";

// Organization schema for site-wide authority
export function OrganizationSchema() {
  useEffect(() => {
    document.querySelectorAll('script[data-schema="organization"]').forEach(el => el.remove());
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "Oracle Bull",
      "alternateName": "OracleBull",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/oracle-bull-logo.jpg`,
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://twitter.com/oracle_bulls"
      ],
      "description": "AI-powered cryptocurrency analytics platform providing real-time price forecasts, whale tracking, sentiment analysis, and market intelligence for Bitcoin, Ethereum, and 1000+ tokens.",
      "foundingDate": "2024",
      "knowsAbout": [
        "Cryptocurrency Trading",
        "Bitcoin Price Prediction",
        "Ethereum Analysis",
        "Blockchain Analytics",
        "Market Sentiment Analysis",
        "Whale Tracking",
        "DeFi Analytics"
      ],
      "areaServed": "Worldwide"
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "organization");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="organization"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}

// WebSite schema with SearchAction for sitelinks search box
export function WebSiteSchema() {
  useEffect(() => {
    document.querySelectorAll('script[data-schema="website"]').forEach(el => el.remove());
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "name": "Oracle Bull",
      "url": baseUrl,
      "description": "Free AI-powered crypto forecasting platform with real-time analytics",
      "publisher": {
        "@id": `${baseUrl}/#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/predictions?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "en-US"
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "website");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="website"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}

// BreadcrumbList schema generator
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  useEffect(() => {
    if (items.length === 0) return;
    
    document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
      }))
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "breadcrumb");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());
    };
  }, [items]);

  return null;
}

// SoftwareApplication schema for the platform
export function SoftwareApplicationSchema() {
  useEffect(() => {
    document.querySelectorAll('script[data-schema="software"]').forEach(el => el.remove());
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Oracle Bull Crypto Analytics",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "AI Price Predictions",
        "Real-time Price Charts",
        "Whale Activity Tracking",
        "Market Sentiment Analysis",
        "Multi-Chain Analytics",
        "Token Discovery Engine",
        "Portfolio Tracking"
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "software");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="software"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}

// HowTo schema for tutorial/educational content
interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

export function HowToSchema({ 
  name, 
  description, 
  steps,
  totalTime = "PT5M"
}: { 
  name: string; 
  description: string; 
  steps: HowToStep[];
  totalTime?: string;
}) {
  useEffect(() => {
    document.querySelectorAll('script[data-schema="howto"]').forEach(el => el.remove());
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": name,
      "description": description,
      "totalTime": totalTime,
      "step": steps.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.name,
        "text": step.text,
        ...(step.url && { "url": step.url.startsWith('http') ? step.url : `${baseUrl}${step.url}` })
      }))
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "howto");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="howto"]').forEach(el => el.remove());
    };
  }, [name, description, steps, totalTime]);

  return null;
}

// Product schema for cryptocurrency analysis products
export function CryptoProductSchema({ 
  name, 
  symbol, 
  description,
  price,
  priceChange 
}: { 
  name: string; 
  symbol: string; 
  description: string;
  price?: number;
  priceChange?: number;
}) {
  useEffect(() => {
    document.querySelectorAll('script[data-schema="product"]').forEach(el => el.remove());
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": `${name} (${symbol}) Analysis`,
      "description": description,
      "provider": {
        "@id": `${baseUrl}/#organization`
      },
      "url": `${baseUrl}/price-prediction/${name.toLowerCase().replace(/\s+/g, '-')}/daily`,
      ...(price && {
        "offers": {
          "@type": "Offer",
          "price": price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": new Date(Date.now() + 3600000).toISOString()
        }
      })
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "product");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="product"]').forEach(el => el.remove());
    };
  }, [name, symbol, description, price, priceChange]);

  return null;
}

// Combined global schemas that should be on every page
export function GlobalSchemas() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <SoftwareApplicationSchema />
    </>
  );
}
