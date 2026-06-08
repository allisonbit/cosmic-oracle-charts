import { useQuery } from "@tanstack/react-query";
import { INSIGHTS_ARTICLES } from "@/data/insightsArticles";

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

// Curated, hand-written analysis library — every article is unique (no templated
// repetition). Sourced from src/data/insightsArticles.ts; no backend dependency.
function buildInsightsData(): InsightsData {
  const posts = [...INSIGHTS_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const today = new Date().toISOString().split("T")[0];
  return {
    posts,
    date: today,
    timestamp: Date.now(),
    totalArticles: posts.length,
    todayArticles: posts.filter((p) => p.publishedAt.startsWith(today)).length,
  };
}

export function useInsights() {
  return useQuery<InsightsData>({
    queryKey: ["insights-articles"],
    queryFn: async () => buildInsightsData(),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

// Helper to get a single article by slug.
export function useInsightArticle(slug: string) {
  const { data, isLoading, error } = useInsights();
  const article = data?.posts?.find((post) => post.slug === slug);
  return { article, isLoading, error };
}
