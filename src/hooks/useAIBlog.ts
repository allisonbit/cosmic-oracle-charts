import { useQuery } from "@tanstack/react-query";

// ── useAIBlog — honest empty state ───────────────────────────────────────────
// Articles were generated server-side by an `ai-blog` edge function that no
// longer exists. This build has no content source, so the hook returns an
// explicit empty post list — the Learn page renders its empty state rather
// than showing fabricated articles.

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
    queryFn: async () => ({
      posts: [],
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      totalArticles: 0,
    }),
    staleTime: 5 * 60_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
