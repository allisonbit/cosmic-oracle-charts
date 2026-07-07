import { Helmet } from "react-helmet-async";

export interface FAQItem { question: string; answer: string }
export interface HowToStep { name: string; text: string; url?: string }

export function FAQSchema({ items, url }: { items: FAQItem[]; url?: string }) {
  if (!items.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { url } : {}),
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  url,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  url?: string;
}) {
  if (!steps.length) return null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url ? { url: step.url } : {})
    }))
  };
  if (totalTime) schema.totalTime = totalTime;
  if (url) schema.url = url;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
