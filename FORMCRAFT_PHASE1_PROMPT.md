# FormCraft — Phase 1 Master Build Prompt
# Copy this entire file and paste it into your AI coding assistant (Cursor / Windsurf / Copilot Workspace)

---

## CONTEXT — READ THIS FIRST

You are extending a Turborepo monorepo starter into **FormCraft**, a production-grade, industry-standard
Typeform competitor. The starter repository already exists at the paths described below.
Do NOT create a new repo. Extend the existing one.

### Existing repo structure (do not delete or overwrite these files)

```
apps/
  api/                    ← Express + tRPC backend (port 8000)
    src/
      env.ts
      index.ts
      server.ts           ← already has Scalar API docs at /docs
  web/                    ← Next.js 15 App Router frontend (port 3000)
    app/
      globals.css         ← already has Tailwind v4 + tw-animate-css
      layout.tsx
      page.tsx
    components/ui/        ← full shadcn/ui component set already installed
    trpc/
      client.ts
      create-client.ts
      server.ts
    providers/global.tsx
packages/
  database/               ← Drizzle ORM, Neon Postgres
    models/user.ts        ← usersTable already defined
    schema.ts
    drizzle.config.ts
  trpc/
    server/
      context.ts
      index.ts
      routes/auth/route.ts
      routes/health/route.ts
      trpc.ts
      schema.ts
    client/index.ts
  services/
    clients/google-oauth.ts   ← Google OAuth client already configured
  logger/
  eslint-config/
  typescript-config/
```

### Tech stack (MANDATORY — do not change or replace these)

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Express 5 + tRPC v11 + Zod v4
- **Frontend**: Next.js 15 App Router + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, already installed)
- **Database**: Drizzle ORM + Neon Postgres (pg driver)
- **Auth**: better-auth (replace the existing stub auth — keep Google OAuth from packages/services)
- **Icons**: react-icons ONLY — do NOT use lucide-react, do NOT use emojis anywhere in the app UI
- **API docs**: Scalar (already wired at /docs in apps/api)
- **Payments**: Razorpay (Indian payment gateway)
- **Email**: Resend + react-email
- **Validation**: Zod v4 everywhere — both frontend and backend

---

## PHASE 1 DELIVERABLE

Build the complete **foundation layer** of FormCraft. This includes:

1. All new package installations
2. New shared packages: `packages/schemas` and `packages/email`
3. Complete Drizzle database schema (all tables)
4. better-auth wired into the Express API and Next.js frontend
5. All tRPC routers scaffolded with full Zod validation
6. Security middleware layer
7. Theme system data structure
8. Updated `apps/web` layout with proper providers

---

## STEP 1 — Install all dependencies

Run these commands from the monorepo root:

```bash
# packages/database — ORM additions
pnpm add drizzle-orm pg --filter @repo/database
pnpm add -D drizzle-kit @types/pg --filter @repo/database

# better-auth — install in both api and a new shared auth package
pnpm add better-auth --filter @repo/api
pnpm add better-auth --filter @repo/trpc

# apps/api — security and utilities
pnpm add express-rate-limit helmet cors express-validator --filter @repo/api
pnpm add razorpay --filter @repo/api
pnpm add resend --filter @repo/api
pnpm add @types/razorpay -D --filter @repo/api
pnpm add nanoid --filter @repo/api
pnpm add bcryptjs --filter @repo/api
pnpm add @types/bcryptjs -D --filter @repo/api

# apps/web — frontend additions
pnpm add react-icons --filter @repo/web
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities --filter @repo/web
pnpm add recharts --filter @repo/web
pnpm add react-hot-toast --filter @repo/web
pnpm add qrcode.react --filter @repo/web
pnpm add framer-motion --filter @repo/web
pnpm add @tanstack/react-query --filter @repo/web
pnpm add zustand --filter @repo/web
pnpm add react-confetti --filter @repo/web
pnpm add date-fns --filter @repo/web
pnpm add better-auth --filter @repo/web

# new shared package — schemas
mkdir -p packages/schemas/src
# new shared package — email
mkdir -p packages/email/src/templates
```

---

## STEP 2 — Create `packages/schemas`

This package holds all shared Zod schemas used by both the API and the frontend.
It is the single source of truth for all data shapes.

### `packages/schemas/package.json`

```json
{
  "name": "@repo/schemas",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.9.3"
  }
}
```

