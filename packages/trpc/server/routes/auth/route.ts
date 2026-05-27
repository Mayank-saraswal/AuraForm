import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { sendWelcomeEmail } from "@repo/email";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(getAuthenticationMethodOutputSchema).readonly())
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),

  register: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(2).max(80),
        email: z.string().email().max(255),
        password: z.string().min(8).max(72),
      })
    )
    .mutation(async ({ input }) => {
      // Check if user already exists
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, input.email.toLowerCase()))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create user
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name: input.fullName.trim(),
          email: input.email.toLowerCase().trim(),
          password: hashedPassword,
        })
        .returning({ id: usersTable.id, email: usersTable.email, name: usersTable.name });

      // Send welcome email (non-blocking)
      try {
        await sendWelcomeEmail({
          toEmail: newUser!.email,
          toName: newUser!.name ?? "there",
        });
      } catch {
        // Never block registration on email failure
      }

      return { success: true, userId: newUser!.id };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80),
        email: z.string().email().max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email is taken by someone else
      if (input.email !== ctx.user.email) {
        const [existing] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.email, input.email.toLowerCase()))
          .limit(1);

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }
      }

      await db
        .update(usersTable)
        .set({
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
        })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true };
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await db
        .select({ password: usersTable.password })
        .from(usersTable)
        .where(eq(usersTable.id, ctx.user.id))
        .limit(1);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!user.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You signed in with a provider (like Google) and don't have a password. Please sign in with Google.",
        });
      }

      const isValid = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Incorrect current password." });
      }

      const newHashedPassword = await bcrypt.hash(input.newPassword, 12);

      await db
        .update(usersTable)
        .set({ password: newHashedPassword })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true };
    }),

  deleteAccount: protectedProcedure
    .input(z.object({ confirm: z.boolean().refine(val => val === true, "Must confirm deletion") }))
    .mutation(async ({ ctx }) => {
      // Deleting user will cascade delete forms, responses, etc. due to foreign key setup (or Drizzle)
      await db.delete(usersTable).where(eq(usersTable.id, ctx.user.id));
      return { success: true };
    }),
});
