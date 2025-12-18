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
    staleTime: 600000, // 10 minutes
    refetchInterval: 1800000, // 30 minutes
    retry: 2,
  });
}

// Helper to get article by slug
export function useInsightArticle(slug: string) {
  const { data, isLoading, error } = useInsights();
  
  const article = data?.posts?.find(post => post.slug === slug);
  
  return { article, isLoading, error };
}
