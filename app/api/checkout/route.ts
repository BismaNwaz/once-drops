import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { checkout } from "@/lib/orders";
import { ApiError, handle, readJson, requireString } from "@/lib/errors";

// POST /api/checkout { name, line1, city, postcode, country, card }
// Demo payments: the card is format-checked and never stored or charged.
export const POST = handle(async (req: Request) => {
  const user = await getUser();
  if (!user) throw new ApiError(401, "Sign in to complete your order.");
  const b = await readJson<Record<string, string>>(req);
  const shipTo = {
    name: requireString(b.name, "Full name", { max: 100 }),
    line1: requireString(b.line1, "Address", { max: 200 }),
    city: requireString(b.city, "City", { max: 100 }),
    postcode: requireString(b.postcode, "Postcode", { max: 20 }),
    country: requireString(b.country, "Country", { max: 60 }),
  };
  const card = String(b.card ?? "").replace(/\s/g, "");
  if (!/^\d{16}$/.test(card)) throw new ApiError(400, "Enter a 16-digit card number (demo — use 4242 4242 4242 4242).");

  const number = await checkout(user.id, shipTo);
  return NextResponse.json({ number }, { status: 201 });
});
