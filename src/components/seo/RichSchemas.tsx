import { useEffect } from "react";
import { SITE_URL } from "@/lib/siteConfig";

const baseUrl = SITE_URL;

// NOTE: Organization, WebSite and SoftwareApplication are emitted ONCE as static
// JSON-LD in index.html (the site-identity graph). They are intentionally NOT
// React components here anymore — re-emitting them per-route caused duplicate
// Organization/WebSite/SoftwareApplication entities across the site.
//
// The reusable, page-specific schema helpers below remain available for any page
// that needs them (breadcrumbs, how-to guides, per-coin product schema).

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
