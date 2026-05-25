// apps/web/components/builder/field-settings-panel.tsx
"use client";
import { useFormBuilder } from "~/stores/form-builder";
import { RiSettings3Line } from "react-icons/ri";

export function FieldSettingsPanel() {
  const { selectedFieldId, fields, updateSelectedField } = useFormBuilder();
  const field = fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <div className="flex w-80 flex-col items-center justify-center gap-3 border-l bg-background p-6 text-center">
        <RiSettings3Line className="h-8 w-8 text-muted-foreground/30" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No field selected</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Click on a field in the canvas to edit its settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-80 flex-col overflow-y-auto border-l bg-background">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Field settings
        </p>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {/* Label */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateSelectedField({ label: e.target.value })}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            value={field.description ?? ""}
            onChange={(e) => updateSelectedField({ description: e.target.value || null })}
            rows={2}
            className="rounded-md border bg-background px-3 py-2 text-sm resize-none"
          />
        </div>

        {/* Placeholder */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Placeholder</label>
          <input
            type="text"
            value={field.placeholder ?? ""}
            onChange={(e) => updateSelectedField({ placeholder: e.target.value || null })}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Required toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => updateSelectedField({ required: e.target.checked })}
            className="rounded border"
          />
          <span className="text-sm">Required field</span>
        </label>

        <div className="mt-2 rounded-lg border border-dashed p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Advanced settings (validation, conditional logic, options) coming in Phase 3
          </p>
        </div>
      </div>
    </div>
  );
}
