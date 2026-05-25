import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import type { ThemeConfig } from "@repo/schemas";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived", "closed"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);
export const fieldTypeEnum = pgEnum("field_type", [
  "short_text", "long_text", "email", "number", "phone", "url",
  "single_select", "multi_select", "dropdown", "checkbox",
  "rating", "scale", "date", "time", "yes_no",
  "file_upload", "statement", "welcome_screen", "thank_you_screen",
]);

// ─── Form Themes ─────────────────────────────────────────────────────────────

export const formThemesTable = pgTable("form_themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  config: jsonb("config").$type<ThemeConfig>().notNull(),
  previewImageUrl: text("preview_image_url"),
  isPro: boolean("is_pro").default(false).notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  createdByUserId: uuid("created_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Forms ───────────────────────────────────────────────────────────────────

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    themeId: uuid("theme_id").references(() => formThemesTable.id, { onDelete: "set null" }),

    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 80 }).unique(),

    status: formStatusEnum("status").default("draft").notNull(),
    visibility: formVisibilityEnum("visibility").default("unlisted").notNull(),

    // Closing conditions
    responseLimit: integer("response_limit"),           // null = unlimited
    expiresAt: timestamp("expires_at"),

    // Protection
    passwordHash: text("password_hash"),                // null = not protected

    // Notifications
    notifyOnResponse: boolean("notify_on_response").default(true).notNull(),
    notifyEmail: varchar("notify_email", { length: 255 }), // override user email

    // Thank-you screen
    thankYouTitle: varchar("thank_you_title", { length: 200 }),
    thankYouMessage: text("thank_you_message"),
    redirectUrl: text("redirect_url"),

    // Branding
    showBranding: boolean("show_branding").default(true).notNull(),

    // Analytics counters (denormalized for performance)
    viewCount: integer("view_count").default(0).notNull(),
    responseCount: integer("response_count").default(0).notNull(),

    publishedAt: timestamp("published_at"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    userIdIdx: index("forms_user_id_idx").on(t.userId),
    slugIdx: uniqueIndex("forms_slug_unique_idx").on(t.slug),
    statusVisibilityIdx: index("forms_status_visibility_idx").on(t.status, t.visibility),
  })
);

// ─── Form Fields ─────────────────────────────────────────────────────────────

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    type: fieldTypeEnum("type").notNull(),
    label: varchar("label", { length: 500 }).notNull(),
    description: text("description"),
    placeholder: varchar("placeholder", { length: 300 }),
    required: boolean("required").default(false).notNull(),
    order: integer("order").notNull(),

    // For select/multi_select/dropdown — array of {id, label, value, order}
    options: jsonb("options").$type<Array<{ id: string; label: string; value: string; order: number }>>(),

    // Validation rules — {min, max, minLength, maxLength, pattern, ...}
    validation: jsonb("validation").$type<Record<string, unknown>>(),

    // Conditional display logic
    logic: jsonb("logic").$type<{
      conditions: Array<{
        fieldId: string;
        operator: string;
        value?: string | number | boolean;
      }>;
      logicType: "all" | "any";
    }>(),

    // For welcome/thank_you screens and statements
    buttonLabel: varchar("button_label", { length: 100 }),
    imageUrl: text("image_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    formIdIdx: index("form_fields_form_id_idx").on(t.formId),
    formIdOrderIdx: index("form_fields_form_id_order_idx").on(t.formId, t.order),
  })
);

// ─── Types ───────────────────────────────────────────────────────────────────

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
export type SelectFormTheme = typeof formThemesTable.$inferSelect;
