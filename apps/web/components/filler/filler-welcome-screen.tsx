// apps/web/components/filler/filler-welcome-screen.tsx
"use client";
import { motion } from "framer-motion";
import { RiArrowDownLine } from "react-icons/ri";

interface Props {
  title: string;
  description?: string | null;
  buttonLabel?: string;
  onStart: () => void;
}

export function FillerWelcomeScreen({ title, description, buttonLabel, onStart }: Props) {
  return (
    <div className="filler-root flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4"
      >
        <h1 className="filler-question text-4xl font-bold leading-tight sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto max-w-md text-base opacity-60" style={{ color: "var(--filler-text)" }}>
            {description}
          </p>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        onClick={onStart}
        className="filler-btn flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold"
      >
        {buttonLabel ?? "Start"}
        <RiArrowDownLine className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
