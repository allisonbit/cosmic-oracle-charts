import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-background/70 border border-border rounded-lg w-10 h-10 flex items-center justify-center font-display font-bold text-base text-foreground tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function AirdropCountdown({ targetDate, label = "Snapshot" }: { targetDate: string; label?: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) return (
    <div className="text-xs text-muted-foreground font-medium">{label} passed</div>
  );

  return (
    <div className="flex items-end gap-1.5">
      <span className="text-[10px] text-muted-foreground mb-2 shrink-0">{label} in</span>
      <Digit value={timeLeft.days} label="d" />
      <span className="text-muted-foreground font-bold mb-2">:</span>
      <Digit value={timeLeft.hours} label="h" />
      <span className="text-muted-foreground font-bold mb-2">:</span>
      <Digit value={timeLeft.minutes} label="m" />
      <span className="text-muted-foreground font-bold mb-2">:</span>
      <Digit value={timeLeft.seconds} label="s" />
    </div>
  );
}
