import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { ApiError, handle, readJson, requireString } from "@/lib/errors";

// POST /api/auth/login { email, password }
export const POST = handle(async (req: Request) => {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = requireString(body.email, "Email").toLowerCase();
  const password = requireString(body.password, "Password");

  const [user] = await sql<{ id: number; name: string; email: string; password_hash: string }[]>`
    SELECT id, name, email, password_hash FROM users WHERE email = ${email}`;
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    throw new ApiError(401, "That email and password don't match.");

  await startSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
});
