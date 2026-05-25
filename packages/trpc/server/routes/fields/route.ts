import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, asc } from "drizzle-orm";
import { router, protectedProcedure } from "../../trpc";
import { db } from "@repo/database";
import { formsTable, formFieldsTable } from "@repo/database";
import {
  createFieldSchema,
  updateFieldSchema,
  reorderFieldsSchema,
  uuidParamSchema,
} from "@repo/schemas";
import { openApiMeta } from "../../utils/path-generator";

// Guard: ensures the requesting user owns the form
async function assertFormOwner(formId: string, userId: string) {
  const form = await db.query.formsTable.findFirst({
    where: and(eq(formsTable.id, formId), eq(formsTable.userId, userId)),
    columns: { id: true, status: true },
  });
  if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
  return form;
}

export const fieldsRouter = router({
  add: protectedProcedure
    .meta(openApiMeta("POST", "/fields", ["Fields"], true))
    .input(createFieldSchema)
    .mutation(async ({ ctx, input }) => {
      await assertFormOwner(input.formId, ctx.user.id);
      const [field] = await db.insert(formFieldsTable).values(input).returning();
      return field;
    }),

  update: protectedProcedure
    .meta(openApiMeta("PATCH", "/fields/{id}", ["Fields"], true))
    .input(uuidParamSchema.merge(updateFieldSchema.extend({ formId: z.string().uuid() })))
    .mutation(async ({ ctx, input }) => {
      const { id, formId, ...updates } = input;
      await assertFormOwner(formId, ctx.user.id);
      const [field] = await db
        .update(formFieldsTable)
        .set(updates)
        .where(and(eq(formFieldsTable.id, id), eq(formFieldsTable.formId, formId)))
        .returning();
      if (!field) throw new TRPCError({ code: "NOT_FOUND", message: "Field not found." });
      return field;
    }),

  delete: protectedProcedure
    .meta(openApiMeta("DELETE", "/fields/{id}", ["Fields"], true))
    .input(uuidParamSchema.extend({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await assertFormOwner(input.formId, ctx.user.id);
      await db
        .delete(formFieldsTable)
        .where(and(eq(formFieldsTable.id, input.id), eq(formFieldsTable.formId, input.formId)));
      return { success: true };
    }),

  reorder: protectedProcedure
    .meta(openApiMeta("POST", "/fields/reorder", ["Fields"], true))
    .input(reorderFieldsSchema)
    .mutation(async ({ ctx, input }) => {
      await assertFormOwner(input.formId, ctx.user.id);
      // Update order for each field in a single transaction
      await db.transaction(async (tx) => {
        for (let i = 0; i < input.orderedIds.length; i++) {
          await tx
            .update(formFieldsTable)
            .set({ order: i })
            .where(
              and(
                eq(formFieldsTable.id, input.orderedIds[i]!),
                eq(formFieldsTable.formId, input.formId)
              )
            );
        }
      });
      return { success: true };
    }),
});
