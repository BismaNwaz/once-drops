"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBag, useMe } from "@/lib/client";
import { useUI } from "./Providers";

const nav = [
  { href: "/#live", label: "Live" },
  { href: "/#soon", label: "Opening soon" },
  { href: "/#archive", label: "Archive" },
  { href: "/collection", label: "Collection" },
];

export function Header() {
  const { data: bag } = useBag();
  const { data: me } = useMe();
  const { openBag } = useUI();
  const pathname = usePathname();
  const count = bag?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10">
        <nav className="hidden items-center gap-7 text-[13px] text-ink-2 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`link-underline ${pathname === n.href ? "text-ink" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/#live" className="label text-ink-2 md:hidden">
          Drops
        </Link>

        <Link href="/" className="font-serif text-[30px] leading-none tracking-[0.18em]" aria-label="ONCE home">
          ONCE
        </Link>

        <div className="flex items-center justify-end gap-6 text-[13px]">
          {me?.user ? (
            <Link href="/collection" className="link-underline hidden text-ink-2 sm:inline">
              {me.user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/login" className="link-underline hidden text-ink-2 sm:inline">
              Sign in
            </Link>
          )}
          <button onClick={openBag} className="flex items-center gap-2 text-ink" aria-label="Open bag">
            <span>Bag</span>
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] tabular transition ${
                count ? "bg-accent text-paper" : "border border-line text-muted"
              }`}
            >
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
