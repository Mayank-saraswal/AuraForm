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

export function BuilderPreview({
  fieldsOverride,
  themeOverride,
}: {
  fieldsOverride?: BuilderField[];
  themeOverride?: { config: unknown };
} = {}) {
  const store = useFormBuilder();
  const fields = fieldsOverride ?? store.fields;
  const theme = themeOverride ?? store.theme;
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
                  className="flex flex-col gap-8 rounded-2xl p-6 sm:p-10"
                  style={{
                    backgroundColor: "var(--filler-question-bg, transparent)",
                    backdropFilter: "blur(var(--filler-question-blur, 0px))",
                  }}
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
                <div
                  className="filler-question text-3xl font-bold leading-snug sm:text-4xl prose prose-2xl dark:prose-invert max-w-none"
                  style={{ color: "var(--filler-question)" }}
                  dangerouslySetInnerHTML={{ __html: currentField.label || "Untitled question" }}
                />

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
