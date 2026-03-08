import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("ob-announcement-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("ob-announcement-dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="bg-gradient-primary text-primary-foreground text-center py-2 px-4 text-sm relative z-[60]">
      <span>🎉 Summer Special: Get 30% off Pro with code <strong>SUMMER30</strong> — Limited time!</span>
      <button onClick={dismiss} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
