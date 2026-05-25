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
    <section className="bg-[#050505] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-bold tracking-widest text-[#6C47FF] uppercase">
            Built for speed
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            From idea to insights in <span className="text-[#6C47FF]">minutes</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              {/* Connector line for desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute right-0 top-12 h-px w-8 translate-x-full bg-white/10" />
              )}
              
              <div
                className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.color + "15", color: s.color }}
              >
                <s.icon className="h-7 w-7" />
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold opacity-50" style={{ color: s.color }}>STEP {s.step}</span>
              </div>
              
              <h3 className="mb-3 text-xl font-bold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
