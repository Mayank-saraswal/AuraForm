// apps/web/app/(dashboard)/dashboard/forms/[id]/edit/page.tsx
"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { useFormBuilder } from "~/stores/form-builder";
import { BuilderToolbar }    from "~/components/builder/toolbar";
import { FieldTypePanel }    from "~/components/builder/field-type-panel";
import { FieldCanvas }       from "~/components/builder/field-canvas";
import { FieldSettingsPanel } from "~/components/builder/field-settings-panel";
import { BuilderPreview }    from "~/components/builder/preview";
import { Skeleton }          from "~/components/ui/skeleton";

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { setForm, setFields, setTheme, previewMode } = useFormBuilder();

  const { data: form, isLoading } = trpc.forms.getById.useQuery({ id });

  useEffect(() => {
    if (form) {
      setForm(form as Parameters<typeof setForm>[0]);
      setFields((form as { fields?: Parameters<typeof setFields>[0] }).fields ?? []);
      if ((form as { theme?: Parameters<typeof setTheme>[0] }).theme) {
        setTheme((form as { theme: Parameters<typeof setTheme>[0] }).theme);
      }
    }
  }, [form, setForm, setFields, setTheme]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-60px)] flex-col gap-0">
        <Skeleton className="h-14 w-full rounded-none" />
        <div className="flex flex-1 gap-0">
          <Skeleton className="w-64 rounded-none" />
          <Skeleton className="flex-1 rounded-none" />
          <Skeleton className="w-80 rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-60px)] flex-col overflow-hidden">
      <BuilderToolbar formId={id} />
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <FieldTypePanel formId={id} />}
        <FieldCanvas formId={id} />
        {!previewMode && <FieldSettingsPanel />}
        {previewMode && <BuilderPreview />}
      </div>
    </div>
  );
}
