import { NextResponse } from "next/server";
import { getDrop } from "@/lib/drops";
import { ApiError, handle } from "@/lib/errors";

// GET /api/drops/:slug
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/drops/[slug]">) => {
  const { slug } = await ctx.params;
  const drop = await getDrop(slug);
  if (!drop) throw new ApiError(404, "Drop not found.");
  return NextResponse.json(drop);
});
