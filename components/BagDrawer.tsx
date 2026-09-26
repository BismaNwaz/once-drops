"use client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { api, useBag } from "@/lib/client";
import { money } from "@/lib/format";
import { useUI } from "./Providers";
import { DropImage } from "./DropImage";
import { useNow } from "./hooks";
import { formatDuration } from "@/lib/format";

export function BagDrawer() {
  const { bagOpen, closeBag, toast } = useUI();
  const { data, mutate } = useBag();
  const now = useNow();
  const items = useMemo(() => data?.items ?? [], [data]);
  const subtotal = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);

  // When a hold runs out, re-read the bag from the server so it drops out.
  useEffect(() => {
    if (now && items.some((i) => +new Date(i.expiresAt) <= now)) mutate();
  }, [now, items, mutate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBag();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeBag]);

  if (!bagOpen) return null;

  async function remove(holdId: number) {
    const res = await api<{ items: typeof items }>(`/api/bag/${holdId}`, { method: "DELETE" });
    mutate(res, { revalidate: false });
    toast("Released back to the edition");
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade bg-ink/30 backdrop-blur-[2px]" onClick={closeBag} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] animate-drawer flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-7 py-5">
          <h2 className="font-serif text-3xl">Your bag</h2>
          <button onClick={closeBag} className="label text-muted hover:text-ink">
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <p className="font-serif text-2xl italic">Nothing on hold.</p>
            <p className="mt-3 text-sm text-muted">
              When you reserve a piece we keep it for you for ten minutes while you check out.
            </p>
            <Link href="/#live" onClick={closeBag} className="btn btn-line mt-8">
              See what&apos;s live
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto px-7 py-6">
              {items.map((i) => {
                const left = now ? +new Date(i.expiresAt) - now : null;
                const urgent = left !== null && left < 120_000;
                return (
                  <div key={i.holdId} className="flex gap-4">
                    <DropImage src={i.image} alt={i.title} tone={i.tone} className="h-28 w-24 shrink-0 rounded-lg" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <Link href={`/drops/${i.slug}`} onClick={closeBag} className="font-serif text-xl leading-tight">
                            {i.title}
                          </Link>
                          <p className="text-[13px] text-muted">{i.maker}</p>
                        </div>
                        <p className="text-sm tabular">{money(i.priceCents * i.quantity)}</p>
                      </div>
                      <p className="mt-1 text-[13px] text-muted">Qty {i.quantity}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className={`label flex items-center gap-2 ${urgent ? "text-accent" : "text-sage"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${urgent ? "animate-pulse-dot bg-accent" : "bg-sage"}`} />
                          Held · {left === null ? "--:--" : formatDuration(left).slice(3)}
                        </span>
                        <button onClick={() => remove(i.holdId)} className="text-[13px] text-muted underline-offset-4 hover:underline">
                          Release
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-line px-7 py-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="tabular">{money(subtotal)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-sm">
                <span className="text-muted">Insured shipping</span>
                <span>Complimentary</span>
              </div>
              <Link href="/checkout" onClick={closeBag} className="btn btn-ink mt-6 w-full">
                Checkout · {money(subtotal)}
              </Link>
              <p className="mt-3 text-center text-[12px] text-muted">Pieces return to the edition when a hold expires.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
