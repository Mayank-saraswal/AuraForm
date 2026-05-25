// apps/web/components/marketing/cta.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { RiArrowRightLine } from "react-icons/ri";
import { FiZap } from "react-icons/fi";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#050505] px-4 py-24">
      {/* Gradient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6C47FF]/15 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <h2 className="text-4xl font-bold text-white sm:text-5xl">
          Ready to build forms that
          <br />
          <span className="gradient-text">people actually enjoy?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/50">
          Join thousands of creators, startups, and teams using FormCraft
          to collect data beautifully. Free forever — no credit card required.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
            <Link href="/explore">Browse public forms</Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-white/30">
          No credit card required. Free plan includes 3 forms and 100 responses each.
        </p>
      </motion.div>
    </section>
  );
}
