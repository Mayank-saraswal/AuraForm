import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, count, avg, sql, gte, lte } from "drizzle-orm";
import { router, protectedProcedure, publicProcedure } from "../../trpc";
import { db } from "@repo/database";
import { formsTable, formFieldsTable, responsesTable, responseAnswersTable } from "@repo/database";
import {
  submitResponseSchema,
  listResponsesSchema,
  uuidParamSchema,
  paginationSchema,
} from "@repo/schemas";
import { openApiMeta } from "../../utils/path-generator";
import crypto from "node:crypto";

function hashIp(ip: string): string {
  // Hash IP with a server-side salt — never store raw IPs
  const salt = process.env["IP_HASH_SALT"] ?? "formcraft-ip-salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

export const responsesRouter = router({
  // ── Public submission (no auth) ───────────────────────────────────────────

  submit: publicProcedure
    .meta(openApiMeta("POST", "/responses/submit", ["Responses"]))
    .input(submitResponseSchema)
    .mutation(async ({ ctx, input }) => {
      // Honeypot check — if _hp field is filled, it's a bot
      if (input._hp) {
        // Return fake success to confuse bots
        return { success: true, responseId: crypto.randomUUID() };
      }

      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, input.formId),
        with: { fields: true },
      });

      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });
      if (form.status !== "published") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form is not accepting responses." });
      }

      // Check response limit
      if (form.responseLimit && form.responseCount >= form.responseLimit) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form has reached its response limit." });
      }

      // Check expiry
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form has expired." });
      }

      // Validate required fields are answered
      const requiredFieldIds = form.fields
        .filter((f) => f.required)
        .map((f) => f.id);

      const answeredFieldIds = input.answers
        .filter((a) => a.value !== null && a.value !== "" && (Array.isArray(a.value) ? a.value.length > 0 : true))
        .map((a) => a.fieldId);

      const missingRequired = requiredFieldIds.filter(
        (id) => !answeredFieldIds.includes(id)
      );
      if (missingRequired.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Required fields not answered: ${missingRequired.join(", ")}`,
        });
      }

      // Hash IP for spam protection
      const rawIp = ctx.req.ip ?? ctx.req.socket.remoteAddress ?? "unknown";
      const ipHash = hashIp(rawIp);

      // Insert response + answers in a transaction
      const [response] = await db.transaction(async (tx) => {
        const [newResponse] = await tx
          .insert(responsesTable)
          .values({
            formId: input.formId,
            ipHash,
            userAgent: ctx.req.headers["user-agent"] ?? null,
            timeToCompleteMs: input.timeToCompleteMs,
          })
          .returning();

        if (input.answers.length > 0) {
          await tx.insert(responseAnswersTable).values(
            input.answers.map((a) => ({
              responseId: newResponse!.id,
              fieldId: a.fieldId,
              value: a.value as (typeof responseAnswersTable.$inferInsert)["value"],
            }))
          );
        }

        // Increment response counter (denormalized for perf)
        await tx
          .update(formsTable)
          .set({ responseCount: sql`${formsTable.responseCount} + 1` })
          .where(eq(formsTable.id, input.formId));

        return [newResponse];
      });

      // Fire email notification async (non-blocking)
      if (form.notifyOnResponse) {
        // notifyCreator(form, response).catch(console.error);
      }

      return { success: true, responseId: response!.id };
    }),

  // ── Creator analytics (protected) ────────────────────────────────────────

  list: protectedProcedure
    .meta(openApiMeta("GET", "/responses", ["Responses"], true))
    .input(listResponsesSchema)
    .query(async ({ ctx, input }) => {
      // Verify form ownership
      const form = await db.query.formsTable.findFirst({
        where: and(eq(formsTable.id, input.formId), eq(formsTable.userId, ctx.user.id)),
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });

      const { page, limit, startDate, endDate, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(responsesTable.formId, input.formId)];
      if (startDate) conditions.push(gte(responsesTable.submittedAt, new Date(startDate)));
      if (endDate) conditions.push(lte(responsesTable.submittedAt, new Date(endDate)));

      const sortColumn = sortBy === "time_to_complete" ? responsesTable.timeToCompleteMs : responsesTable.submittedAt;

      const [responses, total] = await Promise.all([
        db.query.responsesTable.findMany({
          where: and(...conditions),
          orderBy: sortOrder === "asc"
            ? [sql`${sortColumn} ASC`]
            : [sql`${sortColumn} DESC`],
          limit,
          offset,
          with: {
            answers: {
              with: { field: { columns: { label: true, type: true } } },
            },
          },
        }),
        db.select({ count: count() }).from(responsesTable).where(and(...conditions)),
      ]);

      return { responses, total: total[0]?.count ?? 0, page, limit };
    }),

  analytics: protectedProcedure
    .meta(openApiMeta("GET", "/responses/analytics/{id}", ["Analytics"], true))
    .input(uuidParamSchema)
    .query(async ({ ctx, input }) => {
      const form = await db.query.formsTable.findFirst({
        where: and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)),
        with: { fields: true },
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });

      const [completionStats] = await db
        .select({
          total: count(),
          avgTimeMs: avg(responsesTable.timeToCompleteMs),
        })
        .from(responsesTable)
        .where(eq(responsesTable.formId, input.id));

      // Responses per day for last 30 days
      const dailyStats = await db
        .select({
          date: sql<string>`DATE(${responsesTable.submittedAt})`,
          count: count(),
        })
        .from(responsesTable)
        .where(
          and(
            eq(responsesTable.formId, input.id),
            gte(responsesTable.submittedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )
        .groupBy(sql`DATE(${responsesTable.submittedAt})`)
        .orderBy(sql`DATE(${responsesTable.submittedAt}) ASC`);

      return {
        form: {
          id: form.id,
          title: form.title,
          viewCount: form.viewCount,
          responseCount: form.responseCount,
          completionRate: form.viewCount > 0
            ? Math.round((form.responseCount / form.viewCount) * 100)
            : 0,
        },
        totalResponses: completionStats?.total ?? 0,
        avgTimeMs: completionStats?.avgTimeMs ? Math.round(Number(completionStats.avgTimeMs)) : null,
        dailyStats,
        fields: form.fields,
      };
    }),
});
