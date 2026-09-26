import { NextResponse } from "next/server";
import { getOwnerKey } from "@/lib/auth";
import { getBag, placeHold } from "@/lib/bag";
import { handle, readJson, requireString } from "@/lib/errors";

// GET /api/bag -> the shopper's active holds
export const GET = handle(async () => {
  const owner = await getOwnerKey({ create: false });
  return NextResponse.json({ items: await getBag(owner) }, { headers: { "Cache-Control": "no-store" } });
});

// POST /api/bag { slug, quantity } -> place (or refresh) a 10-minute hold
export const POST = handle(async (req: Request) => {
  const body = await readJson<{ slug?: string; quantity?: number }>(req);
  const slug = requireString(body.slug, "Drop");
  const owner = (await getOwnerKey({ create: true }))!;
  const hold = await placeHold(owner, slug, Number(body.quantity ?? 1));
  return NextResponse.json({ ...hold, items: await getBag(owner) }, { status: 201 });
});
