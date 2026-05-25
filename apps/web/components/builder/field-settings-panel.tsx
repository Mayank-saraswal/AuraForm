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
