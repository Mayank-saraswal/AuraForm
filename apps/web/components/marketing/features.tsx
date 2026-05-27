// apps/web/components/marketing/features.tsx
"use client";
import { motion } from "framer-motion";
import { FiShield, FiGlobe } from "react-icons/fi";
import { RiBarChartLine, RiPaletteLine, RiQrCodeLine, RiMailLine } from "react-icons/ri";
import { TbForms, TbChartInfographic } from "react-icons/tb";

const FEATURES = [
  {
    icon: TbForms,
    color: "var(--primary)",
    title: "One question at a time",
    desc: "Typeform-style full-screen experience. Keyboard navigation, smooth transitions, progress indicator.",
  },
  {
    icon: RiPaletteLine,
    color: "#E50914",
    title: "20+ cinematic themes",
    desc: "Netflix, WhatsApp, Jaipur, Anime, macOS, Discord and more. Each theme is a complete visual identity.",
  },
  {
    icon: TbChartInfographic,
    color: "#10B981",
    title: "Real-time analytics",
    desc: "Completion rates, drop-off by question, avg time, daily response chart. All in one dashboard.",
  },
  {
    icon: FiShield,
    color: "#F59E0B",
    title: "Enterprise security",
    desc: "Password-protected forms, IP hashing, rate limiting, HMAC-verified payments. Production-grade from day one.",
  },
  {
    icon: RiQrCodeLine,
    color: "#C026D3",
    title: "QR code and custom slugs",
    desc: "auraform.app/f/your-slug — share via QR, WhatsApp, Twitter. No ugly hash URLs.",
  },
  {
    icon: RiMailLine,
    color: "#0EA5E9",
    title: "Email notifications",
    desc: "Instant creator alerts on new responses. Respondent confirmation emails with React Email templates.",
  },
  {
    icon: RiBarChartLine,
    color: "#8B5CF6",
    title: "CSV export",
    desc: "Download all responses as a spreadsheet with one click. Filter by date, sort by completion time.",
  },
  {
    icon: FiGlobe,
    color: "#EF4444",
    title: "Public and unlisted modes",
    desc: "Public forms appear in the explore gallery. Unlisted forms are link-only. You control visibility.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#050505] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-primary uppercase">
            Features
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Everything Typeform has.
            <br />
            <span className="gradient-text">And then some.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="card-lift rounded-xl border border-white/8 bg-white/3 p-6"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: f.color + "20" }}
              >
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
