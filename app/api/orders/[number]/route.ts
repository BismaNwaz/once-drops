import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { ApiError, handle } from "@/lib/errors";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/orders/[number]">) => {
  const user = await getUser();
  if (!user) throw new ApiError(401, "Sign in to see this order.");
  const { number } = await ctx.params;
  const [order] = await listOrders(user.id, number);
  if (!order) throw new ApiError(404, "Order not found.");
  return NextResponse.json(order);
});
