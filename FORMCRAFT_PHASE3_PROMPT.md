# FormCraft — Phase 3 Master Build Prompt
# Complete the builder, forms list, theme gallery, QR sharing, CSV export, form settings
# Paste into Cursor / Windsurf after Phase 2 is verified working.

---

## PROGRESS TRACKER — WHERE WE ARE

| Phase | What was built                                          | Status |
|-------|---------------------------------------------------------|--------|
| 1     | DB schema, better-auth, tRPC routers, security          | Done   |
| 2     | Landing, auth pages, dashboard shell, builder canvas,   | Done   |
|       | form filler, analytics, pricing + Razorpay, explore     | Done   |
| 3     | THIS PHASE — see full list below                        | Build  |
| 4     | Seed data, email templates, deployment, README          | Next   |
| 5     | Conditional logic, admin dashboard, bonus features      | Last   |

## PHASE 3 DELIVERABLES

1.  `FieldSettingsPanel`   — right sidebar: label, description, placeholder, required toggle,
                             validation config, options editor (for select/multi-select/dropdown)
2.  `BuilderPreview`       — full live preview rendered inside the builder using theme CSS vars
3.  Forms list page        — `/dashboard/forms` with search, status filter, sort, actions menu
4.  Form settings drawer   — slug, visibility, response limit, expiry, password protection,
                             thank-you screen, email notification toggle
5.  QR code share modal    — `qrcode.react`, download as PNG, WhatsApp / Twitter share links
6.  CSV export             — server tRPC procedure + frontend download button
7.  Theme gallery page     — `/dashboard/themes` — pick and apply themes to a form
8.  Field options editor   — add / edit / delete / reorder options for select fields
9.  `HowItWorks` section   — missing marketing component from Phase 2
10. `SocialProof` + `CTA`  — remaining marketing components
11. `MarketingFooter` fix  — was referenced but needs a few missing links wired

---

## ABSOLUTE RULES — SAME AS EVERY PHASE

- react-icons ONLY. Zero lucide-react. Zero emoji in JSX.
- shadcn/ui for all primitives.
- framer-motion for all transitions.
- Zod from @repo/schemas — never redefine locally.
- No `any`. Strict TypeScript throughout.
- Every data-fetch component has a Skeleton loading state.
- Mobile-first. Every layout works at 375px.

---

## STEP 1 — CSV export tRPC procedure

Add this to `packages/trpc/server/routes/responses/route.ts`
inside the existing `responsesRouter`. Add it after the `analytics` procedure.

```typescript
// ADD inside responsesRouter in packages/trpc/server/routes/responses/route.ts

exportCsv: protectedProcedure
  .meta(openApiMeta("GET", "/responses/export/{id}", ["Responses"], true))
  .input(uuidParamSchema)
  .query(async ({ ctx, input }) => {
    // Verify ownership
    const form = await db.query.formsTable.findFirst({
      where: and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)),
      with: { fields: { orderBy: [asc(formFieldsTable.order)] } },
    });
    if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found." });

    const responses = await db.query.responsesTable.findMany({
      where: eq(responsesTable.formId, input.id),
      orderBy: [desc(responsesTable.submittedAt)],
      with: { answers: true },
      limit: 10000, // safety cap
    });

    // Build CSV header row from field labels
    const headers = [
      "Response ID",
      "Submitted At",
      "Time to Complete (s)",
      ...form.fields.map((f) => f.label),
    ];

    // Build CSV rows
    const rows = responses.map((r) => {
      const answerMap = Object.fromEntries(
        r.answers.map((a) => [a.fieldId, a.value])
      );
      return [
        r.id,
        r.submittedAt.toISOString(),
        r.timeToCompleteMs != null ? Math.round(r.timeToCompleteMs / 1000) : "",
        ...form.fields.map((f) => {
          const val = answerMap[f.id];
          if (val === null || val === undefined) return "";
          if (Array.isArray(val)) return val.join("; ");
          return String(val);
        }),
      ];
    });

    // Serialize to CSV string
    function escapeCell(cell: string | number): string {
      const s = String(cell);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }

    const csvLines = [headers, ...rows].map((row) =>
      row.map(escapeCell).join(",")
    );

    return {
      csv: csvLines.join("\n"),
      filename: `${form.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_responses.csv`,
      totalRows: responses.length,
    };
  }),
```

---

## STEP 2 — FieldSettingsPanel (right sidebar in builder)

### `apps/web/components/builder/field-settings-panel.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormBuilder } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  RiAddLine, RiDeleteBinLine, RiLoader4Line,
  RiDragMoveLine, RiSettings3Line, RiCheckboxLine,
} from "react-icons/ri";
import { MdOutlineDragIndicator } from "react-icons/md";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuid } from "uuid";
import type { BuilderField } from "~/stores/form-builder";

// ── Local schema for the settings form ───────────────────────────────────────
const settingsSchema = z.object({
  label:       z.string().min(1, "Label is required").max(500),
  description: z.string().max(1000).optional(),
  placeholder: z.string().max(300).optional(),
  required:    z.boolean(),
  buttonLabel: z.string().max(100).optional(),
  validation: z.object({
    minLength:   z.coerce.number().int().min(0).optional(),
    maxLength:   z.coerce.number().int().min(0).optional(),
    min:         z.coerce.number().optional(),
    max:         z.coerce.number().optional(),
    pattern:     z.string().optional(),
  }).optional(),
  options: z.array(z.object({
    id:    z.string(),
    label: z.string().min(1, "Option label required").max(200),
    value: z.string().min(1).max(200),
    order: z.number(),
  })).optional(),
});

type SettingsInput = z.infer<typeof settingsSchema>;

