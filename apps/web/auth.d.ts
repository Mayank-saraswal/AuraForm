// apps/web/auth.d.ts — Augment NextAuth types with custom fields
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    plan?: string;
    emailVerified?: Date | null;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan: string;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }
}
