// apps/web/components/filler/form-filler-client.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc }          from "~/trpc/client";
import { applyThemeToDom } from "~/lib/utils";
import toast             from "react-hot-toast";
import { FillerQuestion }      from "./filler-question";
import { FillerThankYou }      from "./filler-thank-you";
import { FillerPasswordGate }  from "./filler-password-gate";
import { RiArrowDownLine, RiLoader4Line, RiArrowUpLine } from "react-icons/ri";
import type { ThemeConfig } from "@repo/schemas";

type AnswerValue = string | number | boolean | string[] | null | undefined;

const SLIDE_VARIANTS = {
  enter:  (dir: number) => ({ y: dir > 0 ?  80 : -80, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit:   (dir: number) => ({ y: dir > 0 ? -80 :  80, opacity: 0 }),
};

interface Props { slug: string; password?: string; }

export function FormFillerClient({ slug, password }: Props) {
  const rootRef      = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());

  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [direction,   setDirection]   = useState(1);
  const [answers,     setAnswers]     = useState<Record<string, AnswerValue>>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [pwGate,      setPwGate]      = useState(!password);
  const [unlockedPw,  setUnlockedPw]  = useState<string | undefined>(password);

  const { data: form, isLoading, error } = trpc.forms.getBySlug.useQuery(
    { slug, password: unlockedPw },
    { retry: false, enabled: !pwGate || !!unlockedPw }
  );

  const submitMutation = trpc.responses.submit.useMutation();

  // Apply theme CSS variables on theme change
  useEffect(() => {
    if (rootRef.current && form && typeof form === "object" && "theme" in form) {
      const formObj = form as { theme?: { config?: unknown } };
      if (formObj.theme?.config) {
        applyThemeToDom(rootRef.current, formObj.theme.config as ThemeConfig);
      }
    }
  }, [form]);

  // Only show interactive (non-statement) fields in filler
  const interactiveFields = ((form && typeof form === "object" && "fields" in form)
    ? (form as { fields: { id: string; type: string; label: string; description: string | null; placeholder: string | null; required: boolean; options: unknown }[] }).fields
    : []
  ).filter((f) => !["welcome_screen", "thank_you_screen"].includes(f.type));

  const currentField = interactiveFields[currentIdx];
  const progress     = interactiveFields.length > 0 ? ((currentIdx) / interactiveFields.length) * 100 : 0;
  const isLast       = currentIdx === interactiveFields.length - 1;

  const handleNext = useCallback(() => {
    if (currentIdx < interactiveFields.length - 1) {
      setDirection(1);
      setCurrentIdx((i) => i + 1);
    }
  }, [currentIdx, interactiveFields.length]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx((i) => i - 1);
    }
  }, [currentIdx]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) handleNext();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  handlePrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  function handleAnswer(fieldId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit() {
    const formObj = form as { id: string } | null;
    if (!formObj) return;

    const answersArr = Object.entries(answers).map(([fieldId, value]) => ({ fieldId, value }));

    try {
      await submitMutation.mutateAsync({
        formId: formObj.id,
        answers: answersArr,
        timeToCompleteMs: Date.now() - startTimeRef.current,
        _hp: "", // honeypot — always empty for real users
      });
      setSubmitted(true);
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Submission failed. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <RiLoader4Line className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">This form is not available</p>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "The form may have been unpublished or the link is invalid."}
        </p>
      </div>
    );
  }

  const formObj = form as {
    id: string;
    showBranding?: boolean;
    thankYouTitle?: string | null;
    thankYouMessage?: string | null;
    theme?: { config?: { thankYouAnimation?: string } };
  };

  if (submitted) {
    return (
      <FillerThankYou
        title={formObj.thankYouTitle ?? "Thank you!"}
        message={formObj.thankYouMessage ?? "Your response has been recorded."}
        animation={formObj.theme?.config?.thankYouAnimation ?? "confetti"}
      />
    );
  }

  return (
    <div ref={rootRef} className="filler-root relative flex min-h-dvh flex-col">
      {/* Progress bar */}
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-black/10">
        <div className="filler-progress-fill h-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {currentField && (
              <motion.div
                key={currentField.id}
                custom={direction}
                variants={SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <FillerQuestion
                  field={currentField}
                  value={answers[currentField.id]}
                  onChange={(val) => handleAnswer(currentField.id, val)}
                  onNext={handleNext}
                  questionNumber={currentIdx + 1}
                  totalQuestions={interactiveFields.length}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--filler-btn-bg)]/30 text-[var(--filler-text)] disabled:opacity-30 hover:opacity-70 transition-opacity"
          >
            <RiArrowUpLine className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={isLast}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--filler-btn-bg)]/30 text-[var(--filler-text)] disabled:opacity-30 hover:opacity-70 transition-opacity"
          >
            <RiArrowDownLine className="h-4 w-4" />
          </button>
          <span className="ml-2 text-xs opacity-40">
            {currentIdx + 1} / {interactiveFields.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="filler-btn flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              {submitMutation.isPending && <RiLoader4Line className="h-4 w-4 animate-spin" />}
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="filler-btn flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              Continue
              <RiArrowDownLine className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* FormCraft branding (hidden on Pro) */}
      {formObj.showBranding && (
        <div className="pb-4 text-center">
          <a href="/" className="text-xs opacity-30 hover:opacity-60 transition-opacity">
            Powered by FormCraft
          </a>
        </div>
      )}
    </div>
  );
}