// ── Single sortable option row ────────────────────────────────────────────────
function SortableOption({
  id, index, register, onRemove, errors,
}: {
  id: string;
  index: number;
  register: ReturnType<typeof useForm<SettingsInput>>["register"];
  onRemove: () => void;
  errors: ReturnType<typeof useForm<SettingsInput>>["formState"]["errors"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 ${isDragging ? "opacity-40" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
      >
        <MdOutlineDragIndicator className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <Input
          {...register(`options.${index}.label`)}
          placeholder={`Option ${index + 1}`}
          className="h-8 text-sm"
        />
        {errors.options?.[index]?.label && (
          <p className="text-[11px] text-destructive mt-0.5">
            {errors.options[index].label?.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <RiDeleteBinLine className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const OPTION_FIELD_TYPES = ["single_select", "multi_select", "dropdown"];
const TEXT_FIELD_TYPES   = ["short_text", "long_text", "email", "url", "phone"];
const NUMBER_FIELD_TYPES = ["number", "rating", "scale"];

export function FieldSettingsPanel({ formId }: { formId: string }) {
  const { selectedFieldId, fields, updateSelectedField } = useFormBuilder();
  const utils = trpc.useUtils();

  const selectedField = fields.find(
    (f) => f.id === selectedFieldId || f._localId === selectedFieldId
  ) as BuilderField | undefined;

  const updateMutation = trpc.fields.update.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate({ id: formId });
      toast.success("Field saved.");
    },
    onError: (e) => toast.error(e.message),
  });

  const {
    register, handleSubmit, reset, control, watch,
    setValue, formState: { errors, isDirty },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema) });

  const { fields: optionFields, append, remove, swap } = useFieldArray({
    control,
    name: "options",
  });

  // Reset form when selected field changes
  useEffect(() => {
    if (!selectedField) return;
    reset({
      label:       selectedField.label,
      description: selectedField.description ?? "",
      placeholder: selectedField.placeholder ?? "",
      required:    selectedField.required,
      buttonLabel: selectedField.buttonLabel ?? "",
      validation:  (selectedField.validation as SettingsInput["validation"]) ?? {},
      options:     (selectedField.options as SettingsInput["options"]) ??
                   (OPTION_FIELD_TYPES.includes(selectedField.type)
                     ? [{ id: uuid(), label: "Option 1", value: "option_1", order: 0 }]
                     : []),
    });
  }, [selectedField?.id, reset]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleOptionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = optionFields.findIndex((f) => f.id === active.id);
    const to   = optionFields.findIndex((f) => f.id === over.id);
    if (from !== -1 && to !== -1) swap(from, to);
  }

  function addOption() {
    const idx = optionFields.length;
    append({
      id:    uuid(),
      label: `Option ${idx + 1}`,
      value: `option_${idx + 1}`,
      order: idx,
    });
  }

  async function onSubmit(data: SettingsInput) {
    if (!selectedField) return;

    // Sync value from label for options
    const normalizedOptions = data.options?.map((o, i) => ({
      ...o,
      value: o.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
      order: i,
    }));

    const payload = { ...data, options: normalizedOptions };

    updateSelectedField(payload);
    await updateMutation.mutateAsync({
      id:     selectedField.id,
      formId,
      ...payload,
    });
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!selectedField) {
    return (
      <aside className="flex w-80 flex-col items-center justify-center gap-3 border-l bg-background p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <RiSettings3Line className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Select a field on the canvas to edit its settings
        </p>
      </aside>
    );
  }

  // ── Settings panel ──────────────────────────────────────────────────────────
  return (
    <aside className="flex w-80 flex-col overflow-hidden border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Field settings
          </p>
          <p className="mt-0.5 text-sm font-medium capitalize">
            {selectedField.type.replace(/_/g, " ")}
          </p>
        </div>
        {isDirty && (
          <Button
            size="sm"
            className="h-7 bg-[#6C47FF] px-3 text-xs"
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? <RiLoader4Line className="h-3.5 w-3.5 animate-spin" />
              : "Save"
            }
          </Button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0">
          <Accordion type="multiple" defaultValue={["basic", "options", "validation"]}>

            {/* ── Basic settings ─────────────────────────────────────────── */}
            <AccordionItem value="basic" className="border-b px-4">
              <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-widest hover:no-underline">
                Basic
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 pb-4">

                {/* Label */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Question label</Label>
                  <Textarea
                    {...register("label")}
                    rows={2}
                    className="resize-none text-sm"
                    placeholder="What is your question?"
                  />
                  {errors.label && (
                    <p className="text-[11px] text-destructive">{errors.label.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Description <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    {...register("description")}
                    placeholder="Add a hint or subtitle"
                    className="text-sm"
                  />
                </div>

                {/* Placeholder (text fields only) */}
                {[...TEXT_FIELD_TYPES, "number", "phone", "url"].includes(selectedField.type) && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Placeholder text</Label>
                    <Input
                      {...register("placeholder")}
                      placeholder="e.g. Type your answer..."
                      className="text-sm"
                    />
                  </div>
                )}

                {/* Button label (statement / welcome) */}
                {["statement", "welcome_screen"].includes(selectedField.type) && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Button label</Label>
                    <Input
                      {...register("buttonLabel")}
                      placeholder="e.g. Let's go!"
                      className="text-sm"
                    />
                  </div>
                )}

                {/* Required toggle */}
                {!["statement", "welcome_screen", "thank_you_screen"].includes(selectedField.type) && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Required</p>
                      <p className="text-xs text-muted-foreground">
                        Respondents must answer this question
                      </p>
                    </div>
                    <Switch
                      checked={watch("required")}
                      onCheckedChange={(v) => setValue("required", v, { shouldDirty: true })}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ── Options editor (select fields) ─────────────────────────── */}
            {OPTION_FIELD_TYPES.includes(selectedField.type) && (
              <AccordionItem value="options" className="border-b px-4">
                <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-widest hover:no-underline">
                  Options ({optionFields.length})
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleOptionDragEnd}
                  >
                    <SortableContext
                      items={optionFields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {optionFields.map((opt, i) => (
                          <SortableOption
                            key={opt.id}
                            id={opt.id}
                            index={i}
                            register={register}
                            onRemove={() => remove(i)}
                            errors={errors}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full gap-1.5 text-xs"
                    onClick={addOption}
                  >
                    <RiAddLine className="h-3.5 w-3.5" />
                    Add option
                  </Button>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* ── Validation ─────────────────────────────────────────────── */}
            {[...TEXT_FIELD_TYPES, ...NUMBER_FIELD_TYPES].includes(selectedField.type) && (
              <AccordionItem value="validation" className="border-b px-4">
                <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-widest hover:no-underline">
                  Validation
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3 pb-4">

                  {/* Text length constraints */}
                  {TEXT_FIELD_TYPES.includes(selectedField.type) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px]">Min length</Label>
                        <Input
                          type="number"
                          min={0}
                          {...register("validation.minLength")}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px]">Max length</Label>
                        <Input
                          type="number"
                          min={0}
                          {...register("validation.maxLength")}
                          placeholder="No limit"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Number / rating / scale constraints */}
                  {NUMBER_FIELD_TYPES.includes(selectedField.type) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px]">Min value</Label>
                        <Input
                          type="number"
                          {...register("validation.min")}
                          placeholder="No min"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px]">Max value</Label>
                        <Input
                          type="number"
                          {...register("validation.max")}
                          placeholder="No max"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Regex pattern */}
                  {TEXT_FIELD_TYPES.includes(selectedField.type) &&
                   !["email", "url", "phone"].includes(selectedField.type) && (
                    <div className="flex flex-col gap-1">
                      <Label className="text-[11px]">Regex pattern <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        {...register("validation.pattern")}
                        placeholder="e.g. ^[A-Z].*"
                        className="h-8 font-mono text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Answer must match this regular expression
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Save button at bottom */}
          <div className="p-4">
            <Button
              type="submit"
              className="w-full bg-[#6C47FF] hover:bg-[#5B21B6]"
              disabled={updateMutation.isPending || !isDirty}
            >
              {updateMutation.isPending
                ? <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                : <RiCheckboxLine className="mr-2 h-4 w-4" />
              }
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </aside>
  );
}
```

---

## STEP 3 — BuilderPreview component

### `apps/web/components/builder/preview.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useFormBuilder } from "~/stores/form-builder";
import { applyThemeToDom } from "~/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiArrowUpLine, RiArrowDownLine, RiStarLine, RiStarFill,
} from "react-icons/ri";
import type { BuilderField } from "~/stores/form-builder";
import type { ThemeConfig } from "@repo/schemas";
import { cn } from "~/lib/utils";

export function BuilderPreview() {
  const { fields, theme } = useFormBuilder();
  const rootRef           = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction,  setDirection]  = useState(1);
  const [ratingVal,  setRatingVal]  = useState(0);

  // Interactive fields only
  const previewFields = fields.filter(
    (f) => !["welcome_screen", "thank_you_screen", "statement"].includes(f.type)
  );

  const currentField = previewFields[currentIdx] as BuilderField | undefined;

  // Apply theme
  useEffect(() => {
    if (rootRef.current && theme?.config) {
      applyThemeToDom(rootRef.current, theme.config as ThemeConfig);
    }
  }, [theme]);

  const VARIANTS = {
    enter:  (d: number) => ({ y: d > 0 ? 60 : -60, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit:   (d: number) => ({ y: d > 0 ? -60 : 60, opacity: 0 }),
  };

  function goNext() {
    if (currentIdx < previewFields.length - 1) {
      setDirection(1);
      setCurrentIdx((i) => i + 1);
    }
  }
  function goPrev() {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx((i) => i - 1);
    }
  }

  const progress = previewFields.length > 0
    ? (currentIdx / previewFields.length) * 100
    : 0;

  if (previewFields.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/20 text-sm text-muted-foreground">
        Add fields to preview your form
      </div>
    );
  }

  return (
    <div ref={rootRef} className="filler-root flex flex-1 flex-col overflow-hidden">
      {/* Label */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-center py-2">
        <span className="rounded-full bg-black/30 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
          Preview mode — not interactive
        </span>
      </div>

      {/* Progress bar */}
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-black/10">
        <div className="filler-progress-fill h-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {currentField && (
              <motion.div
                key={currentField.id}
                custom={direction}
                variants={VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col gap-8"
              >
                {/* Question number */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold opacity-50">{currentIdx + 1}</span>
                  <RiArrowDownLine className="h-4 w-4 opacity-30" />
                  {currentField.required && (
                    <span className="text-xs font-medium opacity-50">Required</span>
                  )}
                </div>

                {/* Question label */}
                <h2
                  className="filler-question text-3xl font-bold leading-snug sm:text-4xl"
                  style={{ color: "var(--filler-question)" }}
                >
                  {currentField.label || "Untitled question"}
                </h2>

                {/* Field preview based on type */}
                <PreviewFieldInput field={currentField} ratingVal={ratingVal} setRatingVal={setRatingVal} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--filler-btn-bg)]/30
              text-[var(--filler-text)] disabled:opacity-30 hover:opacity-70"
          >
            <RiArrowUpLine className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            disabled={currentIdx === previewFields.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--filler-btn-bg)]/30
              text-[var(--filler-text)] disabled:opacity-30 hover:opacity-70"
          >
            <RiArrowDownLine className="h-4 w-4" />
          </button>
          <span className="ml-2 text-xs opacity-40" style={{ color: "var(--filler-text)" }}>
            {currentIdx + 1} / {previewFields.length}
          </span>
        </div>
        <button
          className="filler-btn rounded-lg px-6 py-2.5 text-sm font-semibold"
          onClick={goNext}
          disabled={currentIdx === previewFields.length - 1}
        >
          {currentIdx === previewFields.length - 1 ? "Submit" : "Continue"}
        </button>
      </div>
    </div>
  );
}

// ── Mini field previews ───────────────────────────────────────────────────────
function PreviewFieldInput({
  field, ratingVal, setRatingVal,
}: {
  field: BuilderField;
  ratingVal: number;
  setRatingVal: (v: number) => void;
}) {
  const base = `w-full border-b-2 border-[var(--filler-btn-bg)]/40 bg-transparent
    pb-2 pt-1 text-lg text-[var(--filler-text)] outline-none placeholder:opacity-40`;

  const options = (field.options as Array<{ id: string; label: string }> | null) ?? [];

  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
      return (
        <input readOnly className={base}
          placeholder={field.placeholder ?? "Type your answer here..."} />
      );

    case "long_text":
      return (
        <textarea readOnly rows={3} className={cn(base, "resize-none")}
          placeholder={field.placeholder ?? "Type your answer here..."} />
      );

    case "number":
      return (
        <input readOnly type="number" className={base}
          placeholder={field.placeholder ?? "Enter a number..."} />
      );

    case "single_select":
      return (
        <div className="flex flex-col gap-2">
          {options.slice(0, 4).map((opt, i) => (
            <div key={opt.id}
              className="flex items-center gap-3 rounded-xl border-2 px-5 py-3 text-sm"
              style={{ borderColor: "var(--filler-btn-bg)40", color: "var(--filler-text)" }}>
              <span className="flex h-6 w-6 items-center justify-center rounded border border-current text-xs opacity-50">
                {String.fromCharCode(65 + i)}
              </span>
              {opt.label}
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-sm opacity-40" style={{ color: "var(--filler-text)" }}>
              Add options in the settings panel
            </p>
          )}
        </div>
      );

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-2">
          {options.slice(0, 6).map((opt) => (
            <span key={opt.id}
              className="rounded-full border-2 px-5 py-2 text-sm"
              style={{ borderColor: "var(--filler-btn-bg)40", color: "var(--filler-text)" }}>
              {opt.label}
            </span>
          ))}
          {options.length === 0 && (
            <p className="text-sm opacity-40" style={{ color: "var(--filler-text)" }}>
              Add options in the settings panel
            </p>
          )}
        </div>
      );

    case "rating":
      return (
        <div className="flex items-center gap-3">
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setRatingVal(n)}
              style={{ color: "var(--filler-btn-bg)" }}>
              {n <= ratingVal
                ? <RiStarFill className="h-8 w-8" />
                : <RiStarLine className="h-8 w-8 opacity-40" />
              }
            </button>
          ))}
        </div>
      );

    case "scale":
      return (
        <div className="flex gap-1.5">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <div key={n}
              className="flex flex-1 h-10 items-center justify-center rounded text-xs font-medium"
              style={{
                border: "1px solid var(--filler-btn-bg)40",
                color: "var(--filler-text)",
              }}>
              {n}
            </div>
          ))}
        </div>
      );

    case "yes_no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <div key={opt}
              className="flex-1 rounded-xl border-2 py-4 text-center text-base font-semibold"
              style={{ borderColor: "var(--filler-btn-bg)40", color: "var(--filler-text)" }}>
              {opt}
            </div>
          ))}
        </div>
      );

    case "date":
      return <input readOnly type="date" className={cn(base, "max-w-xs")} />;

    case "checkbox":
      return (
        <div className="flex items-center gap-3 rounded-xl border-2 px-5 py-4"
          style={{ borderColor: "var(--filler-btn-bg)40", color: "var(--filler-text)" }}>
          <div className="h-5 w-5 rounded border-2"
            style={{ borderColor: "var(--filler-btn-bg)" }} />
          <span className="text-sm">{field.placeholder ?? "Check this box"}</span>
        </div>
      );

    default:
      return (
        <p className="text-sm opacity-40" style={{ color: "var(--filler-text)" }}>
          {field.type.replace(/_/g, " ")} field
        </p>
      );
  }
}
```

---

## STEP 4 — Forms list page

### `apps/web/app/(dashboard)/dashboard/forms/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { trpc } from "~/trpc/client";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
  RiAddLine, RiSearchLine, RiMoreLine, RiEditLine, RiDeleteBinLine,
  RiEyeLine, RiBarChartLine, RiCopyLine, RiGlobalLine, RiLinkM,
  RiFormLine, RiArrowUpLine, RiArrowDownLine,
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import { getFormShareUrl, truncate } from "~/lib/utils";
import { QRShareModal } from "~/components/dashboard/qr-share-modal";

