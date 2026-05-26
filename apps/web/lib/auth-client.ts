// apps/web/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Point to the API server, NOT the Next.js server
  baseURL: process.env["NEXT_PUBLIC_API_URL"]
    ?.replace("/trpc", "")      // strip /trpc suffix
    ?? "http://localhost:8000",
  fetchOptions: {
    credentials: "include",     // REQUIRED — send cookies cross-origin
  },
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
