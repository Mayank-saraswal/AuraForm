import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, router } from "../../trpc";
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
});
