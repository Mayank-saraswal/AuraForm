import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const letterBlock: Variants = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export const staggerContainer = (delay = 0.1, stagger = 0.1): Variants => ({
  animate: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const slideFromLeft: Variants = {
  initial: { x: -40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
};

export const scaleIn: Variants = {
  initial: { scale: 0.92, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};
