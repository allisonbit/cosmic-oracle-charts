import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InsightFAQ {
  question: string;
  answer: string;
}

export interface InsightPost {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  takeaways: string[];
  faqs?: InsightFAQ[];
  category: string;
  readTime: string;
  wordCount: number;
  publishedAt: string;
  imageUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export interface InsightsData {
  posts: InsightPost[];
  date: string;
  timestamp: number;
  totalArticles: number;
  todayArticles?: number;
}

export function useInsights() {
  return useQuery<InsightsData>({
    queryKey: ['insights-articles'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('insights-engine');
      
      if (error) {
        console.error('Insights engine error:', error);
        throw error;
      }

      return data;
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // 10 minutes - auto refresh
    gcTime: 1000 * 60 * 30, // 30 min cache
    refetchIntervalInBackground: true, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}

// Helper to get article by slug
export function useInsightArticle(slug: string) {
  const { data, isLoading, error } = useInsights();
  
  const article = data?.posts?.find(post => post.slug === slug);
  
  return { article, isLoading, error };
}