### `packages/schemas/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "include": ["src"]
}
```

### `packages/schemas/src/index.ts`

```typescript
export * from "./form";
export * from "./field";
export * from "./response";
export * from "./theme";
export * from "./auth";
export * from "./payment";
export * from "./common";
```

### `packages/schemas/src/common.ts`

```typescript
import { z } from "zod";

// Reusable pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Reusable UUID param schema
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// Slug validation — URL-safe, lowercase, hyphens only
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(80, "Slug must be 80 characters or less")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only")
  .transform((s) => s.toLowerCase().trim());

export type PaginationInput = z.infer<typeof paginationSchema>;
```

### `packages/schemas/src/auth.ts`

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or less")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters")
    .transform((s) => s.trim()),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email too long")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long") // bcrypt limit
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### `packages/schemas/src/theme.ts`

```typescript
import { z } from "zod";

export const buttonStyleSchema = z.enum(["rounded", "square", "pill"]);
export const progressStyleSchema = z.enum(["bar", "dots", "percentage", "none"]);
export const animationSchema = z.enum(["slide", "fade", "pop", "none"]);
export const fontFamilySchema = z.enum([
  "inter",
  "geist",
  "bebas-neue",
  "space-grotesk",
  "noto-sans",
  "roboto",
  "poppins",
  "playfair-display",
  "outfit",
  "dm-sans",
]);

