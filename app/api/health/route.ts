import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/health — proves the deployment is talking to a real database.
export async function GET() {
  const started = Date.now();
  try {
    const [row] = await sql<{ drops: number; now: Date }[]>`SELECT (SELECT count(*) FROM drops)::int AS drops, now()`;
    return NextResponse.json({ ok: true, database: "postgres", drops: row.drops, dbTime: row.now, latencyMs: Date.now() - started });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 503 });
  }
}
