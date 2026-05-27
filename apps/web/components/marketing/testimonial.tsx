"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"],
  });

  const quote = "AuraForm revolutionized how we handle data collection using smart analytics. We are now driving better outcomes quicker than we ever imagined! AuraForm revolutionized how we handle data insights using smart forms.";
  const words = quote.split(" ");

  return (
    <section ref={containerRef} className="min-h-screen w-full flex flex-col justify-center py-24 md:py-32 px-8 md:px-28 bg-[var(--color-background)]">
      <div className="max-w-3xl mx-auto flex flex-col items-start gap-10">
        
        {/* Quote symbol */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Quotation_Marks.svg/1024px-Quotation_Marks.svg.png" 
          alt="Quote" 
          className="w-14 h-10 object-contain invert opacity-80" 
        />

        {/* Scroll-driven word reveal */}
        <div className="text-4xl md:text-5xl font-medium leading-[1.2] flex flex-wrap">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = (i + 1) / words.length;
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const color = useTransform(scrollYProgress, [start, end], ["hsl(0 0% 35%)", "hsl(0 0% 100%)"]);

            return (
              <motion.span 
                key={i} 
                style={{ opacity, color }}
                className="mr-[0.3em]"
              >
                {word}
              </motion.span>
            );
          })}
          <span className="text-[var(--color-muted-foreground)] ml-2">"</span>
        </div>

        {/* Author Row */}
        <div className="flex items-center gap-4 mt-4">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128&h=128&auto=format&fit=crop" 
            alt="Brooklyn Simmons" 
            className="w-14 h-14 rounded-full border-[3px] border-[var(--color-foreground)] object-cover"
          />
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-7 text-[var(--color-foreground)]">Brooklyn Simmons</span>
            <span className="text-sm font-normal leading-5 text-[var(--color-muted-foreground)]">Product Manager</span>
          </div>
        </div>

      </div>
    </section>
  );
}
