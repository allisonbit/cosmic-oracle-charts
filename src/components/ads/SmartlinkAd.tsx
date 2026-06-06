import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface SmartlinkAdProps {
  className?: string;
}

export function SmartlinkAd({ className }: SmartlinkAdProps) {
  return (
    <a 
      href="https://www.effectivecpmnetwork.com/u3mt6t8wv?key=14bd0561df5ff2ef73924bd92d873b81"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 animate-pulse-subtle",
        className
      )}
    >
      <Sparkles className="w-5 h-5 text-yellow-300" />
      <span>Exclusive Partner Offers</span>
    </a>
  );
}
