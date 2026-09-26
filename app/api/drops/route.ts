import { NextResponse } from "next/server";
import { groupDrops, listDrops } from "@/lib/drops";
import { handle } from "@/lib/errors";

// GET /api/drops -> { live, upcoming, archive }
export const GET = handle(async () => {
  return NextResponse.json(groupDrops(await listDrops()));
});
