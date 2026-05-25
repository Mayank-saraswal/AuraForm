import { z } from "zod";
import { paginationSchema } from "./common";

// A single answer to a single field
export const answerSchema = z.object({
  fieldId: z.string().uuid("Invalid field ID"),
  // value can be a string, number, boolean, array of strings (multi-select), or null (skipped optional)
  value: z.union([
    z.string().max(50000),
    z.number(),
    z.boolean(),
    z.array(z.string().max(500)),
    z.null(),
  ]),
});

export const submitResponseSchema = z.object({
  formId: z.string().uuid("Invalid form ID"),
  answers: z
    .array(answerSchema)
    .min(1, "At least one answer required")
    .max(200, "Too many answers"),
  // Client-side timing
  timeToCompleteMs: z.number().int().min(0).max(3600000).optional(), // max 1 hour
  // Honeypot field — must be empty (bot trap)
  _hp: z.string().max(0, "Bot detected").optional(),
});

export const listResponsesSchema = paginationSchema.extend({
  formId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["created_at", "time_to_complete"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type AnswerValue = z.infer<typeof answerSchema>["value"];
