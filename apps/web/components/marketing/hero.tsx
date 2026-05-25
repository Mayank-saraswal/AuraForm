// apps/web/components/marketing/hero.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { HiOutlineSparkles } from "react-icons/hi2";
import { RiArrowRightLine, RiPlayLine } from "react-icons/ri";
import { FiZap } from "react-icons/fi";

const HERO_THEMES = [
  { label: "Netflix",    color: "#E50914", bg: "#141414" },
  { label: "WhatsApp",   color: "#25D366", bg: "#075E54" },
  { label: "Pink City",  color: "#F7A8C4", bg: "#8B1A4A" },
  { label: "Discord",    color: "#5865F2", bg: "#313338" },
  { label: "Cyberpunk",  color: "#00FFFF", bg: "#0D001A" },
];

export function HeroSection() {
  return (
    <section className="hero-mesh relative overflow-hidden px-4 py-24 sm:py-36">
      <div className="relative mx-auto max-w-5xl text-center">

        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex"
        >
          <Badge
            variant="outline"
            className="gap-1.5 border-white/20 bg-white/5 px-3 py-1.5 text-white/80 backdrop-blur"
          >
            <HiOutlineSparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
            India&apos;s most beautiful form builder
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-7xl"
        >
          Forms that feel like
          <br />
          <span className="gradient-text">an experience</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl"
        >
          Create stunning, one-question-at-a-time forms with cinematic themes.
          From Netflix to Pink City Jaipur — every form tells a story.
          Collect responses, analyse data, get paid. All in one place.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            asChild
            size="lg"
            className="h-12 gap-2 bg-[#6C47FF] px-8 text-base hover:bg-[#5B21B6]"
          >
            <Link href="/auth/register">
              <FiZap className="h-4 w-4" />
              Start building free
              <RiArrowRightLine className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 gap-2 border-white/20 bg-white/5 px-8 text-base text-white hover:bg-white/10"
          >
            <Link href="/explore">
              <RiPlayLine className="h-4 w-4" />
              See live demos
            </Link>
          </Button>
        </motion.div>

        {/* Theme preview pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-white/40">20+ themes including</span>
          {HERO_THEMES.map((t) => (
            <span
              key={t.label}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: t.color + "40", color: t.color, background: t.bg + "60" }}
            >
              {t.label}
            </span>
          ))}
          <span className="text-xs text-white/40">and more</span>
        </motion.div>

        {/* Mock browser window showing a form */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl shadow-[#6C47FF]/20"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28CA41]" />
            <div className="ml-4 flex-1 rounded-md bg-[#2a2a2a] px-3 py-1 text-left text-xs text-white/30">
              formcraft.app/f/netflix-watchlist
            </div>
          </div>

          {/* Fake form preview — Netflix theme */}
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-8 bg-[#141414] p-8 sm:p-16">
            <div className="text-center">
              <p className="mb-3 text-sm font-medium tracking-widest text-[#E50914]">01 / 05</p>
              <h2 className="text-4xl tracking-wider text-white sm:text-6xl font-bold">
                What&apos;s your favourite genre?
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Select all that apply
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {["Thriller", "Sci-Fi", "Romance", "Documentary", "Horror", "Comedy"].map((g) => (
                <button
                  key={g}
                  className="rounded-full border border-[#E50914]/40 px-5 py-2 text-sm text-white transition-colors hover:bg-[#E50914] hover:border-[#E50914]"
                >
                  {g}
                </button>
              ))}
            </div>
            <button className="rounded-md bg-[#E50914] px-8 py-3 text-sm font-medium text-white hover:bg-[#c20812] transition-colors">
              Continue
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[#2a2a2a]">
            <div className="h-full w-1/5 bg-[#E50914] transition-all" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
