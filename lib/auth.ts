import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { sql } from "./db";

export const SESSION_COOKIE = "once_session";
export const GUEST_COOKIE = "once_guest";
const SESSION_DAYS = 30;

export type User = { id: number; email: string; name: string };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql<User[]>`
    SELECT u.id, u.email, u.name
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > now()`;
  return rows[0] ?? null;
}

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await sql`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (${hashToken(token)}, ${userId}, ${expires})`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { ...cookieBase, expires });

  // Anything a guest put on hold moves into their account.
  const guest = jar.get(GUEST_COOKIE)?.value;
  if (guest) {
    await adoptGuestHolds(`g:${guest}`, `u:${userId}`);
    jar.delete(GUEST_COOKIE);
  }
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
  jar.delete(SESSION_COOKIE);
}

/** Identifies whoever owns the bag: a signed-in user or an anonymous guest. */
export async function getOwnerKey(opts: { create: boolean }): Promise<string | null> {
  const user = await getUser();
  if (user) return `u:${user.id}`;
  const jar = await cookies();
  let guest = jar.get(GUEST_COOKIE)?.value;
  if (!guest) {
    if (!opts.create) return null;
    guest = randomUUID();
    jar.set(GUEST_COOKIE, guest, { ...cookieBase, maxAge: 60 * 60 * 24 * 7 });
  }
  return `g:${guest}`;
}

async function adoptGuestHolds(from: string, to: string) {
  await sql.begin(async (tx) => {
    // If the account already holds the same drop, keep the account's hold and drop the guest's.
    await tx`
      DELETE FROM holds g USING holds u
      WHERE g.owner_key = ${from} AND u.owner_key = ${to} AND g.drop_id = u.drop_id`;
    await tx`UPDATE holds SET owner_key = ${to} WHERE owner_key = ${from}`;
  });
}
