"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[150vh] overflow-hidden bg-[var(--color-background)]">

      {/* Hero Content Group */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="flex flex-col items-center pt-32 md:pt-44 px-4 relative z-40"
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className="liquid-glass px-3 py-2 rounded-lg mb-6 flex items-center gap-2"
        >
          <span className="bg-[var(--color-foreground)] text-[var(--color-background)] rounded-md text-sm font-medium px-2 py-0.5">New</span>
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Say Hello to AuraForm v3.2</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl tracking-[-2px] font-medium leading-tight md:leading-[1.15] mb-3 text-center text-[var(--color-foreground)]"
        >
          Your Forms.<br className="md:hidden" /> One Clear <span className="font-serif italic font-normal">Overview.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg font-normal leading-6 opacity-90 mb-8 text-center text-[var(--color-hero-subtitle)]"
        >
          AuraForm helps teams collect data, goals,<br />
          and progress with precision.
        </motion.p>

        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[var(--color-foreground)] text-[var(--color-background)] rounded-full px-8 py-3.5 text-base font-medium cursor-pointer"
        >
          Get Started for Free
        </motion.button>
      </motion.div>

      {/* Dashboard & Video Area */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative w-screen ml-[calc(-50vw+50%)] aspect-video mt-12 overflow-hidden flex justify-center items-start"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for contrast */}
        
        <motion.img 
          style={{ y: dashboardY }}
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
          alt="Dashboard"
          className="absolute max-w-5xl w-[90%] rounded-2xl shadow-2xl mix-blend-luminosity border border-white/10 mt-10 md:mt-20"
        />

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[var(--color-background)] to-transparent z-30 pointer-events-none" />
      </motion.div>
    </section>
  );
}
