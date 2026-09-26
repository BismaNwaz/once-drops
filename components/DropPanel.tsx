"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import type { Drop, DropStatus } from "@/lib/drops";
import { api, useBag } from "@/lib/client";
import { dropNo, humanSpan, money } from "@/lib/format";
import { BigCountdown, Countdown } from "./Countdown";
import { StockBar } from "./StockBar";
import { Waitlist } from "./Waitlist";
import { useUI } from "./Providers";
import { LocalTime } from "./LocalTime";

type Stock = { status: DropStatus; sold: number; held: number; available: number; editionSize: number; waitlistCount: number };

/** Price, live edition meter and the reserve action. Stock is polled from /api/drops/:slug/stock. */
export function DropPanel({ drop }: { drop: Drop }) {
  const router = useRouter();
  const { openBag, toast } = useUI();
  const { data: bag, mutate: mutateBag } = useBag();
  const { data: stock, mutate: mutateStock } = useSWR<Stock>(`/api/drops/${drop.slug}/stock`, {
    fallbackData: drop,
    refreshInterval: drop.status === "live" ? 4000 : 20_000,
  });
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = stock ?? drop;
  const myHold = bag?.items.find((i) => i.slug === drop.slug);

  async function reserve() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ items: NonNullable<typeof bag>["items"] }>("/api/bag", { method: "POST", json: { slug: drop.slug, quantity: qty } });
      await mutateBag({ items: res.items }, { revalidate: false });
      mutateStock();
      toast(`${drop.title} is held for you for 10 minutes`);
      openBag();
    } catch (err) {
      setError((err as Error).message);
      mutateStock();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 rounded-[24px] border border-line bg-card p-6 md:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-serif text-5xl tabular">{money(drop.priceCents)}</p>
          <p className="mt-1 text-[13px] text-muted">Complimentary insured shipping · Duties included</p>
        </div>
        <StatusPill status={s.status} />
      </div>

      {s.status === "live" && (
        <>
          <div className="mt-8">
            <StockBar sold={s.sold} held={s.held} editionSize={s.editionSize} />
          </div>
          <p className="mt-5 flex items-center justify-between text-[13px] text-muted">
            <span>Edition closes in</span>
            <Countdown to={drop.endsAt} className="font-mono text-[14px] text-ink" />
          </p>

          {myHold ? (
            <div className="mt-7 rounded-2xl bg-sage/10 p-5">
              <p className="text-[15px] text-sage">
                ✓ {myHold.quantity} held for you · expires in <Countdown to={myHold.expiresAt} className="font-mono" />
              </p>
              <div className="mt-4 flex gap-3">
                <button onClick={() => router.push("/checkout")} className="btn btn-ink flex-1">
                  Checkout
                </button>
                <button onClick={openBag} className="btn btn-line">
                  View bag
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-7 flex gap-3">
              <div className="flex h-[52px] items-center rounded-full border border-line">
                <button aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-full w-11 text-lg text-muted hover:text-ink">
                  −
                </button>
                <span className="w-6 text-center tabular">{qty}</span>
                <button
                  aria-label="More"
                  onClick={() => setQty((q) => Math.min(drop.perCustomerLimit, Math.max(1, s.available), q + 1))}
                  className="h-full w-11 text-lg text-muted hover:text-ink"
                >
                  +
                </button>
              </div>
              <button onClick={reserve} disabled={busy || s.available === 0} className="btn btn-ink flex-1">
                {s.available === 0 ? "All pieces on hold" : busy ? "Reserving…" : "Reserve for 10 minutes"}
              </button>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-accent">{error}</p>}
          <p className="mt-4 text-[12.5px] text-muted">
            Reserving takes a piece out of the edition while you check out. Limit {drop.perCustomerLimit} per collector.
          </p>
        </>
      )}

      {s.status === "upcoming" && (
        <div className="mt-8">
          <p className="label mb-4 text-muted">Opens <LocalTime iso={drop.startsAt} format="opening" /></p>
          <BigCountdown to={drop.startsAt} onZero={() => router.refresh()} />
          <p className="mt-6 text-[13px] text-muted">An edition of {drop.editionSize}. First come, first served.</p>
          <div className="mt-5">
            <Waitlist slug={drop.slug} initialCount={s.waitlistCount} />
          </div>
        </div>
      )}

      {(s.status === "sold_out" || s.status === "ended") && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="font-serif text-3xl italic">
            {s.status === "sold_out" ? "This edition has sold out." : "This edition has closed."}
          </p>
          <p className="mt-3 text-[15px] text-muted">
            {drop.soldOutAt ? (
              <>
                All {drop.editionSize} pieces found homes in {humanSpan(+new Date(drop.soldOutAt) - +new Date(drop.startsAt))}, on{" "}
                <LocalTime iso={drop.soldOutAt} format="long" />.
              </>
            ) : (
              `${s.sold} of ${drop.editionSize} pieces were numbered before it closed.`
            )}{" "}
            {dropNo(drop.number)} will not be made again.
          </p>
          <Link href="/#soon" className="btn btn-line mt-6">
            See what opens next
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: DropStatus }) {
  const map: Record<DropStatus, [string, string]> = {
    live: ["Live", "bg-accent text-paper"],
    upcoming: ["Opening soon", "bg-ink text-paper"],
    sold_out: ["Sold out", "bg-paper-2 text-muted"],
    ended: ["Closed", "bg-paper-2 text-muted"],
  };
  const [label, cls] = map[status];
  return (
    <span className={`label flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 ${cls}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-paper" />}
      {label}
    </span>
  );
}
