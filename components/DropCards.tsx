import Link from "next/link";
import type { Drop } from "@/lib/drops";
import { dropNo, humanSpan, money } from "@/lib/format";
import { DropImage } from "./DropImage";
import { Countdown } from "./Countdown";
import { StockBar } from "./StockBar";

export function LiveCard({ drop, index = 0 }: { drop: Drop; index?: number }) {
  const low = drop.available / drop.editionSize < 0.15;
  return (
    <Link href={`/drops/${drop.slug}`} className="group block animate-rise" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="relative">
        <DropImage src={drop.image} alt={drop.title} tone={drop.tone} className="aspect-[4/5] rounded-2xl" />
        <span className="label absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-ink backdrop-blur">
          {dropNo(drop.number)}
        </span>
        <span className="label absolute right-4 top-4 flex items-center gap-2 rounded-full bg-ink/85 px-3 py-1.5 text-paper backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#e0634a]" />
          <Countdown to={drop.endsAt} />
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-[28px] leading-none">{drop.title}</h3>
        <span className="text-[15px] tabular">{money(drop.priceCents)}</span>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {drop.maker} · {drop.origin}
      </p>
      <div className="mt-4">
        <StockBar sold={drop.sold} held={drop.held} editionSize={drop.editionSize} compact />
        <p className={`mt-2 text-[12.5px] tabular ${low ? "text-accent" : "text-muted"}`}>
          {low ? `Only ${drop.available} left` : `${drop.available} of ${drop.editionSize} remain`}
        </p>
      </div>
    </Link>
  );
}

export function ArchiveCard({ drop }: { drop: Drop }) {
  const soldOutIn = drop.soldOutAt ? +new Date(drop.soldOutAt) - +new Date(drop.startsAt) : null;
  return (
    <Link href={`/drops/${drop.slug}`} className="group block">
      <DropImage src={drop.image} alt={drop.title} tone={drop.tone} muted className="aspect-square rounded-2xl" />
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-serif text-2xl">{drop.title}</h3>
        <span className="label text-muted">{dropNo(drop.number)}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted">
        {soldOutIn !== null ? (
          <>
            All {drop.editionSize} sold in <span className="text-ink">{humanSpan(soldOutIn)}</span>
          </>
        ) : (
          <>Closed · {drop.sold} of {drop.editionSize} found homes</>
        )}
      </p>
    </Link>
  );
}
