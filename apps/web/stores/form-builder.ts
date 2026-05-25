// apps/web/stores/form-builder.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// Minimal types to avoid tight coupling with database package at the store level
interface FormData {
  id: string;
  title: string;
  slug: string | null;
  status: string;
  [key: string]: unknown;
}

interface FieldData {
  id: string;
  formId: string;
  type: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: unknown;
  validation: unknown;
  logic: unknown;
  buttonLabel: string | null;
  imageUrl: string | null;
  [key: string]: unknown;
}

interface ThemeData {
  id: string;
  name: string;
  config: unknown;
  [key: string]: unknown;
}

export type BuilderField = FieldData & {
  _localId: string; // for dnd-kit — stable even before DB save
};

interface FormBuilderState {
  form:           FormData | null;
  fields:         BuilderField[];
  theme:          ThemeData | null;
  selectedFieldId: string | null;
  previewMode:    boolean;
  isDirty:        boolean;

  // Actions
  setForm:             (form: FormData)       => void;
  setFields:           (fields: FieldData[]) => void;
  setTheme:            (theme: ThemeData)  => void;
  selectField:         (id: string | null)       => void;
  updateSelectedField: (updates: Partial<BuilderField>) => void;
  reorderFields:       (from: number, to: number) => void;
  addField:            (field: BuilderField)     => void;
  removeField:         (id: string)              => void;
  togglePreview:       ()                         => void;
  markClean:           ()                         => void;
}

export const useFormBuilder = create<FormBuilderState>()(
  immer((set) => ({
    form:            null,
    fields:          [],
    theme:           null,
    selectedFieldId: null,
    previewMode:     false,
    isDirty:         false,

    setForm:   (form)  => set((s) => { s.form  = form;  }),
    setFields: (fields) => set((s) => {
      s.fields = fields.map((f) => ({ ...f, _localId: f.id }));
    }),
    setTheme: (theme) => set((s) => { s.theme = theme; s.isDirty = true; }),
    selectField: (id) => set((s) => { s.selectedFieldId = id; }),

    updateSelectedField: (updates) =>
      set((s) => {
        const idx = s.fields.findIndex((f) => f.id === s.selectedFieldId);
        if (idx !== -1) {
          Object.assign(s.fields[idx]!, updates);
          s.isDirty = true;
        }
      }),

    reorderFields: (from, to) =>
      set((s) => {
        const [moved] = s.fields.splice(from, 1);
        if (moved) s.fields.splice(to, 0, moved);
        s.fields.forEach((f, i) => { f.order = i; });
        s.isDirty = true;
      }),

    addField: (field) =>
      set((s) => {
        field.order = s.fields.length;
        s.fields.push(field);
        s.selectedFieldId = field._localId;
        s.isDirty = true;
      }),

    removeField: (id) =>
      set((s) => {
        s.fields = s.fields.filter((f) => f.id !== id && f._localId !== id);
        if (s.selectedFieldId === id) s.selectedFieldId = null;
        s.isDirty = true;
      }),

    togglePreview: () => set((s) => { s.previewMode = !s.previewMode; }),
    markClean:     () => set((s) => { s.isDirty = false; }),
  }))
);
