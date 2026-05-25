import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import { router, protectedProcedure, publicProcedure } from "../../trpc";
import { db } from "@repo/database";
import { formsTable, formFieldsTable, formThemesTable } from "@repo/database";
import {
  createFormSchema,
  updateFormSchema,
  publishFormSchema,
  getPublicFormSchema,
  paginationSchema,
  uuidParamSchema,
} from "@repo/schemas";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { openApiMeta } from "../../utils/path-generator";

export const formsRouter = router({
  // ── Creator endpoints (protected) ────────────────────────────────────────

  create: protectedProcedure
    .meta(openApiMeta("POST", "/forms", ["Forms"], true))
    .input(createFormSchema)
    .mutation(async ({ ctx, input }) => {
      const [form] = await db
        .insert(formsTable)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          themeId: input.themeId,
          status: "draft",
          visibility: "unlisted",
        })
        .returning();
      return form;
    }),

  update: protectedProcedure
    .meta(openApiMeta("PATCH", "/forms/{id}", ["Forms"], true))
    .input(uuidParamSchema.merge(updateFormSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, password, passwordProtected, ...rest } = input;

      const form = await db.query.formsTable.findFirst({
        where: and(eq(formsTable.id, id), eq(formsTable.userId, ctx.user.id)),
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });

      const updateData: Partial<typeof formsTable.$inferInsert> = {
        ...rest,
        expiresAt: rest.expiresAt ? new Date(rest.expiresAt) : rest.expiresAt === null ? null : undefined,
      };

      // Hash password if enabling password protection
      if (passwordProtected === true && password) {
        updateData.passwordHash = await bcrypt.hash(password, 12);
      } else if (passwordProtected === false) {
        updateData.passwordHash = null;
      }

      const [updated] = await db
        .update(formsTable)
        .set(updateData)
        .where(eq(formsTable.id, id))
        .returning();
      return updated;
    }),

  publish: protectedProcedure
    .meta(openApiMeta("POST", "/forms/{id}/publish", ["Forms"], true))
    .input(publishFormSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await db.query.formsTable.findFirst({
        where: and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)),
        with: { fields: { limit: 1 } },
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      if (!form.fields?.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Add at least one field before publishing." });
      }

      // Auto-generate slug if not set
      const slug = form.slug ?? `${nanoid(10)}`;

      const [published] = await db
        .update(formsTable)
        .set({
          status: "published",
          visibility: input.visibility,
          slug,
          publishedAt: new Date(),
        })
        .where(eq(formsTable.id, input.id))
        .returning();
      return published;
    }),

  unpublish: protectedProcedure
    .meta(openApiMeta("POST", "/forms/{id}/unpublish", ["Forms"], true))
    .input(uuidParamSchema)
    .mutation(async ({ ctx, input }) => {
      const [form] = await db
        .update(formsTable)
        .set({ status: "draft" })
        .where(and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)))
        .returning();
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      return form;
    }),

  delete: protectedProcedure
    .meta(openApiMeta("DELETE", "/forms/{id}", ["Forms"], true))
    .input(uuidParamSchema)
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db
        .delete(formsTable)
        .where(and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)))
        .returning({ id: formsTable.id });
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      return { success: true };
    }),

  getById: protectedProcedure
    .meta(openApiMeta("GET", "/forms/{id}", ["Forms"], true))
    .input(uuidParamSchema)
    .query(async ({ ctx, input }) => {
      const form = await db.query.formsTable.findFirst({
        where: and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)),
        with: {
          fields: { orderBy: [asc(formFieldsTable.order)] },
          theme: true,
        },
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      return form;
    }),

  list: protectedProcedure
    .meta(openApiMeta("GET", "/forms", ["Forms"], true))
    .input(paginationSchema.extend({ status: z.enum(["draft", "published", "archived"]).optional() }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(formsTable.userId, ctx.user.id)];
      if (status) conditions.push(eq(formsTable.status, status));

      const [forms, total] = await Promise.all([
        db.query.formsTable.findMany({
          where: and(...conditions),
          orderBy: [desc(formsTable.updatedAt)],
          limit,
          offset,
          with: { theme: { columns: { name: true, slug: true } } },
        }),
        db.select({ count: count() }).from(formsTable).where(and(...conditions)),
      ]);

      return { forms, total: total[0]?.count ?? 0, page, limit };
    }),

  clone: protectedProcedure
    .input(uuidParamSchema)
    .mutation(async ({ ctx, input }) => {
      const original = await db.query.formsTable.findFirst({
        where: and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)),
        with: { fields: { orderBy: [asc(formFieldsTable.order)] } },
      });
      if (!original) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });

      const [cloned] = await db
        .insert(formsTable)
        .values({
          userId: ctx.user.id,
          title: `${original.title} (Copy)`,
          description: original.description,
          themeId: original.themeId,
          status: "draft",
          visibility: "unlisted",
        })
        .returning();

      if (original.fields?.length) {
        await db.insert(formFieldsTable).values(
          original.fields.map((f) => ({
            ...f,
            id: undefined, // let DB generate new UUID
            formId: cloned!.id,
            createdAt: undefined,
            updatedAt: undefined,
          }))
        );
      }
      return cloned;
    }),

  // ── Public endpoint (no auth required) ───────────────────────────────────

  getBySlug: publicProcedure
    .meta(openApiMeta("POST", "/forms/public/slug", ["Public Forms"]))
    .input(getPublicFormSchema)
    .query(async ({ input }) => {
      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.slug, input.slug),
        with: {
          fields: { orderBy: [asc(formFieldsTable.order)] },
          theme: true,
        },
      });

      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      if (form.status !== "published") {
        throw new TRPCError({ code: "NOT_FOUND", message: "This form is not available." });
      }

      // Check expiry
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form has expired." });
      }

      // Check response limit
      if (form.responseLimit && form.responseCount >= form.responseLimit) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form has reached its response limit." });
      }

      // Check password
      if (form.passwordHash) {
        if (!input.password) {
          throw new TRPCError({ code: "FORBIDDEN", message: "This form is password protected.", });
        }
        const valid = await bcrypt.compare(input.password, form.passwordHash);
        if (!valid) throw new TRPCError({ code: "FORBIDDEN", message: "Incorrect password." });
      }

      // Increment view count (fire-and-forget — do not await)
      db.update(formsTable)
        .set({ viewCount: sql`${formsTable.viewCount} + 1` })
        .where(eq(formsTable.id, form.id))
        .catch(() => {});

      // Strip sensitive fields before returning
      const { passwordHash, userId, ...publicForm } = form;
      return publicForm;
    }),

  // ── Public explore page ───────────────────────────────────────────────────

  listPublic: publicProcedure
    .meta(openApiMeta("GET", "/forms/public", ["Public Forms"]))
    .input(paginationSchema.extend({
      category: z.string().optional(),
      themeSlug: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      const forms = await db.query.formsTable.findMany({
        where: and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public")
        ),
        orderBy: [desc(formsTable.responseCount)],
        limit,
        offset,
        columns: {
          passwordHash: false, // never expose this
          notifyEmail: false,
          userId: false,
        },
        with: { theme: true },
      });

      return { forms, page, limit };
    }),
});
