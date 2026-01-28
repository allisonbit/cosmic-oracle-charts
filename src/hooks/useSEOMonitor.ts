import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_URL } from "@/lib/siteConfig";

export interface SEOHealthResult {
  url: string;
  status: number;
  responseTime: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasH1: boolean;
  hasCanonical: boolean;
  hasSchema: boolean;
  issues: string[];
}

export interface SEOReport {
  timestamp: string;
  totalPages: number;
  healthyPages: number;
  pagesWithIssues: number;
  brokenLinks: string[];
  missingMeta: string[];
  slowPages: string[];
  results: SEOHealthResult[];
  recommendations: string[];
  seoScore?: number;
  coreWebVitals?: {
    averageResponseTime: number;
    fastPages: number;
    slowPages: number;
  };
}

export interface ContentRefreshResult {
  success: boolean;
  articlesGenerated: number;
  articles: any[];
  timestamp: string;
}

// Hook for SEO monitoring
export function useSEOMonitor() {
  return useQuery<SEOReport>({
    queryKey: ['seo-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('seo-monitor');
      
      if (error) {
        console.error('SEO Monitor error:', error);
        throw error;
      }

      return data;
    },
    enabled: false, // Only run when explicitly triggered
    staleTime: 86400000, // 24 hours
    retry: 2,
    retryDelay: 3000,
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });
}

// Hook for content refresh
export function useContentRefresh() {
  return useMutation<ContentRefreshResult, Error, { count?: number }>({
    mutationFn: async ({ count = 3 }) => {
      const { data, error } = await supabase.functions.invoke('content-refresh', {
        body: { count }
      });
      
      if (error) {
        console.error('Content refresh error:', error);
        throw error;
      }

      return data;
    },
  });
}

// Utility function to check if a page is indexed (client-side check)
export async function checkPageIndexStatus(url: string): Promise<boolean> {
  try {
    // This is a basic check - actual indexing status requires Google Search Console API
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get SEO score from report
export function calculateSEOScore(report: SEOReport): number {
  if (!report || !report.results || report.results.length === 0) return 0;
  
  let score = 100;
  const totalPages = report.totalPages;
  
  // Deduct for pages with issues
  score -= (report.pagesWithIssues / totalPages) * 30;
  
  // Deduct for broken links
  score -= Math.min(report.brokenLinks.length * 5, 20);
  
  // Deduct for missing meta
  score -= Math.min(report.missingMeta.length * 3, 15);
  
  // Deduct for slow pages
  score -= Math.min(report.slowPages.length * 5, 20);
  
  return Math.max(0, Math.round(score));
}
