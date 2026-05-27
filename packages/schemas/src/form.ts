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
  showBranding: z.boolean().optional(), // hide "Powered by AuraForm" on Pro
});

export const publishFormSchema = z.object({
  id: z.string().uuid(),
  visibility: formVisibilitySchema,
});

export const updateCustomThemeSchema = z.object({
  id: z.string().uuid(),
  themeConfig: z.record(z.any()), // We allow passing Partial<ThemeConfig>
});

// Used when getting a form by slug for public filling
export const getPublicFormSchema = z.object({
  slug: z.string().min(1),
  password: z.string().optional(), // for password-protected forms
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