export const themeConfigSchema = z.object({
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  bgImage: z.string().url().optional().nullable(),
  bgOverlayOpacity: z.number().min(0).max(1).default(0),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  questionColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  fontFamily: fontFamilySchema.default("inter"),
  fontSize: z.enum(["sm", "md", "lg"]).default("md"),
  buttonStyle: buttonStyleSchema.default("rounded"),
  buttonBgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  progressStyle: progressStyleSchema.default("bar"),
  progressColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  questionAnimation: animationSchema.default("slide"),
  thankYouAnimation: z.enum(["confetti", "fireworks", "checkmark", "minimal"]).default("confetti"),
  logoUrl: z.string().url().optional().nullable(),
  customCss: z.string().max(5000, "Custom CSS too large").optional().nullable(),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

// The 20 predefined themes
export const PREDEFINED_THEMES = [
  {
    slug: "netflix",
    name: "Netflix",
    category: "streaming",
    isPro: false,
    config: {
      bgColor: "#141414", accentColor: "#E50914", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "bebas-neue", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#E50914", questionAnimation: "slide",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    category: "social",
    isPro: false,
    config: {
      bgColor: "#075E54", accentColor: "#25D366", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", buttonStyle: "pill",
      progressStyle: "bar", progressColor: "#25D366", questionAnimation: "fade",
      thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "youtube",
    name: "YouTube",
    category: "streaming",
    isPro: false,
    config: {
      bgColor: "#0F0F0F", accentColor: "#FF0000", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#FF0000", questionAnimation: "slide",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "instagram",
    name: "Instagram",
    category: "social",
    isPro: false,
    config: {
      bgColor: "#0A0A0A", accentColor: "#E1306C", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "inter", buttonStyle: "pill",
      progressStyle: "dots", progressColor: "#E1306C", questionAnimation: "pop",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "pink-city",
    name: "Pink City Jaipur",
    category: "culture",
    isPro: false,
    config: {
      bgColor: "#8B1A4A", accentColor: "#F7A8C4", textColor: "#FFFFFF",
      questionColor: "#FFE4EF", fontFamily: "playfair-display", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#F7A8C4", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "anime-dark",
    name: "Anime Dark",
    category: "anime",
    isPro: false,
    config: {
      bgColor: "#0D0D1A", accentColor: "#7C3AED", textColor: "#E2E8F0",
      questionColor: "#F1F5F9", fontFamily: "noto-sans", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#7C3AED", questionAnimation: "pop",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "macos",
    name: "macOS",
    category: "operating-system",
    isPro: true,
    config: {
      bgColor: "#1C1C1E", accentColor: "#0A84FF", textColor: "#FFFFFF",
      questionColor: "#EBEBF5", fontFamily: "inter", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#0A84FF", questionAnimation: "slide",
      thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "discord",
    name: "Discord",
    category: "gaming",
    isPro: false,
    config: {
      bgColor: "#313338", accentColor: "#5865F2", textColor: "#DBDEE1",
      questionColor: "#FFFFFF", fontFamily: "inter", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#5865F2", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "startup",
    name: "Startup",
    category: "startup",
    isPro: false,
    config: {
      bgColor: "#0A0A0A", accentColor: "#FF6B35", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", buttonStyle: "rounded",
      progressStyle: "percentage", progressColor: "#FF6B35", questionAnimation: "slide",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "streaming",
    isPro: true,
    config: {
      bgColor: "#121212", accentColor: "#1DB954", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "dm-sans", buttonStyle: "pill",
      progressStyle: "bar", progressColor: "#1DB954", questionAnimation: "slide",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "minimal-light",
    name: "Minimal Light",
    category: "minimal",
    isPro: false,
    config: {
      bgColor: "#FAFAFA", accentColor: "#111111", textColor: "#111111",
      questionColor: "#111111", fontFamily: "geist", buttonStyle: "square",
      progressStyle: "bar", progressColor: "#111111", questionAnimation: "fade",
      thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "india-pride",
    name: "India Pride",
    category: "culture",
    isPro: false,
    config: {
      bgColor: "#FFFFFF", accentColor: "#FF9933", textColor: "#000080",
      questionColor: "#000080", fontFamily: "poppins", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#138808", questionAnimation: "slide",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "cyberpunk",
    name: "Cyberpunk",
    category: "gaming",
    isPro: true,
    config: {
      bgColor: "#0D001A", accentColor: "#00FFFF", textColor: "#00FFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", buttonStyle: "square",
      progressStyle: "bar", progressColor: "#FF00FF", questionAnimation: "pop",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
] as const;
```

### `packages/schemas/src/field.ts`

```typescript
import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "single_select",
  "multi_select",
  "dropdown",
  "checkbox",
  "rating",        // 1–5 stars
  "scale",         // 1–10 linear scale (NPS-style)
  "date",
  "time",
  "yes_no",        // boolean toggle
  "file_upload",
  "statement",     // display-only text, no input
  "welcome_screen",
  "thank_you_screen",
]);

export type FieldType = z.infer<typeof fieldTypeSchema>;

export const fieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().max(10000).optional(),
  pattern: z.string().optional(),             // regex pattern for text fields
  allowedFileTypes: z.array(z.string()).optional(), // for file_upload
  maxFileSizeMb: z.number().max(50).optional(),
});

export const fieldOptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(200).trim(),
  value: z.string().min(1).max(200).trim(),
  order: z.number().int().min(0),
});

export const conditionalLogicSchema = z.object({
  // Show this field ONLY IF another field has a specific value
  conditions: z.array(
    z.object({
      fieldId: z.string().uuid(),
      operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than", "is_filled", "is_empty"]),
      value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    })
  ),
  logicType: z.enum(["all", "any"]).default("all"), // AND vs OR
});

export const createFieldSchema = z.object({
  formId: z.string().uuid(),
  type: fieldTypeSchema,
  label: z.string().min(1, "Field label is required").max(500, "Label too long").trim(),
  description: z.string().max(1000).trim().optional().nullable(),
  placeholder: z.string().max(300).trim().optional().nullable(),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  options: z.array(fieldOptionSchema).optional().nullable(),       // for select/multi_select/dropdown
  validation: fieldValidationSchema.optional().nullable(),
  logic: conditionalLogicSchema.optional().nullable(),
  // for statement and welcome/thank_you screens
  buttonLabel: z.string().max(100).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateFieldSchema = createFieldSchema.omit({ formId: true, order: true }).partial();

export const reorderFieldsSchema = z.object({
  formId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1, "At least one field required"),
});

export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
```

### `packages/schemas/src/form.ts`

```typescript
import { z } from "zod";
import { slugSchema } from "./common";

export const formStatusSchema = z.enum(["draft", "published", "archived", "closed"]);
export const formVisibilitySchema = z.enum(["public", "unlisted"]);

export const createFormSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title too long")
    .trim(),
  description: z.string().max(2000, "Description too long").trim().optional().nullable(),
  themeId: z.string().uuid("Invalid theme ID").optional().nullable(),
});

export const updateFormSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional().nullable(),
  themeId: z.string().uuid().optional().nullable(),
  slug: slugSchema.optional().nullable(),
  visibility: formVisibilitySchema.optional(),
  // Closing conditions
  responseLimit: z.number().int().min(1).max(1000000).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  // Notifications
  notifyOnResponse: z.boolean().optional(),
  notifyEmail: z.string().email().optional().nullable(),
  // Protection
  passwordProtected: z.boolean().optional(),
  password: z.string().min(6).max(100).optional().nullable(),
  // Thank-you screen settings
  thankYouTitle: z.string().max(200).optional().nullable(),
  thankYouMessage: z.string().max(1000).optional().nullable(),
  redirectUrl: z.string().url().optional().nullable(),
  // Branding
  showBranding: z.boolean().optional(), // hide "Powered by FormCraft" on Pro
});

export const publishFormSchema = z.object({
  id: z.string().uuid(),
  visibility: formVisibilitySchema,
});

// Used when getting a form by slug for public filling
export const getPublicFormSchema = z.object({
  slug: z.string().min(1),
  password: z.string().optional(), // for password-protected forms
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
```

### `packages/schemas/src/response.ts`

```typescript
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
```

### `packages/schemas/src/payment.ts`

```typescript
import { z } from "zod";

export const planSchema = z.enum(["free", "pro", "team"]);

export const createRazorpayOrderSchema = z.object({
  plan: z.enum(["pro", "team"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  plan: z.enum(["pro", "team"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export type Plan = z.infer<typeof planSchema>;
export type CreateOrderInput = z.infer<typeof createRazorpayOrderSchema>;
```

---

## STEP 3 — Extend the database schema

Open `packages/database/schema.ts` and replace its entire contents with the following.
Keep the existing `usersTable` structure but extend it, then add all new tables.

### `packages/database/schema.ts`

```typescript
export * from "./models/user";
export * from "./models/form";
export * from "./models/response";
export * from "./models/subscription";
```

### `packages/database/models/user.ts` (REPLACE existing)

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  passwordHash: text("password_hash"),           // null for OAuth-only users
  profileImageUrl: text("profile_image_url"),
  plan: planEnum("plan").default("free").notNull(),

  // better-auth required fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

// better-auth sessions table
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

// better-auth accounts table (for OAuth providers)
export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

// better-auth verification tokens (email verification, password reset)
export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(), // email address
  value: text("value").notNull(),           // token
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
```

### `packages/database/models/form.ts` (CREATE NEW)

```typescript
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
```

### `packages/database/models/response.ts` (CREATE NEW)

```typescript
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
```

### `packages/database/models/subscription.ts` (CREATE NEW)

```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "cancelled", "expired", "past_due", "trialing",
]);

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Razorpay identifiers
    razorpaySubscriptionId: text("razorpay_subscription_id").unique(),
    razorpayCustomerId: text("razorpay_customer_id"),

    plan: varchar("plan", { length: 20 }).notNull(),                   // pro | team
    billingCycle: varchar("billing_cycle", { length: 10 }).notNull(),  // monthly | yearly
    status: subscriptionStatusEnum("status").default("active").notNull(),

    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),

    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(t.userId),
  })
);

export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptionsTable.id),

    razorpayOrderId: text("razorpay_order_id").notNull().unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    razorpaySignature: text("razorpay_signature"),

    amountPaise: integer("amount_paise").notNull(),                    // amount in paise (1 INR = 100 paise)
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    status: varchar("status", { length: 20 }).notNull(),               // created | paid | failed | refunded

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("payments_user_id_idx").on(t.userId),
  })
);

export type SelectSubscription = typeof subscriptionsTable.$inferSelect;
export type SelectPayment = typeof paymentsTable.$inferSelect;
```

---

## STEP 4 — Set up better-auth

### `packages/trpc/server/auth.ts` (CREATE NEW)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/database";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationsTable,
} from "@repo/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
    requireEmailVerification: false, // set true in production
    sendResetPassword: async ({ user, url }) => {
      // Wire to Resend email in Step 7
      console.log(`Password reset URL for ${user.email}: ${url}`);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,       // 30 days
    updateAge: 60 * 60 * 24,             // refresh session cookie every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  trustedOrigins: [
    process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  ],

  rateLimit: {
    enabled: true,
    window: 60,        // 60-second window
    max: 10,           // max 10 auth attempts per window
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
    cookiePrefix: "formcraft",
  },
});

export type Auth = typeof auth;
```

### `packages/trpc/server/context.ts` (REPLACE existing)

```typescript
import type { Request, Response } from "express";
import { auth } from "./auth";

export interface Context {
  req: Request;
  res: Response;
  user: {
    id: string;
    email: string;
    fullName: string;
    plan: string;
    emailVerified: boolean;
  } | null;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  let user: Context["user"] = null;

  try {
    const session = await auth.api.getSession({ headers: req.headers as Headers });
    if (session?.user) {
      user = {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.name ?? "",
        plan: (session.user as Record<string, unknown>)["plan"] as string ?? "free",
        emailVerified: session.user.emailVerified ?? false,
      };
    }
  } catch {
    // No valid session — user remains null (public request)
  }

  return { req, res, user };
}
```

### `packages/trpc/server/trpc.ts` (REPLACE existing)

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
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
```

---

## STEP 5 — Build all tRPC routers

### `packages/trpc/server/routes/forms/route.ts` (CREATE NEW)

```typescript
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

      const updateData: Partial<typeof formsTable.$inferInsert> = { ...rest };

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
```

### `packages/trpc/server/routes/fields/route.ts` (CREATE NEW)

```typescript
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
```

### `packages/trpc/server/routes/responses/route.ts` (CREATE NEW)

```typescript
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
              value: a.value as Parameters<typeof responseAnswersTable.$inferInsert.value>[0],
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

      const [responses, total] = await Promise.all([
        db.query.responsesTable.findMany({
          where: and(...conditions),
          orderBy: sortOrder === "asc"
            ? [sql`${responsesTable[sortBy]} ASC`]
            : [sql`${responsesTable[sortBy]} DESC`],
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
```

### `packages/trpc/server/routes/themes/route.ts` (CREATE NEW)

```typescript
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { eq } from "drizzle-orm";
import { db } from "@repo/database";
import { formThemesTable } from "@repo/database";
import { uuidParamSchema } from "@repo/schemas";
import { openApiMeta } from "../../utils/path-generator";

export const themesRouter = router({
  list: publicProcedure
    .meta(openApiMeta("GET", "/themes", ["Themes"]))
    .query(async () => {
      return db.query.formThemesTable.findMany({
        where: eq(formThemesTable.isCustom, false),
        orderBy: (t, { asc }) => [asc(t.name)],
      });
    }),

  getById: publicProcedure
    .meta(openApiMeta("GET", "/themes/{id}", ["Themes"]))
    .input(uuidParamSchema)
    .query(async ({ input }) => {
      const theme = await db.query.formThemesTable.findFirst({
        where: eq(formThemesTable.id, input.id),
      });
      if (!theme) throw new Error("Theme not found.");
      return theme;
    }),
});
```

### `packages/trpc/server/routes/payments/route.ts` (CREATE NEW)

```typescript
import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { router, protectedProcedure } from "../../trpc";
import { db } from "@repo/database";
import { paymentsTable, subscriptionsTable, usersTable } from "@repo/database";
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from "@repo/schemas";
import { eq } from "drizzle-orm";
import { openApiMeta } from "../../utils/path-generator";

// Price map in paise (1 INR = 100 paise)
const PRICES = {
  pro_monthly: 49900,    // ₹499/month
  pro_yearly: 399900,    // ₹3999/year (save ~₹2000)
  team_monthly: 149900,  // ₹1499/month
  team_yearly: 1199900,  // ₹11999/year
} as const;

function getRazorpay() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env["RAZORPAY_KEY_ID"],
    key_secret: process.env["RAZORPAY_KEY_SECRET"],
  });
}

export const paymentsRouter = router({
  createOrder: protectedProcedure
    .meta(openApiMeta("POST", "/payments/create-order", ["Payments"], true))
    .input(createRazorpayOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const razorpay = getRazorpay();
      const key = `${input.plan}_${input.billingCycle}` as keyof typeof PRICES;
      const amount = PRICES[key];

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${ctx.user.id}_${Date.now()}`,
        notes: { userId: ctx.user.id, plan: input.plan, billingCycle: input.billingCycle },
      });

      // Record order intent
      await db.insert(paymentsTable).values({
        userId: ctx.user.id,
        razorpayOrderId: order.id,
        amountPaise: amount,
        currency: "INR",
        status: "created",
      });

      return {
        orderId: order.id,
        amount,
        currency: "INR",
        keyId: process.env["RAZORPAY_KEY_ID"],
      };
    }),

  verifyPayment: protectedProcedure
    .meta(openApiMeta("POST", "/payments/verify", ["Payments"], true))
    .input(verifyRazorpayPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify HMAC signature — critical security check
      const generatedSignature = crypto
        .createHmac("sha256", process.env["RAZORPAY_KEY_SECRET"] ?? "")
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== input.razorpaySignature) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Payment verification failed. Invalid signature.",
        });
      }

      // Update payment record
      await db
        .update(paymentsTable)
        .set({
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          status: "paid",
        })
        .where(eq(paymentsTable.razorpayOrderId, input.razorpayOrderId));

      // Create subscription record
      const now = new Date();
      const periodEnd = new Date(now);
      if (input.billingCycle === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
      else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

      await db.insert(subscriptionsTable).values({
        userId: ctx.user.id,
        plan: input.plan,
        billingCycle: input.billingCycle,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });

      // Upgrade user plan
      await db
        .update(usersTable)
        .set({ plan: input.plan as "pro" | "team" })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true, plan: input.plan };
    }),

  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      return db.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.userId, ctx.user.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });
    }),
});
```

### `packages/trpc/server/index.ts` (REPLACE existing)

```typescript
import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { formsRouter } from "./routes/forms/route";
import { fieldsRouter } from "./routes/fields/route";
import { responsesRouter } from "./routes/responses/route";
import { themesRouter } from "./routes/themes/route";
import { paymentsRouter } from "./routes/payments/route";

