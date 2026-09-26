import postgres from "postgres";

// One connection pool per server instance, created lazily on first query so that
// importing this module never needs DATABASE_URL (e.g. during `next build`).
const globalForDb = globalThis as unknown as { sqlClient?: postgres.Sql };

function client(): postgres.Sql {
  if (globalForDb.sqlClient) return globalForDb.sqlClient;
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  // Neon adds channel_binding=require, which postgres.js would forward to the server as an unknown setting.
  const parsed = new URL(raw);
  parsed.searchParams.delete("channel_binding");
  const url = parsed.toString();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  globalForDb.sqlClient = postgres(url, {
    ssl: isLocal ? false : "require",
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    prepare: false, // required for pooled (PgBouncer) connections such as Neon's -pooler host
    idle_timeout: 20,
  });
  return globalForDb.sqlClient;
}

export const sql = new Proxy(function () {} as unknown as postgres.Sql, {
  apply: (_t, _this, args) => (client() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_t, prop) => {
    const c = client() as unknown as Record<string | symbol, unknown>;
    const v = c[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
});