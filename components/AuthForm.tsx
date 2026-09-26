"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { api } from "@/lib/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/collection";
  const { mutate } = useSWRConfig();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(body: typeof form | null) {
    setBusy(true);
    setError(null);
    try {
      if (body === null) await api("/api/auth/demo", { method: "POST" });
      else await api(`/api/auth/${mode === "login" ? "login" : "signup"}`, { method: "POST", json: body });
      await Promise.all([mutate("/api/auth/me"), mutate("/api/bag")]);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 md:px-10 lg:grid-cols-2 lg:py-24">
      <div className="flex flex-col justify-between rounded-[28px] bg-ink p-10 text-paper max-lg:hidden">
        <p className="label text-paper/50">{mode === "login" ? "Welcome back" : "Join ONCE"}</p>
        <p className="font-serif text-6xl leading-[1.02]">
          Your collection,
          <br />
          <span className="italic text-paper/55">numbered and kept.</span>
        </p>
        <p className="max-w-sm text-paper/60">
          An account keeps every piece you own with its edition number, and lets you check out in seconds when a drop opens.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md py-6">
        <h1 className="font-serif text-6xl">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="mt-3 text-muted">
          {mode === "login" ? "New here? " : "Already collecting? "}
          <Link href={`/${mode === "login" ? "signup" : "login"}?next=${encodeURIComponent(next)}`} className="text-ink underline underline-offset-4">
            {mode === "login" ? "Create an account" : "Sign in"}
          </Link>
        </p>

        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit(form);
          }}
        >
          {mode === "signup" && (
            <label className="block">
              <span className="label text-muted">Name</span>
              <input className="input" required value={form.name} onChange={set("name")} autoComplete="name" />
            </label>
          )}
          <label className="block">
            <span className="label text-muted">Email</span>
            <input className="input" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
          </label>
          <label className="block">
            <span className="label text-muted">Password</span>
            <input
              className="input"
              type="password"
              required
              minLength={mode === "signup" ? 8 : 1}
              value={form.password}
              onChange={set("password")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : ""}
            />
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button disabled={busy} className="btn btn-ink w-full">
            {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-dashed border-line p-5">
          <p className="text-sm text-muted">Just looking around? Get a private demo account in one click.</p>
          <button
            disabled={busy}
            onClick={() => submit(null)}
            className="btn btn-line mt-3 h-11 w-full"
          >
            Continue as a guest collector
          </button>
        </div>
      </div>
    </div>
  );
}
