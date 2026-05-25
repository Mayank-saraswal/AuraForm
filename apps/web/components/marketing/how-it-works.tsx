// apps/web/components/marketing/how-it-works.tsx
"use client";
import { motion } from "framer-motion";
import { RiAddLine, RiPaletteLine, RiShareLine, RiBarChartLine } from "react-icons/ri";

const STEPS = [
  {
    step: "01",
    icon: RiAddLine,
    title: "Create your form",
    desc: "Give it a name, add questions using our drag-and-drop builder. Short text, ratings, NPS scales, dropdowns — 15 field types.",
    color: "#6C47FF",
  },
  {
    step: "02",
    icon: RiPaletteLine,
    title: "Pick a theme",
    desc: "Choose from 20+ cinematic themes or customise colours, fonts, and animations. Your form, your vibe.",
    color: "#E50914",
  },
  {
    step: "03",
    icon: RiShareLine,
    title: "Share everywhere",
    desc: "Publish with a custom slug. Share via link, QR code, or embed. Password-protect if needed.",
    color: "#10B981",
  },
  {
    step: "04",
    icon: RiBarChartLine,
    title: "Analyse responses",
    desc: "Watch responses come in real-time. See completion rates, drop-off points, and export to CSV.",
    color: "#F59E0B",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#050505] px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#6C47FF] uppercase">
            How it works
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Four steps to <span className="gradient-text">beautiful data</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[23px] top-0 hidden h-full w-px bg-gradient-to-b from-[#6C47FF]/60 via-[#E50914]/40 to-[#F59E0B]/60 md:block" />

          <div className="flex flex-col gap-12">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-6"
              >
                <div
                  className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10"
                  style={{ background: s.color + "15" }}
                >
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-xs font-bold tracking-widest" style={{ color: s.color }}>
                      STEP {s.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{s.title}</h3>
                  <p className="max-w-md text-sm leading-relaxed text-white/50">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
