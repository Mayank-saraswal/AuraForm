# AuraForm — Landing Page Redesign Prompt
# Inspired by the NHM motionsites.ai editorial aesthetic
# Adapted for: Next.js 15 App Router · Tailwind CSS v4 · motion (framer-motion) · react-icons · TypeScript
# File: apps/web/app/(marketing)/page.tsx + component files

---

## CONTEXT

You are redesigning the AuraForm landing page. AuraForm is an India-first
Typeform competitor — a form builder SaaS where creators build cinematic,
one-question-at-a-time forms with 20+ visual themes.

The design reference is an editorial, typographic, monochrome website
(Natural History Museum style). You will **adapt** that design language
to AuraForm's brand:

- Replace dinosaurs / fossils content with forms / data / creativity
- Replace all lucide-react icons with react-icons (Remix Icons / Tabler)
- Use Next.js 15 App Router patterns (Server Component by default,
  `"use client"` only where hooks are needed)
- use the framer-motion library for animations
- dont use any purple colour and also remove the purple colour from the globals.css file also change the whole website theme accoring to these colour 

- Color palette: `#fcfcfc` (off-white bg), `#111` / `#1a1a1a` (near-black), `#0a0a0a` (dark section bg). Gray scale via Tailwind: `gray-300` through `gray-800`.
- No purple/indigo anywhere. Strictly monochrome black/white/gray.  follow these colour all over the website change the global.css file fully accourding to this 

- Typography hierarchy: Large display headings (3.5-5rem), mono labels (10-11px), body text (13-14px).
- Spacing: 8px base system throughout.
- Transitions: Most hover transitions 300-700ms. Button slide effect uses `cubic-bezier(0.16, 1, 0.3, 1)`. Letter animations use same cubic bezier.

---
sorry use the frammer motion library for the animation dont use the motion/react bleow the this their is mistake in code and prompt so make sure use the frammer motion 
## TECH STACK — EXACT IMPORTS TO USE

```typescript
// Motion
import { motion, AnimatePresence, usePresence, useInView } from "motion/react";

// Icons — react-icons ONLY, zero lucide-react
import { RiFormLine, RiBarChartLine, RiPaletteLine, RiArrowRightLine,
         RiArrowUpRightLine, RiAddLine, RiCheckLine, RiGlobalLine,
         RiMenuLine, RiCloseLine, RiStarLine, RiTimeLine,
         RiDownloadLine, RiLockLine, RiQrCodeLine } from "react-icons/ri";
import { TbForms, TbChartInfographic, TbBrandRazorpay } from "react-icons/tb";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FiZap, FiShield, FiStar, FiGlobe } from "react-icons/fi";
import { SiRazorpay } from "react-icons/si";

// Next.js
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Fonts — already loaded in layout.tsx
// Inter (sans) and JetBrains Mono (mono) via next/font/google
```

---

## GLOBAL CSS — Add to `apps/web/app/globals.css`

```css
/* Add these below the existing CSS */

/* Mega display text — matches NHM scale */
@layer utilities {
  .text-mega {
    font-size: 18vw;
    line-height: 0.78;
    letter-spacing: -0.04em;
  }

  .text-display {
    font-size: clamp(3rem, 7vw, 6rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .text-mono-label {
    font-size: 10px;
    font-family: var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
}

/* Selection */
::selection {
  background: #111;
  color: #fcfcfc;
}

/* Scrollbar */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 999px; }

/* Overflow */
body { overflow-x: hidden; }
```

---

## ANIMATION VARIANTS — Define in `apps/web/lib/motion-variants.ts`

```typescript
// apps/web/lib/motion-variants.ts
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export const staggerContainer = (delay = 0.1, stagger = 0.1) => ({
  animate: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const slideFromLeft = {
  initial: { x: -40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
};

export const scaleIn = {
  initial: { scale: 0.92, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};
```

---

## DATA — Define in `apps/web/lib/landing-data.ts`

