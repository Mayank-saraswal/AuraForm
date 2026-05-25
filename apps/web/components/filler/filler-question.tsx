// apps/web/components/filler/filler-question.tsx
"use client";
import { RiArrowRightLine, RiStarLine, RiStarFill } from "react-icons/ri";
import { useState } from "react";
import { cn } from "~/lib/utils";

type AnswerValue = string | number | boolean | string[] | null | undefined;

interface FieldData {
  id: string;
  type: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  options: unknown;
}

interface Props {
  field:           FieldData;
  value:           AnswerValue;
  onChange:        (val: AnswerValue) => void;
  onNext:          () => void;
  questionNumber:  number;
  totalQuestions:  number;
}

export function FillerQuestion({ field, value, onChange, onNext, questionNumber }: Props) {
  const [ratingHover, setRatingHover] = useState(0);

  const inputBase = `w-full border-b-2 border-[var(--filler-btn-bg)]/40 bg-transparent pb-2 pt-1
    text-lg text-[var(--filler-text)] outline-none placeholder:opacity-40
    focus:border-[var(--filler-btn-bg)] transition-colors`;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && field.type !== "long_text") {
      e.preventDefault();
      onNext();
    }
  }

  const options = (field.options ?? []) as { id: string; label: string; value: string }[];

  return (
    <div className="flex flex-col gap-8">
      {/* Question header */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-bold opacity-50">{questionNumber}</span>
          <RiArrowRightLine className="h-4 w-4 opacity-30" />
          {field.required && (
            <span className="text-xs font-medium opacity-50">Required</span>
          )}
        </div>
        <h2 className="filler-question text-3xl font-bold leading-snug sm:text-4xl">
          {field.label}
        </h2>
        {field.description && (
          <p className="mt-3 text-base opacity-60">{field.description}</p>
        )}
      </div>

      {/* Field input */}
      <div>
        {/* SHORT TEXT */}
        {field.type === "short_text" && (
          <input
            type="text"
            className={inputBase}
            placeholder={field.placeholder ?? "Type your answer here..."}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* LONG TEXT */}
        {field.type === "long_text" && (
          <textarea
            className={cn(inputBase, "min-h-[100px] resize-none border-2 rounded-lg border-[var(--filler-btn-bg)]/40 px-4 py-3")}
            placeholder={field.placeholder ?? "Type your answer here..."}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
        )}

        {/* EMAIL */}
        {field.type === "email" && (
          <input
            type="email"
            className={inputBase}
            placeholder={field.placeholder ?? "name@example.com"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* NUMBER */}
        {field.type === "number" && (
          <input
            type="number"
            className={inputBase}
            placeholder={field.placeholder ?? "Enter a number..."}
            value={(value as number) ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* PHONE */}
        {field.type === "phone" && (
          <input
            type="tel"
            className={inputBase}
            placeholder={field.placeholder ?? "+91 98765 43210"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* URL */}
        {field.type === "url" && (
          <input
            type="url"
            className={inputBase}
            placeholder={field.placeholder ?? "https://example.com"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* SINGLE SELECT */}
        {field.type === "single_select" && (
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.value); setTimeout(onNext, 300); }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 text-left text-base transition-all",
                  value === opt.value
                    ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/15"
                    : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                )}
                style={{ color: "var(--filler-text)" }}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-current text-xs opacity-50">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* DROPDOWN — same as single select visually for filler */}
        {field.type === "dropdown" && (
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.value); setTimeout(onNext, 300); }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 text-left text-base transition-all",
                  value === opt.value
                    ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/15"
                    : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                )}
                style={{ color: "var(--filler-text)" }}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-current text-xs opacity-50">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* MULTI SELECT */}
        {field.type === "multi_select" && (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const selected = ((value as string[]) ?? []).includes(opt.value);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const cur = (value as string[]) ?? [];
                    onChange(selected ? cur.filter((v) => v !== opt.value) : [...cur, opt.value]);
                  }}
                  className={cn(
                    "rounded-full border-2 px-5 py-2 text-sm font-medium transition-all",
                    selected
                      ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                      : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                  )}
                  style={{ color: "var(--filler-text)" }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* RATING (1-5 stars) */}
        {field.type === "rating" && (
          <div className="flex items-center gap-3">
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                onClick={() => onChange(n)}
                onMouseEnter={() => setRatingHover(n)}
                onMouseLeave={() => setRatingHover(0)}
                className="text-3xl transition-transform hover:scale-110"
                style={{ color: "var(--filler-btn-bg)" }}
              >
                {n <= (ratingHover || (value as number) || 0)
                  ? <RiStarFill className="h-8 w-8" />
                  : <RiStarLine className="h-8 w-8 opacity-40" />
                }
              </button>
            ))}
          </div>
        )}

        {/* NPS SCALE (1-10) */}
        {field.type === "scale" && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange(n)}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all",
                    value === n
                      ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                      : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                  )}
                  style={{ color: "var(--filler-text)" }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs opacity-50" style={{ color: "var(--filler-text)" }}>
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        )}

        {/* YES / NO */}
        {field.type === "yes_no" && (
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt === "Yes"); setTimeout(onNext, 300); }}
                className={cn(
                  "flex-1 rounded-xl border-2 py-4 text-base font-semibold transition-all",
                  value === (opt === "Yes")
                    ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                    : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                )}
                style={{ color: "var(--filler-text)" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* CHECKBOX */}
        {field.type === "checkbox" && (
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt === "Yes"); setTimeout(onNext, 300); }}
                className={cn(
                  "flex-1 rounded-xl border-2 py-4 text-base font-semibold transition-all",
                  value === (opt === "Yes")
                    ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                    : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                )}
                style={{ color: "var(--filler-text)" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* DATE */}
        {field.type === "date" && (
          <input
            type="date"
            className={cn(inputBase, "max-w-xs")}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
        )}

        {/* STATEMENT — just display, no input */}
        {field.type === "statement" && (
          <div className="rounded-lg bg-[var(--filler-btn-bg)]/10 p-6 text-base" style={{ color: "var(--filler-text)" }}>
            {field.description ?? "Continue to the next question"}
          </div>
        )}

        {/* Press Enter hint */}
        {!["single_select","multi_select","dropdown","rating","scale","yes_no","checkbox","date","statement"].includes(field.type) && (
          <p className="mt-3 text-xs opacity-40" style={{ color: "var(--filler-text)" }}>
            Press Enter to continue
          </p>
        )}
      </div>
    </div>
  );
}