export * from "./context";
export { auth } from "./auth";

export const serverRouter = router({
  health: healthRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  themes: themesRouter,
  payments: paymentsRouter,
});

export type ServerRouter = typeof serverRouter;
```

---

## STEP 6 — Security middleware in Express

### `apps/api/src/server.ts` (REPLACE existing)

```typescript
import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { serverRouter, createContext, auth } from "@repo/trpc/server";
import { toNodeHandler } from "better-auth/node";
import { env } from "./env";

export const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // allow embedding (for forms)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        connectSrc: ["'self'", "https://api.razorpay.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === "prod" ? [] : null,
      },
    },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  env.FRONTEND_URL ?? "http://localhost:3000",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
  })
);

// ── Global rate limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                   // 500 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  skip: (req) => req.path === "/health",
});

// ── Strict rate limit for public form submission ──────────────────────────────
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,                      // 20 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Submission limit reached. Please try again later." },
  keyGenerator: (req) => {
    // Use x-forwarded-for safely (only trust first IP)
    const forwarded = req.headers["x-forwarded-for"] as string | undefined;
    return (forwarded?.split(",")[0] ?? req.ip ?? "unknown").trim();
  },
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(globalLimiter);

// ── Basic security headers ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "FormCraft API is running." }));
app.get("/health", (req, res) => res.json({ status: "healthy", ts: Date.now() }));

