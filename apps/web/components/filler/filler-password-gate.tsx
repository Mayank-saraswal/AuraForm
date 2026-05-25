// apps/web/components/filler/filler-password-gate.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { RiLockLine, RiLoader4Line, RiArrowRightLine } from "react-icons/ri";

interface Props {
  onUnlock: (password: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export function FillerPasswordGate({ onUnlock, error, isLoading }: Props) {
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim()) onUnlock(password.trim());
  }

  return (
    <div className="filler-root flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--filler-btn-bg)", opacity: 0.2 }}
      >
        <RiLockLine className="h-8 w-8" style={{ color: "var(--filler-btn-bg)" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h2 className="filler-question text-2xl font-bold sm:text-3xl">
          This form is password protected
        </h2>
        <p className="text-sm opacity-50" style={{ color: "var(--filler-text)" }}>
          Enter the password to access this form
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full rounded-lg border-2 bg-transparent px-4 py-3 text-center text-sm outline-none transition-colors"
          style={{
            borderColor: "var(--filler-btn-bg)",
            color: "var(--filler-text)",
            opacity: 0.8,
          }}
        />
        {error && (
          <p className="text-xs text-[#EF4444]">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading || !password.trim()}
          className="filler-btn flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {isLoading ? (
            <RiLoader4Line className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continue
              <RiArrowRightLine className="h-4 w-4" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
