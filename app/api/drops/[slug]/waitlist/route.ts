import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ApiError, handle, isEmail, readJson } from "@/lib/errors";

// POST /api/drops/:slug/waitlist { email? } — signed-in users can omit the email.
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/drops/[slug]/waitlist">) => {
  const { slug } = await ctx.params;
  const body = await readJson<{ email?: string }>(req);
  const user = await getUser();
  const email = (body.email ?? user?.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) throw new ApiError(400, "Enter a valid email address.");

  const [drop] = await sql<{ id: number; upcoming: boolean }[]>`
    SELECT id, starts_at > now() AS upcoming FROM drops WHERE slug = ${slug}`;
  if (!drop) throw new ApiError(404, "Drop not found.");
  if (!drop.upcoming) throw new ApiError(409, "This drop is already open.");

  await sql`INSERT INTO waitlist (drop_id, email) VALUES (${drop.id}, ${email}) ON CONFLICT DO NOTHING`;
  const [{ n }] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM waitlist WHERE drop_id = ${drop.id}`;
  return NextResponse.json({ ok: true, email, waitlistCount: n });
});