// ── better-auth handler ───────────────────────────────────────────────────────
app.all("/auth/*", toNodeHandler(auth));

// ── OpenAPI + Scalar docs ─────────────────────────────────────────────────────
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "FormCraft API",
  version: "1.0.0",
  description: "Industry-grade form builder API. Full OpenAPI 3.0 documentation.",
  baseUrl: env.BASE_URL.concat("/api"),
  tags: [
    { name: "Forms", description: "Create and manage forms" },
    { name: "Public Forms", description: "Public form access (no auth required)" },
    { name: "Fields", description: "Manage form fields" },
    { name: "Responses", description: "Submit and view form responses" },
    { name: "Analytics", description: "Form analytics and insights" },
    { name: "Themes", description: "Form visual themes" },
    { name: "Payments", description: "Razorpay subscription payments" },
  ],
});

app.get("/openapi.json", (req, res) => res.json(openApiDocument));
app.use("/docs", apiReference({ url: "/openapi.json", theme: "saturn" }));

// ── tRPC (main — all endpoints including public) ───────────────────────────────
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ path, error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error(`tRPC error on ${path ?? "unknown"}`, { error });
      }
    },
  })
);

// ── REST API via OpenAPI middleware (with submit rate limiting) ────────────────
app.use(
  "/api/responses/submit",
  submitLimiter,
  createOpenApiExpressMiddleware({ router: serverRouter, createContext })
);
app.use("/api", createOpenApiExpressMiddleware({ router: serverRouter, createContext }));

