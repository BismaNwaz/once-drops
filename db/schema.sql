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
