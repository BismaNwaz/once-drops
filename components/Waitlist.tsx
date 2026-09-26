"use client";
import { useState } from "react";
import { api, useMe } from "@/lib/client";
import { useUI } from "./Providers";

export function Waitlist({ slug, initialCount, dark = false }: { slug: string; initialCount: number; dark?: boolean }) {
  const { data: me } = useMe();
  const { toast } = useUI();
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(initialCount);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ waitlistCount: number; email: string }>(`/api/drops/${slug}/waitlist`, {
        method: "POST",
        json: me?.user ? {} : { email },
      });
      setCount(res.waitlistCount);
      setJoined(true);
      toast(`We'll email ${res.email} the moment it opens`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (joined)
    return (
      <p className={`text-sm ${dark ? "text-paper/80" : "text-sage"}`}>
        ✓ You&apos;re on the list — with {count.toLocaleString()} others.
      </p>
    );

  return (
    <form onSubmit={join} className="w-full">
      <div className="flex items-end gap-3">
        {!me?.user && (
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={`input flex-1 ${dark ? "border-paper/25 text-paper placeholder:text-paper/40 focus:border-paper" : ""}`}
          />
        )}
        <button disabled={busy} className={`btn h-11 px-5 ${dark ? "bg-paper text-ink" : "btn-ink"} ${me?.user ? "w-full" : ""}`}>
          {busy ? "…" : "Notify me"}
        </button>
      </div>
      <p className={`mt-2.5 text-[12.5px] ${dark ? "text-paper/50" : "text-muted"}`}>
        {error ?? `${count.toLocaleString()} collectors waiting`}
      </p>
    </form>
  );
}