```typescript
// apps/web/lib/landing-data.ts

// AuraForm theme previews — replaces NHM chapter data
export const themesData = [
  {
    name:    "Netflix",
    tagline: "Dark cinema — Red accent",
    bg:      "#141414",
    accent:  "#E50914",
    image:   "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624247/01_udnber.png",
    // Replace with AuraForm form preview screenshots when available
  },
  {
    name:    "Pink City Jaipur",
    tagline: "Royal rose — Cultural pride",
    bg:      "#8B1A4A",
    accent:  "#F7A8C4",
    image:   "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624374/02_pmvxxl.png",
  },
  {
    name:    "Discord",
    tagline: "Blurple depth — Community first",
    bg:      "#313338",
    accent:  "#5865F2",
    image:   "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624236/03_hcp3jc.png",
  },
  {
    name:    "Anime Dark",
    tagline: "Deep violet — Manga spirit",
    bg:      "#0D0D1A",
    accent:  "#7C3AED",
    image:   "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624256/04_get63z.png",
  },
  {
    name:    "Startup",
    tagline: "Ember orange — Founder energy",
    bg:      "#0A0A0A",
    accent:  "#FF6B35",
    image:   "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624251/05_kz1tyu.png",
  },
];

export const featuresData = [
  { label: "Form Themes",        icon: "RiPaletteLine" },
  { label: "Analytics",          icon: "RiBarChartLine" },
  { label: "QR Sharing",         icon: "RiQrCodeLine" },
  { label: "Razorpay Payments",  icon: "TbBrandRazorpay" },
  { label: "Email Alerts",       icon: "RiTimeLine" },
];

export const statsData = [
  { label: "Active Forms",       value: "12,000+" },
  { label: "Responses Collected",value: "480,000+" },
  { label: "Themes Available",   value: "20+" },
  { label: "Countries",          value: "14+" },
];

export const navLinks = [
  { label: "Features",  href: "/#features" },
  { label: "Themes",    href: "/#themes" },
  { label: "Pricing",   href: "/pricing" },
  { label: "Explore",   href: "/explore" },
  { label: "Docs",      href: "/api-docs" },
];
```

---

## STATE (in the client root component)

```typescript
const [showVideo,       setShowVideo]       = useState(false);
const [activeTheme,     setActiveTheme]     = useState(2); // starts at Discord
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Show background video after 2800ms (same as NHM reference)
useEffect(() => {
  const timer = setTimeout(() => setShowVideo(true), 2800);
  return () => clearTimeout(timer);
}, []);

// Auto-cycle themes every 3500ms (same as NHM chapter cycling)
useEffect(() => {
  const interval = setInterval(() => {
    setActiveTheme((prev) => (prev + 1) % themesData.length);
  }, 3500);
  return () => clearInterval(interval);
}, []);
```

---

## SECTION 1: HERO (full viewport height)

Container: `"use client"` component.
`relative w-full min-h-screen flex flex-col overflow-hidden bg-[#fcfcfc]`

### 1A. HEADER — AuraForm wordmark logo (SVG polygon letters, same technique as NHM)

`motion.header` with `staggerChildren: 0.08, delayChildren: 0.1`
Padding: `pt-6 px-6 md:px-16 z-20`

The logo is an inline SVG built from polygon shapes — same letter-animation
technique as the NHM "NHM" logo, applied to "FC" (AuraForm initials)
OR the full wordmark "FORMCRAFT" using geometric block letters.

Use the `letterBlock` variant for each polygon so letters slide up
from `y: 120` on load.

```tsx
{/* Logo SVG — "FC" monogram in block geometric style */}
<motion.h1
  variants={{ animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
  className="relative"
  style={{ width: "80px", height: "40px" }}
>
  <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
    {/* Letter F */}
    <g>
      <motion.polygon variants={letterBlock} fill="#111" points="0,0 14,0 14,100 0,100" />
      <motion.polygon variants={letterBlock} fill="#111" points="0,0 120,0 120,14 0,14" />
      <motion.polygon variants={letterBlock} fill="#111" points="0,43 90,43 90,57 0,57" />
    </g>
    {/* Letter C */}
    <g transform="translate(140, 0)">
      <motion.polygon variants={letterBlock} fill="#6C47FF" points="0,0 60,0 60,14 0,14" />
      <motion.polygon variants={letterBlock} fill="#6C47FF" points="0,0 14,0 14,100 0,100" />
      <motion.polygon variants={letterBlock} fill="#6C47FF" points="0,86 60,86 60,100 0,100" />
    </g>
  </svg>
</motion.h1>

{/* AuraForm wordmark text next to the monogram */}
<motion.span
  variants={fadeUp}
  transition={{ duration: 0.7, delay: 0.4 }}
  className="text-[13px] font-mono tracking-[0.25em] uppercase text-[#111] ml-4"
>
  AuraForm
</motion.span>
```

### 1B. SUB-NAV BAR

