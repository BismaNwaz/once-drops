import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { ApiError, handle } from "@/lib/errors";

export const GET = handle(async () => {
  const user = await getUser();
  if (!user) throw new ApiError(401, "Sign in to see your collection.");
  return NextResponse.json({ orders: await listOrders(user.id) });
});
