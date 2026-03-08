import { MessageCircle } from "lucide-react";

export function LiveChatButton() {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all animate-pulse"
      aria-label="Live chat"
      onClick={() => window.open("https://t.me/OracleBullSupport", "_blank")}
    >
      <MessageCircle size={24} />
    </button>
  );
}
