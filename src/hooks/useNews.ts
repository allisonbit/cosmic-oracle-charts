import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NewsCoin {
  id: string;
  name: string;
  symbol: string;
}

export interface NewsFaq {
  question: string;
  answer: string;
}

export interface NewsArticleData {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  takeaways: string[];
  faqs: NewsFaq[];
  category: string;
  readTime: string;
  wordCount: number;
  publishedAt: string;
  imageUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  externalUrl: string;
  sourceName: string;
  sourceIcon: string;
  sentiment: "bullish" | "bearish" | "neutral";
  coins: NewsCoin[];
}

interface NewsListResponse {
  articles: NewsArticleData[];
  total: number;
  categories: string[];
}

interface NewsArticleResponse {
  article: NewsArticleData | null;
  related: NewsArticleData[];
}

// ── List / search hook (powers the /news hub) ────────────────────────────────
export function useNewsFeed(params: { category?: string; q?: string; limit?: number } = {}) {
  const { category = "All", q = "", limit = 40 } = params;
  return useQuery<NewsListResponse>({
    queryKey: ["news-feed", category, q, limit],
    queryFn: async () => {
      const { data, error } = await invokeFunction<NewsListResponse>("news-feed", {
        body: { category, q, limit },
      });
      if (error) throw new Error(error.message);
      return data ?? { articles: [], total: 0, categories: [] };
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // mirror the 30-min server refresh without hammering
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev, // keep showing results while a new filter loads
    retry: 2,
  });
}

// ── Single-article hook (powers /news/:slug — works on direct visits) ─────────
export function useNewsArticle(slug: string | undefined) {
  return useQuery<NewsArticleResponse>({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data, error } = await invokeFunction<NewsArticleResponse>("news-feed", {
        body: { slug },
      });
      if (error) throw new Error(error.message);
      return data ?? { article: null, related: [] };
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
    retry: 2,
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────────
export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const SENTIMENT_STYLES: Record<string, { label: string; className: string }> = {
  bullish: { label: "Bullish", className: "text-success border-success/30 bg-success/10" },
  bearish: { label: "Bearish", className: "text-danger border-danger/30 bg-danger/10" },
  neutral: { label: "Neutral", className: "text-warning border-warning/30 bg-warning/10" },
};

export function sentimentStyle(s: string) {
  return SENTIMENT_STYLES[s] ?? SENTIMENT_STYLES.neutral;
}
