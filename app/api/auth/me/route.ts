import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { handle } from "@/lib/errors";

export const GET = handle(async () => {
  return NextResponse.json({ user: await getUser() }, { headers: { "Cache-Control": "no-store" } });
});
