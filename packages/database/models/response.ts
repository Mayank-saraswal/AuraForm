import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form";

export const responsesTable = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    // We never store raw IP — always SHA-256 hash of IP+salt
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),

    // Client-reported completion time in ms
    timeToCompleteMs: integer("time_to_complete_ms"),

    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (t) => ({
    formIdIdx: index("responses_form_id_idx").on(t.formId),
    submittedAtIdx: index("responses_submitted_at_idx").on(t.submittedAt),
  })
);

export const responseAnswersTable = pgTable(
  "response_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => responsesTable.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => formFieldsTable.id, { onDelete: "cascade" }),

    // JSONB to support all answer types: string, number, boolean, string[]
    value: jsonb("value").$type<string | number | boolean | string[] | null>().notNull(),
  },
  (t) => ({
    responseIdIdx: index("response_answers_response_id_idx").on(t.responseId),
    fieldIdIdx: index("response_answers_field_id_idx").on(t.fieldId),
  })
);

export type SelectResponse = typeof responsesTable.$inferSelect;
export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
