import { Helmet } from "react-helmet-async";

// Reusable JSON-LD emitter for informational/hub pages so Oracle Bull is
// eligible for FAQ and HowTo rich results in Google. Drop one of these into
// any page that already has visible Q&A or step-by-step content — the visible
// copy must match (Google penalises FAQ schema with no matching on-page text).

export interface FAQItem { question: string; answer: string }
export interface HowToStep { name: string; text: string; url?: string }

export function FAQSchema({ items, url }: { items: FAQItem[]; url?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime = "PT5M",
  url,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  url?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    ...(url ? { "@id": `${url}#howto` } : {}),
    name,
    description,
    totalTime,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}