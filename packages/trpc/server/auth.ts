import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/database";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationsTable,
} from "@repo/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
    requireEmailVerification: false, // set true in production
    sendResetPassword: async ({ user, url }) => {
      // Wire to Resend email in Step 7
      console.log(`Password reset URL for ${user.email}: ${url}`);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,       // 30 days
    updateAge: 60 * 60 * 24,             // refresh session cookie every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  trustedOrigins: [
    process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  ],

  rateLimit: {
    enabled: true,
    window: 60,        // 60-second window
    max: 10,           // max 10 auth attempts per window
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
    cookiePrefix: "formcraft",
  },
});

export type Auth = typeof auth;
