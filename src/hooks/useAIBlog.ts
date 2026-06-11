import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

export interface BlogFAQ {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  takeaways: string[];
  faqs?: BlogFAQ[];
  category: string;
  readTime: string;
  wordCount: number;
  publishedAt: string;
  imageUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export interface AIBlogData {
  posts: BlogPost[];
  date: string;
  timestamp: number;
  totalArticles: number;
}

export function useAIBlog() {
  return useQuery<AIBlogData>({
    queryKey: ['ai-blog'],
    queryFn: async () => {
      const { data, error } = await invokeFunction('ai-blog');
      
      if (error) {
        console.error('AI Blog error:', error);
        throw error;
      }

      return data;
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // 10 minutes - auto refresh
    gcTime: 1000 * 60 * 30, // 30 min cache
    refetchIntervalInBackground: false, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}
