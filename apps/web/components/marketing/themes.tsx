// apps/web/components/marketing/themes.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiStarFill } from "react-icons/ri";

const SHOWCASE_THEMES = [
  {
    slug: "netflix",
    name: "Netflix",
    category: "Streaming",
    bg: "#141414",
    accent: "#E50914",
    text: "#FFFFFF",
    font: "Bebas Neue",
    question: "Rate your favourite Netflix original",
    fieldType: "rating" as const,
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    category: "Social",
    bg: "#075E54",
    accent: "#25D366",
    text: "#FFFFFF",
    font: "Roboto",
    question: "Which WhatsApp feature do you use most?",
    fieldType: "select" as const,
  },
  {
    slug: "pink-city",
    name: "Pink City Jaipur",
    category: "Culture",
    bg: "#8B1A4A",
    accent: "#F7A8C4",
    text: "#FFFFFF",
    font: "Playfair Display",
    question: "Which part of Jaipur did you visit?",
    fieldType: "multi-select" as const,
  },
  {
    slug: "anime-dark",
    name: "Anime Dark",
    category: "Anime",
    bg: "#0D0D1A",
    accent: "#7C3AED",
    text: "#E2E8F0",
    font: "Noto Sans JP",
    question: "Who is your favourite anime protagonist?",
    fieldType: "text" as const,
  },
  {
    slug: "discord",
    name: "Discord",
    category: "Gaming",
    bg: "#313338",
    accent: "#5865F2",
    text: "#DBDEE1",
    font: "Inter",
    question: "How would you rate our community server?",
    fieldType: "scale" as const,
  },
];

export function ThemesSection() {
  const [active, setActive] = useState(0);
  const theme = SHOWCASE_THEMES[active]!;

  return (
    <section id="themes" className="bg-[#080808] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-primary uppercase">Themes</p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Pick a theme. <span className="gradient-text">Set the mood.</span>
          </h2>
          <p className="mt-4 text-white/50">
            Every theme is a complete visual identity — background, font, accent colours,
            button style, animations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Theme selector */}
          <div className="flex flex-col gap-2">
            {SHOWCASE_THEMES.map((t, i) => (
              <button
                key={t.slug}
                onClick={() => setActive(i)}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                  i === active
                    ? "border-primary bg-primary/10"
                    : "border-white/8 bg-white/3 hover:border-white/20"
                }`}
              >
                <div
                  className="h-10 w-10 flex-shrink-0 rounded-lg border border-white/10"
                  style={{ background: t.bg }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.category} · {t.font}</div>
                </div>
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: t.accent }}
                />
              </button>
            ))}
          </div>

          {/* Live preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theme.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: theme.bg }}
            >
              {/* Progress */}
              <div className="h-1" style={{ background: theme.accent + "40" }}>
                <div className="h-full w-2/5 transition-all" style={{ background: theme.accent }} />
              </div>

              <div className="flex min-h-[380px] flex-col items-start justify-center gap-8 p-10 sm:p-14">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: theme.accent }}>02</span>
                  <span className="text-xs" style={{ color: theme.text + "60" }}>of 5</span>
                </div>
                <h3 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: theme.text }}>
                  {theme.question}
                </h3>

                {theme.fieldType === "rating" && (
                  <div className="flex gap-3">
                    {[1,2,3,4,5].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-bold transition-colors"
                        style={{
                          borderColor: n <= 4 ? theme.accent : theme.accent + "40",
                          background: n <= 4 ? theme.accent + "20" : "transparent",
                          color: theme.text,
                        }}
                      >
                        {n <= 4 ? <RiStarFill className="h-5 w-5" style={{ color: theme.accent }} /> : n}
                      </div>
                    ))}
                  </div>
                )}
                {theme.fieldType === "text" && (
                  <div
                    className="w-full rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: theme.accent + "60", color: theme.text + "80", background: "transparent" }}
                  >
                    Type your answer here...
                  </div>
                )}
                {theme.fieldType === "select" && (
                  <div className="flex flex-col gap-2 w-full">
                    {["Status updates", "Voice notes", "Channels", "Disappearing messages"].map((o) => (
                      <div
                        key={o}
                        className="rounded-lg border px-4 py-2.5 text-sm"
                        style={{ borderColor: theme.accent + "40", color: theme.text }}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                )}
                {theme.fieldType === "multi-select" && (
                  <div className="flex flex-wrap gap-2">
                    {["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"].map((o, i) => (
                      <span
                        key={o}
                        className="rounded-full px-4 py-1.5 text-sm"
                        style={{
                          background: i < 2 ? theme.accent + "30" : "transparent",
                          border: `1px solid ${theme.accent}${i < 2 ? "80" : "40"}`,
                          color: theme.text,
                        }}
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                )}
                {theme.fieldType === "scale" && (
                  <div className="w-full">
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <div
                          key={n}
                          className="flex flex-1 h-10 items-center justify-center rounded text-xs font-medium"
                          style={{
                            background: n <= 7 ? theme.accent + "30" : "transparent",
                            border: `1px solid ${theme.accent}40`,
                            color: theme.text,
                          }}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs" style={{ color: theme.text + "60" }}>
                      <span>Not at all</span>
                      <span>Extremely</span>
                    </div>
                  </div>
                )}

                <button
                  className="rounded-lg px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: theme.accent, color: "#FFFFFF" }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