Below the logo. `flex justify-between items-start mt-8`
Font: `text-mono-label` (10–11px mono uppercase tracking)
Uses `fadeUp` variant with `duration: 0.8`

**Left column** (15% width) — Three stacked lines:
```
Form
Builder
Platform
```
`text-[10px] font-mono tracking-[0.2em] uppercase text-gray-700`

**Arrow separator** (5%, desktop only):
`RiArrowRightLine` size 14, `text-gray-400`

**Center column** (flex-1) — AuraForm tagline:
```
"Build forms that feel like
an experience. One question
at a time. Any theme."
```
`text-gray-800 leading-relaxed font-mono text-[11px]`

**Arrow separator** (5%, desktop only): Same.

**Right column** (15%, desktop only) — Nav links:
```
Visit, Features, Themes, Pricing, Docs
```
`text-gray-800 hover:text-black hover:underline transition-colors`

**Hamburger** (far right, mobile):
- Two horizontal bars: `w-8 h-[1.5px] bg-black gap-[6px]`
- Hover: first bar → `w-6`, second bar → `w-10`
- When open: first bar rotates 45deg + translateY, second rotates -45deg (X shape)
- `transition duration-300`

### 1C. MOBILE MENU OVERLAY

`AnimatePresence` wrapping `motion.div`:
- Enters from `y: -20, opacity: 0` → `y: 0, opacity: 1`
- `bg-[#fcfcfc] border-b border-gray-200 shadow-xl md:hidden`
- Same nav links, `text-sm font-mono tracking-[0.2em] uppercase space-y-6`

### 1D. BACKGROUND VIDEO

Appears after 2800ms (`showVideo` state).
`absolute top-0 left-0 w-full h-full pointer-events-none z-0`

**Replace the NHM dinosaur video with a AuraForm-appropriate looping video:**
Use a subtle abstract particle / flowing gradient / topographic lines video.
Suggested: a dark generative art loop or a minimal desk/studio b-roll.

Temporary placeholder (use the NHM video URL for initial build,
swap when you have brand video):
```
https://res.cloudinary.com/dsdxaxkiz/video/upload/v1779624998/magnific_use-img-2-as-the-exact-ba_Piu3X0W42C_wnrc8f.mp4
```

```tsx
{showVideo && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.15 }}      // lower opacity — subtle bg texture
    transition={{ duration: 2 }}
    className="absolute inset-0 pointer-events-none z-0"
  >
    <video
      autoPlay loop muted playsInline
      className="w-full h-full object-cover"
      src="YOUR_VIDEO_URL"
    />
  </motion.div>
)}
```

### 1E. LEFT SIDEBAR CONTENT

`motion.div staggerChildren: 0.15, delayChildren: 0.6`
Position: `px-10 md:px-16 mt-20 sm:mt-28 md:mt-32 w-[320px] z-10`

**Section indicator:**
`01` + `w-16 h-[1.5px] bg-black/20` horizontal line
`text-xs font-mono`

**Headline — Replace NHM "TIMELESS WONDERS" with:**
```
YOUR FORM
IS AN
EXPERIENCE
```
`text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1]`
Line breaks after each word.
The word "EXPERIENCE" gets `text-[#6C47FF]` color (the only purple accent
in the entire hero section).

**Description:**
```
"Build cinematic, one-question-at-a-time
forms with 20+ themes. Share a link
or QR code. Collect responses. Done."
```
`text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6] font-mono`

**CTA Button ("Start Building Free"):**
Same slide-background technique as NHM "Explore Now" button:
- Container: `bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm`
- Hover: `translateY(-0.5px)`, `shadow-[3px_3px_0px_rgba(17,17,17,0.5)]`
- Active: reset transform and shadow
- Sliding background panel: `bg-[#fcfcfc]` slides from `-translate-x-[101%]`
  to `translate-x-0` on hover, `duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`
- Icon: `RiFormLine` — white by default, turns `#111` on hover,
  with `scale-110 -rotate-12 -translate-y-1`
- Text: "Start Building Free" — white turning `#111` on hover
- `text-[15px] font-medium`
- `<Link href="/auth/register">` wrapping the button

**Secondary link:**
```
"or see live demos →"
```
`text-[11px] font-mono text-gray-500 mt-3 hover:text-black transition-colors`
`<Link href="/explore">`

### 1F. RIGHT SIDEBAR (desktop only)

`motion.div staggerChildren: 0.15, delayChildren: 0.9`
`w-[200px] mt-12 md:mt-20 hidden md:flex flex-col gap-8`

