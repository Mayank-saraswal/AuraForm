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
