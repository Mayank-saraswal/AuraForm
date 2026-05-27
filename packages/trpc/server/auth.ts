// packages/trpc/server/auth.ts
// Session validation for the API server.
// Decodes the NextAuth JWT session token from cookies.
// With JWT strategy, sessions are NOT stored in the database.

import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  emailVerified: Date | null;
}

/**
 * Validate a NextAuth session token from request headers/cookies.
 * Returns the user if valid, null otherwise.
 *
 * With JWT strategy, the token is a JWE (encrypted JWT). We decode it
 * using the same secret NextAuth uses. If decoding fails, we fall back
 * to looking up the user by the token's sub claim via database.
 */
export async function getSessionFromRequest(
  headers: Record<string, string | string[] | undefined>
): Promise<SessionUser | null> {
  try {
    const cookieHeader = headers["cookie"];
    if (!cookieHeader || typeof cookieHeader !== "string") return null;

    // Parse cookies to find the session token
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key?.trim(), rest.join("=").trim()];
      })
    );

    const sessionToken =
      cookies["__Secure-authjs.session-token"] ||
      cookies["authjs.session-token"] ||
      cookies["__Secure-next-auth.session-token"] ||
      cookies["next-auth.session-token"];

    if (!sessionToken) return null;

    // Decode the JWT using jose (same lib NextAuth v5 uses)
    let userId: string | null = null;
    try {
      const { jwtDecrypt } = await import("jose");
      const secret = process.env["AUTH_SECRET"] || process.env["NEXTAUTH_SECRET"];
      if (!secret) return null;

      // NextAuth v5 derives a 256-bit key from the secret via HKDF
      const { hkdf } = await import("@panva/hkdf");
      const derivedKey = await hkdf(
        "sha256",
        secret,
        "",
        "Auth.js Generated Encryption Key",
        32
      );

      const { payload } = await jwtDecrypt(sessionToken, new Uint8Array(derivedKey), {
        clockTolerance: 15,
      });

      userId = (payload.id as string) || (payload.sub as string) || null;
    } catch {
      // JWT decode failed — token invalid or expired
      return null;
    }

    if (!userId) return null;

    // Fetch the user from database
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        plan: usersTable.plan,
        emailVerified: usersTable.emailVerified,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) return null;

    return user;
  } catch {
    return null;
  }
}
