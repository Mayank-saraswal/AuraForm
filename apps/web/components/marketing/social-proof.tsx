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
  {
    quote: "The builder is so fast. I can create a complex 20-question branching form in under 5 minutes.",
    name: "Vikram Singh",
    role: "UX Researcher, Mumbai",
    avatar: "VS",
    color: "#F59E0B",
  },
];

export function SocialProof() {
  return (
    <section className="bg-[#080808] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-bold tracking-widest text-[#6C47FF] uppercase">
            Loved by creators
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Don't just take our word for it
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
            >
              <div className="mb-6 flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <RiStarFill key={n} className="h-5 w-5 text-[#F59E0B]" />
                ))}
              </div>

              <p className="mb-8 flex-1 text-base leading-relaxed text-white/80">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
