import { NextResponse } from "next/server";
import { getDrop } from "@/lib/drops";
import { ApiError, handle } from "@/lib/errors";

// GET /api/drops/:slug/stock — small payload the drop page polls every few seconds.
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/drops/[slug]/stock">) => {
  const { slug } = await ctx.params;
  const d = await getDrop(slug);
  if (!d) throw new ApiError(404, "Drop not found.");
  return NextResponse.json(
    { status: d.status, sold: d.sold, held: d.held, available: d.available, editionSize: d.editionSize, waitlistCount: d.waitlistCount, serverTime: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
});
