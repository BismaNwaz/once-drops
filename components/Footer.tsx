import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10">
        <p className="max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">
          Made once. <span className="italic text-paper/60">Gone once.</span>
        </p>
        <div className="mt-16 grid gap-10 border-t border-paper/15 pt-10 text-sm text-paper/70 md:grid-cols-4">
          <div>
            <p className="label mb-4 text-paper/40">The idea</p>
            <p>Small editions from independent makers. Released at a set hour, numbered forever, never restocked.</p>
          </div>
          <div>
            <p className="label mb-4 text-paper/40">Shop</p>
            <ul className="space-y-2">
              <li><Link href="/#live" className="link-underline">Live now</Link></li>
              <li><Link href="/#soon" className="link-underline">Opening soon</Link></li>
              <li><Link href="/#archive" className="link-underline">Archive</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-paper/40">Account</p>
            <ul className="space-y-2">
              <li><Link href="/collection" className="link-underline">Your collection</Link></li>
              <li><Link href="/login" className="link-underline">Sign in</Link></li>
              <li><Link href="/signup" className="link-underline">Create account</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-paper/40">Note</p>
            <p>A portfolio project. Payments run in demo mode and no card is ever charged or stored.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
