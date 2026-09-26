import Link from "next/link";
import { groupDrops, listDrops } from "@/lib/drops";
import { dropNo, money } from "@/lib/format";
import { DropImage } from "@/components/DropImage";
import { BigCountdown, Countdown } from "@/components/Countdown";
import { StockBar } from "@/components/StockBar";
import { ArchiveCard, LiveCard } from "@/components/DropCards";
import { Waitlist } from "@/components/Waitlist";
import { LocalTime } from "@/components/LocalTime";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { live, upcoming, archive } = groupDrops(await listDrops());
  const [featured, ...restLive] = live;
  const next = upcoming[0];
  const collectors = archive.reduce((n, d) => n + d.sold, 0) + live.reduce((n, d) => n + d.sold, 0);

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 pt-14 md:px-10 lg:grid-cols-12 lg:pt-20">
        <div className="flex flex-col lg:col-span-5">
          <p className="label flex items-center gap-2 text-muted">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
            {live.length} drops live · {upcoming.length} opening soon
          </p>
          <h1 className="mt-8 animate-rise font-serif text-[clamp(64px,9vw,148px)] leading-[0.86] tracking-[-0.02em]">
            Made once.
            <br />
            <span className="italic text-ink/45">Gone once.</span>
          </h1>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
            Small-batch objects from independent makers, released at a set hour in numbered editions. When an edition
            sells out, it never comes back.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="#live" className="btn btn-ink">
              Shop the live drops
            </Link>
            <Link href="#how" className="btn btn-line">
              How it works
            </Link>
          </div>
          <dl className="mt-auto grid grid-cols-3 gap-6 border-t border-line pt-8 max-lg:mt-14">
            {[
              [String(live.length + upcoming.length + archive.length), "Editions released"],
              [collectors.toLocaleString(), "Pieces numbered"],
              ["10:00", "Min hold at checkout"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-serif text-4xl tabular">{v}</dt>
                <dd className="mt-1 text-[12.5px] text-muted">{k}</dd>
              </div>
            ))}
          </dl>
        </div>

        {featured && (
          <Link href={`/drops/${featured.slug}`} className="group relative block lg:col-span-7">
            <DropImage src={featured.image} alt={featured.title} tone={featured.tone} eager className="aspect-[4/5] rounded-[28px] md:aspect-[5/5]" />
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="label rounded-full bg-paper/90 px-3 py-1.5 backdrop-blur">{dropNo(featured.number)}</span>
              <span className="label rounded-full bg-accent px-3 py-1.5 text-paper">Almost gone</span>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-paper/92 p-6 backdrop-blur-md md:inset-x-6 md:bottom-6 md:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label text-muted">
                    {featured.maker} · {featured.origin}
                  </p>
                  <h2 className="mt-2 font-serif text-4xl leading-none md:text-5xl">{featured.title}</h2>
                </div>
                <div className="text-right">
                  <p className="font-serif text-3xl tabular">{money(featured.priceCents)}</p>
                  <p className="text-[12.5px] text-muted">
                    Closes in <Countdown to={featured.endsAt} className="text-ink" />
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <StockBar sold={featured.sold} held={featured.held} editionSize={featured.editionSize} />
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* ——— Live ——— */}
      <section id="live" className="mx-auto max-w-[1400px] scroll-mt-28 px-5 md:px-10">
        <SectionHead index="01" title="Live now" note="Each edition closes at its own hour, or when the last piece goes." />
        <div className={`grid gap-x-8 gap-y-16 sm:grid-cols-2 ${restLive.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {live.length === 0 && <p className="font-serif text-3xl italic text-muted">Nothing is live this minute — see what opens next below.</p>}
          {(restLive.length ? restLive : live).map((d, i) => (
            <LiveCard key={d.id} drop={d} index={i} />
          ))}
        </div>
      </section>

      {/* ——— Opening soon ——— */}
      {upcoming.length > 0 && (
      <section id="soon" className="mt-32 scroll-mt-28 bg-paper-2/70 py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <SectionHead index="02" title="Opening soon" note="Join a waitlist and we'll tell you the minute it opens." />
          {next && (
            <div className="grid items-center gap-10 rounded-[28px] bg-ink p-6 text-paper md:grid-cols-2 md:p-10">
              <DropImage src={next.image} alt={next.title} tone={next.tone} className="aspect-[4/3] rounded-2xl" />
              <div>
                <p className="label text-paper/50">
                  Next up · {dropNo(next.number)} · <LocalTime iso={next.startsAt} format="opening" />
                </p>
                <h3 className="mt-4 font-serif text-5xl leading-none md:text-6xl">{next.title}</h3>
                <p className="mt-4 max-w-md text-paper/70">{next.tagline}</p>
                <div className="mt-8 [&_div]:border-paper/15 [&_div]:bg-paper/5">
                  <BigCountdown to={next.startsAt} />
                </div>
                <p className="mt-6 text-sm text-paper/60">
                  {next.editionSize} pieces · {money(next.priceCents)} · {next.maker}
                </p>
                <div className="mt-6 max-w-md">
                  <Waitlist slug={next.slug} initialCount={next.waitlistCount} dark />
                </div>
              </div>
            </div>
          )}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {upcoming.slice(1).map((d) => (
              <div key={d.id} className="flex flex-col rounded-2xl border border-line bg-card p-5">
                <Link href={`/drops/${d.slug}`} className="group flex gap-4">
                  <DropImage src={d.image} alt={d.title} tone={d.tone} className="h-24 w-20 shrink-0 rounded-lg" />
                  <div>
                    <p className="label text-muted">{dropNo(d.number)}</p>
                    <h3 className="mt-1 font-serif text-2xl leading-tight">{d.title}</h3>
                    <p className="mt-1 text-[13px] text-muted">
                      Opens in <Countdown to={d.startsAt} className="text-ink" />
                    </p>
                  </div>
                </Link>
                <div className="mt-5 border-t border-line pt-4">
                  <Waitlist slug={d.slug} initialCount={d.waitlistCount} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ——— How it works ——— */}
      <section id="how" className="mx-auto mt-32 max-w-[1400px] scroll-mt-28 px-5 md:px-10">
        <SectionHead index="03" title="How a drop works" />
        <div className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-3">
          {[
            ["I", "Released at a set hour", "Every edition opens at a published time. No early access, no bots queueing — the countdown is the same for everyone."],
            ["II", "Held while you decide", "Reserving a piece takes it out of the edition for ten minutes, so nobody can buy it from under you at checkout."],
            ["III", "Numbered forever", "Each piece is assigned its edition number the moment you buy it. Yours is recorded in your collection — Nº 047 of 120, for good."],
          ].map(([n, t, body]) => (
            <div key={n} className="bg-card p-8 md:p-10">
              <span className="font-serif text-6xl italic text-accent">{n}</span>
              <h3 className="mt-8 font-serif text-3xl">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Archive ——— */}
      <section id="archive" className="mx-auto mt-32 max-w-[1400px] scroll-mt-28 px-5 md:px-10">
        <SectionHead index="04" title="The archive" note="Past editions. These won't be made again." />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {archive.map((d) => (
            <ArchiveCard key={d.id} drop={d} />
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHead({ index, title, note }: { index: string; title: string; note?: string }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="flex items-baseline gap-5">
        <span className="label text-muted">{index}</span>
        <h2 className="font-serif text-5xl leading-none md:text-6xl">{title}</h2>
      </div>
      {note && <p className="max-w-sm text-[14px] text-muted">{note}</p>}
    </div>
  );
}
