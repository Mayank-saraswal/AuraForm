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
