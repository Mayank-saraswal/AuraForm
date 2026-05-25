// apps/web/components/builder/preview.tsx
"use client";
import { useFormBuilder } from "~/stores/form-builder";
import { RiEyeLine } from "react-icons/ri";

export function BuilderPreview() {
  const { fields, form, theme } = useFormBuilder();

  if (fields.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/20 p-6 text-center">
        <RiEyeLine className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Add fields to preview your form</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-muted/20">
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">{form?.title ?? "Untitled Form"}</h2>
          {fields.map((field, idx) => (
            <div key={field._localId} className="mb-6 last:mb-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">{idx + 1}.</span>
                <span className="text-sm font-medium">{field.label}</span>
                {field.required && <span className="text-xs text-[#EF4444]">*</span>}
              </div>
              {field.description && (
                <p className="mb-2 text-xs text-muted-foreground">{field.description}</p>
              )}
              {/* Render input previews by type */}
              {["short_text", "email", "phone", "url", "number"].includes(field.type) && (
                <input
                  type="text"
                  placeholder={field.placeholder ?? "Type here..."}
                  disabled
                  className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm"
                />
              )}
              {field.type === "long_text" && (
                <textarea
                  placeholder={field.placeholder ?? "Type here..."}
                  disabled
                  rows={3}
                  className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm resize-none"
                />
              )}
              {field.type === "yes_no" && (
                <div className="flex gap-2">
                  <div className="flex-1 rounded-md border py-2 text-center text-sm">Yes</div>
                  <div className="flex-1 rounded-md border py-2 text-center text-sm">No</div>
                </div>
              )}
              {field.type === "rating" && (
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} className="h-8 w-8 rounded border text-center text-sm leading-8 text-muted-foreground">{n}</div>
                  ))}
                </div>
              )}
              {field.type === "scale" && (
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <div key={n} className="flex-1 rounded border py-1 text-center text-xs text-muted-foreground">{n}</div>
                  ))}
                </div>
              )}
              {field.type === "date" && (
                <input type="date" disabled className="rounded-md border bg-muted/30 px-3 py-2 text-sm" />
              )}
              {field.type === "checkbox" && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" disabled className="rounded" />
                  {field.label}
                </label>
              )}
              {field.type === "statement" && (
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  {field.description ?? "Statement text"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
