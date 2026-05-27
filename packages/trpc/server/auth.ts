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

    let sessionCookieName = "";
    if (cookies["__Secure-authjs.session-token"]) sessionCookieName = "__Secure-authjs.session-token";
    else if (cookies["authjs.session-token"]) sessionCookieName = "authjs.session-token";
    else if (cookies["__Secure-next-auth.session-token"]) sessionCookieName = "__Secure-next-auth.session-token";
    else if (cookies["next-auth.session-token"]) sessionCookieName = "next-auth.session-token";

    const sessionToken = cookies[sessionCookieName];

    console.log("[TRPC Auth] Session Token:", sessionToken ? "Found" : "Missing", "CookieName:", sessionCookieName);

    if (!sessionToken) return null;

    // Decode the JWT using jose (same lib NextAuth v5 uses)
    let userId: string | null = null;
    try {
      const { jwtDecrypt } = await import("jose");
      const secret = process.env["AUTH_SECRET"] || process.env["NEXTAUTH_SECRET"];
      if (!secret) {
        console.log("[TRPC Auth] Secret missing");
        return null;
      }

      // NextAuth v5 derives a 256-bit key from the secret via HKDF
      const { hkdf } = await import("@panva/hkdf");
      
      const isV5 = sessionCookieName.includes("authjs");
      const salt = isV5 ? sessionCookieName : "";
      const info = isV5 
        ? `Auth.js Generated Encryption Key (${salt})`
        : "NextAuth.js Generated Encryption Key";
      const keyLength = isV5 ? 64 : 32;

      const derivedKey = await hkdf(
        "sha256",
        secret,
        salt,
        info,
        keyLength
      );

      const { payload } = await jwtDecrypt(sessionToken, new Uint8Array(derivedKey), {
        clockTolerance: 15,
      });

      userId = (payload.id as string) || (payload.sub as string) || null;
      console.log("[TRPC Auth] Decoded userId:", userId);
    } catch (err) {
      // JWT decode failed — token invalid or expired
      console.error("[TRPC Auth] JWT Decode Failed:", err);
      return null;
    }

    if (!userId) {
      console.log("[TRPC Auth] UserId missing in payload");
      return null;
    }

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

    if (!user) {
      console.log("[TRPC Auth] User not found in DB for ID:", userId);
      return null;
    }

    console.log("[TRPC Auth] Successfully authenticated user:", user.email);
    return user;
  } catch (err) {
    console.error("[TRPC Auth] Outer catch error:", err);
    return null;
  }
}
  
