// JSON-LD schema emitters removed — the site no longer ships crawler markup.
// These are kept as no-op components so existing imports/call sites keep working.

export interface FAQItem { question: string; answer: string }
export interface HowToStep { name: string; text: string; url?: string }

export function FAQSchema(_props: { items: FAQItem[]; url?: string }) {
  return null;
}

export function HowToSchema(_props: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  url?: string;
}) {
  return null;
}
