import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { OpenApiMeta } from "trpc-to-openapi";

const t = initTRPC.meta<OpenApiMeta>().context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Never expose internal error details in production
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof Error
            ? error.cause.message
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Throws UNAUTHORIZED if no valid session
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Throws FORBIDDEN if user plan is not pro or team
export const proProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.plan === "free") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a Pro or Team plan.",
    });
  }
  return next({ ctx });
});