**Active form info** (replaces T-Rex specimen card):
```
Title:    "Netflix Watchlist Survey"
Type:     "Published · Public form"
Subtext:  "89 responses / 71% completion"
Theme:    "Netflix theme"
```
`text-[10px] font-bold font-mono tracking-widest uppercase` for title
`text-[12px] text-gray-600 leading-[1.6]` for subtext

**Stats** (replaces Length/Height):
```
"Forms" label   + "12,000+" value
"Responses" label + "480K+"  value
```
Labels: `text-[10px] font-mono tracking-widest uppercase text-gray-500`
Values: `text-[13px] font-medium`

**View Themes button** (replaces "View Details" circle):
Circle `w-10 h-10 rounded-full border border-gray-400` with `RiPaletteLine`
(size 16, strokeWidth 1.5), text "View Themes" (`text-[10px] font-mono`).
Hover: circle `border-black bg-[#111]`, icon turns white.
`<Link href="/#themes">`

### 1G. BOTTOM-LEFT "SCROLL TO EXPLORE"

`absolute bottom-10 left-[2.5rem] md:left-[4rem] hidden md:flex`
Fade up animation `delay: 1.2`

Circle `w-12 h-12 rounded-full border border-gray-300` containing two
vertical lines `w-[1px] h-[12px] bg-gray-600 gap-[4px]` (pause icon).

Text: "Scroll to explore" — `text-[10px] font-mono tracking-widest uppercase text-gray-500`

---

## SECTION 2: "WHAT WE BUILD"

Container: `relative w-full min-h-[75vh] md:min-h-screen bg-[#fcfcfc]`
`flex flex-col items-center pt-24 md:pt-32 pb-0 z-20`

### 2A. SECTION LABEL

```
[ 02 ]  What We Build
```
`text-mono-label mb-12`
"02" in `text-gray-500`, "What We Build" in `text-gray-900 font-bold`

### 2B. MAIN HEADING

**Replace NHM fossils headline with:**
```
"Create forms that feel less like
work and more like conversations."
```
`text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111]`
max-width 1000px, text-center.
`whileInView` from `y: 40, opacity: 0` → `y: 0, opacity: 1`, once: true, margin `-100px`

### 2C. ACTION PILLS

**Replace NHM category pills with AuraForm feature pills:**

```tsx
const pills = [
  { icon: RiPaletteLine,    label: "20+ Themes" },
  { icon: TbChartInfographic, label: "Analytics" },
  { icon: RiQrCodeLine,     label: "QR Sharing" },
  { icon: SiRazorpay,       label: "Razorpay" },
  { icon: RiGlobalLine,     label: "Public Forms" },
];
```

Pill style: `rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 px-4 py-2.5 flex items-center gap-2`
Hover: `border-[#6C47FF] bg-[#6C47FF] text-white`
Staggered reveal `staggerChildren: 0.1, delayChildren: 0.3`

### 2D. STATS ROW

**Add this between pills and spacer (NHM did not have this — AuraForm-specific):**

Four stat counters in a row:
```
12,000+   480,000+   20+    14+
Active    Responses  Themes Countries
Forms     Collected
```

Layout: `grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 w-full max-w-4xl px-8`
Value: `text-[2.5rem] md:text-[3.5rem] font-medium tracking-tight text-[#111]`
Label: `text-[10px] font-mono tracking-widest uppercase text-gray-500 mt-1`
`whileInView` animate each counter with `staggerChildren: 0.12`

### 2E. SPACER

`min-h-[220px] md:min-h-[450px]`
Provides room for the decorative element from Section 3 to overlap upward.

### 2F. BOTTOM TEXT

Absolute positioned at bottom. `pointer-events-none hidden md:flex`
Two items at `justify-between`:
- Left:  `"FORMS THAT FEEL LIKE AN EXPERIENCE."`
- Right: `"FORMCRAFT (C) 2026"`
Both: `text-mono-label text-gray-500`

---

## SECTION 3: "EXPLORE OUR THEMES" (Dark Section)

Container: `relative w-full bg-[#0a0a0a] text-white flex flex-col z-30`

### 3A. OVERLAPPING DECORATIVE ELEMENT

**Replace the pterodactyl image with a AuraForm form preview mockup:**

The element that overlaps from Section 2 into Section 3:
- A floating phone/browser mockup showing a live AuraForm form
  in the "Netflix" theme (dark bg, red accent, one question visible)
