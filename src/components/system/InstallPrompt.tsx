import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { computeStats } from "@/lib/dailyGame";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "ob-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      // Show only after dismissal wasn't permanent and the visitor has played.
      if (localStorage.getItem(DISMISS_KEY) !== "1") setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    setStreak(computeStats().streak);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="rounded-xl border border-primary/30 bg-card shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="grid place-items-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
          <Download className="w-4.5 h-4.5 w-[18px] h-[18px] text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">
            Install Oracle Bull{streak > 0 ? ` · ${streak}-day streak 🔥` : ""}
          </p>
          <p className="text-xs text-muted-foreground">One tap — keep your streak and live prices one tap away.</p>
        </div>
        <button onClick={install} className="rounded-lg bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 hover:bg-primary/90 shrink-0">
          Install
        </button>
        <button onClick={dismiss} aria-label="Dismiss install prompt" className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
