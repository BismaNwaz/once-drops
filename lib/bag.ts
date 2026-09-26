import { sql } from "./db";
import { ApiError } from "./errors";

export const HOLD_MINUTES = 10;

export type BagItem = {
  holdId: number;
  slug: string;
  number: number;
  title: string;
  maker: string;
  image: string;
  tone: string;
  priceCents: number;
  quantity: number;
  expiresAt: string;
};

export async function getBag(ownerKey: string | null): Promise<BagItem[]> {
  if (!ownerKey) return [];
  // Expired holds are dead weight; tidy this shopper's up on read.
  await sql`DELETE FROM holds WHERE owner_key = ${ownerKey} AND expires_at <= now()`;
  const rows = await sql<(BagItem & { expiresAt: Date })[]>`
    SELECT h.id AS "holdId", d.slug, d.number, d.title, d.maker, d.image, d.tone,
           d.price_cents AS "priceCents", h.quantity, h.expires_at AS "expiresAt"
    FROM holds h JOIN drops d ON d.id = h.drop_id
    WHERE h.owner_key = ${ownerKey}
    ORDER BY h.created_at`;
  return rows.map((r) => ({ ...r, expiresAt: new Date(r.expiresAt).toISOString() }));
}

/**
 * Reserve pieces of a live drop for HOLD_MINUTES. The drop row is locked for the
 * duration of the transaction, so two shoppers can never hold the same last piece.
 */
export async function placeHold(ownerKey: string, slug: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError(400, "Choose at least one piece.");

  return sql.begin(async (tx) => {
    const [drop] = await tx<
      { id: number; sold: number; edition_size: number; per_customer_limit: number; live: boolean; upcoming: boolean }[]
    >`
      SELECT id, sold, edition_size, per_customer_limit,
             (starts_at <= now() AND ends_at > now()) AS live,
             (starts_at > now()) AS upcoming
      FROM drops WHERE slug = ${slug} FOR UPDATE`;
    if (!drop) throw new ApiError(404, "This drop doesn't exist.");
    if (drop.upcoming) throw new ApiError(409, "This drop hasn't opened yet.");
    if (!drop.live) throw new ApiError(409, "This drop has closed.");

    let alreadyOwned = 0;
    if (ownerKey.startsWith("u:")) {
      const [row] = await tx<{ n: number }[]>`
        SELECT COALESCE(SUM(oi.quantity), 0)::int AS n
        FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE o.user_id = ${Number(ownerKey.slice(2))} AND oi.drop_id = ${drop.id}`;
      alreadyOwned = row.n;
    }
    const allowance = drop.per_customer_limit - alreadyOwned;
    if (allowance <= 0) throw new ApiError(409, `You already own the maximum of ${drop.per_customer_limit} from this drop.`);
    if (quantity > allowance) throw new ApiError(409, `Limit ${drop.per_customer_limit} per collector — you can add ${allowance} more.`);

    const [{ othersHeld }] = await tx<{ othersHeld: number }[]>`
      SELECT COALESCE(SUM(quantity), 0)::int AS "othersHeld" FROM holds
      WHERE drop_id = ${drop.id} AND owner_key <> ${ownerKey} AND expires_at > now()`;
    const available = drop.edition_size - drop.sold - othersHeld;
    if (available <= 0) throw new ApiError(409, "Every remaining piece is sold or on hold. Check back in a few minutes.");
    if (quantity > available) throw new ApiError(409, `Only ${available} left — try a smaller quantity.`);

    const [hold] = await tx<{ id: number; expiresAt: Date }[]>`
      INSERT INTO holds (drop_id, owner_key, quantity, expires_at)
      VALUES (${drop.id}, ${ownerKey}, ${quantity}, now() + ${HOLD_MINUTES + " minutes"}::interval)
      ON CONFLICT (drop_id, owner_key)
      DO UPDATE SET quantity = EXCLUDED.quantity, expires_at = EXCLUDED.expires_at
      RETURNING id, expires_at AS "expiresAt"`;
    return { holdId: hold.id, expiresAt: new Date(hold.expiresAt).toISOString() };
  });
}

export async function releaseHold(ownerKey: string, holdId: number) {
  const rows = await sql`DELETE FROM holds WHERE id = ${holdId} AND owner_key = ${ownerKey} RETURNING id`;
  if (rows.length === 0) throw new ApiError(404, "That item isn't in your bag.");
}
