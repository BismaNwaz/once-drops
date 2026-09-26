// Creates the schema and seeds the catalogue.
//   npm run db:setup           -> create tables, seed drops + demo account if empty
//   npm run db:setup -- --reset -> wipe everything and reseed (fresh schedule)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { seedDrops } from "./drops";

const url = process.env.DATABASE_URL?.replace(/[?&]channel_binding=[^&]*/, "");
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const sql = postgres(url, { ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require", prepare: false, max: 1 });

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) {
    await sql`DROP TABLE IF EXISTS order_items, orders, waitlist, holds, drops, sessions, users CASCADE`;
    console.log("✓ dropped existing tables");
  }

  await sql.unsafe(readFileSync(join(__dirname, "schema.sql"), "utf8"));
  console.log("✓ schema ready");

  const [{ count }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM drops`;
  if (count === 0) {
    const now = Date.now();
    const hour = 3_600_000;
    for (const d of seedDrops) {
      const starts = new Date(now + d.startsInHours * hour);
      const ends = new Date(starts.getTime() + d.lengthHours * hour);
      const sold = Math.round(d.editionSize * d.soldRatio);
      const soldOutAt =
        sold >= d.editionSize ? new Date(starts.getTime() + (d.soldOutAfterMinutes ?? 30) * 60_000) : null;
      await sql`
        INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details,
                           price_cents, edition_size, sold, per_customer_limit, image, tone,
                           starts_at, ends_at, sold_out_at)
        VALUES (${d.number}, ${d.slug}, ${d.title}, ${d.maker}, ${d.origin}, ${d.category}, ${d.tagline},
                ${d.story}, ${sql.json(d.details)}, ${Math.round(d.price * 100)}, ${d.editionSize}, ${sold},
                ${d.limit ?? 2}, ${d.image}, ${d.tone}, ${starts}, ${ends}, ${soldOutAt})`;
    }
    // Give upcoming drops a believable waitlist.
    const upcoming = await sql<{ id: number }[]>`SELECT id FROM drops WHERE starts_at > now()`;
    for (const { id } of upcoming) {
      const n = 40 + Math.floor(Math.random() * 380);
      await sql`
        INSERT INTO waitlist (drop_id, email)
        SELECT ${id}, 'guest' || g || '@example.com' FROM generate_series(1, ${n}) g
        ON CONFLICT DO NOTHING`;
    }
    console.log(`✓ seeded ${seedDrops.length} drops`);
  } else {
    console.log(`• drops already present (${count}), skipped seeding`);
  }

  const hash = await bcrypt.hash("once-demo", 10);
  await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES ('demo@once.shop', 'Demo Collector', ${hash})
    ON CONFLICT (email) DO NOTHING`;
  console.log("✓ demo account: demo@once.shop / once-demo");

  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
