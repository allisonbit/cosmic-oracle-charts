import { useQuery } from '@tanstack/react-query';
import { EducationalArticle } from '@/lib/educationalArticles';

export const useEducationalArticles = () => {
  return useQuery({
    queryKey: ['educational-articles'],
    queryFn: async () => {
      const res = await fetch('/data/educational-articles.json');
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json() as Promise<EducationalArticle[]>;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24,
  });
};