// ── Razorpay webhook (raw body needed for signature verification) ─────────────
app.post(
  "/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env["RAZORPAY_WEBHOOK_SECRET"] ?? "";
    const expectedSig = require("node:crypto")
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSig) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());
    logger.info("Razorpay webhook received", { event: event.event });

    // Handle events:
    // subscription.charged → extend subscription period
    // subscription.cancelled → set status to cancelled
    // payment.failed → notify user
    res.json({ received: true });
  }
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

export default app;
```

---

## STEP 7 — Create `packages/email`

### `packages/email/package.json`

```json
{
  "name": "@repo/email",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "@react-email/components": "^0.0.22",
    "react": "^19.0.0",
    "resend": "^4.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.9.3"
  }
}
```

### `packages/email/src/index.ts`

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env["RESEND_API_KEY"]);

export * from "./templates/response-notification";
export * from "./templates/welcome";
export * from "./templates/form-confirmation";
```

### `packages/email/src/templates/response-notification.tsx`

```tsx
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from "@react-email/components";

interface ResponseNotificationProps {
  creatorName: string;
  formTitle: string;
  responseCount: number;
  formUrl: string;
}

export function ResponseNotificationEmail({
  creatorName,
  formTitle,
  responseCount,
  formUrl,
}: ResponseNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New response received for {formTitle}</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>
            New Response Received
          </Heading>
          <Text style={{ color: "#6b7280", fontSize: "16px" }}>
            Hello {creatorName},
          </Text>
          <Text style={{ color: "#374151", fontSize: "16px" }}>
            Your form <strong>{formTitle}</strong> just received a new response.
            You now have <strong>{responseCount}</strong> total response{responseCount !== 1 ? "s" : ""}.
          </Text>
          <Section style={{ marginTop: "24px" }}>
            <a
              href={formUrl}
              style={{
                backgroundColor: "#6C47FF",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              View Responses
            </a>
          </Section>
          <Hr style={{ marginTop: "32px", borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            FormCraft — Forms that feel like an experience. You can turn off
            email notifications in your form settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## STEP 8 — Update `apps/web` providers and layout

### Update `apps/web/providers/global.tsx`

```tsx
"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";
import { Toaster } from "react-hot-toast";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // Do not retry on 4xx errors
          if ((error as { data?: { httpStatus?: number } }).data?.httpStatus &&
              (error as { data: { httpStatus: number } }).data.httpStatus < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = React.useState(() =>
    trpc.createClient({ links: [createTRPCHttpBatchClientClient()] })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }}
        />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Update `apps/web/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Space_Grotesk, Bebas_Neue, Playfair_Display, Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas-neue", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-poppins", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "FormCraft", template: "%s | FormCraft" },
  description: "Forms that feel like an experience. The modern, beautiful form builder for India.",
  keywords: ["form builder", "typeform alternative", "survey tool", "FormCraft"],
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    title: "FormCraft",
    description: "Forms that feel like an experience.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#6C47FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          inter.variable,
          spaceGrotesk.variable,
          bebasNeue.variable,
          playfair.variable,
          poppins.variable,
          dmSans.variable,
          "font-sans antialiased",
        ].join(" ")}
      >
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
```

