"use client";
import useSWR from "swr";
import type { Drop } from "@/lib/drops";
import { Countdown } from "./Countdown";

/** Thin live strip across the top: what's selling and what opens next. Data comes from /api/drops. */
export function Ticker() {
  const { data } = useSWR<{ live: Drop[]; upcoming: Drop[] }>("/api/drops", { refreshInterval: 15_000 });
  const items: React.ReactNode[] = [];
  data?.live.forEach((d) =>
    items.push(
      <span key={`l${d.id}`} className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#e0634a]" />
        {d.title} — {d.available} left
      </span>,
    ),
  );
  data?.upcoming.slice(0, 2).forEach((d) =>
    items.push(
      <span key={`u${d.id}`}>
        {d.title} opens in <Countdown to={d.startsAt} />
      </span>,
    ),
  );
  items.push(<span key="ship">Complimentary insured shipping on every piece</span>);
  items.push(<span key="ed">Every piece numbered. No restocks, ever.</span>);

  return (
    <div className="relative z-40 h-9 overflow-hidden bg-ink text-paper">
      <div className="label flex h-full w-max animate-marquee items-center gap-14 whitespace-nowrap pl-14 text-[10.5px] text-paper/80">
        {items}
        {items.map((n, i) => (
          <span key={`dup${i}`} aria-hidden>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
