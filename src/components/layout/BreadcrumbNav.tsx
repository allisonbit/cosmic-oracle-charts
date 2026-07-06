import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { SITE_URL } from "@/lib/siteConfig";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  "": "Home",
  "dashboard": "Live Market Dashboard",
  "predictions": "AI Price Predictions",
  "price-prediction": "Price Predictions",
  "strength": "Crypto Strength Meter",
  "strength-meter": "Crypto Strength Meter",
  "factory": "Crypto Factory",
  "portfolio": "Wallet Scanner",
  "scanner": "Wallet Scanner",
  "chain": "Blockchain Analytics",
  "sentiment": "Market Sentiment & Fear/Greed",
  "explorer": "Token Explorer",
  "learn": "Learn Crypto",
  "insights": "Market Insights",
  "contact": "Contact Us",
  "about": "About Oracle Bull",
  "privacy-policy": "Privacy Policy",
  "terms": "Terms of Service",
  "risk-disclaimer": "Risk Disclaimer",
  "market": "Market Analysis",
  "q": "AI Answers",
  "my": "My Hub",
  // Timeframes
  "daily": "Daily Forecast",
  "weekly": "Weekly Forecast",
  "monthly": "Monthly Forecast",
  // Factory
  "events": "Market Events",
  "onchain": "On-Chain Intelligence",
  "narratives": "Market Narratives",
  "news": "Crypto News",
  // Chains
  "ethereum": "Ethereum (ETH)",
  "solana": "Solana (SOL)",
  "bitcoin": "Bitcoin (BTC)",
  "base": "Base",
  "polygon": "Polygon (MATIC)",
  "arbitrum": "Arbitrum",
  "avalanche": "Avalanche (AVAX)",
  "bnb": "BNB Chain",
  "optimism": "Optimism (OP)",
  // Coins
  "ripple": "XRP (Ripple)",
  "binancecoin": "BNB",
  "cardano": "Cardano (ADA)",
  "dogecoin": "Dogecoin (DOGE)",
  "polkadot": "Polkadot (DOT)",
  "chainlink": "Chainlink (LINK)",
  "avalanche-2": "Avalanche (AVAX)",
  "matic-network": "Polygon (MATIC)",
  "shiba-inu": "Shiba Inu (SHIB)",
  "litecoin": "Litecoin (LTC)",
  "uniswap": "Uniswap (UNI)",
  "cosmos": "Cosmos (ATOM)",
  "near": "NEAR Protocol",
  "pepe": "Pepe (PEPE)",
  "floki": "Floki (FLOKI)",
  "bonk": "Bonk (BONK)",
  "toncoin": "Toncoin (TON)",
  "tron": "TRON (TRX)",
  "stellar": "Stellar (XLM)",
  "monero": "Monero (XMR)",
  "okb": "OKB",
  "hedera": "Hedera (HBAR)",
  "filecoin": "Filecoin (FIL)",
  "vechain": "VeChain (VET)",
  "internet-computer": "Internet Computer (ICP)",
  "render-token": "Render (RNDR)",
  "fetch-ai": "Fetch.ai (FET)",
  "injective-protocol": "Injective (INJ)",
  "kaspa": "Kaspa (KAS)",
  "theta-token": "Theta Network (THETA)",
  "aptos": "Aptos (APT)",
  "sui": "Sui (SUI)",
  "sei-network": "Sei (SEI)",
  "bittensor": "Bittensor (TAO)",
  "dogwifcoin": "dogwifhat (WIF)",
  "brett-based": "Brett (BRETT)",
  "mog-coin": "Mog Coin (MOG)",
  "pendle": "Pendle (PENDLE)",
  "eigenlayer": "EigenLayer (EIGEN)",
  "wormhole": "Wormhole (W)",
  "starknet": "StarkNet (STRK)",
  "jupiter-ag": "Jupiter (JUP)",
  "pyth-network": "Pyth Network (PYTH)",
  "jito-governance-token": "Jito (JTO)",
  // Market slugs
  "best-crypto-to-buy-today": "Best Crypto to Buy Today",
  "top-crypto-gainers-today": "Top Crypto Gainers Today",
  "crypto-market-prediction-today": "Crypto Market Prediction Today",
  "which-crypto-will-go-up-today": "Which Crypto Will Go Up Today",
  "crypto-losers-today": "Crypto Losers Today",
  "is-crypto-going-up-today": "Is Crypto Going Up Today?",
  "best-crypto-to-buy-this-week": "Best Crypto This Week",
  "crypto-prediction-this-week": "Crypto Prediction This Week",
  "crypto-to-watch-this-week": "Crypto to Watch This Week",
  "top-crypto-gainers-this-week": "Top Gainers This Week",
  "next-crypto-to-explode": "Next Crypto to Explode",
  "safest-crypto-to-invest": "Safest Crypto to Invest",
  "cheap-crypto-to-buy-now": "Cheap Crypto to Buy Now",
  "undervalued-crypto-to-buy": "Undervalued Crypto",
  "crypto-with-most-potential": "Crypto With Most Potential",
  "best-altcoins-to-buy": "Best Altcoins to Buy",
  "top-meme-coins": "Top Meme Coins",
  "best-defi-tokens": "Best DeFi Tokens",
  "top-ai-crypto-tokens": "Top AI Crypto Tokens",
};

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function BreadcrumbNav() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || formatSlug(segment);
      items.push({ label, path: currentPath });
    });

    return items;
  }, [location.pathname]);

  // JSON-LD BreadcrumbList — gives Google rich breadcrumb results
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: `${SITE_URL}${item.path}`,
      })),
    }),
    [breadcrumbs]
  );

  if (location.pathname === "/") return null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb navigation"
        className="container mx-auto px-3 sm:px-4 flex items-center gap-1 text-xs md:text-sm text-muted-foreground overflow-x-auto scrollbar-hide py-2 md:py-3"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <div key={item.path} className="flex items-center gap-1 whitespace-nowrap">
              {index === 0 && (
                <Home className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="text-foreground font-medium truncate max-w-[180px] md:max-w-none"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    to={item.path}
                    className="hover:text-primary transition-colors truncate max-w-[100px] md:max-w-none"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight
                    className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-muted-foreground/50"
                    aria-hidden="true"
                  />
                </>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