---

## STEP 9 — Environment variables

Create `.env` at the monorepo root (setup.sh will symlink it everywhere):

```bash
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:password@ep-example.neon.tech/formcraft?sslmode=require"

# API
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Auth
BETTER_AUTH_SECRET="generate-with: openssl rand -base64 32"
BETTER_AUTH_URL=http://localhost:8000

# Google OAuth (from packages/services — already set up)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
IP_HASH_SALT="generate-with: openssl rand -base64 16"

# Email (Resend — free tier: 3000 emails/month)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="FormCraft <noreply@formcraft.app>"

# Razorpay (use test keys from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxx

# Frontend (Next.js public vars)
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
```

---

## STEP 10 — Add to `pnpm-workspace.yaml` and `turbo.json`

Add `@repo/schemas` and `@repo/email` to workspace:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

(Already correct — no change needed if it matches this.)

Add `@repo/schemas` as a dependency in `packages/trpc/package.json`:

```json
{
  "dependencies": {
    "@repo/schemas": "workspace:*",
    "@repo/database": "workspace:*"
  }
}
```

Add `@repo/schemas` and `@repo/email` as dependencies in `apps/web/package.json`:

```json
{
  "dependencies": {
    "@repo/schemas": "workspace:*",
    "@repo/trpc": "workspace:*"
  }
}
```

---

## STEP 11 — Run migrations and seed themes

After all files are written, run:

```bash
# Install all new packages
pnpm install

# Generate Drizzle migration from new schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Then write a seed script at packages/database/seed.ts
# and run: npx tsx packages/database/seed.ts
```

### Seed script outline (`packages/database/seed.ts`):