- OR use an abstract decorative element: a large circle with gradient
  that represents the AuraForm "orb" / brand shape

```tsx
<motion.div
  className="absolute left-1/2 -translate-x-1/2 w-[160vw] md:w-[900px]
             pointer-events-none z-0"
  whileInView={{
    y:       "-72%",
    opacity: 1,
  }}
  initial={{ y: "-60%", opacity: 0 }}
  transition={{ duration: 1.4, ease: "easeOut" }}
  viewport={{ margin: "100px" }}
>
  {/* AuraForm theme preview — replace with actual screenshot */}
  <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10
                  bg-[#141414] shadow-2xl shadow-[#6C47FF]/20">
    {/* Mock form preview in Netflix theme */}
    <div className="flex flex-col items-center justify-center h-full gap-6 p-12">
      <div className="h-1 w-full bg-[#E50914] opacity-60 rounded" />
      <p className="text-[#888] text-xs font-mono tracking-widest">02 / 05</p>
      <h2 className="text-white text-3xl font-bold text-center leading-snug">
        What is your favourite<br />Netflix genre?
      </h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {["Thriller", "Sci-Fi", "Romance", "Horror"].map((g) => (
          <span key={g} className="border border-[#E50914]/40 rounded-full px-5 py-2
                                    text-sm text-white/70">
            {g}
          </span>
        ))}
      </div>
      <button className="bg-[#E50914] text-white px-8 py-3 rounded-md text-sm font-medium">
        Continue
      </button>
    </div>
  </div>
</motion.div>
```

### 3B. HEADING AREA

`px-8 md:px-16 pt-32 md:pt-48 mb-16 z-10`
Two-column on xl.

**Left — Main heading (replace NHM "Curated from millions of years"):**
```
"Themes crafted [3 circle icons]
for every story."
```
`text-[1.8rem] md:text-[3rem] lg:text-[4rem] leading-[1.15] font-medium text-white`

The three inline circle icons — same style as NHM:
`inline-flex gap-2 align-middle mx-3 translate-y-[-4px]`
Each circle: `w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600
             bg-black text-gray-400 flex items-center justify-center`
Hover: `bg-white text-black border-white`

Icons inside circles:
- `RiPaletteLine` (size 22)
- `RiFormLine`   (size 22)
- `TbForms`      (size 22)

**Right — Tagline + pills (replace NHM right column):**

Tagline:
```
"WE DON'T JUST BUILD FORMS
WE CREATE EXPERIENCES"
```
`text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-6 leading-relaxed`

Three pills: `"Beautiful"`, `"Responsive"`, `"Cinematic"`
`px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300`
Hover: `bg-white text-black border-white`

### 3C. TWO-COLUMN PANEL (Theme Explorer)

**Replaces NHM chapters panel with AuraForm theme gallery**

`h-[1px] bg-gray-800` divider line.

**Left panel (35%) — Theme image preview:**
`border-r border-gray-800 min-h-[400px] md:min-h-[500px]`

Same `SandTransitionImage` technique (SVG filter sand dissolve) as NHM —
but applied to AuraForm theme preview images:

```tsx
{/* Section indicator */}
<p className="text-gray-500 text-xl tracking-[0.3em]">***</p>

{/* Sand-dissolve theme image */}
<AnimatePresence mode="wait">
  <SandTransitionImage
    key={activeTheme}
    src={themesData[activeTheme].image}
    alt={themesData[activeTheme].name}
    className="absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten"
  />
</AnimatePresence>

{/* Counter: 01 / 05 */}
<div className="text-[10px] font-mono tracking-widest text-[#888] uppercase">
  <motion.div key={activeTheme}>
    {String(activeTheme + 1).padStart(2, "0")}
  </motion.div>
  <span className="text-[#333]"> / </span>
  <span>05</span>
</div>
```

**SandTransitionImage component — use EXACTLY the same implementation
as the NHM reference:**

