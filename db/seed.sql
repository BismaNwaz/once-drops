-- ONCE — limited drops. Postgres schema.
-- Safe to run repeatedly (idempotent).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only a SHA-256 hash of the session token is stored; the raw token lives in an httpOnly cookie.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS drops (
  id                 SERIAL PRIMARY KEY,
  number             INTEGER NOT NULL UNIQUE,          -- "Drop 014"
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  maker              TEXT NOT NULL,
  origin             TEXT NOT NULL,
  category           TEXT NOT NULL,
  tagline            TEXT NOT NULL,
  story              TEXT NOT NULL,
  details            JSONB NOT NULL DEFAULT '[]',
  price_cents        INTEGER NOT NULL CHECK (price_cents > 0),
  edition_size       INTEGER NOT NULL CHECK (edition_size > 0),
  sold               INTEGER NOT NULL DEFAULT 0 CHECK (sold >= 0),
  per_customer_limit INTEGER NOT NULL DEFAULT 2,
  image              TEXT NOT NULL,
  tone               TEXT NOT NULL DEFAULT '#d9d2c5',  -- backdrop colour behind the product shot
  starts_at          TIMESTAMPTZ NOT NULL,
  ends_at            TIMESTAMPTZ NOT NULL,
  sold_out_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sold <= edition_size),
  CHECK (ends_at > starts_at)
);

-- A hold reserves pieces for 10 minutes. "The bag" is simply a shopper's active holds.
-- owner_key is 'u:<user id>' for signed-in shoppers or 'g:<uuid>' for guests.
CREATE TABLE IF NOT EXISTS holds (
  id         SERIAL PRIMARY KEY,
  drop_id    INTEGER NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  owner_key  TEXT NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drop_id, owner_key)
);
CREATE INDEX IF NOT EXISTS holds_active_idx ON holds (drop_id, expires_at);
CREATE INDEX IF NOT EXISTS holds_owner_idx ON holds (owner_key);

CREATE TABLE IF NOT EXISTS waitlist (
  drop_id    INTEGER NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (drop_id, email)
);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  number         TEXT NOT NULL UNIQUE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  total_cents    INTEGER NOT NULL,
  ship_to        JSONB NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC);

-- Every piece sold gets a permanent edition number, e.g. No. 047 of 300.
CREATE TABLE IF NOT EXISTS order_items (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  drop_id         INTEGER NOT NULL REFERENCES drops(id),
  title           TEXT NOT NULL,
  image           TEXT NOT NULL,
  price_cents     INTEGER NOT NULL,
  quantity        INTEGER NOT NULL,
  edition_numbers INTEGER[] NOT NULL
);