```typescript
import { db } from "./index";
import { formThemesTable, usersTable, formsTable, formFieldsTable, responsesTable, responseAnswersTable } from "./schema";
import { PREDEFINED_THEMES } from "@repo/schemas";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // 1. Seed all predefined themes
  for (const theme of PREDEFINED_THEMES) {
    await db.insert(formThemesTable).values({
      name: theme.name,
      slug: theme.slug,
      category: theme.category,
      config: theme.config as never,
      isPro: theme.isPro,
      isCustom: false,
    }).onConflictDoNothing();
  }
  console.log("Themes seeded.");

  // 2. Create demo user
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const [demoUser] = await db.insert(usersTable).values({
    fullName: "Demo Creator",
    email: "demo@formcraft.app",
    emailVerified: true,
    passwordHash,
    plan: "pro",
  }).onConflictDoNothing().returning();
  console.log("Demo user seeded:", demoUser?.email);

  // 3. Create 5 sample forms with fields and responses
  // (see full seed script in docs — forms: Netflix Watchlist, Jaipur Tourism,
  //  Startup Validator, Anime Poll, WhatsApp Feature Request)

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
```

---

## UI LIBRARY RECOMMENDATIONS

Use these in `apps/web` alongside shadcn/ui. All are production-grade and complement the stack:

| Library | Purpose | Install |
|---|---|---|
| `react-icons` | Icons — NO lucide, NO emojis | `pnpm add react-icons` |
| `@dnd-kit/sortable` | Drag-and-drop field reorder in form builder | `pnpm add @dnd-kit/core @dnd-kit/sortable` |
| `recharts` | Analytics charts (bar, line, pie) | `pnpm add recharts` |
| `framer-motion` | Form question transitions (slide, fade, pop) | `pnpm add framer-motion` |
| `react-hot-toast` | Toast notifications | `pnpm add react-hot-toast` |
| `zustand` | Client-side state for form builder | `pnpm add zustand` |
| `qrcode.react` | QR code generation for form sharing | `pnpm add qrcode.react` |
| `react-confetti` | Thank-you screen celebration animation | `pnpm add react-confetti` |
| `date-fns` | Date formatting in analytics | `pnpm add date-fns` |
| `@tanstack/react-table` | Responses table with sorting/filtering | `pnpm add @tanstack/react-table` |
| `react-hook-form` | Form management in the builder UI | `pnpm add react-hook-form @hookform/resolvers` |
| `cmdk` | Command palette (already in shadcn) | already installed |
| `vaul` | Mobile drawer (already in shadcn as `drawer`) | already installed |
| `sonner` | Toast (already in shadcn) | already installed |

### Icon usage pattern (react-icons — MANDATORY)

```tsx
// CORRECT: use react-icons
import { RiFormLine, RiBarChartLine, RiSettingsLine } from "react-icons/ri";
import { HiOutlineGlobeAlt, HiOutlineLockClosed } from "react-icons/hi2";
import { FiEdit2, FiTrash2, FiShare2, FiCopy } from "react-icons/fi";
import { BsStarFill, BsQrCode, BsDownload } from "react-icons/bs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { TbBrandRazorpay } from "react-icons/tb";

// WRONG: do not do any of these
// import { Star } from "lucide-react";  — NO lucide
// <span>⭐</span>                        — NO emojis in UI
```

---

## WHAT TO BUILD NEXT (Phase 2 prompt topics)

After Phase 1 is working (API starts, DB migrates, auth works, all routers type-check):

1. **Landing page** — hero, features, pricing, testimonials, CTA
2. **Auth pages** — `/auth/login` and `/auth/register` with react-icons
3. **Dashboard** — form list, stats cards, quick actions
4. **Form Builder** — drag-and-drop field editor with real-time preview
5. **Public Form Filler** — `/f/[slug]` Typeform-style one-question-at-a-time
6. **Analytics page** — recharts dashboard per form
7. **Explore page** — public form gallery with theme filters
8. **Pricing page** — Razorpay checkout integration

---

## VALIDATION CHECKLIST (run after writing all files)

- [ ] `pnpm install` completes with no errors
- [ ] `pnpm db:generate` generates a migration with all tables
- [ ] `pnpm db:migrate` applies migration successfully
- [ ] `pnpm dev` starts both `apps/api` (port 8000) and `apps/web` (port 3000)
- [ ] `GET http://localhost:8000/health` returns `{"status":"healthy"}`
- [ ] `GET http://localhost:8000/docs` renders Scalar API documentation
- [ ] `GET http://localhost:8000/openapi.json` returns valid OpenAPI spec
- [ ] TypeScript has zero errors: `pnpm check-types`
- [ ] better-auth endpoints work: `POST http://localhost:8000/auth/sign-in/email`
- [ ] tRPC health endpoint works: `http://localhost:3000` loads without errors
