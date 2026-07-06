import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

// ── SetupSchema — per-setup structured data ───────────────────────────────────
// Emits an Investment/Recommendation-flavored JSON-LD describing THIS coin's
// trade setup (direction, entry, target, stop, confidence, write-up). Complements
// PredictionSEO (which handles FAQ/Article); does NOT re-emit Organization/WebSite.

interface SetupSchemaProps {
  coinName: string;
  symbol: string;
  timeframe: string;
  bias?: "bullish" | "bearish" | "neutral";
  confidence?: number;
  currentPrice?: number;
  entryLow?: number;
  entryHigh?: number;
  stopLoss?: number;
  takeProfit1?: number;
  writeUp?: string;
}

export function SetupSchema({
  coinName, symbol, timeframe, bias, confidence, currentPrice,
  entryLow, entryHigh, stopLoss, takeProfit1, writeUp,
}: SetupSchemaProps) {
  const slug = coinName.toLowerCase().replace(/\s+/g, "-");
  const url = `${SITE_URL}/price-prediction/${slug}/${timeframe}`;
  const action = bias === "bullish" ? "Buy" : bias === "bearish" ? "Sell" : "Hold";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Recommendation",
    "name": `${coinName} (${symbol.toUpperCase()}) ${timeframe} trade setup`,
    "url": url,
    "datePublished": new Date().toISOString(),
    "about": {
      "@type": "FinancialProduct",
      "name": `${coinName} (${symbol.toUpperCase()})`,
      "category": "Cryptocurrency",
    },
    "reviewAspect": "Technical trade setup",
    "description":
      (writeUp ? writeUp.split(/\n{2,}/)[0] : `${coinName} ${timeframe} setup with a ${bias || "neutral"} bias.`).slice(0, 500),
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Direction", "value": action },
      ...(confidence != null ? [{ "@type": "PropertyValue", "name": "Confidence", "value": `${confidence}%` }] : []),
      ...(currentPrice != null ? [{ "@type": "PropertyValue", "name": "Current Price", "value": `$${currentPrice}` }] : []),
      ...(entryLow != null && entryHigh != null ? [{ "@type": "PropertyValue", "name": "Entry Zone", "value": `$${entryLow} – $${entryHigh}` }] : []),
      ...(takeProfit1 != null ? [{ "@type": "PropertyValue", "name": "Take Profit 1", "value": `$${takeProfit1}` }] : []),
      ...(stopLoss != null ? [{ "@type": "PropertyValue", "name": "Stop Loss", "value": `$${stopLoss}` }] : []),
    ],
  };

  return (
    <Helmet>
      
    </Helmet>
  );
}
