import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDrop, listDrops } from "@/lib/drops";
import { dropNo } from "@/lib/format";
import { DropImage } from "@/components/DropImage";
import { DropPanel } from "@/components/DropPanel";
import { LiveCard } from "@/components/DropCards";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/drops/[slug]">): Promise<Metadata> {
  const drop = await getDrop((await props.params).slug);
  return drop ? { title: `${drop.title} — ${drop.maker} · ONCE`, description: drop.tagline } : {};
}

export default async function DropPage(props: PageProps<"/drops/[slug]">) {
  const { slug } = await props.params;
  const drop = await getDrop(slug);
  if (!drop) notFound();
  const more = (await listDrops()).filter((d) => d.status === "live" && d.id !== drop.id).slice(0, 3);

  return (
    <article className="mx-auto max-w-[1400px] px-5 pt-8 md:px-10">
      <nav className="label flex gap-2 text-muted">
        <Link href="/" className="hover:text-ink">Drops</Link>
        <span>/</span>
        <span>{drop.category}</span>
        <span>/</span>
        <span className="text-ink">{dropNo(drop.number)}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <DropImage
              src={drop.image}
              alt={drop.title}
              tone={drop.tone}
              eager
              muted={drop.status === "sold_out" || drop.status === "ended"}
              className="aspect-[4/5] rounded-[28px] md:aspect-square"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <p className="label text-muted">
            {drop.maker} · {drop.origin}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(52px,6vw,88px)] leading-[0.92]">{drop.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">{drop.tagline}</p>

          <DropPanel drop={drop} />

          <section className="mt-14 border-t border-line pt-10">
            <h2 className="label text-muted">The story</h2>
            <p className="mt-5 font-serif text-[26px] leading-[1.3]">{drop.story}</p>
          </section>

          <section className="mt-12">
            <h2 className="label text-muted">Details</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {drop.details.map((d) => (
                <li key={d} className="py-3.5 text-[15px] text-ink-2">
                  {d}
                </li>
              ))}
              <li className="py-3.5 text-[15px] text-ink-2">
                Edition of {drop.editionSize} · limit {drop.perCustomerLimit} per collector
              </li>
            </ul>
          </section>
        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-32">
          <div className="mb-10 flex items-end justify-between border-b border-line pb-6">
            <h2 className="font-serif text-5xl">Also live</h2>
            <Link href="/#live" className="link-underline text-sm">All drops</Link>
          </div>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((d, i) => (
              <LiveCard key={d.id} drop={d} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
