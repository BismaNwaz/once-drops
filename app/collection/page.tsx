import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { dropNo, longDate, money, pad } from "@/lib/format";
import { DropImage } from "@/components/DropImage";
import { SignOut } from "@/components/SignOut";

export const metadata = { title: "Your collection · ONCE" };

export default async function CollectionPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/collection");
  const orders = await listOrders(user.id);
  const pieces = orders.flatMap((o) =>
    o.items.flatMap((i) => i.editionNumbers.map((n) => ({ ...i, n, order: o.number, date: o.createdAt }))),
  );
  const value = orders.reduce((s, o) => s + o.totalCents, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <div>
          <p className="label text-muted">{user.email}</p>
          <h1 className="mt-4 font-serif text-6xl leading-none md:text-8xl">
            {user.name.split(" ")[0]}&apos;s <span className="italic text-ink/45">collection</span>
          </h1>
        </div>
        <div className="flex items-end gap-10">
          <Stat v={String(pieces.length)} k="Pieces" />
          <Stat v={String(orders.length)} k="Orders" />
          <Stat v={money(value)} k="Collected" />
          <SignOut />
        </div>
      </div>

      {pieces.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-serif text-4xl italic">Nothing numbered yet.</p>
          <p className="mt-3 text-muted">Pieces you buy appear here with their edition numbers.</p>
          <Link href="/#live" className="btn btn-ink mt-8">See what&apos;s live</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {pieces.map((p) => (
            <Link key={`${p.order}-${p.slug}-${p.n}`} href={`/orders/${p.order}`} className="group block">
              <div className="relative">
                <DropImage src={p.image} alt={p.title} tone={p.tone} className="aspect-[4/5] rounded-2xl" />
                <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1.5 font-serif text-lg backdrop-blur tabular">
                  Nº {pad(p.n, 3)} <span className="text-muted">/ {p.editionSize}</span>
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl">{p.title}</h3>
              <p className="mt-1 text-[13px] text-muted">
                {dropNo(p.dropNumber)} · {p.maker} · {longDate(p.date)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const Stat = ({ v, k }: { v: string; k: string }) => (
  <div>
    <p className="font-serif text-4xl tabular">{v}</p>
    <p className="label mt-1 text-muted">{k}</p>
  </div>
);
