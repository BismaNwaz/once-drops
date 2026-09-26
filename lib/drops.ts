import { sql } from "./db";

export type DropStatus = "upcoming" | "live" | "sold_out" | "ended";

export type Drop = {
  id: number;
  number: number;
  slug: string;
  title: string;
  maker: string;
  origin: string;
  category: string;
  tagline: string;
  story: string;
  details: string[];
  priceCents: number;
  editionSize: number;
  sold: number;
  held: number;
  available: number;
  perCustomerLimit: number;
  image: string;
  tone: string;
  startsAt: string;
  endsAt: string;
  soldOutAt: string | null;
  status: DropStatus;
  waitlistCount: number;
};

// Status and availability are always derived in the database, so every page and
// API response agrees with what checkout will actually allow.
const dropSelect = () => sql`
  SELECT d.id, d.number, d.slug, d.title, d.maker, d.origin, d.category, d.tagline, d.story, d.details,
         d.price_cents      AS "priceCents",
         d.edition_size     AS "editionSize",
         d.sold,
         COALESCE(h.held, 0)::int AS held,
         GREATEST(d.edition_size - d.sold - COALESCE(h.held, 0), 0)::int AS available,
         d.per_customer_limit AS "perCustomerLimit",
         d.image, d.tone,
         d.starts_at   AS "startsAt",
         d.ends_at     AS "endsAt",
         d.sold_out_at AS "soldOutAt",
         CASE
           WHEN d.starts_at > now()               THEN 'upcoming'
           WHEN d.sold >= d.edition_size          THEN 'sold_out'
           WHEN d.ends_at <= now()                THEN 'ended'
           ELSE 'live'
         END AS status,
         COALESCE(w.n, 0)::int AS "waitlistCount"
  FROM drops d
  LEFT JOIN LATERAL (
    SELECT SUM(quantity) AS held FROM holds WHERE drop_id = d.id AND expires_at > now()
  ) h ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS n FROM waitlist WHERE drop_id = d.id
  ) w ON true`;

export async function listDrops(): Promise<Drop[]> {
  const rows = await sql<Drop[]>`${dropSelect()} ORDER BY d.starts_at`;
  return rows.map(normalize);
}

export async function getDrop(slug: string): Promise<Drop | null> {
  const rows = await sql<Drop[]>`${dropSelect()} WHERE d.slug = ${slug}`;
  return rows[0] ? normalize(rows[0]) : null;
}

export function groupDrops(drops: Drop[]) {
  return {
    live: drops.filter((d) => d.status === "live").sort((a, b) => sellThrough(b) - sellThrough(a)),
    upcoming: drops.filter((d) => d.status === "upcoming"),
    archive: drops
      .filter((d) => d.status === "sold_out" || d.status === "ended")
      .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt)),
  };
}

export const sellThrough = (d: Pick<Drop, "sold" | "editionSize">) => d.sold / d.editionSize;

function normalize(d: Drop): Drop {
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : (v as string));
  return {
    ...d,
    startsAt: iso(d.startsAt),
    endsAt: iso(d.endsAt),
    soldOutAt: d.soldOutAt ? iso(d.soldOutAt) : null,
  };
}
