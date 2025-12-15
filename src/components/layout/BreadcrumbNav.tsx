import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  "": "Home",
  "dashboard": "Dashboard",
  "strength": "Strength Meter",
  "factory": "Crypto Factory",
  "portfolio": "Wallet Scanner",
  "chain": "Chains",
  "sentiment": "Sentiment",
  "explorer": "Explorer",
  "learn": "Learn",
  "contact": "Contact",
  "ethereum": "Ethereum",
  "solana": "Solana",
  "base": "Base",
  "polygon": "Polygon",
  "arbitrum": "Arbitrum",
  "avalanche": "Avalanche",
  "bnb": "BNB Chain",
  "optimism": "Optimism",
};

export function BreadcrumbNav() {
  const location = useLocation();
  
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }];
    
    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ label, path: currentPath });
    });
    
    return items;
  }, [location.pathname]);

  // JSON-LD structured data for SEO
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://oraclebull.com${item.path}`
    }))
  }), [breadcrumbs]);

  // Don't show breadcrumb on home page
  if (location.pathname === "/") return null;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Visual Breadcrumb */}
      <nav 
        aria-label="Breadcrumb" 
        className="container mx-auto px-3 sm:px-4 flex items-center gap-1 text-xs md:text-sm text-muted-foreground overflow-x-auto scrollbar-hide py-2 md:py-3"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <div key={item.path} className="flex items-center gap-1 whitespace-nowrap">
              {index === 0 && (
                <Home className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              )}
              
              {isLast ? (
                <span className="text-foreground font-medium truncate max-w-[150px] md:max-w-none">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link 
                    to={item.path}
                    className="hover:text-primary transition-colors truncate max-w-[100px] md:max-w-none"
                  >
                    {index === 0 ? "" : item.label}
                  </Link>
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-muted-foreground/50" />
                </>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
