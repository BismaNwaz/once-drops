"use client";
import { formatDuration, pad, splitDuration } from "@/lib/format";
import { useEffect, useRef } from "react";
import { useNow } from "./hooks";

export function Countdown({ to, className = "" }: { to: string; className?: string }) {
  const now = useNow();
  return <span className={`tabular ${className}`}>{now === null ? "--:--:--" : formatDuration(+new Date(to) - now)}</span>;
}

/** Large split-flap style countdown used for upcoming drops. */
export function BigCountdown({ to, onZero }: { to: string; onZero?: () => void }) {
  const now = useNow();
  const ms = now === null ? null : +new Date(to) - now;
  const fired = useRef(false);
  useEffect(() => {
    if (ms !== null && ms <= 0 && onZero && !fired.current) {
      fired.current = true;
      onZero();
    }
  }, [ms, onZero]);
  const p = ms === null ? null : splitDuration(ms);
  const cells: [string, string][] = [
    ["Days", p ? pad(p.days) : "--"],
    ["Hours", p ? pad(p.hours) : "--"],
    ["Min", p ? pad(p.minutes) : "--"],
    ["Sec", p ? pad(p.seconds) : "--"],
  ];
  return (
    <div className="flex gap-2">
      {cells.map(([label, v]) => (
        <div key={label} className="flex min-w-[72px] flex-col items-center rounded-xl border border-line bg-card px-3 py-3">
          <span className="font-serif text-4xl leading-none tabular">{v}</span>
          <span className="label mt-2 text-[10px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