type SortField = "updatedAt" | "createdAt" | "responseCount";
type Status = "all" | "draft" | "published" | "archived";

export default function FormsListPage() {
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState<Status>("all");
  const [sortBy,    setSortBy]    = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [qrFormId,  setQrFormId]  = useState<string | null>(null);
  const [page,      setPage]      = useState(1);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.forms.list.useQuery({
    page,
    limit: 12,
    status: status === "all" ? undefined : status,
  });

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form deleted."); },
    onError:   (e) => toast.error(e.message),
  });

  const cloneMutation = trpc.forms.clone.useMutation({
    onSuccess: (f) => {
      utils.forms.list.invalidate();
      toast.success("Form cloned! Opening editor…");
    },
    onError: (e) => toast.error(e.message),
  });

  const publishMutation   = trpc.forms.publish.useMutation({
    onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form published."); },
    onError:   (e) => toast.error(e.message),
  });

  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form unpublished."); },
    onError:   (e) => toast.error(e.message),
  });

  // Client-side filter + sort (data already paged from server)
  const forms = (data?.forms ?? [])
    .filter((f) => !search || f.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "responseCount") return (a.responseCount - b.responseCount) * dir;
      return (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * dir;
    });

  const qrForm = forms.find((f) => f.id === qrFormId);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last updated</SelectItem>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="responseCount">Responses</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc"
              ? <RiArrowUpLine className="h-4 w-4" />
              : <RiArrowDownLine className="h-4 w-4" />
            }
          </Button>

          <Button asChild className="gap-1.5 bg-[#6C47FF] hover:bg-[#5B21B6]">
            <Link href="/dashboard/forms/new">
              <RiAddLine className="h-4 w-4" />
              New form
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading…" : `${data?.total ?? 0} forms`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <RiFormLine className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search ? "No forms match your search." : "No forms yet. Create your first one!"}
          </p>
          {!search && (
            <Button asChild size="sm" className="bg-[#6C47FF]">
              <Link href="/dashboard/forms/new">
                <RiAddLine className="mr-1.5 h-4 w-4" />
                Create form
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const isPublished = form.status === "published";
            const shareUrl    = form.slug ? getFormShareUrl(form.slug) : null;

            return (
              <div
                key={form.id}
                className="group flex flex-col rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                {/* Theme colour strip */}
                <div className="flex h-2 w-full overflow-hidden rounded-t-xl">
                  <div className="flex-1 bg-[#6C47FF]" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {truncate(form.title, 50)}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <RiMoreLine className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/edit`} className="gap-2">
                            <RiEditLine className="h-4 w-4" />
                            Edit form
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/responses`} className="gap-2">
                            <RiBarChartLine className="h-4 w-4" />
                            View analytics
                          </Link>
                        </DropdownMenuItem>

                        {isPublished && shareUrl && (
                          <>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success("Link copied!"))}
                            >
                              <RiCopyLine className="h-4 w-4" />
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => setQrFormId(form.id)}
                            >
                              <RiLinkM className="h-4 w-4" />
                              QR code
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        {isPublished ? (
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => unpublishMutation.mutate({ id: form.id })}
                          >
                            <RiEyeLine className="h-4 w-4" />
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => publishMutation.mutate({ id: form.id, visibility: "unlisted" })}
                          >
                            <RiGlobalLine className="h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => cloneMutation.mutate({ id: form.id })}
                        >
                          <RiCopyLine className="h-4 w-4" />
                          Clone form
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this form?</AlertDialogTitle>
                              <AlertDialogDescription>
                                All responses will be permanently deleted. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate({ id: form.id })}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{form.responseCount} response{form.responseCount !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{form.viewCount} view{form.viewCount !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between">
                    <Badge
                      className={
                        form.status === "published"
                          ? "bg-[#10B981]/10 text-[#10B981] text-xs border-none"
                          : form.status === "archived"
                          ? "bg-muted text-muted-foreground text-xs border-none"
                          : "bg-[#F59E0B]/10 text-[#F59E0B] text-xs border-none"
                      }
                    >
                      {form.status}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {isPublished && shareUrl && (
                        <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                          <a href={shareUrl} target="_blank" rel="noreferrer">
                            <RiEyeLine className="h-3.5 w-3.5" />
                            View
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                        <Link href={`/dashboard/forms/${form.id}/edit`}>
                          <RiEditLine className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 12 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(data.total / 12)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 12)}
          >
            Next
          </Button>
        </div>
      )}

      {/* QR modal */}
      {qrForm?.slug && (
        <QRShareModal
          open={!!qrFormId}
          onClose={() => setQrFormId(null)}
          slug={qrForm.slug}
          title={qrForm.title}
        />
      )}
    </div>
  );
}
```

---

## STEP 5 — QR code share modal

Install first: `pnpm add qrcode.react --filter @repo/web`

### `apps/web/components/dashboard/qr-share-modal.tsx`

```tsx
"use client";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import {
  RiDownloadLine, RiCopyLine, RiTwitterLine, RiWhatsappLine,
} from "react-icons/ri";
import { getFormShareUrl } from "~/lib/utils";

