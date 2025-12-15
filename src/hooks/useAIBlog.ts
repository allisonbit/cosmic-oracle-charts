import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  takeaways: string[];
  category: string;
  readTime: string;
  publishedAt: string;
  imageUrl: string;
}

export interface AIBlogData {
  posts: BlogPost[];
  date: string;
  timestamp: number;
}

export function useAIBlog() {
  return useQuery<AIBlogData>({
    queryKey: ['ai-blog'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-blog');
      
      if (error) {
        console.error('AI Blog error:', error);
        throw error;
      }

      return data;
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // 10 minutes
  });
}
