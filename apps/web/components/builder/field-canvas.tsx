// apps/web/components/builder/field-canvas.tsx
"use client";
import { useFormBuilder, type BuilderField } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "~/lib/utils";
import toast from "react-hot-toast";
import { RiFormLine, RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";

function SortableField({
  field,
  formId,
  isSelected,
  onSelect,
}: {
  field: BuilderField;
  formId: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { removeField } = useFormBuilder();
  const utils = trpc.useUtils();
  const deleteFieldMutation = trpc.fields.delete.useMutation({
    onSuccess: () => { utils.forms.getById.invalidate({ id: formId }); },
    onError: (e) => toast.error(e.message),
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field._localId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border bg-card p-4 cursor-pointer transition-all",
        isSelected ? "border-[#6C47FF] ring-1 ring-[#6C47FF]/20" : "hover:border-border/80",
        isDragging && "builder-field-ghost"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 flex-shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <MdOutlineDragIndicator className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
            {field.type.replace(/_/g, " ")}
          </Badge>
          {field.required && (
            <span className="text-[10px] text-[#EF4444] font-medium">Required</span>
          )}
        </div>
        <p className="text-sm font-medium truncate">{field.label}</p>
        {field.description && (
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{field.description}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteFieldMutation.mutate({ id: field.id, formId });
          removeField(field.id);
        }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <RiDeleteBinLine className="h-4 w-4" />
      </button>
    </div>
  );
}

export function FieldCanvas({ formId }: { formId: string }) {
  const { fields, selectedFieldId, selectField, reorderFields } = useFormBuilder();
  const utils = trpc.useUtils();

  const reorderMutation = trpc.fields.reorder.useMutation({
    onError: (e) => toast.error(e.message),
  });

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIdx = fields.findIndex((f) => f._localId === active.id);
    const toIdx   = fields.findIndex((f) => f._localId === over.id);
    if (fromIdx === -1 || toIdx === -1) return;

    reorderFields(fromIdx, toIdx);

    // Persist new order to DB
    reorderMutation.mutate({
      formId,
      orderedIds: fields.map((f) => f.id),
    });
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-muted/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C47FF]/10">
          <RiFormLine className="h-8 w-8 text-[#6C47FF]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">No fields yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add fields from the left panel to start building
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-muted/20">
      <div className="mx-auto w-full max-w-2xl p-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f._localId)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <SortableField
                  key={field._localId}
                  field={field}
                  formId={formId}
                  isSelected={selectedFieldId === field._localId || selectedFieldId === field.id}
                  onSelect={() => selectField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
