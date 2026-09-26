import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { handle } from "@/lib/errors";

// POST /api/auth/demo — creates a private throwaway account so every reviewer
// gets a clean collection and their own per-collector limits.
export const POST = handle(async () => {
  const id = randomBytes(3).toString("hex");
  const email = `guest-${id}@demo.once.shop`;
  const hash = await bcrypt.hash(randomBytes(16).toString("hex"), 8);
  const [user] = await sql<{ id: number }[]>`
    INSERT INTO users (email, name, password_hash) VALUES (${email}, ${"Guest Collector"}, ${hash}) RETURNING id`;
  await startSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: "Guest Collector", email } }, { status: 201 });
});
