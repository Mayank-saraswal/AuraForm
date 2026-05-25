// apps/web/components/builder/field-type-panel.tsx
"use client";
import { useFormBuilder, type BuilderField } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import toast from "react-hot-toast";
import { RiText, RiFileTextLine, RiMailLine, RiHashtag,
         RiListCheck, RiCheckboxLine, RiStarLine, RiCalendarLine,
         RiBarChartLine, RiToggleLine, RiPhoneLine, RiLinkLine,
         RiImageLine, RiAlignLeftLine } from "react-icons/ri";

type FieldType = "short_text" | "long_text" | "email" | "number" | "phone" | "url" |
  "single_select" | "multi_select" | "dropdown" | "checkbox" | "rating" | "scale" |
  "date" | "yes_no" | "statement";

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: "short_text",    label: "Short text",     icon: RiText,          desc: "Single-line answer" },
  { type: "long_text",     label: "Long text",      icon: RiFileTextLine,  desc: "Multi-line answer" },
  { type: "email",         label: "Email",          icon: RiMailLine,      desc: "Email address" },
  { type: "number",        label: "Number",         icon: RiHashtag,       desc: "Numeric answer" },
  { type: "phone",         label: "Phone",          icon: RiPhoneLine,     desc: "Phone number" },
  { type: "url",           label: "Website URL",    icon: RiLinkLine,      desc: "Valid URL" },
  { type: "single_select", label: "Single select",  icon: RiListCheck,     desc: "Choose one option" },
  { type: "multi_select",  label: "Multi select",   icon: RiListCheck,     desc: "Choose many options" },
  { type: "dropdown",      label: "Dropdown",       icon: RiAlignLeftLine, desc: "Dropdown list" },
  { type: "checkbox",      label: "Checkbox",       icon: RiCheckboxLine,  desc: "Yes / No tick" },
  { type: "rating",        label: "Rating",         icon: RiStarLine,      desc: "1 to 5 stars" },
  { type: "scale",         label: "NPS Scale",      icon: RiBarChartLine,  desc: "1 to 10 scale" },
  { type: "date",          label: "Date",           icon: RiCalendarLine,  desc: "Date picker" },
  { type: "yes_no",        label: "Yes / No",       icon: RiToggleLine,    desc: "Boolean toggle" },
  { type: "statement",     label: "Statement",      icon: RiImageLine,     desc: "Display text / image" },
];

export function FieldTypePanel({ formId }: { formId: string }) {
  const { addField, fields } = useFormBuilder();
  const utils = trpc.useUtils();

  const addFieldMutation = trpc.fields.add.useMutation({
    onSuccess: async (newField) => {
      const builderField: BuilderField = {
        ...newField,
        _localId: newField.id,
        formId: newField.formId ?? formId,
        type: newField.type ?? "short_text",
        label: newField.label ?? "",
        description: newField.description ?? null,
        placeholder: newField.placeholder ?? null,
        required: newField.required ?? false,
        order: newField.order ?? fields.length,
        options: newField.options ?? null,
        validation: newField.validation ?? null,
        logic: newField.logic ?? null,
        buttonLabel: newField.buttonLabel ?? null,
        imageUrl: newField.imageUrl ?? null,
      };
      addField(builderField);
      await utils.forms.getById.invalidate({ id: formId });
      toast.success(`${(newField.type ?? "").replace(/_/g, " ")} field added.`);
    },
    onError: (e) => toast.error(e.message),
  });

  function handleAdd(type: FieldType) {
    addFieldMutation.mutate({
      formId,
      type,
      label: `Question ${fields.length + 1}`,
      required: false,
      order: fields.length,
    });
  }

  return (
    <div className="flex w-60 flex-col overflow-y-auto border-r bg-background">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Add a field
        </p>
      </div>
      <div className="flex flex-col gap-0.5 p-2">
        {FIELD_TYPES.map(({ type, label, icon: Icon, desc }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            disabled={addFieldMutation.isPending}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent group"
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-[#6C47FF]" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
