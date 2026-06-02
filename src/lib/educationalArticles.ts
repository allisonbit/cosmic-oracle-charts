export interface EducationalArticle {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  readTime: string;
  content: string;
  faqs: { question: string; answer: string }[];
  relatedLinks: { text: string; url: string }[];
  primaryKeyword: string;
  secondaryKeywords: string[];
}
