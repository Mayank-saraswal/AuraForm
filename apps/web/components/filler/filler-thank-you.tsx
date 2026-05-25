// apps/web/components/filler/filler-thank-you.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { RiCheckLine } from "react-icons/ri";
import Link from "next/link";

interface Props {
  title:     string;
  message:   string;
  animation: string;
}

export function FillerThankYou({ title, message, animation }: Props) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(animation === "confetti" || animation === "fireworks");

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="filler-root flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={animation === "fireworks" ? 400 : 200}
          colors={["#6C47FF", "#C026D3", "#10B981", "#F59E0B", "#EF4444"]}
        />
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "var(--filler-btn-bg)" }}
      >
        <RiCheckLine className="h-10 w-10" style={{ color: "var(--filler-btn-text)" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <h1 className="filler-question text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="text-lg opacity-70" style={{ color: "var(--filler-text)" }}>{message}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-3"
      >
        <p className="text-sm opacity-40" style={{ color: "var(--filler-text)" }}>
          Built with FormCraft
        </p>
        <Link
          href="/"
          className="rounded-lg border px-5 py-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--filler-btn-bg)", color: "var(--filler-text)" }}
        >
          Create your own form
        </Link>
      </motion.div>
    </div>
  );
}