interface Props {
  open:    boolean;
  onClose: () => void;
  slug:    string;
  title:   string;
}

export function QRShareModal({ open, onClose, slug, title }: Props) {
  const qrRef  = useRef<SVGSVGElement>(null);
  const shareUrl = getFormShareUrl(slug);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  }

  function downloadQr() {
    if (!qrRef.current) return;
    const svg       = qrRef.current;
    const svgData   = new XMLSerializer().serializeToString(svg);
    const canvas    = document.createElement("canvas");
    const size      = 400;
    canvas.width    = size;
    canvas.height   = size;
    const ctx       = canvas.getContext("2d")!;
    const img       = new Image();
    img.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a    = document.createElement("a");
      a.download = `${slug}-qr.png`;
      a.href     = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Fill out my form: ${title}`)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share your form</DialogTitle>
        </DialogHeader>

        {/* QR code */}
        <div className="flex justify-center rounded-xl border bg-white p-6">
          <QRCodeSVG
            ref={qrRef}
            value={shareUrl}
            size={200}
            fgColor="#111111"
            bgColor="#FFFFFF"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Link copy */}
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
            <RiCopyLine className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadQr}>
            <RiDownloadLine className="h-3.5 w-3.5" />
            Download QR
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <a href={twitterUrl} target="_blank" rel="noreferrer">
              <RiTwitterLine className="h-3.5 w-3.5" />
              Twitter
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <RiWhatsappLine className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## STEP 6 — Form settings drawer

### `apps/web/components/builder/form-settings-drawer.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { useFormBuilder } from "~/stores/form-builder";
import toast from "react-hot-toast";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import { RiLoader4Line, RiLinkM, RiLockLine, RiTimeLine, RiMailLine } from "react-icons/ri";
import { slugSchema } from "@repo/schemas";

const formSettingsSchema = z.object({
  title:           z.string().min(2).max(200).trim(),
  description:     z.string().max(2000).optional(),
  slug:            slugSchema.optional(),
  visibility:      z.enum(["public", "unlisted"]),
  responseLimit:   z.coerce.number().int().min(1).optional().nullable(),
  notifyOnResponse: z.boolean(),
  notifyEmail:     z.string().email().optional().nullable(),
  passwordProtected: z.boolean(),
  password:        z.string().min(6).max(100).optional(),
  thankYouTitle:   z.string().max(200).optional(),
  thankYouMessage: z.string().max(1000).optional(),
  showBranding:    z.boolean(),
});

type FormSettings = z.infer<typeof formSettingsSchema>;

interface Props { formId: string; open: boolean; onClose: () => void; }

export function FormSettingsDrawer({ formId, open, onClose }: Props) {
  const { form, setForm } = useFormBuilder();
  const utils = trpc.useUtils();

  const updateMutation = trpc.forms.update.useMutation({
    onSuccess: async (updated) => {
      setForm(updated);
      await utils.forms.getById.invalidate({ id: formId });
      toast.success("Settings saved.");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSettings>({
    resolver: zodResolver(formSettingsSchema),
  });

  useEffect(() => {
    if (form && open) {
      reset({
        title:            form.title,
        description:      form.description ?? "",
        slug:             form.slug ?? "",
        visibility:       form.visibility,
        responseLimit:    form.responseLimit ?? undefined,
        notifyOnResponse: form.notifyOnResponse,
        notifyEmail:      form.notifyEmail ?? "",
        passwordProtected: !!form.passwordHash,
        thankYouTitle:    form.thankYouTitle ?? "",
        thankYouMessage:  form.thankYouMessage ?? "",
        showBranding:     form.showBranding,
      });
    }
  }, [form, open, reset]);

  const pwProtected = watch("passwordProtected");
  const notify      = watch("notifyOnResponse");

  async function onSubmit(data: FormSettings) {
    await updateMutation.mutateAsync({ id: formId, ...data });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-4">
          <SheetTitle>Form settings</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">

          {/* ── General ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              General
            </p>

            <div className="flex flex-col gap-1.5">
              <Label>Form title</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea {...register("description")} rows={2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5">
                <RiLinkM className="h-3.5 w-3.5" />
                Custom URL slug
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  /f/
                </span>
                <Input {...register("slug")} placeholder="my-awesome-form" className="font-mono" />
              </div>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              <p className="text-[11px] text-muted-foreground">
                Lowercase letters, numbers and hyphens only
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Visibility</Label>
              <Select
                value={watch("visibility")}
                onValueChange={(v) => setValue("visibility", v as "public" | "unlisted")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    Public — appears in explore gallery
                  </SelectItem>
                  <SelectItem value="unlisted">
                    Unlisted — link only, not listed publicly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Show FormCraft branding</p>
                <p className="text-xs text-muted-foreground">
                  "Powered by FormCraft" footer on the form
                </p>
              </div>
              <Switch
                checked={watch("showBranding")}
                onCheckedChange={(v) => setValue("showBranding", v)}
              />
            </div>
          </section>

          <Separator />

          {/* ── Closing conditions ───────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <RiTimeLine className="mr-1 inline h-3.5 w-3.5" />
              Closing conditions
            </p>

            <div className="flex flex-col gap-1.5">
              <Label>Response limit <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                type="number"
                min={1}
                {...register("responseLimit")}
                placeholder="No limit"
              />
              <p className="text-[11px] text-muted-foreground">
                Stop accepting responses after this many submissions
              </p>
            </div>
          </section>

          <Separator />

          {/* ── Notifications ────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <RiMailLine className="mr-1 inline h-3.5 w-3.5" />
              Notifications
            </p>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Email on new response</p>
                <p className="text-xs text-muted-foreground">
                  Get notified each time someone submits
                </p>
              </div>
              <Switch
                checked={notify}
                onCheckedChange={(v) => setValue("notifyOnResponse", v)}
              />
            </div>

            {notify && (
              <div className="flex flex-col gap-1.5">
                <Label>Notification email <span className="text-muted-foreground text-xs">(leave blank to use account email)</span></Label>
                <Input {...register("notifyEmail")} type="email" placeholder="you@example.com" />
              </div>
            )}
          </section>

          <Separator />

          {/* ── Security ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <RiLockLine className="mr-1 inline h-3.5 w-3.5" />
              Security
            </p>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Password protection</p>
                <p className="text-xs text-muted-foreground">
                  Require a password to open the form
                </p>
              </div>
              <Switch
                checked={pwProtected}
                onCheckedChange={(v) => setValue("passwordProtected", v)}
              />
            </div>

            {pwProtected && (
              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <Input {...register("password")} type="password" placeholder="Enter a password" />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}
          </section>

          <Separator />

          {/* ── Thank-you screen ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Thank-you screen
            </p>

            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input {...register("thankYouTitle")} placeholder="Thank you!" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Message</Label>
              <Textarea
                {...register("thankYouMessage")}
                placeholder="Your response has been recorded."
                rows={2}
              />
            </div>
          </section>

          {/* Save */}
          <div className="sticky bottom-0 bg-background pt-4 pb-2">
            <Button
              type="submit"
              className="w-full bg-[#6C47FF] hover:bg-[#5B21B6]"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {(isSubmitting || updateMutation.isPending) && (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save settings
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

Wire the settings drawer into `BuilderToolbar` — add a settings button:

```tsx
// ADD inside BuilderToolbar (in apps/web/components/builder/toolbar.tsx)
// 1. Add import at top:
import { FormSettingsDrawer } from "./form-settings-drawer";
import { RiSettings3Line } from "react-icons/ri";

// 2. Add state inside component:
const [settingsOpen, setSettingsOpen] = useState(false);

// 3. Add button before the Publish button in the right div:
<Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSettingsOpen(true)}>
  <RiSettings3Line className="h-4 w-4" />
  Settings
</Button>

// 4. Add drawer after the closing </div> of the toolbar:
<FormSettingsDrawer formId={formId} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
```

---

## STEP 7 — CSV export download button

Add to `apps/web/app/(dashboard)/dashboard/forms/[id]/responses/page.tsx`
Replace the existing CSV export Button with this wired version:

```tsx
// ADD these imports
import { trpc } from "~/trpc/client";

// REPLACE the existing CSV Export button with:
function CsvExportButton({ formId }: { formId: string }) {
  const [downloading, setDownloading] = useState(false);
  const utils = trpc.useUtils();

  async function handleExport() {
    setDownloading(true);
    try {
      const result = await utils.client.responses.exportCsv.query({ id: formId });
      const blob   = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url    = URL.createObjectURL(blob);
      const a      = document.createElement("a");
      a.href       = url;
      a.download   = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${result.totalRows} responses.`);
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Export failed.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={downloading}>
      {downloading
        ? <RiLoader4Line className="h-4 w-4 animate-spin" />
        : <RiDownloadLine className="h-4 w-4" />
      }
      Export CSV
    </Button>
  );
}
```

---

## STEP 8 — Theme gallery page

### `apps/web/app/(dashboard)/dashboard/themes/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { trpc }      from "~/trpc/client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge }     from "~/components/ui/badge";
import { Button }    from "~/components/ui/button";
import { Skeleton }  from "~/components/ui/skeleton";
import { RiCheckLine, RiLockLine, RiPaletteLine } from "react-icons/ri";
import type { ThemeConfig } from "@repo/schemas";
import { cn } from "~/lib/utils";

const CATEGORIES = ["All", "Streaming", "Social", "Culture", "Gaming", "Anime", "Startup", "Operating System", "Minimal"];

export default function ThemesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId"); // optional: apply to a specific form

  const { data: themes, isLoading } = trpc.themes.list.useQuery();

  const applyThemeMutation = trpc.forms.update.useMutation({
    onSuccess: () => toast.success("Theme applied!"),
    onError:   (e) => toast.error(e.message),
  });

  const filtered = (themes ?? []).filter((t) =>
    activeCategory === "All" ||
    t.category.toLowerCase() === activeCategory.toLowerCase()
  );

  function handleApply(themeId: string) {
    if (!formId) {
      toast.error("Open a form first, then click a theme to apply it.");
      return;
    }
    applyThemeMutation.mutate({ id: formId, themeId });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Theme gallery</h2>
        <p className="text-sm text-muted-foreground">
          {formId
            ? "Click a theme to apply it to your form."
            : "Browse available themes. Open a form to apply one."
          }
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-[#6C47FF] text-white"
                : "border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((theme) => {
            const cfg = theme.config as ThemeConfig;
            return (
              <button
                key={theme.id}
                onClick={() => handleApply(theme.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border text-left transition-all hover:ring-2 hover:ring-[#6C47FF]",
                  applyThemeMutation.isPending && "pointer-events-none opacity-60"
                )}
              >
                {/* Preview area */}
                <div
                  className="flex h-28 flex-col items-start justify-end gap-2 p-4"
                  style={{ background: cfg.bgColor }}
                >
                  {/* Fake progress bar */}
                  <div className="h-1 w-full rounded-full" style={{ background: cfg.accentColor + "40" }}>
                    <div className="h-full w-1/3 rounded-full" style={{ background: cfg.accentColor }} />
                  </div>
                  {/* Fake CTA */}
                  <div
                    className="rounded-md px-3 py-1 text-[10px] font-medium"
                    style={{
                      background: cfg.buttonBgColor ?? cfg.accentColor,
                      color: cfg.buttonTextColor ?? "#FFFFFF",
                    }}
                  >
                    Continue
                  </div>
                </div>

                {/* Label */}
                <div className="flex items-center justify-between bg-card px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold">{theme.name}</p>
                    <p className="text-[10px] capitalize text-muted-foreground">{theme.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.isPro && (
                      <Badge className="h-4 px-1 text-[9px] bg-[#6C47FF] text-white">Pro</Badge>
                    )}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#6C47FF]/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <RiCheckLine className="h-4 w-4" />
                    Apply theme
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## STEP 9 — Missing marketing components (from Phase 2)

### `apps/web/components/marketing/how-it-works.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import { RiAddLine, RiPaletteLine, RiShareLine, RiBarChartLine } from "react-icons/ri";

const STEPS = [
  {
    step: "01",
    icon: RiAddLine,
    title: "Create your form",
    desc: "Give it a title, add your questions. Drag-and-drop to reorder. Takes under 2 minutes.",
    color: "#6C47FF",
  },
  {
    step: "02",
    icon: RiPaletteLine,
    title: "Pick a theme",
    desc: "Choose from 20+ cinematic themes. Netflix, Jaipur, Discord, Anime — make it yours.",
    color: "#C026D3",
  },
  {
    step: "03",
    icon: RiShareLine,
    title: "Share the link or QR code",
    desc: "Publish and share a clean custom URL or a QR code. Anyone can fill it — no login needed.",
    color: "#10B981",
  },
  {
    step: "04",
    icon: RiBarChartLine,
    title: "Analyse responses",
    desc: "View completion rate, daily chart, drop-off per question. Export to CSV in one click.",
    color: "#F59E0B",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#080808] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#6C47FF]">
            How it works
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            From idea to live form <span className="gradient-text">in minutes</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-start gap-5"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <step.icon className="h-8 w-8" style={{ color: step.color }} />
                <div
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: step.color }}
                >
                  {step.step}
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### `apps/web/components/marketing/social-proof.tsx`

```tsx
"use client";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "We replaced our Google Forms with FormCraft for all our event registrations. The Netflix theme gets a comment every single time.",
    name: "Arjun Sharma",
    role: "Event Manager, Bengaluru",
    avatar: "AS",
    color: "#E50914",
  },
  {
    quote: "The Jaipur Pink City theme was perfect for our Rajasthan tourism survey. Our completion rate jumped from 38% to 71%.",
    name: "Priya Gupta",
    role: "Research Analyst, Jaipur",
    avatar: "PG",
    color: "#F7A8C4",
  },
  {
    quote: "Best Typeform alternative I've found. Razorpay integration means I don't have to convert currencies. Love the analytics.",
    name: "Karan Mehta",
    role: "Solo founder, Mumbai",
    avatar: "KM",
    color: "#6C47FF",
  },
  {
    quote: "We use the Anime Dark theme for our gaming community surveys. Members fill it out completely — it feels like part of the experience.",
    name: "Divya Nair",
    role: "Community Manager, Pune",
    avatar: "DN",
    color: "#7C3AED",
  },
];

export function SocialProof() {
  return (
    <section className="bg-[#050505] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#6C47FF]">
            Social proof
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Loved by creators across India
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-lift rounded-xl border border-white/8 bg-white/3 p-6"
            >
              <p className="text-sm leading-relaxed text-white/70">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: t.color + "40", border: `1px solid ${t.color}60` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### `apps/web/components/marketing/cta.tsx`

```tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { RiArrowRightLine } from "react-icons/ri";
import { FiZap } from "react-icons/fi";

export function CTASection() {
  return (
    <section className="bg-[#050505] px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#6C47FF]/20 via-transparent to-[#C026D3]/10 p-14"
        >
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Ready to build your first form?
          </h2>
          <p className="mt-4 text-lg text-white/50">
            Free forever. No credit card required. First form live in 2 minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 gap-2 bg-[#6C47FF] px-8 text-base hover:bg-[#5B21B6]">
              <Link href="/auth/register">
                <FiZap className="h-4 w-4" />
                Start building free
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg"
              className="h-12 gap-2 border-white/20 bg-white/5 px-8 text-base text-white hover:bg-white/10">
              <Link href="/explore">See public forms</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## STEP 10 — Wire all imports in builder edit page

Update `apps/web/app/(dashboard)/dashboard/forms/[id]/edit/page.tsx` to include
the settings button trigger. The drawer is already wired via `BuilderToolbar` from Step 6.

Also ensure the Drizzle relations are defined so `.with({ fields: true, theme: true })` works.
Add this to `packages/database/models/form.ts`:

```typescript
// ADD at the bottom of packages/database/models/form.ts
import { relations } from "drizzle-orm";
import { responsesTable } from "./response";

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  user:   one(usersTable,    { fields: [formsTable.userId],  references: [usersTable.id] }),
  theme:  one(formThemesTable, { fields: [formsTable.themeId], references: [formThemesTable.id] }),
  fields: many(formFieldsTable),
  responses: many(responsesTable),
}));

export const formFieldsRelations = relations(formFieldsTable, ({ one, many }) => ({
  form:    one(formsTable, { fields: [formFieldsTable.formId], references: [formsTable.id] }),
  answers: many(responseAnswersTable),
}));
```

Add to `packages/database/models/response.ts`:

```typescript
// ADD at the bottom of packages/database/models/response.ts
import { relations } from "drizzle-orm";
import { formsTable, formFieldsTable } from "./form";

export const responsesRelations = relations(responsesTable, ({ one, many }) => ({
  form:    one(formsTable, { fields: [responsesTable.formId], references: [formsTable.id] }),
  answers: many(responseAnswersTable),
}));

export const responseAnswersRelations = relations(responseAnswersTable, ({ one }) => ({
  response: one(responsesTable, { fields: [responseAnswersTable.responseId], references: [responsesTable.id] }),
  field:    one(formFieldsTable, { fields: [responseAnswersTable.fieldId],   references: [formFieldsTable.id] }),
}));
```

Update `packages/database/index.ts` to pass relations to drizzle:

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon }    from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env["DATABASE_URL"]!);
export const db = drizzle(sql, { schema });
export * from "./schema";
```

---

## STEP 11 — Phase 3 final checklist

```bash
# Install any missing packages
pnpm add uuid @types/uuid --filter @repo/web
pnpm add immer --filter @repo/web         # for zustand/middleware/immer

# Re-run type check
pnpm check-types

# Verify these pages work:
# /dashboard/forms               → grid of form cards with action menus
# /dashboard/forms/[id]/edit     → builder with left panel + canvas + right settings panel
#                                  + settings drawer button in toolbar
#                                  + preview toggle button
# /dashboard/forms/[id]/responses → analytics with CSV download
# /dashboard/themes               → theme gallery grid
# /f/[slug]                       → form filler with correct theme applied

# Test QR code flow:
# 1. Create and publish a form
# 2. Click QR code from the forms list dropdown
# 3. See QR modal with download + WhatsApp + Twitter share buttons

# Test settings drawer:
# 1. Open form builder
# 2. Click "Settings" in toolbar
# 3. Change slug, toggle visibility, add password, save
# 4. Verify form is accessible at /f/new-slug

# Test CSV export:
# 1. Go to a form's analytics page
# 2. Click "Export CSV"
# 3. File downloads with all responses
```

---

## HOW MANY PROMPTS REMAIN AFTER THIS?

| Phase | Content                                                          | Status   |
|-------|------------------------------------------------------------------|----------|
| 1     | DB schema, auth, tRPC routers, security middleware               | Complete |
| 2     | Landing page, auth pages, dashboard shell, form builder canvas,  | Complete |
|       | form filler (Typeform UX), analytics, pricing + Razorpay, explore | Complete |
| 3     | Field settings panel, builder preview, forms list, form settings, | Complete |
|       | QR modal, CSV export, theme gallery, remaining marketing sections | (this)   |
| 4     | **Seed script** (5 themed forms, 200+ responses, realistic data), | Next     |
|       | **email templates** (Resend + React Email, 3 templates),         |          |
|       | **Scalar API docs** final wiring and tags,                       |          |
|       | **README.md** with demo credentials and setup guide              |          |
| 5     | **Deployment** (Railway for API, Vercel for web, env vars),      | Last     |
|       | **admin dashboard**, **conditional logic UI**, form password gate,|          |
|       | **responses table** with filter/pagination on responses page,    |          |
|       | final polish and judge-ready demo checklist                      |          |

**2 prompts remaining after this one (Phase 4 and Phase 5).**

Phase 4 is the most important for winning — judges open the demo and expect
to see data immediately. The seed script + README is what separates a
"technically complete" project from a "judge-ready" one.
ENDOFPROMPT