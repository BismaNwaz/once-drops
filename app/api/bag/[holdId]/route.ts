import { NextResponse } from "next/server";
import { getOwnerKey } from "@/lib/auth";
import { getBag, releaseHold } from "@/lib/bag";
import { ApiError, handle } from "@/lib/errors";

// DELETE /api/bag/:holdId -> release a hold back to the pool
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/bag/[holdId]">) => {
  const { holdId } = await ctx.params;
  const owner = await getOwnerKey({ create: false });
  if (!owner) throw new ApiError(404, "Your bag is empty.");
  await releaseHold(owner, Number(holdId));
  return NextResponse.json({ items: await getBag(owner) });
});
