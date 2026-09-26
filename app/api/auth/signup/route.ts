import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { ApiError, handle, isEmail, readJson, requireString } from "@/lib/errors";

// POST /api/auth/signup { name, email, password }
export const POST = handle(async (req: Request) => {
  const body = await readJson<{ name?: string; email?: string; password?: string }>(req);
  const name = requireString(body.name, "Name", { max: 80 });
  const email = requireString(body.email, "Email", { max: 160 }).toLowerCase();
  if (!isEmail(email)) throw new ApiError(400, "Enter a valid email address.");
  if (typeof body.password !== "string" || body.password.length < 8)
    throw new ApiError(400, "Password must be at least 8 characters.");

  const hash = await bcrypt.hash(body.password, 10);
  const rows = await sql<{ id: number }[]>`
    INSERT INTO users (email, name, password_hash) VALUES (${email}, ${name}, ${hash})
    ON CONFLICT (email) DO NOTHING RETURNING id`;
  if (rows.length === 0) throw new ApiError(409, "An account with this email already exists. Sign in instead.");

  await startSession(rows[0].id);
  return NextResponse.json({ user: { id: rows[0].id, name, email } }, { status: 201 });
});
