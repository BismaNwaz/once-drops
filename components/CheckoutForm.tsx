"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BagItem } from "@/lib/bag";
import type { User } from "@/lib/auth";
import { api, useBag } from "@/lib/client";
import { dropNo, money } from "@/lib/format";
import { DropImage } from "./DropImage";
import { Countdown } from "./Countdown";

export function CheckoutForm({ user, initialItems }: { user: User; initialItems: BagItem[] }) {
  const router = useRouter();
  const { data, mutate } = useBag();
  const items = data?.items ?? initialItems;
  const subtotal = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const [f, setF] = useState({ name: user.name, line1: "", city: "", postcode: "", country: "Denmark", card: "4242 4242 4242 4242", exp: "12 / 29", cvc: "123" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { number } = await api<{ number: string }>("/api/checkout", { method: "POST", json: f });
      await mutate({ items: [] }, { revalidate: false });
      router.push(`/orders/${number}?new=1`);
    } catch (err) {
      setError((err as Error).message);
      mutate();
      setBusy(false);
    }
  }

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="font-serif text-6xl">Your bag is empty.</h1>
        <p className="mt-4 text-muted">Holds last ten minutes. If yours ran out, the pieces went back to the edition — they may still be available.</p>
        <Link href="/#live" className="btn btn-ink mt-10">Back to the live drops</Link>
      </div>
    );

  const earliest = items.reduce((a, b) => (a.expiresAt < b.expiresAt ? a : b));

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 md:px-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h1 className="font-serif text-6xl md:text-7xl">Checkout</h1>
        <p className="mt-4 flex items-center gap-2 text-[15px] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
          Your pieces are held for <Countdown to={earliest.expiresAt} className="font-mono" />
        </p>

        <fieldset className="mt-12">
          <legend className="label text-muted">01 — Ship to</legend>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2"><input className="input" required value={f.name} onChange={set("name")} autoComplete="name" /></Field>
            <Field label="Address" className="sm:col-span-2"><input className="input" required value={f.line1} onChange={set("line1")} autoComplete="street-address" placeholder="Street and number" /></Field>
            <Field label="City"><input className="input" required value={f.city} onChange={set("city")} autoComplete="address-level2" /></Field>
            <Field label="Postcode"><input className="input" required value={f.postcode} onChange={set("postcode")} autoComplete="postal-code" /></Field>
            <Field label="Country" className="sm:col-span-2"><input className="input" required value={f.country} onChange={set("country")} autoComplete="country-name" /></Field>
          </div>
        </fieldset>

        <fieldset className="mt-14">
          <legend className="label text-muted">02 — Payment</legend>
          <p className="mt-3 rounded-xl bg-paper-2 px-4 py-3 text-[13px] text-ink-2">
            Demo mode — the test card below is pre-filled. Nothing is charged and card details are never stored.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-4">
            <Field label="Card number" className="sm:col-span-2"><input className="input font-mono" required value={f.card} onChange={set("card")} inputMode="numeric" /></Field>
            <Field label="Expiry"><input className="input font-mono" required value={f.exp} onChange={set("exp")} /></Field>
            <Field label="CVC"><input className="input font-mono" required value={f.cvc} onChange={set("cvc")} /></Field>
          </div>
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="rounded-[24px] border border-line bg-card p-7 lg:sticky lg:top-24">
          <p className="label text-muted">Order summary</p>
          <ul className="mt-6 space-y-5">
            {items.map((i) => (
              <li key={i.holdId} className="flex gap-4">
                <DropImage src={i.image} alt={i.title} tone={i.tone} className="h-20 w-16 shrink-0 rounded-lg" />
                <div className="flex-1">
                  <p className="font-serif text-xl leading-tight">{i.title}</p>
                  <p className="text-[13px] text-muted">{dropNo(i.number)} · Qty {i.quantity}</p>
                </div>
                <p className="text-sm tabular">{money(i.priceCents * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-7 space-y-2 border-t border-line pt-5 text-sm">
            <Row k="Subtotal" v={money(subtotal)} />
            <Row k="Insured shipping" v="Complimentary" />
            <Row k="Duties & taxes" v="Included" />
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-sm">Total</span>
            <span className="font-serif text-4xl tabular">{money(subtotal)}</span>
          </div>
          {error && <p className="mt-4 text-sm text-accent">{error}</p>}
          <button disabled={busy} className="btn btn-ink mt-6 w-full">
            {busy ? "Numbering your pieces…" : `Place order · ${money(subtotal)}`}
          </button>
          <p className="mt-3 text-center text-[12px] text-muted">Signed in as {user.email}</p>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="label text-muted">{label}</span>
      {children}
    </label>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between">
    <span className="text-muted">{k}</span>
    <span className="tabular">{v}</span>
  </div>
);
