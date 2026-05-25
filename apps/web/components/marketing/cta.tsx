// apps/web/components/marketing/cta.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { RiArrowRightLine } from "react-icons/ri";
import { FiZap } from "react-icons/fi";

export function CTASection() {
  return (
    <section className="bg-[#050505] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-16 sm:px-16 sm:py-24 text-center backdrop-blur-sm"
        >
          {/* Subtle gradient glow inside the card */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6C47FF]/20 blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to build forms that
              <br />
              <span className="text-[#6C47FF]">people actually enjoy?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/60">
              Join thousands of creators, startups, and teams using FormCraft
              to collect data beautifully. Free forever — no credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 gap-2 rounded-xl bg-[#6C47FF] px-8 text-base font-bold hover:bg-[#5B21B6]"
              >
                <Link href="/auth/register">
                  <FiZap className="h-5 w-5" />
                  Start building free
                  <RiArrowRightLine className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 gap-2 rounded-xl border-white/20 bg-white/5 px-8 text-base font-bold text-white hover:bg-white/10"
              >
                <Link href="/explore">Browse public forms</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-white/40">
              Free plan includes 3 forms and 100 responses each.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
