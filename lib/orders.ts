import { randomBytes } from "node:crypto";
import { sql } from "./db";
import { ApiError } from "./errors";

export type ShipTo = { name: string; line1: string; city: string; postcode: string; country: string };

export type OrderItem = {
  slug: string;
  title: string;
  maker: string;
  image: string;
  tone: string;
  priceCents: number;
  quantity: number;
  editionNumbers: number[];
  editionSize: number;
  dropNumber: number;
};

export type Order = {
  number: string;
  createdAt: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shipTo: ShipTo;
  items: OrderItem[];
};

const orderNumber = () => "ONC-" + randomBytes(4).toString("hex").toUpperCase().slice(0, 7);

/**
 * Turns the user's active holds into an order in one transaction:
 * locks each drop, assigns sequential edition numbers, and clears the holds.
 */
export async function checkout(userId: number, shipTo: ShipTo): Promise<string> {
  const ownerKey = `u:${userId}`;
  return sql.begin(async (tx) => {
    const holds = await tx<{ id: number; drop_id: number; quantity: number }[]>`
      SELECT id, drop_id, quantity FROM holds
      WHERE owner_key = ${ownerKey} AND expires_at > now()
      ORDER BY drop_id
      FOR UPDATE`;
    if (holds.length === 0) throw new ApiError(409, "Your bag is empty, or your holds have expired.");

    let subtotal = 0;
    const lines: { dropId: number; title: string; image: string; price: number; qty: number; editions: number[] }[] = [];

    for (const h of holds) {
      const [d] = await tx<
        { id: number; title: string; image: string; price_cents: number; sold: number; edition_size: number; live: boolean }[]
      >`
        SELECT id, title, image, price_cents, sold, edition_size, (starts_at <= now() AND ends_at > now()) AS live
        FROM drops WHERE id = ${h.drop_id} FOR UPDATE`;
      if (!d.live) throw new ApiError(409, `${d.title} is no longer open.`);
      if (d.sold + h.quantity > d.edition_size) throw new ApiError(409, `${d.title} sold out before checkout.`);

      const editions = Array.from({ length: h.quantity }, (_, i) => d.sold + i + 1);
      await tx`
        UPDATE drops SET sold = sold + ${h.quantity},
          sold_out_at = CASE WHEN sold + ${h.quantity} >= edition_size THEN now() ELSE sold_out_at END
        WHERE id = ${d.id}`;
      subtotal += d.price_cents * h.quantity;
      lines.push({ dropId: d.id, title: d.title, image: d.image, price: d.price_cents, qty: h.quantity, editions });
    }

    const shipping = 0; // complimentary insured shipping
    const number = orderNumber();
    const [order] = await tx<{ id: number }[]>`
      INSERT INTO orders (number, user_id, subtotal_cents, shipping_cents, total_cents, ship_to)
      VALUES (${number}, ${userId}, ${subtotal}, ${shipping}, ${subtotal + shipping}, ${tx.json(shipTo)})
      RETURNING id`;
    for (const l of lines) {
      await tx`
        INSERT INTO order_items (order_id, drop_id, title, image, price_cents, quantity, edition_numbers)
        VALUES (${order.id}, ${l.dropId}, ${l.title}, ${l.image}, ${l.price}, ${l.qty}, ${l.editions})`;
    }
    await tx`DELETE FROM holds WHERE owner_key = ${ownerKey}`;
    return number;
  });
}

export async function listOrders(userId: number, number?: string): Promise<Order[]> {
  const orders = await sql<(Omit<Order, "items" | "createdAt"> & { id: number; createdAt: Date })[]>`
    SELECT id, number, created_at AS "createdAt", subtotal_cents AS "subtotalCents",
           shipping_cents AS "shippingCents", total_cents AS "totalCents", ship_to AS "shipTo"
    FROM orders
    WHERE user_id = ${userId} ${number ? sql`AND number = ${number}` : sql``}
    ORDER BY created_at DESC`;
  if (orders.length === 0) return [];

  const items = await sql<(OrderItem & { orderId: number })[]>`
    SELECT oi.order_id AS "orderId", d.slug, oi.title, d.maker, oi.image, d.tone,
           oi.price_cents AS "priceCents", oi.quantity, oi.edition_numbers AS "editionNumbers",
           d.edition_size AS "editionSize", d.number AS "dropNumber"
    FROM order_items oi JOIN drops d ON d.id = oi.drop_id
    WHERE oi.order_id IN ${sql(orders.map((o) => o.id))}
    ORDER BY oi.id`;

  return orders.map(({ id, createdAt, ...o }) => ({
    ...o,
    createdAt: new Date(createdAt).toISOString(),
    items: items.filter((i) => i.orderId === id).map((i) => ({ ...i, orderId: undefined })),
  }));
}
