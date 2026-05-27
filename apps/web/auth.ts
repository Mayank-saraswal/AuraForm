// apps/web/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@repo/database";
import {
  usersTable,
  accountsTable,
  sessionsTable,
  verificationTokensTable,
} from "@repo/database";
import { eq } from "@repo/database";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: usersTable as any,
    accountsTable: accountsTable as any,
    sessionsTable: sessionsTable as any,
    verificationTokensTable: verificationTokensTable as any,
  }),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,      // 30 days
    updateAge: 24 * 60 * 60,         // refresh every 24 hours
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch plan from DB
        const [dbUser] = await db
          .select({ plan: usersTable.plan, emailVerified: usersTable.emailVerified })
          .from(usersTable)
          .where(eq(usersTable.id, user.id!))
          .limit(1);
        token.plan = dbUser?.plan ?? "free";
        token.emailVerified = dbUser?.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const u = session.user as any;
        u.id = token.id as string;
        u.plan = token.plan as string ?? "free";
        u.emailVerified = token.emailVerified ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  trustHost: true,
});
