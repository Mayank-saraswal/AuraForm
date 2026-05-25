// apps/web/components/marketing/social-proof.tsx
"use client";
import { motion } from "framer-motion";
import { RiStarFill } from "react-icons/ri";

const TESTIMONIALS = [
  {
    quote: "The best tool I've found for collecting data from students. The themes are incredible.",
    name: "Priya Mehta",
    role: "Product Manager, Bangalore",
    avatar: "PM",
    color: "#6C47FF",
  },
  {
    quote: "We switched from Typeform and saved 80% on costs. The Netflix theme alone increased completion rates by 40%.",
    name: "Arjun Kapoor",
    role: "Startup Founder, Delhi",
    avatar: "AK",
    color: "#E50914",
  },
  {
    quote: "Razorpay integration was a game changer. We collect event registrations with payments in one flow.",
    name: "Sneha Reddy",
    role: "Event Organizer, Hyderabad",
    avatar: "SR",
    color: "#10B981",
  },
];

const STATS = [
  { value: "10K+", label: "Forms created" },
  { value: "1M+", label: "Responses collected" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "Average rating", icon: true },
];

export function SocialProof() {
  return (
    <section className="bg-[#080808] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Stats row */}
        <div className="mb-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-white sm:text-5xl">{stat.value}</span>
                {stat.icon && <RiStarFill className="h-6 w-6 text-[#F59E0B]" />}
              </div>
              <p className="mt-2 text-sm text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#6C47FF] uppercase">
            Loved by creators
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            What our users say
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border border-white/8 bg-white/3 p-6"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {[1,2,3,4,5].map((n) => (
                  <RiStarFill key={n} className="h-4 w-4 text-[#F59E0B]" />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-white/70">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
