import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { dropNo, longDate, money, pad } from "@/lib/format";
import { DropImage } from "@/components/DropImage";

export const metadata = { title: "Your order · ONCE" };

export default async function OrderPage(props: PageProps<"/orders/[number]">) {
  const user = await getUser();
  const { number } = await props.params;
  if (!user) redirect(`/login?next=/orders/${number}`);
  const [order] = await listOrders(user.id, number);
  if (!order) notFound();
  const isNew = (await props.searchParams).new === "1";

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-10">
      <div className="animate-rise text-center">
        <p className="label text-muted">Order {order.number} · {longDate(order.createdAt)}</p>
        <h1 className="mt-5 font-serif text-6xl leading-none md:text-8xl">
          {isNew ? <>It&apos;s yours.</> : <>Your order</>}
        </h1>
        {isNew && <p className="mx-auto mt-5 max-w-md text-muted">Each piece has been given its permanent edition number. A certificate travels with it.</p>}
      </div>

      <div className="mt-16 space-y-8">
        {order.items.map((item) =>
          item.editionNumbers.map((n, idx) => (
            <div
              key={`${item.slug}-${n}`}
              className="animate-rise grid overflow-hidden rounded-[28px] border border-line bg-card md:grid-cols-5"
              style={{ animationDelay: `${150 + idx * 120}ms` }}
            >
              <DropImage src={item.image} alt={item.title} tone={item.tone} className="aspect-square md:col-span-2 md:aspect-auto" />
              <div className="relative flex flex-col p-8 md:col-span-3 md:p-10">
                <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-line/80" />
                <p className="label text-muted">Certificate of edition</p>
                <h2 className="mt-4 font-serif text-4xl leading-none">{item.title}</h2>
                <p className="mt-2 text-[14px] text-muted">{item.maker} · {dropNo(item.dropNumber)}</p>
                <p className="mt-10 font-serif text-[88px] leading-none tabular">
                  <span className="text-[28px] italic text-muted">Nº </span>
                  {pad(n, 3)}
                  <span className="text-[28px] text-muted"> / {item.editionSize}</span>
                </p>
                <div className="mt-auto flex items-end justify-between pt-10 text-[13px] text-muted">
                  <span>Held by {order.shipTo.name}</span>
                  <span className="tabular">{money(item.priceCents)}</span>
                </div>
              </div>
            </div>
          )),
        )}
      </div>

      <div className="mt-12 grid gap-6 rounded-[24px] border border-line p-7 text-sm md:grid-cols-3">
        <div>
          <p className="label text-muted">Shipping to</p>
          <p className="mt-3 leading-relaxed">
            {order.shipTo.name}<br />{order.shipTo.line1}<br />{order.shipTo.postcode} {order.shipTo.city}<br />{order.shipTo.country}
          </p>
        </div>
        <div>
          <p className="label text-muted">Status</p>
          <p className="mt-3">Confirmed · being packed by the maker</p>
        </div>
        <div className="md:text-right">
          <p className="label text-muted">Total paid</p>
          <p className="mt-2 font-serif text-4xl tabular">{money(order.totalCents)}</p>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/collection" className="btn btn-ink">View your collection</Link>
        <Link href="/#live" className="btn btn-line">Keep browsing</Link>
      </div>
    </div>
  );
}