```tsx
function SandTransitionImage({
  src, alt, className,
}: {
  src: string; alt: string; className?: string;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const filterId = useRef(`sand-${Math.random().toString(36).slice(2)}`);
  const imgRef   = useRef<HTMLImageElement>(null);
  const filterRef = useRef<{ turbulence: SVGFETurbulenceElement | null;
    displacement: SVGFEDisplacementMapElement | null;
    offset: SVGFEOffsetElement | null;
    blur: SVGFEGaussianBlurElement | null;
    colorMatrix: SVGFEColorMatrixElement | null;
  }>({ turbulence: null, displacement: null, offset: null, blur: null, colorMatrix: null });
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const duration     = 900;

  useEffect(() => {
    const entering  = isPresent;
    const easeFn    = entering
      ? (t: number) => 1 - Math.pow(1 - t, 4)   // quartic ease-out
      : (t: number) => Math.pow(t, 3);            // cubic ease-in

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed  = timestamp - startTimeRef.current;
      const rawT     = Math.min(elapsed / duration, 1);
      const t        = easeFn(rawT);
      const progress = entering ? t : 1 - t;

      const { turbulence, displacement, offset, blur, colorMatrix } = filterRef.current;
      if (displacement) displacement.scale.baseVal = progress * 150;
      if (offset) {
        offset.dy.baseVal = entering ? -80 * (1 - progress) : 120 * (1 - progress);
        offset.dx.baseVal = entering ? -30 * (1 - progress) : 30 * (1 - progress);
      }
      if (blur)        blur.stdDeviationX.baseVal = (1 - progress) * 6;
      if (colorMatrix) {
        const values = colorMatrix.values.baseVal;
        if (values.length >= 20) values[19] = Math.max(0, 1 - (1 - progress) * 1.2);
      }

      if (rawT < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (!entering) {
        safeToRemove?.();
      }
    };

    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPresent, safeToRemove]);

  return (
    <div className={`relative ${className ?? ""}`} style={{ filter: `url(#${filterId.current})` }}>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id={filterId.current} x="-50%" y="-50%" width="200%" height="200%"
            colorInterpolationFilters="linearRGB">
            <feTurbulence
              ref={(el) => { filterRef.current.turbulence = el; }}
              type="fractalNoise" baseFrequency="1.8" numOctaves="4" result="noise"
            />
            <feDisplacementMap
              ref={(el) => { filterRef.current.displacement = el; }}
              in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R"
              yChannelSelector="G" result="displaced"
            />
            <feOffset
              ref={(el) => { filterRef.current.offset = el; }}
              in="displaced" dx="0" dy="0" result="offsetted"
            />
            <feGaussianBlur
              ref={(el) => { filterRef.current.blur = el; }}
              in="offsetted" stdDeviation="0" result="blurred"
            />
            <feColorMatrix
              ref={(el) => { filterRef.current.colorMatrix = el; }}
              in="blurred" type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
```

**Right panel (65%) — Theme list:**

Top bar:
```
"Pick a theme. Set the mood."   |   "Theme 0{activeTheme + 1}"
```
`border-b border-gray-800 p-8 text-[10px] font-mono text-gray-400 tracking-widest flex justify-between`

Theme list — 5 items:

```tsx
{themesData.map((theme, i) => (
  <div
    key={i}
    onClick={() => setActiveTheme(i)}
    className={`border-b border-gray-800/80 py-8 px-8 cursor-pointer flex items-center justify-between
      ${i === activeTheme ? "text-white" : "text-[#444] hover:text-[#999]"}`}
  >
    {/* Left: theme name + tagline */}
    <div>
      <p className="text-2xl md:text-[2rem] font-medium tracking-tight transition-colors">
        {theme.name}
      </p>
      {i === activeTheme && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-mono tracking-widest text-gray-500 mt-1"
        >
          {theme.tagline}
        </motion.p>
      )}
    </div>

    {/* Right: accent dot + arrow (active only) */}
    <div className="flex items-center gap-3">
      <div
        className="w-3 h-3 rounded-full transition-opacity"
        style={{ background: theme.accent, opacity: i === activeTheme ? 1 : 0 }}
      />
      {i === activeTheme && (
        <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
          <RiArrowUpRightLine size={22} strokeWidth={1} className="text-gray-400" />
        </motion.div>
      )}
    </div>
  </div>
))}
```

Clicking a theme sets `activeTheme`. Below the list, add a CTA:

```tsx
<div className="p-8 flex items-center justify-between">
  <Link href="/explore" className="text-[10px] font-mono tracking-widest uppercase
    text-gray-500 hover:text-white transition-colors flex items-center gap-2">
    <span>Explore all 20+ themes</span>
    <RiArrowRightLine size={14} />
  </Link>
  <Link href="/auth/register" className="px-6 py-3 bg-[#6C47FF] text-white
    text-[11px] font-mono tracking-widest uppercase rounded-md
    hover:bg-[#5B21B6] transition-colors">
    Start Free
  </Link>
</div>
```

### 3D. BOTTOM FOOTER BAR

`h-[1px] bg-gray-800` divider.
```
"FORMS THAT FEEL LIKE AN EXPERIENCE"
```
`px-8 py-8 text-mono-label text-gray-500 bg-[#0a0a0a]`

---

## SECTION 4: "HOW IT WORKS" (Light section)

**NHM did not have this section — AuraForm-specific addition.**
Container: `bg-[#fcfcfc] px-8 md:px-16 py-24 md:py-32`

### 4A. Section label:
`[ 03 ]  How It Works`

### 4B. Heading:
```
"From idea to live form.
In under two minutes."
```
`text-display font-medium tracking-tight text-[#111] mb-16`

### 4C. Four-step process (horizontal on desktop, vertical on mobile):

```
01                02               03               04
───────────────  ───────────────  ───────────────  ───────────────
Create           Pick             Share            Analyse
your form        a theme          the link         responses

Add questions.   Netflix, Jaipur, Copy link or QR  Completion rate,
Drag to reorder. Discord, Anime   code. Anyone     daily chart, CSV
Set validation.  — 20+ themes.    can fill it.     export.
```

Layout: `grid grid-cols-1 md:grid-cols-4 gap-0`
Each step: `border-t-2 border-[#111] pt-8 pr-8`
Step number: `text-[10px] font-mono tracking-widest text-gray-400 mb-4`
Step title: `text-[1.5rem] font-medium tracking-tight text-[#111] mb-3`
Step desc: `text-[13px] text-gray-600 leading-[1.6] font-mono`
`whileInView` stagger each column with `delay: i * 0.15`

---

## SECTION 5: MEGA TEXT + CTA

Container: `bg-[#fcfcfc] overflow-hidden py-12 md:py-20`

### 5A. Mega text (same scale as NHM):

```
FORM
CRAFT
```
`text-mega font-medium tracking-tight text-[#111] leading-[0.78] px-4 md:px-8`
`mix-blend-multiply opacity-[0.06]` — very faint watermark effect

Overlaid on top of the mega text, centered:

```tsx
<div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-500">
    [ 04 ] Get Started
  </p>
  <h2 className="text-[2rem] md:text-[3rem] font-medium text-[#111] text-center tracking-tight">
    Ready to build your first form?
  </h2>
  <p className="text-[13px] text-gray-600 font-mono text-center max-w-sm">
    Free forever. No credit card required.
    First form live in under 2 minutes.
  </p>
  <Link
    href="/auth/register"
    className="bg-[#1a1a1a] text-white px-8 py-4 rounded-md text-[15px] font-medium
               hover:shadow-[3px_3px_0px_rgba(17,17,17,0.4)] hover:-translate-y-[0.5px]
               transition-all duration-200"
  >
    Start Building Free
  </Link>
  <p className="text-[11px] font-mono text-gray-400">
    or{" "}
    <Link href="/explore" className="underline hover:text-black transition-colors">
      explore public forms
    </Link>
  </p>
</div>
```

---

## SECTION 6: FOOTER

Container: `bg-[#0a0a0a] text-white px-8 md:px-16 py-16`

Same editorial mono style as NHM footer:

```
Left block:
  "FC"  (the SVG monogram, small, white)
  "AuraForm"  font-mono tracking-widest
  "Forms that feel like an experience."
  text-gray-500 font-mono text-xs mt-2

Center: Nav links column
  Features · Themes · Pricing · Explore · API Docs
  text-[10px] font-mono tracking-widest uppercase text-gray-400
  hover:text-white transition-colors

Right:
  "Payments by Razorpay"  (SiRazorpay icon)
  "Email by Resend"
  "Hosted on Vercel"
  text-[10px] font-mono text-gray-500

Bottom divider: h-[1px] bg-gray-800

Bottom bar: flex justify-between
  Left:  "(C) 2026 AuraForm. All rights reserved."
  Right: "Built in Jaipur, India."
  Both:  text-[10px] font-mono text-gray-600
```

---

## COMPLETE FILE STRUCTURE

```
apps/web/
├── app/
│   └── (marketing)/
│       └── page.tsx           ← Main landing page (import all sections)
├── components/
│   └── marketing/
│       ├── hero.tsx           ← Section 1 ("use client" — has state)
│       ├── explore-world.tsx  ← Section 2
│       ├── themes-section.tsx ← Section 3 ("use client" — activeTheme state)
│       ├── how-it-works.tsx   ← Section 4
│       ├── cta-mega.tsx       ← Section 5
│       ├── footer.tsx         ← Section 6
│       ├── nav.tsx            ← Header nav ("use client" — mobile menu)
│       └── sand-image.tsx     ← SandTransitionImage component ("use client")
└── lib/
    ├── motion-variants.ts     ← Animation variants
    └── landing-data.ts        ← Data arrays
```

`apps/web/app/(marketing)/page.tsx` assembles all sections:

```tsx
// apps/web/app/(marketing)/page.tsx
import { HeroSection }       from "~/components/marketing/hero";
import { ExploreWorld }      from "~/components/marketing/explore-world";
import { ThemesSection }     from "~/components/marketing/themes-section";
import { HowItWorks }        from "~/components/marketing/how-it-works";
import { CTAMega }           from "~/components/marketing/cta-mega";
import { MarketingFooter }   from "~/components/marketing/footer";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ExploreWorld />
      <ThemesSection />
      <HowItWorks />
      <CTAMega />
      <MarketingFooter />
    </>
  );
}
```

---

## KEY DESIGN RULES — MUST FOLLOW

### Color palette
```
Off-white background: #fcfcfc
Near-black text/UI:   #111 / #1a1a1a
Dark section bg:      #0a0a0a
AuraForm accent:     #6C47FF  ← ONLY accent color. Used sparingly.
Grays:                gray-300 through gray-800 (Tailwind)
```

**No purple anywhere except:**
- The "C" in the "FC" SVG logo
- The "EXPERIENCE" word in the hero headline
- The pill hover state in Section 2
- The "Start Free" button in Section 3 right panel
- The main CTA button background in Section 5

### Typography hierarchy
```
Mega display:  18vw, font-medium, tracking-tight, line-height 0.78
Hero headline: 3.5–5rem, font-normal, tracking-tight
Section heads: 2.2–4.2rem, font-medium, tracking-tight
Mono labels:   10–11px, font-mono, tracking-[0.2em], uppercase
Body text:     13–14px, font-mono, leading-[1.6]
```

### Icons
```
react-icons/ri  → RiFormLine, RiBarChartLine, RiPaletteLine, RiArrowRightLine,
                  RiArrowUpRightLine, RiQrCodeLine, RiGlobalLine, RiTimeLine,
                  RiLockLine, RiMenuLine, RiCloseLine
react-icons/tb  → TbForms, TbChartInfographic, TbBrandRazorpay
react-icons/hi2 → HiOutlineSparkles
react-icons/fi  → FiZap, FiShield
react-icons/si  → SiRazorpay

ZERO lucide-react imports.
ZERO emoji in JSX.
```

### Motion
```
import { motion, AnimatePresence, usePresence } from "motion/react"
// NOT from "framer-motion"

All whileInView animations: once: true, viewport: { margin: "-100px" }
Page load stagger: staggerChildren: 0.08–0.15
Letter animations: duration 1.2, ease [0.16, 1, 0.3, 1]
Button hover transitions: 300–700ms
Sand dissolve: 900ms, RAF loop
```

### Next.js patterns
```tsx
// Default: Server Component (no hooks, no browser APIs)
export default function Section() { ... }

// Only add "use client" when using:
// - useState, useEffect, useRef, useInView
// - motion components with interactive state
// - AnimatePresence, usePresence
// - Event handlers (onClick, onHover)

// Images: use next/image for hero assets, <img> for SVG filters
// Links: always use next/link
```

---

## CHECKLIST BEFORE FINISHING

```bash
# Verify no lucide-react imports
grep -rn "lucide-react" apps/web/components/marketing/
# Expected: no results

# Verify no emoji in JSX
grep -rn "🎬\|⭐\|🚀\|🎨" apps/web/components/marketing/
# Expected: no results

# Verify motion import is correct
grep -rn "from \"framer-motion\"" apps/web/components/marketing/
# Expected: no results (should be "motion/react")

# Verify no inline style with hex colors outside of dynamic theme vars
# (all static colors must be Tailwind classes)

# Type check
pnpm check-types
# Expected: zero errors

# Visual check on mobile (375px):
# - Hero headline readable
# - Mobile menu opens/closes
# - All sections stack correctly
# - CTA buttons are at least 44px tall

# Performance:
# - Background video has opacity <= 0.15 (subtle, not distracting)
# - SandTransitionImage uses RAF cleanup in useEffect return
# - All whileInView animations have once: true (no re-trigger on scroll back)
```