-- Seed (times relative to now)
TRUNCATE order_items, orders, waitlist, holds, drops RESTART IDENTITY CASCADE;
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (21, 'tide-vessel', 'Tide Vessel', 'Studio Maré', 'Porto, Portugal', 'Ceramics', 'Wheel-thrown stoneware, glazed in salt ash.', 'Each vessel is thrown by hand from a single 2 kg pull of stoneware and fired twice. The glaze is mixed from ash gathered on the Leça coastline, so no two surfaces break the same way. Studio Maré makes one kiln load a season — this is it.', '["Height 24 cm, Ø 14 cm","Food-safe interior glaze","Signed and numbered on the base","Ships in a hand-folded linen wrap"]'::jsonb, 18500, 120, 74, 2, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&q=80&auto=format&fit=crop', '#d8cbb8', now() + interval '-300 minutes', now() + interval '16980 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (22, 'meridian-01', 'Meridian 01', 'Halden Watch Co.', 'Biel, Switzerland', 'Timepieces', 'A 38 mm field watch with a hand-brushed steel case.', 'Halden''s first automatic. A quiet, legible dial with lume applied by hand, a sapphire crystal and a movement regulated in five positions. The caseback is engraved with your edition number before it leaves the workshop.', '["38 mm 316L steel, 10 ATM","Swiss automatic, 42 h reserve","Sapphire crystal, anti-reflective","Horween leather strap"]'::jsonb, 64000, 300, 243, 2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop', '#cfd0cb', now() + interval '-1560 minutes', now() + interval '12840 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (23, 'no-9-fig-leaf', 'Fig Leaf', 'Atelier Oriel', 'Grasse, France', 'Fragrance', 'Green fig, vetiver and warm cedar. 50 ml eau de parfum.', 'Composed over two summers in Grasse from figs picked before sunrise. Macerated for eight weeks and bottled by hand in weighted glass. Once this batch is gone, the formula goes back in the drawer.', '["50 ml eau de parfum, 18% concentration","Top: fig leaf, bergamot","Heart: vetiver, iris","Base: cedar, soft musk"]'::jsonb, 14800, 400, 382, 2, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80&auto=format&fit=crop', '#d9d3c2', now() + interval '-120 minutes', now() + interval '12840 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (24, 'fold-tote', 'Fold Tote', 'Casa Velluto', 'Florence, Italy', 'Leather', 'One piece of vegetable-tanned leather, folded — not stitched.', 'Cut from a single hide panel and shaped around a wooden form, the Fold Tote has only four seams. Vegetable tanning means it will darken with you. Casa Velluto has a small allocation of hides each quarter; this drop uses all of it.', '["Full-grain vegetable-tanned leather","40 × 34 × 12 cm","Unlined interior, one slip pocket","Hand-burnished edges"]'::jsonb, 42000, 80, 28, 2, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80&auto=format&fit=crop', '#cdb9a3', now() + interval '-540 minutes', now() + interval '19620 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (25, 'arc-lamp', 'Arc Table Lamp', 'Nordvik Form', 'Copenhagen, Denmark', 'Objects', 'Spun aluminium shade on a solid oak base.', 'A lamp designed around one gesture: the shade tilts in a single arc and stays exactly where you leave it. The base is turned from Danish oak offcuts, so each grain is different.', '["Height 42 cm","Dimmable warm LED, 2700 K","Solid oak base, oiled","Braided fabric cable, 2 m"]'::jsonb, 29500, 150, 30, 2, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80&auto=format&fit=crop', '#d6d1c8', now() + interval '-60 minutes', now() + interval '20100 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (26, 'lowline-chair', 'Lowline Lounge Chair', 'Nordvik Form', 'Copenhagen, Denmark', 'Furniture', 'A low, deep seat in ash and undyed wool.', 'Built for long evenings: a generous seat 38 cm off the floor, joined with hidden wooden dowels and wrapped in undyed wool bouclé.', '["Solid ash frame","Undyed wool bouclé","W 72 × D 80 × H 70 cm","Made to order in 6 weeks"]'::jsonb, 145000, 40, 0, 2, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80&auto=format&fit=crop', '#d3c8b8', now() + interval '30 minutes', now() + interval '17310 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (27, 'studio-cans', 'Studio Cans', 'Resonant Audio', 'Berlin, Germany', 'Sound', 'Open-back headphones with walnut cups.', 'Tuned in a Berlin mastering room for people who listen, not just hear. 50 mm drivers, replaceable everything, and walnut cups cut from a single board.', '["50 mm dynamic drivers","Open-back, 32 Ω","Walnut ear cups","Detachable braided cable"]'::jsonb, 39000, 250, 0, 2, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop', '#cbc6bd', now() + interval '1800 minutes', now() + interval '16200 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (28, 'merino-crew', 'Merino Crew', 'Holm & Hale', 'Donegal, Ireland', 'Knitwear', 'Heavyweight merino, knitted slowly on vintage frames.', 'Knitted at a quarter of modern speed on 1960s frames, so the fabric stays dense and soft for decades. Dyed in small lots — this colour will not be repeated.', '["100% extra-fine merino","12-gauge, 480 g","Fully fashioned seams","Colour: Peat"]'::jsonb, 21000, 200, 0, 2, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=80&auto=format&fit=crop', '#cfc4b4', now() + interval '5760 minutes', now() + interval '20160 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (29, 'pour-over-set', 'Pour-Over Set', 'Studio Maré', 'Porto, Portugal', 'Ceramics', 'Dripper, carafe and two cups in speckled stoneware.', 'Studio Maré''s morning ritual, made in the same kiln as the Tide Vessel.', '["Dripper, 600 ml carafe, 2 cups","Speckled stoneware","Dishwasher safe","Includes 40 paper filters"]'::jsonb, 16500, 150, 0, 2, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop', '#d7ccbd', now() + interval '12960 minutes', now() + interval '27360 minutes', NULL);
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (18, 'rangefinder-m', 'Rangefinder M', 'Kōgen Optics', 'Osaka, Japan', 'Cameras', 'A restored 1970s rangefinder, re-skinned in black leather.', 'Thirty cameras, each stripped, cleaned and recalibrated by one technician in Osaka.', '["Serviced 1970s body","40 mm f/1.7 lens","New light seals","12-month warranty"]'::jsonb, 52000, 30, 30, 2, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80&auto=format&fit=crop', '#cdc7bc', now() + interval '-12960 minutes', now() + interval '-5760 minutes', now() + interval '-12957 minutes');
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (19, 'keyhole-shades', 'Keyhole Shades', 'Vista Lane', 'Cadore, Italy', 'Eyewear', 'Hand-polished acetate with mineral glass lenses.', 'Cut from Mazzucchelli acetate blocks and polished in a tumbler for three days.', '["Mazzucchelli acetate","Mineral glass, UV400","Five-barrel hinges","Leather case"]'::jsonb, 24000, 180, 180, 2, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80&auto=format&fit=crop', '#d4cdbf', now() + interval '-8640 minutes', now() + interval '-2880 minutes', now() + interval '-8593 minutes');
INSERT INTO drops (number, slug, title, maker, origin, category, tagline, story, details, price_cents, edition_size, sold, per_customer_limit, image, tone, starts_at, ends_at, sold_out_at) VALUES (20, 'court-low', 'Court Low', 'Pietra Shoes', 'Marche, Italy', 'Footwear', 'A clean leather court shoe on a stitched cupsole.', 'Made in a family workshop that has stitched soles since 1958.', '["Calf leather upper","Blake-stitched rubber cupsole","Leather lining","Made in Italy"]'::jsonb, 33000, 220, 220, 2, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80&auto=format&fit=crop', '#d2cbc0', now() + interval '-4320 minutes', now() + interval '1440 minutes', now() + interval '-4192 minutes');
INSERT INTO waitlist (drop_id, email) SELECT d.id, 'guest' || g || '@example.com' FROM drops d, generate_series(1, 40 + (d.number * 37) % 300) g WHERE d.starts_at > now() ON CONFLICT DO NOTHING;
SELECT count(*) AS drops_seeded FROM drops;
