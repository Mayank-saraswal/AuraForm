## CONTEXT — READ BEFORE WRITING A SINGLE LINE

Phase 1 is complete. The following are confirmed working:
- All Drizzle tables exist in Neon Postgres
- better-auth handles auth at `POST /auth/*`
- All tRPC routers are live at `http://localhost:8000/trpc`
- `packages/schemas` exports all Zod types
- `apps/web` boots on port 3000 with GlobalProviders and all font variables

Phase 2 builds the **complete frontend**. Every UI component must follow these rules with zero exceptions:

### ABSOLUTE RULES — ENFORCED IN EVERY FILE

1. **react-icons ONLY** — never import from `lucide-react`, never render emoji in JSX
2. **shadcn/ui components** for all primitives (Button, Input, Card, Dialog, etc.)
3. **framer-motion** for all page transitions and animated elements
4. **Tailwind CSS v4** classes only — no inline style objects except for dynamic theme CSS variables
5. **react-hook-form + @hookform/resolvers/zod** for every form in the UI
6. **`@repo/schemas` Zod types** — never redefine a schema locally that already exists in the package
7. **No `any` types** — all TypeScript must be strictly typed
8. **Server Components by default** — add `"use client"` only when hooks or browser APIs are needed
9. **Loading and error states** — every data-fetching component needs a skeleton and error boundary
10. **Mobile-first responsive** — every page works on 375px screen width

### Icon import convention (follow this exactly)

```tsx
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiEyeOffLine,
         RiDashboardLine, RiFormLine, RiBarChartLine, RiSettings3Line,
         RiShareLine, RiLinkM, RiCopyLine, RiCheckLine, RiCloseLine,
         RiArrowLeftLine, RiArrowRightLine, RiArrowUpLine, RiArrowDownLine,
         RiSearchLine, RiFilterLine, RiDownloadLine, RiUploadLine,
         RiQrCodeLine, RiPaletteLine, RiLayoutLine, RiStarLine,
         RiGlobalLine, RiLockLine, RiTimeLine, RiCalendarLine,
         RiUserLine, RiLogoutBoxLine, RiMenuLine, RiSunLine, RiMoonLine,
         RiNotificationLine, RiQuestionLine, RiDragMoveLine } from "react-icons/ri";
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineTemplate } from "react-icons/hi2";
import { FiZap, FiStar, FiShield, FiGlobe } from "react-icons/fi";
import { BsQrCode, BsLayoutTextWindow, BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { MdOutlineDragIndicator, MdOutlineRateReview } from "react-icons/md";
import { TbBrandRazorpay, TbForms, TbChartInfographic } from "react-icons/tb";
import { SiRazorpay } from "react-icons/si";
```

---

## STEP 1 — Design system foundation in globals.css

Replace `apps/web/app/globals.css` COMPLETELY with this. This establishes all design tokens,
the theme system CSS variable structure, and component base styles.

```css
/* apps/web/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ── Brand tokens ────────────────────────────────────────────────────────── */
:root {
  /* FormCraft brand purple */
  --brand-50:  #F5F3FF;
  --brand-100: #EDE9FE;
  --brand-200: #DDD6FE;
  --brand-300: #C4B5FD;
  --brand-400: #A78BFA;
  --brand-500: #8B5CF6;
  --brand-600: #6C47FF;  /* primary */
  --brand-700: #5B21B6;
  --brand-800: #4C1D95;
  --brand-900: #2E1065;

  /* Semantic colour tokens */
  --color-primary:          var(--brand-600);
  --color-primary-hover:    var(--brand-700);
  --color-primary-light:    var(--brand-50);
  --color-destructive:      #EF4444;
  --color-success:          #10B981;
  --color-warning:          #F59E0B;

  /* Layout */
  --sidebar-width: 240px;
  --header-height: 60px;

  /* Form filler theme tokens — overridden per-theme at runtime */
  --filler-bg:           #FFFFFF;
  --filler-accent:       #6C47FF;
  --filler-text:         #111111;
  --filler-question:     #111111;
  --filler-btn-bg:       #6C47FF;
  --filler-btn-text:     #FFFFFF;
  --filler-progress:     #6C47FF;
  --filler-font:         var(--font-inter);

  /* shadcn tokens */
  --background:           oklch(1 0 0);
  --foreground:           oklch(0.145 0 0);
  --card:                 oklch(1 0 0);
  --card-foreground:      oklch(0.145 0 0);
  --popover:              oklch(1 0 0);
  --popover-foreground:   oklch(0.145 0 0);
  --primary:              oklch(0.5 0.2 290);
  --primary-foreground:   oklch(0.985 0 0);
  --secondary:            oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted:                oklch(0.97 0 0);
  --muted-foreground:     oklch(0.556 0 0);
  --accent:               oklch(0.97 0 0);
  --accent-foreground:    oklch(0.205 0 0);
  --destructive:          oklch(0.577 0.245 27.325);
  --border:               oklch(0.922 0 0);
  --input:                oklch(0.922 0 0);
  --ring:                 oklch(0.5 0.2 290);
  --radius:               0.5rem;
  --sidebar:              oklch(0.985 0 0);
  --sidebar-foreground:   oklch(0.145 0 0);
  --sidebar-primary:      oklch(0.5 0.2 290);
  --sidebar-border:       oklch(0.922 0 0);
  --sidebar-accent:       oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-ring:         oklch(0.5 0.2 290);
}

.dark {
  --background:           oklch(0.145 0 0);
  --foreground:           oklch(0.985 0 0);
  --card:                 oklch(0.205 0 0);
  --card-foreground:      oklch(0.985 0 0);
  --popover:              oklch(0.205 0 0);
  --popover-foreground:   oklch(0.985 0 0);
  --primary:              oklch(0.65 0.2 290);
  --primary-foreground:   oklch(0.985 0 0);
  --secondary:            oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted:                oklch(0.269 0 0);
  --muted-foreground:     oklch(0.708 0 0);
  --accent:               oklch(0.269 0 0);
  --accent-foreground:    oklch(0.985 0 0);
  --destructive:          oklch(0.704 0.191 22.216);
  --border:               oklch(1 0 0 / 10%);
  --input:                oklch(1 0 0 / 15%);
  --ring:                 oklch(0.65 0.2 290);
  --sidebar:              oklch(0.205 0 0);
  --sidebar-foreground:   oklch(0.985 0 0);
  --sidebar-border:       oklch(1 0 0 / 10%);
  --sidebar-accent:       oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
}

/* ── Base resets ─────────────────────────────────────────────────────────── */
* { box-sizing: border-box; border-color: var(--border); }
html { scroll-behavior: smooth; }
body {
  background-color: var(--background);
  color: var(--foreground);
  font-feature-settings: "rlig" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
}

/* ── Scrollbar ───────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

/* ── Form filler full-screen container ──────────────────────────────────── */
.filler-root {
  min-height: 100dvh;
  background-color: var(--filler-bg);
  background-image: var(--filler-bg-image, none);
  background-size: cover;
  background-position: center;
  color: var(--filler-text);
  font-family: var(--filler-font, var(--font-inter));
  transition: background-color 0.3s ease;
}

.filler-question {
  color: var(--filler-question);
  font-family: var(--filler-font, var(--font-inter));
}

.filler-btn {
  background-color: var(--filler-btn-bg);
  color: var(--filler-btn-text);
  transition: opacity 0.15s ease;
}
.filler-btn:hover { opacity: 0.88; }

.filler-progress-fill {
  background-color: var(--filler-progress);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Builder drag ghost ──────────────────────────────────────────────────── */
.builder-field-ghost {
  opacity: 0.4;
  border: 2px dashed var(--brand-600) !important;
}

/* ── Gradient text utility ───────────────────────────────────────────────── */
.gradient-text {
  background: linear-gradient(135deg, var(--brand-600) 0%, #C026D3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Landing hero mesh background ───────────────────────────────────────── */
.hero-mesh {
  background-color: #0a0a0a;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(108, 71, 255, 0.35) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(192, 38, 211, 0.25) 0%, transparent 60%);
}

/* ── Card hover lift ─────────────────────────────────────────────────────── */
.card-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px -8px rgba(0, 0, 0, 0.15);
}
```

---

## STEP 2 — better-auth client for Next.js

Create `apps/web/lib/auth-client.ts`:

```typescript
// apps/web/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env["NEXT_PUBLIC_API_URL"]?.replace("/trpc", "") ?? "http://localhost:8000",
});

export const { useSession, signIn, signUp, signOut } = authClient;
```

Create `apps/web/lib/utils.ts` (extend existing if present):

```typescript
// apps/web/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ThemeConfig } from "@repo/schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Apply theme config as CSS custom properties on a DOM element */
export function applyThemeToDom(element: HTMLElement, config: ThemeConfig) {
  const fontMap: Record<string, string> = {
    "inter": "var(--font-inter)",
    "geist": "var(--font-geist-sans)",
    "bebas-neue": "var(--font-bebas-neue)",
    "space-grotesk": "var(--font-space-grotesk)",
    "noto-sans": "var(--font-noto-sans, var(--font-inter))",
    "roboto": "var(--font-roboto, var(--font-inter))",
    "poppins": "var(--font-poppins)",
    "playfair-display": "var(--font-playfair)",
    "outfit": "var(--font-outfit, var(--font-inter))",
    "dm-sans": "var(--font-dm-sans)",
  };

  element.style.setProperty("--filler-bg", config.bgColor);
  element.style.setProperty("--filler-accent", config.accentColor);
  element.style.setProperty("--filler-text", config.textColor);
  element.style.setProperty("--filler-question", config.questionColor);
  element.style.setProperty("--filler-btn-bg", config.buttonBgColor ?? config.accentColor);
  element.style.setProperty("--filler-btn-text", config.buttonTextColor ?? "#FFFFFF");
  element.style.setProperty("--filler-progress", config.progressColor ?? config.accentColor);
  element.style.setProperty("--filler-font", fontMap[config.fontFamily] ?? "var(--font-inter)");
  if (config.bgImage) {
    element.style.setProperty("--filler-bg-image", `url(${config.bgImage})`);
    element.style.setProperty("--filler-bg-overlay", String(config.bgOverlayOpacity ?? 0));
  }
}

/** Convert milliseconds to human-readable string */
export function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
}

/** Generate a public share URL for a form */
export function getFormShareUrl(slug: string): string {
  const base = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
  return `${base}/f/${slug}`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
```

---

## STEP 3 — Landing page

### `apps/web/app/(marketing)/layout.tsx`

```tsx
// apps/web/app/(marketing)/layout.tsx
import { MarketingNav } from "~/components/marketing/nav";
import { MarketingFooter } from "~/components/marketing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
```

### `apps/web/app/(marketing)/page.tsx`

```tsx
// apps/web/app/(marketing)/page.tsx
import { HeroSection }     from "~/components/marketing/hero";
import { FeaturesSection } from "~/components/marketing/features";
import { ThemesSection }   from "~/components/marketing/themes";
import { HowItWorks }      from "~/components/marketing/how-it-works";
import { SocialProof }     from "~/components/marketing/social-proof";
import { CTASection }      from "~/components/marketing/cta";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ThemesSection />
      <HowItWorks />
      <SocialProof />
      <CTASection />
    </>
  );
}
```

### `apps/web/components/marketing/nav.tsx`

```tsx
// apps/web/components/marketing/nav.tsx
"use client";
import Link from "next/link";
import { useSession } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { RiFormLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import { useState } from "react";
import { cn } from "~/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Themes",   href: "/#themes" },
  { label: "Pricing",  href: "/pricing" },
  { label: "Explore",  href: "/explore" },
];

export function MarketingNav() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF]">
            <RiFormLine className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">FormCraft</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Button asChild size="sm" className="bg-[#6C47FF] hover:bg-[#5B21B6]">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#6C47FF] hover:bg-[#5B21B6]">
                <Link href="/auth/register">Get started free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-white/70 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <RiCloseLine className="h-5 w-5" /> : <RiMenuLine className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {session ? (
                <Button asChild size="sm" className="bg-[#6C47FF]">
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#6C47FF]">
                    <Link href="/auth/register">Get started free</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
```

### `apps/web/components/marketing/hero.tsx`

```tsx
// apps/web/components/marketing/hero.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { HiOutlineSparkles } from "react-icons/hi2";
import { RiArrowRightLine, RiPlayLine } from "react-icons/ri";
import { FiZap } from "react-icons/fi";

const HERO_THEMES = [
  { label: "Netflix",    color: "#E50914", bg: "#141414" },
  { label: "WhatsApp",   color: "#25D366", bg: "#075E54" },
  { label: "Pink City",  color: "#F7A8C4", bg: "#8B1A4A" },
  { label: "Discord",    color: "#5865F2", bg: "#313338" },
  { label: "Cyberpunk",  color: "#00FFFF", bg: "#0D001A" },
];

export function HeroSection() {
  return (
    <section className="hero-mesh relative overflow-hidden px-4 py-24 sm:py-36">
      <div className="relative mx-auto max-w-5xl text-center">

        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex"
        >
          <Badge
            variant="outline"
            className="gap-1.5 border-white/20 bg-white/5 px-3 py-1.5 text-white/80 backdrop-blur"
          >
            <HiOutlineSparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
            India&apos;s most beautiful form builder
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-7xl"
        >
          Forms that feel like
          <br />
          <span className="gradient-text">an experience</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl"
        >
          Create stunning, one-question-at-a-time forms with cinematic themes.
          From Netflix to Pink City Jaipur — every form tells a story.
          Collect responses, analyse data, get paid. All in one place.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
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
            <Link href="/explore">
              <RiPlayLine className="h-4 w-4" />
              See live demos
            </Link>
          </Button>
        </motion.div>

        {/* Theme preview pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-white/40">20+ themes including</span>
          {HERO_THEMES.map((t) => (
            <span
              key={t.label}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: t.color + "40", color: t.color, background: t.bg + "60" }}
            >
              {t.label}
            </span>
          ))}
          <span className="text-xs text-white/40">and more</span>
        </motion.div>

        {/* Mock browser window showing a form */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl shadow-[#6C47FF]/20"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28CA41]" />
            <div className="ml-4 flex-1 rounded-md bg-[#2a2a2a] px-3 py-1 text-left text-xs text-white/30">
              formcraft.app/f/netflix-watchlist
            </div>
          </div>

          {/* Fake form preview — Netflix theme */}
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-8 bg-[#141414] p-8 sm:p-16">
            <div className="text-center">
              <p className="mb-3 text-sm font-medium tracking-widest text-[#E50914]">01 / 05</p>
              <h2 className="font-bebas-neue text-4xl tracking-wider text-white sm:text-6xl">
                What&apos;s your favourite genre?
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Select all that apply
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {["Thriller", "Sci-Fi", "Romance", "Documentary", "Horror", "Comedy"].map((g) => (
                <button
                  key={g}
                  className="rounded-full border border-[#E50914]/40 px-5 py-2 text-sm text-white transition-colors hover:bg-[#E50914] hover:border-[#E50914]"
                >
                  {g}
                </button>
              ))}
            </div>
            <button className="rounded-md bg-[#E50914] px-8 py-3 text-sm font-medium text-white hover:bg-[#c20812] transition-colors">
              Continue
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[#2a2a2a]">
            <div className="h-full w-1/5 bg-[#E50914] transition-all" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

### `apps/web/components/marketing/features.tsx`

```tsx
// apps/web/components/marketing/features.tsx
"use client";
import { motion } from "framer-motion";
import { FiZap, FiShield, FiStar, FiGlobe } from "react-icons/fi";
import { RiBarChartLine, RiPaletteLine, RiQrCodeLine, RiMailLine } from "react-icons/ri";
import { TbForms, TbChartInfographic } from "react-icons/tb";

const FEATURES = [
  {
    icon: TbForms,
    color: "#6C47FF",
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
    desc: "formcraft.app/f/your-slug — share via QR, WhatsApp, Twitter. No ugly hash URLs.",
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
          <p className="mb-3 text-sm font-medium tracking-widest text-[#6C47FF] uppercase">
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
```

### `apps/web/components/marketing/themes.tsx`

```tsx
// apps/web/components/marketing/themes.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHOWCASE_THEMES = [
  {
    slug: "netflix",
    name: "Netflix",
    category: "Streaming",
    bg: "#141414",
    accent: "#E50914",
    text: "#FFFFFF",
    font: "Bebas Neue",
    question: "Rate your favourite Netflix original",
    fieldType: "rating",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    category: "Social",
    bg: "#075E54",
    accent: "#25D366",
    text: "#FFFFFF",
    font: "Roboto",
    question: "Which WhatsApp feature do you use most?",
    fieldType: "select",
  },
  {
    slug: "pink-city",
    name: "Pink City Jaipur",
    category: "Culture",
    bg: "#8B1A4A",
    accent: "#F7A8C4",
    text: "#FFFFFF",
    font: "Playfair Display",
    question: "Which part of Jaipur did you visit?",
    fieldType: "multi-select",
  },
  {
    slug: "anime-dark",
    name: "Anime Dark",
    category: "Anime",
    bg: "#0D0D1A",
    accent: "#7C3AED",
    text: "#E2E8F0",
    font: "Noto Sans JP",
    question: "Who is your favourite anime protagonist?",
    fieldType: "text",
  },
  {
    slug: "discord",
    name: "Discord",
    category: "Gaming",
    bg: "#313338",
    accent: "#5865F2",
    text: "#DBDEE1",
    font: "Inter",
    question: "How would you rate our community server?",
    fieldType: "scale",
  },
];

export function ThemesSection() {
  const [active, setActive] = useState(0);
  const theme = SHOWCASE_THEMES[active]!;

  return (
    <section id="themes" className="bg-[#080808] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#6C47FF] uppercase">Themes</p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Pick a theme. <span className="gradient-text">Set the mood.</span>
          </h2>
          <p className="mt-4 text-white/50">
            Every theme is a complete visual identity — background, font, accent colours,
            button style, animations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Theme selector */}
          <div className="flex flex-col gap-2">
            {SHOWCASE_THEMES.map((t, i) => (
              <button
                key={t.slug}
                onClick={() => setActive(i)}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                  i === active
                    ? "border-[#6C47FF] bg-[#6C47FF]/10"
                    : "border-white/8 bg-white/3 hover:border-white/20"
                }`}
              >
                <div
                  className="h-10 w-10 flex-shrink-0 rounded-lg border border-white/10"
                  style={{ background: t.bg }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.category} · {t.font}</div>
                </div>
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: t.accent }}
                />
              </button>
            ))}
          </div>

          {/* Live preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theme.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: theme.bg }}
            >
              {/* Progress */}
              <div className="h-1" style={{ background: theme.accent + "40" }}>
                <div className="h-full w-2/5 transition-all" style={{ background: theme.accent }} />
              </div>

              <div className="flex min-h-[380px] flex-col items-start justify-center gap-8 p-10 sm:p-14">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: theme.accent }}>02</span>
                  <span className="text-xs" style={{ color: theme.text + "60" }}>of 5</span>
                </div>
                <h3 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: theme.text }}>
                  {theme.question}
                </h3>

                {theme.fieldType === "rating" && (
                  <div className="flex gap-3">
                    {[1,2,3,4,5].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-bold transition-colors"
                        style={{
                          borderColor: n <= 4 ? theme.accent : theme.accent + "40",
                          background: n <= 4 ? theme.accent + "20" : "transparent",
                          color: theme.text,
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                )}
                {theme.fieldType === "text" && (
                  <div
                    className="w-full rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: theme.accent + "60", color: theme.text + "80", background: "transparent" }}
                  >
                    Type your answer here...
                  </div>
                )}
                {theme.fieldType === "select" && (
                  <div className="flex flex-col gap-2 w-full">
                    {["Status updates", "Voice notes", "Channels", "Disappearing messages"].map((o) => (
                      <div
                        key={o}
                        className="rounded-lg border px-4 py-2.5 text-sm"
                        style={{ borderColor: theme.accent + "40", color: theme.text }}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                )}
                {theme.fieldType === "multi-select" && (
                  <div className="flex flex-wrap gap-2">
                    {["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"].map((o, i) => (
                      <span
                        key={o}
                        className="rounded-full px-4 py-1.5 text-sm"
                        style={{
                          background: i < 2 ? theme.accent + "30" : "transparent",
                          border: `1px solid ${theme.accent}${i < 2 ? "80" : "40"}`,
                          color: theme.text,
                        }}
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                )}
                {theme.fieldType === "scale" && (
                  <div className="w-full">
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <div
                          key={n}
                          className="flex flex-1 h-10 items-center justify-center rounded text-xs font-medium"
                          style={{
                            background: n <= 7 ? theme.accent + "30" : "transparent",
                            border: `1px solid ${theme.accent}40`,
                            color: theme.text,
                          }}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs" style={{ color: theme.text + "60" }}>
                      <span>Not at all</span>
                      <span>Extremely</span>
                    </div>
                  </div>
                )}

                <button
                  className="rounded-lg px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: theme.accent, color: "#FFFFFF" }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
```

### `apps/web/components/marketing/footer.tsx`

```tsx
// apps/web/components/marketing/footer.tsx
import Link from "next/link";
import { RiFormLine, RiGithubLine, RiTwitterLine } from "react-icons/ri";

const LINKS = {
  Product: [
    { label: "Features",  href: "/#features" },
    { label: "Themes",    href: "/#themes" },
    { label: "Pricing",   href: "/pricing" },
    { label: "Explore",   href: "/explore" },
    { label: "API Docs",  href: "/api-docs" },
  ],
  Company: [
    { label: "About",     href: "/about" },
    { label: "Blog",      href: "/blog" },
    { label: "Privacy",   href: "/privacy" },
    { label: "Terms",     href: "/terms" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#050505] px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF]">
                <RiFormLine className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white">FormCraft</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Forms that feel like an experience. Built for India.
              Powered by Razorpay, Resend, and Next.js.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors">
                <RiGithubLine className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors">
                <RiTwitterLine className="h-5 w-5" />
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
                {section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            {new Date().getFullYear()} FormCraft. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Payments secured by Razorpay. Emails by Resend.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## STEP 4 — Auth pages

### `apps/web/app/(auth)/layout.tsx`

```tsx
// apps/web/app/(auth)/layout.tsx
import Link from "next/link";
import { RiFormLine } from "react-icons/ri";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hero-mesh hidden flex-col items-start justify-between p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF]">
            <RiFormLine className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">FormCraft</span>
        </Link>
        <blockquote className="max-w-sm">
          <p className="text-2xl font-medium leading-snug text-white">
            "The best tool I&apos;ve found for collecting data from students.
            The themes are incredible."
          </p>
          <footer className="mt-4 text-sm text-white/50">
            Priya Mehta — Product Manager, Bangalore
          </footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C47FF]">
              <RiFormLine className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold">FormCraft</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
```

### `apps/web/app/(auth)/auth/login/page.tsx`

```tsx
// apps/web/app/(auth)/auth/login/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginSchema, type LoginInput } from "@repo/schemas";
import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { RiGoogleLine, RiLoader4Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const result = await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    setGoogleLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to your FormCraft account
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-8 w-full gap-2"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading
          ? <RiLoader4Line className="h-4 w-4 animate-spin" />
          : <RiGoogleLine className="h-4 w-4" />
        }
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password"
              className="text-xs text-[#6C47FF] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass
                ? <RiEyeOffLine className="h-4 w-4" />
                : <RiEyeLine className="h-4 w-4" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full bg-[#6C47FF] hover:bg-[#5B21B6]"
          disabled={isSubmitting}
        >
          {isSubmitting && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/auth/register" className="font-medium text-[#6C47FF] hover:underline">
          Create one free
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-8 rounded-lg border border-dashed bg-muted/40 p-4">
        <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Demo credentials
        </p>
        <p className="text-xs text-muted-foreground">
          Email: <code className="font-mono">demo@formcraft.app</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Password: <code className="font-mono">Demo1234!</code>
        </p>
      </div>
    </div>
  );
}
```

### `apps/web/app/(auth)/auth/register/page.tsx`

```tsx
// apps/web/app/(auth)/auth/register/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerSchema, type RegisterInput } from "@repo/schemas";
import { signUp, signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { RiGoogleLine, RiLoader4Line, RiEyeLine, RiEyeOffLine, RiCheckLine } from "react-icons/ri";
import { useState } from "react";

const PASSWORD_RULES = [
  { label: "At least 8 characters",   test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",     test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",     test: (p: string) => /[a-z]/.test(p) },
  { label: "One number",               test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");

  async function onSubmit(data: RegisterInput) {
    const result = await signUp.email({
      name: data.fullName,
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Registration failed. Please try again.");
      return;
    }
    toast.success("Account created! Welcome to FormCraft.");
    router.push("/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Free forever. No credit card required.
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-8 w-full gap-2"
        onClick={async () => {
          setGoogleLoading(true);
          await signIn.social({ provider: "google", callbackURL: "/dashboard" });
          setGoogleLoading(false);
        }}
        disabled={googleLoading}
      >
        {googleLoading
          ? <RiLoader4Line className="h-4 w-4 animate-spin" />
          : <RiGoogleLine className="h-4 w-4" />
        }
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Priya Mehta" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Create a strong password"
              className="pr-10"
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <RiEyeOffLine className="h-4 w-4" /> : <RiEyeLine className="h-4 w-4" />}
            </button>
          </div>
          {/* Password strength indicator */}
          {password.length > 0 && (
            <ul className="mt-1 flex flex-col gap-1">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule.label} className={`flex items-center gap-1.5 text-xs
                  ${rule.test(password) ? "text-[#10B981]" : "text-muted-foreground"}`}>
                  <RiCheckLine className={`h-3 w-3 ${rule.test(password) ? "opacity-100" : "opacity-20"}`} />
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full bg-[#6C47FF] hover:bg-[#5B21B6]"
          disabled={isSubmitting}
        >
          {isSubmitting && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-[#6C47FF] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

---

## STEP 5 — Dashboard layout

### `apps/web/app/(dashboard)/layout.tsx`

```tsx
// apps/web/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@repo/trpc/server";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
import { DashboardHeader }  from "~/components/dashboard/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <DashboardSidebar user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

### `apps/web/components/dashboard/sidebar.tsx`

```tsx
// apps/web/components/dashboard/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  RiDashboardLine, RiFormLine, RiBarChartLine, RiSettings3Line,
  RiLogoutBoxLine, RiGlobalLine, RiPaletteLine, RiFormLine as RiForm,
} from "react-icons/ri";
import { TbForms, TbChartInfographic } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

const NAV = [
  { href: "/dashboard",           label: "Overview",      icon: RiDashboardLine },
  { href: "/dashboard/forms",     label: "My Forms",      icon: TbForms },
  { href: "/dashboard/analytics", label: "Analytics",     icon: TbChartInfographic },
  { href: "/dashboard/themes",    label: "Themes",        icon: RiPaletteLine },
  { href: "/dashboard/settings",  label: "Settings",      icon: RiSettings3Line },
];

const BOTTOM_NAV = [
  { href: "/explore",    label: "Explore",    icon: RiGlobalLine },
  { href: "/pricing",    label: "Upgrade",    icon: null, badge: "Pro" },
];

interface SidebarProps {
  user: { name?: string | null; email?: string; image?: string | null; id: string };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const initials = (user.name ?? user.email ?? "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="flex h-full w-[240px] flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 border-b px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#6C47FF]">
          <RiFormLine className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold">FormCraft</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          <ul className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-[#6C47FF]/10 text-[#6C47FF] font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 px-3">
          <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Platform
          </p>
          <ul className="flex flex-col gap-0.5">
            {BOTTOM_NAV.map(({ href, label, icon: Icon, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  {label}
                  {badge && (
                    <Badge className="ml-auto h-4 px-1.5 text-[10px] bg-[#6C47FF] text-white">{badge}</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User profile + signout */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-[#6C47FF]/20 text-[#6C47FF] text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <RiLogoutBoxLine className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
```

### `apps/web/components/dashboard/header.tsx`

```tsx
// apps/web/components/dashboard/header.tsx
"use client";
import { RiAddLine, RiSearchLine, RiNotificationLine } from "react-icons/ri";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard":             "Overview",
  "/dashboard/forms":       "My Forms",
  "/dashboard/analytics":   "Analytics",
  "/dashboard/themes":      "Themes",
  "/dashboard/settings":    "Settings",
};

export function DashboardHeader({ user }: { user: { name?: string | null } }) {
  const pathname = usePathname();
  const title    = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="flex h-[60px] items-center justify-between border-b bg-background px-6">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <Button asChild size="sm" className="gap-1.5 bg-[#6C47FF] hover:bg-[#5B21B6]">
          <Link href="/dashboard/forms/new">
            <RiAddLine className="h-4 w-4" />
            New form
          </Link>
        </Button>
      </div>
    </header>
  );
}
```

---

## STEP 6 — Dashboard overview page

### `apps/web/app/(dashboard)/dashboard/page.tsx`

```tsx
// apps/web/app/(dashboard)/dashboard/page.tsx
"use client";
import { trpc } from "~/trpc/client";
import { RiFormLine, RiBarChartLine, RiEyeLine, RiArrowRightLine, RiAddLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { formatDuration, truncate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: color + "20" }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const { data, isLoading } = trpc.forms.list.useQuery({ page: 1, limit: 5 });

  const totalForms     = data?.total ?? 0;
  const publishedForms = data?.forms.filter((f) => f.status === "published").length ?? 0;
  const totalResponses = data?.forms.reduce((acc, f) => acc + f.responseCount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total forms"        value={totalForms}     icon={RiFormLine}         color="#6C47FF" />
            <StatCard label="Published forms"    value={publishedForms} icon={RiEyeLine}          color="#10B981" />
            <StatCard label="Total responses"    value={totalResponses} icon={TbChartInfographic} color="#F59E0B" />
          </>
        )}
      </div>

      {/* Recent forms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Recent Forms</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
            <Link href="/dashboard/forms">
              View all <RiArrowRightLine className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-t px-5 py-4">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1"><Skeleton className="h-4 w-40 mb-1" /><Skeleton className="h-3 w-24" /></div>
                </div>
              ))
            : data?.forms.length === 0
            ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <RiFormLine className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No forms yet.</p>
                  <Button asChild size="sm" className="bg-[#6C47FF]">
                    <Link href="/dashboard/forms/new"><RiAddLine className="mr-1.5 h-4 w-4" />Create your first form</Link>
                  </Button>
                </div>
              )
            : data?.forms.map((form) => (
                <div key={form.id} className="flex items-center gap-4 border-t px-5 py-3.5 hover:bg-accent/40 transition-colors">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6C47FF]/10">
                    <RiFormLine className="h-4 w-4 text-[#6C47FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{truncate(form.title, 50)}</p>
                    <p className="text-xs text-muted-foreground">
                      {form.responseCount} response{form.responseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    variant={form.status === "published" ? "default" : "secondary"}
                    className={`text-xs ${form.status === "published" ? "bg-[#10B981]/10 text-[#10B981]" : ""}`}
                  >
                    {form.status}
                  </Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/forms/${form.id}/edit`}>
                      <RiArrowRightLine className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
          }
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## STEP 7 — Form Builder (the centrepiece)

### Form builder Zustand store

Create `apps/web/stores/form-builder.ts`:

```typescript
// apps/web/stores/form-builder.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { SelectForm, SelectFormField, SelectFormTheme } from "@repo/database";

export type BuilderField = SelectFormField & {
  _localId: string; // for dnd-kit — stable even before DB save
};

interface FormBuilderState {
  form:           SelectForm | null;
  fields:         BuilderField[];
  theme:          SelectFormTheme | null;
  selectedFieldId: string | null;
  previewMode:    boolean;
  isDirty:        boolean;

  // Actions
  setForm:             (form: SelectForm)       => void;
  setFields:           (fields: SelectFormField[]) => void;
  setTheme:            (theme: SelectFormTheme)  => void;
  selectField:         (id: string | null)       => void;
  updateSelectedField: (updates: Partial<BuilderField>) => void;
  reorderFields:       (from: number, to: number) => void;
  addField:            (field: BuilderField)     => void;
  removeField:         (id: string)              => void;
  togglePreview:       ()                         => void;
  markClean:           ()                         => void;
}

export const useFormBuilder = create<FormBuilderState>()(
  immer((set) => ({
    form:            null,
    fields:          [],
    theme:           null,
    selectedFieldId: null,
    previewMode:     false,
    isDirty:         false,

    setForm:   (form)  => set((s) => { s.form  = form;  }),
    setFields: (fields) => set((s) => {
      s.fields = fields.map((f) => ({ ...f, _localId: f.id }));
    }),
    setTheme: (theme) => set((s) => { s.theme = theme; s.isDirty = true; }),
    selectField: (id) => set((s) => { s.selectedFieldId = id; }),

    updateSelectedField: (updates) =>
      set((s) => {
        const idx = s.fields.findIndex((f) => f.id === s.selectedFieldId);
        if (idx !== -1) {
          Object.assign(s.fields[idx]!, updates);
          s.isDirty = true;
        }
      }),

    reorderFields: (from, to) =>
      set((s) => {
        const [moved] = s.fields.splice(from, 1);
        if (moved) s.fields.splice(to, 0, moved);
        s.fields.forEach((f, i) => { f.order = i; });
        s.isDirty = true;
      }),

    addField: (field) =>
      set((s) => {
        field.order = s.fields.length;
        s.fields.push(field);
        s.selectedFieldId = field._localId;
        s.isDirty = true;
      }),

    removeField: (id) =>
      set((s) => {
        s.fields = s.fields.filter((f) => f.id !== id && f._localId !== id);
        if (s.selectedFieldId === id) s.selectedFieldId = null;
        s.isDirty = true;
      }),

    togglePreview: () => set((s) => { s.previewMode = !s.previewMode; }),
    markClean:     () => set((s) => { s.isDirty = false; }),
  }))
);
```

### `apps/web/app/(dashboard)/dashboard/forms/[id]/edit/page.tsx`

```tsx
// apps/web/app/(dashboard)/dashboard/forms/[id]/edit/page.tsx
"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { useFormBuilder } from "~/stores/form-builder";
import { BuilderToolbar }    from "~/components/builder/toolbar";
import { FieldTypePanel }    from "~/components/builder/field-type-panel";
import { FieldCanvas }       from "~/components/builder/field-canvas";
import { FieldSettingsPanel } from "~/components/builder/field-settings-panel";
import { BuilderPreview }    from "~/components/builder/preview";
import { Skeleton }          from "~/components/ui/skeleton";

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { setForm, setFields, setTheme, previewMode } = useFormBuilder();

  const { data: form, isLoading } = trpc.forms.getById.useQuery({ id });

  useEffect(() => {
    if (form) {
      setForm(form);
      setFields(form.fields ?? []);
      if (form.theme) setTheme(form.theme);
    }
  }, [form, setForm, setFields, setTheme]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-60px)] flex-col gap-0">
        <Skeleton className="h-14 w-full rounded-none" />
        <div className="flex flex-1 gap-0">
          <Skeleton className="w-64 rounded-none" />
          <Skeleton className="flex-1 rounded-none" />
          <Skeleton className="w-80 rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-60px)] flex-col overflow-hidden">
      <BuilderToolbar formId={id} />
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <FieldTypePanel formId={id} />}
        <FieldCanvas formId={id} />
        {!previewMode && <FieldSettingsPanel formId={id} />}
        {previewMode && <BuilderPreview />}
      </div>
    </div>
  );
}
```

### `apps/web/components/builder/toolbar.tsx`

```tsx
// apps/web/components/builder/toolbar.tsx
"use client";
import { useState } from "react";
import { useFormBuilder } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import {
  RiEyeLine, RiEyeOffLine, RiLoader4Line, RiGlobalLine, RiLinkM,
  RiShareLine, RiCheckLine, RiArrowLeftLine,
} from "react-icons/ri";
import Link from "next/link";
import { getFormShareUrl } from "~/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "~/components/ui/dialog";

export function BuilderToolbar({ formId }: { formId: string }) {
  const { form, isDirty, previewMode, togglePreview, markClean } = useFormBuilder();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied]       = useState(false);
  const utils = trpc.useUtils();

  const publishMutation   = trpc.forms.publish.useMutation();
  const unpublishMutation = trpc.forms.unpublish.useMutation();

  const isPublished = form?.status === "published";
  const shareUrl    = form?.slug ? getFormShareUrl(form.slug) : null;

  async function handlePublish() {
    try {
      await publishMutation.mutateAsync({
        id: formId,
        visibility: "public",
      });
      await utils.forms.getById.invalidate({ id: formId });
      toast.success("Form published!");
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Failed to publish.");
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/forms">
            <RiArrowLeftLine className="h-4 w-4" />
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <span className="max-w-[200px] truncate text-sm font-medium">
          {form?.title ?? "Untitled form"}
        </span>
        {isDirty && <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">Unsaved</Badge>}
        {isPublished && <Badge className="bg-[#10B981]/10 text-[#10B981] text-xs">Live</Badge>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={togglePreview}
        >
          {previewMode
            ? <><RiEyeOffLine className="h-4 w-4" />Exit preview</>
            : <><RiEyeLine className="h-4 w-4" />Preview</>
          }
        </Button>

        {isPublished && shareUrl && (
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RiShareLine className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share your form</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 shrink-0">
                    {copied ? <RiCheckLine className="h-4 w-4 text-[#10B981]" /> : <RiLinkM className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {isPublished ? (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await unpublishMutation.mutateAsync({ id: formId });
              await utils.forms.getById.invalidate({ id: formId });
              toast.success("Form unpublished.");
            }}
            disabled={unpublishMutation.isPending}
            className="gap-1.5"
          >
            {unpublishMutation.isPending && <RiLoader4Line className="h-4 w-4 animate-spin" />}
            Unpublish
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1.5 bg-[#6C47FF] hover:bg-[#5B21B6]"
            onClick={handlePublish}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending
              ? <RiLoader4Line className="h-4 w-4 animate-spin" />
              : <RiGlobalLine className="h-4 w-4" />
            }
            Publish
          </Button>
        )}
      </div>
    </div>
  );
}
```

### `apps/web/components/builder/field-type-panel.tsx`

```tsx
// apps/web/components/builder/field-type-panel.tsx
"use client";
import { useFormBuilder } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import toast from "react-hot-toast";
import { RiText, RiFileTextLine, RiMailLine, RiHashtag,
         RiListCheck, RiCheckboxLine, RiStarLine, RiCalendarLine,
         RiBarChartLine, RiToggleLine, RiPhoneLine, RiLinkLine,
         RiImageLine, RiAlignLeftLine } from "react-icons/ri";
import { MdOutlineDragIndicator } from "react-icons/md";
import type { FieldType } from "@repo/schemas";
import { v4 as uuid } from "uuid";

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: "short_text",    label: "Short text",     icon: RiText,          desc: "Single-line answer" },
  { type: "long_text",     label: "Long text",      icon: RiFileTextLine,  desc: "Multi-line answer" },
  { type: "email",         label: "Email",          icon: RiMailLine,      desc: "Email address" },
  { type: "number",        label: "Number",         icon: RiHashtag,       desc: "Numeric answer" },
  { type: "phone",         label: "Phone",          icon: RiPhoneLine,     desc: "Phone number" },
  { type: "url",           label: "Website URL",    icon: RiLinkLine,      desc: "Valid URL" },
  { type: "single_select", label: "Single select",  icon: RiListCheck,     desc: "Choose one option" },
  { type: "multi_select",  label: "Multi select",   icon: RiListCheck,     desc: "Choose many options" },
  { type: "dropdown",      label: "Dropdown",       icon: RiAlignLeftLine, desc: "Dropdown list" },
  { type: "checkbox",      label: "Checkbox",       icon: RiCheckboxLine,  desc: "Yes / No tick" },
  { type: "rating",        label: "Rating",         icon: RiStarLine,      desc: "1 to 5 stars" },
  { type: "scale",         label: "NPS Scale",      icon: RiBarChartLine,  desc: "1 to 10 scale" },
  { type: "date",          label: "Date",           icon: RiCalendarLine,  desc: "Date picker" },
  { type: "yes_no",        label: "Yes / No",       icon: RiToggleLine,    desc: "Boolean toggle" },
  { type: "statement",     label: "Statement",      icon: RiImageLine,     desc: "Display text / image" },
];

export function FieldTypePanel({ formId }: { formId: string }) {
  const { addField, fields } = useFormBuilder();
  const utils = trpc.useUtils();

  const addFieldMutation = trpc.fields.add.useMutation({
    onSuccess: async (newField) => {
      addField({ ...newField, _localId: newField.id });
      await utils.forms.getById.invalidate({ id: formId });
      toast.success(`${newField.type.replace(/_/g, " ")} field added.`);
    },
    onError: (e) => toast.error(e.message),
  });

  function handleAdd(type: FieldType) {
    addFieldMutation.mutate({
      formId,
      type,
      label: `Question ${fields.length + 1}`,
      required: false,
      order: fields.length,
    });
  }

  return (
    <div className="flex w-60 flex-col overflow-y-auto border-r bg-background">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Add a field
        </p>
      </div>
      <div className="flex flex-col gap-0.5 p-2">
        {FIELD_TYPES.map(({ type, label, icon: Icon, desc }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            disabled={addFieldMutation.isPending}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent group"
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-[#6C47FF]" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### `apps/web/components/builder/field-canvas.tsx`

```tsx
// apps/web/components/builder/field-canvas.tsx
"use client";
import { useFormBuilder } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "~/lib/utils";
import toast from "react-hot-toast";
import { RiFormLine, RiAddLine, RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { BuilderField } from "~/stores/form-builder";
import Link from "next/link";

function SortableField({
  field,
  formId,
  isSelected,
  onSelect,
}: {
  field: BuilderField;
  formId: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { removeField } = useFormBuilder();
  const utils = trpc.useUtils();
  const deleteFieldMutation = trpc.fields.delete.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError: (e) => toast.error(e.message),
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field._localId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border bg-card p-4 cursor-pointer transition-all",
        isSelected ? "border-[#6C47FF] ring-1 ring-[#6C47FF]/20" : "hover:border-border/80",
        isDragging && "builder-field-ghost"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 flex-shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <MdOutlineDragIndicator className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
            {field.type.replace(/_/g, " ")}
          </Badge>
          {field.required && (
            <span className="text-[10px] text-[#EF4444] font-medium">Required</span>
          )}
        </div>
        <p className="text-sm font-medium truncate">{field.label}</p>
        {field.description && (
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{field.description}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteFieldMutation.mutate({ id: field.id, formId });
          removeField(field.id);
        }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <RiDeleteBinLine className="h-4 w-4" />
      </button>
    </div>
  );
}

export function FieldCanvas({ formId }: { formId: string }) {
  const { fields, selectedFieldId, selectField, reorderFields } = useFormBuilder();
  const utils = trpc.useUtils();

  const reorderMutation = trpc.fields.reorder.useMutation({
    onError: (e) => toast.error(e.message),
  });

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIdx = fields.findIndex((f) => f._localId === active.id);
    const toIdx   = fields.findIndex((f) => f._localId === over.id);
    if (fromIdx === -1 || toIdx === -1) return;

    reorderFields(fromIdx, toIdx);

    // Persist new order to DB
    reorderMutation.mutate({
      formId,
      orderedIds: fields.map((f) => f.id),
    });
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-muted/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C47FF]/10">
          <RiFormLine className="h-8 w-8 text-[#6C47FF]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">No fields yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add fields from the left panel to start building
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-muted/20">
      <div className="mx-auto w-full max-w-2xl p-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f._localId)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <SortableField
                  key={field._localId}
                  field={field}
                  formId={formId}
                  isSelected={selectedFieldId === field._localId || selectedFieldId === field.id}
                  onSelect={() => selectField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
```

---

## STEP 8 — Public Form Filler (Typeform-style)

This is the centrepiece UI. One question at a time, full-screen, framer-motion transitions.

### `apps/web/app/f/[slug]/page.tsx`

```tsx
// apps/web/app/f/[slug]/page.tsx
import { Metadata } from "next";
import { FormFillerClient } from "~/components/filler/form-filler-client";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ password?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Fill form — FormCraft`,
    description: "Fill out this form created with FormCraft.",
    robots: { index: false },
  };
}

export default async function FormFillerPage({ params, searchParams }: Props) {
  const { slug }     = await params;
  const { password } = await searchParams;
  return <FormFillerClient slug={slug} password={password} />;
}
```

### `apps/web/components/filler/form-filler-client.tsx`

```tsx
// apps/web/components/filler/form-filler-client.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter }     from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trpc }          from "~/trpc/client";
import { applyThemeToDom, formatDuration } from "~/lib/utils";
import { submitResponseSchema, type AnswerValue } from "@repo/schemas";
import toast             from "react-hot-toast";
import { FillerQuestion }      from "./filler-question";
import { FillerWelcomeScreen } from "./filler-welcome-screen";
import { FillerThankYou }      from "./filler-thank-you";
import { FillerPasswordGate }  from "./filler-password-gate";
import { RiArrowDownLine, RiLoader4Line, RiArrowUpLine } from "react-icons/ri";
import type { SelectFormField, SelectFormTheme } from "@repo/database";

const SLIDE_VARIANTS = {
  enter:  (dir: number) => ({ y: dir > 0 ?  80 : -80, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit:   (dir: number) => ({ y: dir > 0 ? -80 :  80, opacity: 0 }),
};

interface Props { slug: string; password?: string; }

export function FormFillerClient({ slug, password }: Props) {
  const rootRef      = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());

  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [direction,   setDirection]   = useState(1);
  const [answers,     setAnswers]     = useState<Record<string, AnswerValue>>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [pwGate,      setPwGate]      = useState(!!password === false);
  const [unlockedPw,  setUnlockedPw]  = useState<string | undefined>(password);

  const { data: form, isLoading, error } = trpc.forms.getBySlug.useQuery(
    { slug, password: unlockedPw },
    { retry: false, enabled: !pwGate || !!unlockedPw }
  );

  const submitMutation = trpc.responses.submit.useMutation();

  // Apply theme CSS variables on theme change
  useEffect(() => {
    if (rootRef.current && form?.theme?.config) {
      applyThemeToDom(rootRef.current, form.theme.config as import("@repo/schemas").ThemeConfig);
    }
  }, [form?.theme]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) handleNext();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  handlePrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <RiLoader4Line className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">This form is not available</p>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "The form may have been unpublished or the link is invalid."}
        </p>
      </div>
    );
  }

  // Only show interactive (non-statement) fields in filler
  const interactiveFields = form.fields.filter(
    (f) => !["welcome_screen", "thank_you_screen"].includes(f.type)
  ) as SelectFormField[];

  const currentField = interactiveFields[currentIdx];
  const progress     = ((currentIdx) / interactiveFields.length) * 100;
  const isLast       = currentIdx === interactiveFields.length - 1;

  function handleAnswer(fieldId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleNext() {
    if (currentIdx < interactiveFields.length - 1) {
      setDirection(1);
      setCurrentIdx((i) => i + 1);
    }
  }

  function handlePrev() {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx((i) => i - 1);
    }
  }

  async function handleSubmit() {
    const answersArr = Object.entries(answers).map(([fieldId, value]) => ({ fieldId, value }));

    try {
      const result = submitResponseSchema.safeParse({
        formId: form.id,
        answers: answersArr,
        timeToCompleteMs: Date.now() - startTimeRef.current,
        _hp: "", // honeypot — always empty for real users
      });

      if (!result.success) {
        toast.error("Please fill all required fields.");
        return;
      }

      await submitMutation.mutateAsync(result.data);
      setSubmitted(true);
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Submission failed. Please try again.");
    }
  }

  if (submitted) {
    return (
      <FillerThankYou
        title={form.thankYouTitle ?? "Thank you!"}
        message={form.thankYouMessage ?? "Your response has been recorded."}
        animation={form.theme?.config?.thankYouAnimation ?? "confetti"}
      />
    );
  }

  return (
    <div ref={rootRef} className="filler-root relative flex min-h-dvh flex-col">
      {/* Progress bar */}
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-black/10">
        <div className="filler-progress-fill h-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {currentField && (
              <motion.div
                key={currentField.id}
                custom={direction}
                variants={SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <FillerQuestion
                  field={currentField}
                  value={answers[currentField.id]}
                  onChange={(val) => handleAnswer(currentField.id, val)}
                  onNext={handleNext}
                  questionNumber={currentIdx + 1}
                  totalQuestions={interactiveFields.length}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--filler-btn-bg)]/30 text-[var(--filler-text)] disabled:opacity-30 hover:opacity-70 transition-opacity"
          >
            <RiArrowUpLine className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={isLast}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--filler-btn-bg)]/30 text-[var(--filler-text)] disabled:opacity-30 hover:opacity-70 transition-opacity"
          >
            <RiArrowDownLine className="h-4 w-4" />
          </button>
          <span className="ml-2 text-xs opacity-40">
            {currentIdx + 1} / {interactiveFields.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="filler-btn flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              {submitMutation.isPending && <RiLoader4Line className="h-4 w-4 animate-spin" />}
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="filler-btn flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              Continue
              <RiArrowDownLine className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* FormCraft branding (hidden on Pro) */}
      {form.showBranding && (
        <div className="pb-4 text-center">
          <a href="/" className="text-xs opacity-30 hover:opacity-60 transition-opacity">
            Powered by FormCraft
          </a>
        </div>
      )}
    </div>
  );
}
```

### `apps/web/components/filler/filler-question.tsx`

```tsx
// apps/web/components/filler/filler-question.tsx
"use client";
import { RiArrowRightLine, RiStarLine, RiStarFill } from "react-icons/ri";
import type { SelectFormField } from "@repo/database";
import type { AnswerValue } from "@repo/schemas";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface Props {
  field:           SelectFormField;
  value:           AnswerValue;
  onChange:        (val: AnswerValue) => void;
  onNext:          () => void;
  questionNumber:  number;
  totalQuestions:  number;
}

export function FillerQuestion({ field, value, onChange, onNext, questionNumber, totalQuestions }: Props) {
  const [ratingHover, setRatingHover] = useState(0);

  const inputBase = `w-full border-b-2 border-[var(--filler-btn-bg)]/40 bg-transparent pb-2 pt-1
    text-lg text-[var(--filler-text)] outline-none placeholder:opacity-40
    focus:border-[var(--filler-btn-bg)] transition-colors`;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && field.type !== "long_text") {
      e.preventDefault();
      onNext();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Question header */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-bold opacity-50">{questionNumber}</span>
          <RiArrowRightLine className="h-4 w-4 opacity-30" />
          {field.required && (
            <span className="text-xs font-medium opacity-50">Required</span>
          )}
        </div>
        <h2 className="filler-question text-3xl font-bold leading-snug sm:text-4xl">
          {field.label}
        </h2>
        {field.description && (
          <p className="mt-3 text-base opacity-60">{field.description}</p>
        )}
      </div>

      {/* Field input */}
      <div>
        {/* SHORT TEXT */}
        {field.type === "short_text" && (
          <input
            type="text"
            className={inputBase}
            placeholder={field.placeholder ?? "Type your answer here..."}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* LONG TEXT */}
        {field.type === "long_text" && (
          <textarea
            className={cn(inputBase, "min-h-[100px] resize-none border-2 rounded-lg border-[var(--filler-btn-bg)]/40 px-4 py-3")}
            placeholder={field.placeholder ?? "Type your answer here..."}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
        )}

        {/* EMAIL */}
        {field.type === "email" && (
          <input
            type="email"
            className={inputBase}
            placeholder={field.placeholder ?? "name@example.com"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* NUMBER */}
        {field.type === "number" && (
          <input
            type="number"
            className={inputBase}
            placeholder={field.placeholder ?? "Enter a number..."}
            value={(value as number) ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        {/* SINGLE SELECT */}
        {field.type === "single_select" && (
          <div className="flex flex-col gap-2">
            {(field.options as { id: string; label: string; value: string }[] ?? []).map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.value); setTimeout(onNext, 300); }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 text-left text-base transition-all",
                  value === opt.value
                    ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/15"
                    : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                )}
                style={{ color: "var(--filler-text)" }}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-current text-xs opacity-50">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* MULTI SELECT */}
        {field.type === "multi_select" && (
          <div className="flex flex-wrap gap-2">
            {(field.options as { id: string; label: string; value: string }[] ?? []).map((opt) => {
              const selected = (value as string[] ?? []).includes(opt.value);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const cur = (value as string[]) ?? [];
                    onChange(selected ? cur.filter((v) => v !== opt.value) : [...cur, opt.value]);
                  }}
                  className={cn(
                    "rounded-full border-2 px-5 py-2 text-sm font-medium transition-all",
                    selected
                      ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                      : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                  )}
                  style={{ color: "var(--filler-text)" }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* RATING (1–5 stars) */}
        {field.type === "rating" && (
          <div className="flex items-center gap-3">
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                onClick={() => onChange(n)}
                onMouseEnter={() => setRatingHover(n)}
                onMouseLeave={() => setRatingHover(0)}
                className="text-3xl transition-transform hover:scale-110"
                style={{ color: "var(--filler-btn-bg)" }}
              >
                {n <= (ratingHover || (value as number) || 0)
                  ? <RiStarFill className="h-8 w-8" />
                  : <RiStarLine className="h-8 w-8 opacity-40" />
                }
              </button>
            ))}
          </div>
        )}

        {/* NPS SCALE (1–10) */}
        {field.type === "scale" && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange(n)}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all",
                    value === n
                      ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                      : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                  )}
                  style={{ color: "var(--filler-text)" }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs opacity-50" style={{ color: "var(--filler-text)" }}>
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        )}

        {/* YES / NO */}
        {field.type === "yes_no" && (
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt === "Yes"); setTimeout(onNext, 300); }}
                className={cn(
                  "flex-1 rounded-xl border-2 py-4 text-base font-semibold transition-all",
                  value === (opt === "Yes")
                    ? "border-[var(--filler-btn-bg)] bg-[var(--filler-btn-bg)]/20"
                    : "border-[var(--filler-btn-bg)]/30 hover:border-[var(--filler-btn-bg)]/70"
                )}
                style={{ color: "var(--filler-text)" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* DATE */}
        {field.type === "date" && (
          <input
            type="date"
            className={cn(inputBase, "max-w-xs")}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
        )}

        {/* Press Enter hint */}
        {!["single_select","multi_select","rating","scale","yes_no","date"].includes(field.type) && (
          <p className="mt-3 text-xs opacity-40" style={{ color: "var(--filler-text)" }}>
            Press Enter to continue
          </p>
        )}
      </div>
    </div>
  );
}
```

### `apps/web/components/filler/filler-thank-you.tsx`

```tsx
// apps/web/components/filler/filler-thank-you.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { RiCheckLine } from "react-icons/ri";
import Link from "next/link";

interface Props {
  title:     string;
  message:   string;
  animation: string;
}

export function FillerThankYou({ title, message, animation }: Props) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(animation === "confetti" || animation === "fireworks");

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="filler-root flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={animation === "fireworks" ? 400 : 200}
          colors={["#6C47FF", "#C026D3", "#10B981", "#F59E0B", "#EF4444"]}
        />
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "var(--filler-btn-bg)" }}
      >
        <RiCheckLine className="h-10 w-10" style={{ color: "var(--filler-btn-text)" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <h1 className="filler-question text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="text-lg opacity-70" style={{ color: "var(--filler-text)" }}>{message}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-3"
      >
        <p className="text-sm opacity-40" style={{ color: "var(--filler-text)" }}>
          Built with FormCraft
        </p>
        <Link
          href="/"
          className="rounded-lg border px-5 py-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--filler-btn-bg)", color: "var(--filler-text)" }}
        >
          Create your own form
        </Link>
      </motion.div>
    </div>
  );
}
```

---

## STEP 9 — Analytics page

### `apps/web/app/(dashboard)/dashboard/forms/[id]/responses/page.tsx`

```tsx
// apps/web/app/(dashboard)/dashboard/forms/[id]/responses/page.tsx
"use client";
import { useParams }   from "next/navigation";
import { trpc }        from "~/trpc/client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton }    from "~/components/ui/skeleton";
import { Badge }       from "~/components/ui/badge";
import { Button }      from "~/components/ui/button";
import { formatDuration } from "~/lib/utils";
import { RiDownloadLine, RiBarChartLine, RiEyeLine, RiTimeLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";

const CHART_COLORS = ["#6C47FF", "#10B981", "#F59E0B", "#EF4444", "#C026D3"];

function MetricCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: color + "20" }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FormAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = trpc.responses.analytics.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { form, totalResponses, avgTimeMs, dailyStats } = data;

  const completionColor = form.completionRate >= 70
    ? "#10B981" : form.completionRate >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{form.title}</h2>
          <p className="text-sm text-muted-foreground">Response analytics and insights</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <RiDownloadLine className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total views"      value={form.viewCount.toLocaleString()}     icon={RiEyeLine}          color="#6C47FF" />
        <MetricCard label="Responses"        value={totalResponses.toLocaleString()}     icon={TbChartInfographic} color="#10B981" />
        <MetricCard label="Completion rate"  value={`${form.completionRate}%`}           icon={RiBarChartLine}     color={completionColor} />
        <MetricCard label="Avg. time"        value={avgTimeMs ? formatDuration(avgTimeMs) : "—"} icon={RiTimeLine} color="#F59E0B" />
      </div>

      {/* Daily responses chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Responses over time (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyStats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(d) => d.slice(5)} // show MM-DD
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6C47FF"
                strokeWidth={2}
                dot={{ fill: "#6C47FF", r: 3 }}
                name="Responses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion rate gauge (simple bar) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Completion rate</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {totalResponses} completed out of {form.viewCount} views
            </span>
            <span className="font-bold" style={{ color: completionColor }}>
              {form.completionRate}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${form.completionRate}%`, background: completionColor }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {form.completionRate >= 70
              ? "Excellent completion rate. Your form is well-optimised."
              : form.completionRate >= 40
              ? "Average completion rate. Consider shortening your form."
              : "Low completion rate. Try reducing the number of questions."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## STEP 10 — Pricing page with Razorpay

### `apps/web/app/(marketing)/pricing/page.tsx`

```tsx
// apps/web/app/(marketing)/pricing/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "~/trpc/client";
import { useSession } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  RiCheckLine, RiCloseLine, RiLoader4Line, RiShieldLine,
} from "react-icons/ri";
import { SiRazorpay } from "react-icons/si";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For individuals just getting started",
    features: [
      { label: "3 active forms",             included: true },
      { label: "100 responses per form",      included: true },
      { label: "8 field types",               included: true },
      { label: "Basic themes (8)",            included: true },
      { label: "CSV export",                  included: true },
      { label: "Custom URL slug",             included: false },
      { label: "QR code sharing",             included: false },
      { label: "Remove FormCraft branding",   included: false },
      { label: "All premium themes (20+)",    included: false },
      { label: "Password-protected forms",    included: false },
      { label: "Priority support",            included: false },
    ],
    cta:    "Get started free",
    ctaHref: "/auth/register",
    color:  "#6B7280",
    plan:   "free" as const,
  },
  {
    name: "Pro",
    monthlyPrice: 499,
    yearlyPrice: 3999,
    description: "For creators and solo makers",
    features: [
      { label: "Unlimited active forms",      included: true },
      { label: "Unlimited responses",         included: true },
      { label: "All 14 field types",          included: true },
      { label: "All 20+ premium themes",      included: true },
      { label: "CSV export",                  included: true },
      { label: "Custom URL slug",             included: true },
      { label: "QR code sharing",             included: true },
      { label: "Remove FormCraft branding",   included: true },
      { label: "Password-protected forms",    included: true },
      { label: "Form expiry and limits",      included: true },
      { label: "Priority email support",      included: false },
    ],
    cta:    "Upgrade to Pro",
    color:  "#6C47FF",
    plan:   "pro" as const,
    popular: true,
  },
  {
    name: "Team",
    monthlyPrice: 1499,
    yearlyPrice: 11999,
    description: "For teams and growing businesses",
    features: [
      { label: "Everything in Pro",           included: true },
      { label: "5 team members",              included: true },
      { label: "Shared form library",         included: true },
      { label: "API access",                  included: true },
      { label: "White-label forms",           included: true },
      { label: "Conditional logic",           included: true },
      { label: "Webhook integrations",        included: true },
      { label: "Admin dashboard",             included: true },
      { label: "Priority phone support",      included: true },
      { label: "SLA guarantee",               included: true },
      { label: "Custom domain",               included: true },
    ],
    cta:    "Upgrade to Team",
    color:  "#C026D3",
    plan:   "team" as const,
  },
];

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function PricingPage() {
  const [cycle, setCycle]       = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading]   = useState<string | null>(null);
  const { data: session }       = useSession();
  const router                  = useRouter();

  const createOrderMutation  = trpc.payments.createOrder.useMutation();
  const verifyPaymentMutation = trpc.payments.verifyPayment.useMutation();

  async function handleUpgrade(plan: "pro" | "team") {
    if (!session) { router.push("/auth/register"); return; }
    setLoading(plan);

    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      const order = await createOrderMutation.mutateAsync({ plan, billingCycle: cycle });

      const rzp = new window.Razorpay({
        key:              order.keyId,
        amount:           order.amount,
        currency:         order.currency,
        order_id:         order.orderId,
        name:             "FormCraft",
        description:      `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — ${cycle}`,
        image:            "/icon.png",
        prefill: {
          name:  session.user.name,
          email: session.user.email,
        },
        theme: { color: plan === "pro" ? "#6C47FF" : "#C026D3" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          await verifyPaymentMutation.mutateAsync({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            plan,
            billingCycle:      cycle,
          });
          toast.success(`Welcome to FormCraft ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`);
          router.push("/dashboard");
        },
      });

      rzp.open();
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-[#050505] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-white/50"
          >
            Start free. Upgrade when you need more. Cancel anytime.
          </motion.p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setCycle("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                cycle === "monthly" ? "bg-white text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                cycle === "yearly" ? "bg-white text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Yearly
              <Badge className="bg-[#10B981] text-white text-[10px] h-4 px-1.5">Save 33%</Badge>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-[#6C47FF] bg-[#6C47FF]/5"
                  : "border-white/10 bg-white/3"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#6C47FF] text-white">Most popular</Badge>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              </div>

              <div className="mt-6">
                {plan.monthlyPrice === 0 ? (
                  <div className="text-4xl font-bold text-white">Free</div>
                ) : (
                  <div className="flex items-end gap-1">
                    <div className="text-4xl font-bold text-white">
                      ₹{cycle === "monthly" ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                    </div>
                    <div className="mb-1 text-sm text-white/40">/month</div>
                  </div>
                )}
                {cycle === "yearly" && plan.yearlyPrice > 0 && (
                  <p className="mt-1 text-xs text-white/40">
                    ₹{plan.yearlyPrice} billed yearly
                  </p>
                )}
              </div>

              <div className="my-6 h-px bg-white/10" />

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included
                      ? <RiCheckLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#10B981]" />
                      : <RiCloseLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/20" />
                    }
                    <span className={f.included ? "text-white/80" : "text-white/30"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.monthlyPrice === 0 ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/auth/register">{plan.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    style={{ background: plan.color }}
                    onClick={() => handleUpgrade(plan.plan as "pro" | "team")}
                    disabled={loading === plan.plan}
                  >
                    {loading === plan.plan
                      ? <RiLoader4Line className="h-4 w-4 animate-spin" />
                      : <SiRazorpay className="h-4 w-4" />
                    }
                    {plan.cta}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/30">
          <div className="flex items-center gap-2 text-sm">
            <SiRazorpay className="h-5 w-5" />
            Secured by Razorpay
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiShieldLine className="h-5 w-5" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiCheckLine className="h-5 w-5" />
            UPI, cards, netbanking accepted
          </div>
        </div>

        {/* Test card */}
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/3 p-6 text-center">
          <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2">
            Test payment credentials
          </p>
          <p className="text-xs text-white/30">
            Card: <code className="font-mono">4111 1111 1111 1111</code> &nbsp;·&nbsp;
            UPI: <code className="font-mono">success@razorpay</code> &nbsp;·&nbsp;
            Any CVV and future date
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## STEP 11 — Explore page (public form gallery)

### `apps/web/app/(marketing)/explore/page.tsx`

```tsx
// apps/web/app/(marketing)/explore/page.tsx
"use client";
import { useState } from "react";
import { trpc }       from "~/trpc/client";
import Link           from "next/link";
import { motion }     from "framer-motion";
import { RiFormLine, RiSearchLine, RiArrowRightLine, RiEyeLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";
import { Badge }      from "~/components/ui/badge";
import { Input }      from "~/components/ui/input";
import { Skeleton }   from "~/components/ui/skeleton";
import { getFormShareUrl, truncate } from "~/lib/utils";

const CATEGORIES = ["All", "Streaming", "Social", "Culture", "Gaming", "Anime", "Startup", "Minimal"];

export default function ExplorePage() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");

  const { data, isLoading } = trpc.forms.listPublic.useQuery({ page: 1, limit: 24 });

  const forms = data?.forms.filter((f) => {
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || f.theme?.category === category.toLowerCase();
    return matchSearch && matchCat;
  }) ?? [];

  return (
    <div className="bg-[#050505] min-h-dvh px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#6C47FF]">Explore</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Discover public forms
          </h1>
          <p className="mt-4 text-white/50">
            Browse forms created by the FormCraft community. Fill them out or use as inspiration.
          </p>
        </div>

        {/* Search + filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-[#6C47FF] text-white"
                    : "border border-white/10 bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <RiFormLine className="h-12 w-12 text-white/20" />
            <p className="text-white/50">No public forms found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {forms.map((form, i) => {
              const themeConfig = form.theme?.config as { accentColor?: string; bgColor?: string } | undefined;
              return (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group card-lift overflow-hidden rounded-xl border border-white/10"
                >
                  {/* Theme preview strip */}
                  <div
                    className="flex h-24 items-end justify-between p-4"
                    style={{
                      background: themeConfig?.bgColor ?? "#1a1a1a",
                      borderBottom: `2px solid ${themeConfig?.accentColor ?? "#6C47FF"}20`,
                    }}
                  >
                    <div
                      className="h-2 w-16 rounded-full"
                      style={{ background: themeConfig?.accentColor ?? "#6C47FF" }}
                    />
                    {form.theme && (
                      <Badge className="text-[10px]" style={{
                        background: (themeConfig?.accentColor ?? "#6C47FF") + "30",
                        color: themeConfig?.accentColor ?? "#6C47FF",
                        border: "none",
                      }}>
                        {form.theme.name}
                      </Badge>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="bg-[#111] p-4">
                    <h3 className="text-sm font-semibold text-white line-clamp-2">
                      {truncate(form.title, 60)}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <TbChartInfographic className="h-3.5 w-3.5" />
                        {form.responseCount} responses
                      </span>
                      {form.description && (
                        <span className="flex items-center gap-1">
                          <RiEyeLine className="h-3.5 w-3.5" />
                          {form.viewCount} views
                        </span>
                      )}
                    </div>
                    <Link
                      href={form.slug ? getFormShareUrl(form.slug) : "#"}
                      className="mt-3 flex items-center gap-1 text-xs text-[#6C47FF] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Fill form <RiArrowRightLine className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## STEP 12 — Create form shortcut page

### `apps/web/app/(dashboard)/dashboard/forms/new/page.tsx`

```tsx
// apps/web/app/(dashboard)/dashboard/forms/new/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc }      from "~/trpc/client";
import { createFormSchema, type CreateFormInput } from "@repo/schemas";
import toast from "react-hot-toast";
import { Button }    from "~/components/ui/button";
import { Input }     from "~/components/ui/input";
import { Label }     from "~/components/ui/label";
import { Textarea }  from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RiLoader4Line, RiArrowRightLine } from "react-icons/ri";

export default function NewFormPage() {
  const router = useRouter();
  const utils  = trpc.useUtils();

  const createMutation = trpc.forms.create.useMutation({
    onSuccess: async (form) => {
      await utils.forms.list.invalidate();
      toast.success("Form created! Now add some fields.");
      router.push(`/dashboard/forms/${form.id}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<CreateFormInput>({ resolver: zodResolver(createFormSchema) });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a new form</CardTitle>
          <p className="text-sm text-muted-foreground">
            Give your form a name. You can change it later.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Form title</Label>
              <Input id="title" placeholder="e.g. Netflix Watchlist Survey" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="description" placeholder="What is this form about?" rows={3} {...register("description")} />
            </div>
            <Button
              type="submit"
              className="gap-2 bg-[#6C47FF] hover:bg-[#5B21B6]"
              disabled={isSubmitting || createMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending)
                ? <RiLoader4Line className="h-4 w-4 animate-spin" />
                : <RiArrowRightLine className="h-4 w-4" />
              }
              Create and open editor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## STEP 13 — next.config.ts and final wiring

### `apps/web/next.config.ts`

```typescript
// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/trpc", "@repo/schemas", "@repo/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/f/:slug*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" }, // don't index individual form fill pages
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## STEP 14 — Final checklist

Run these commands in order to verify everything is working:

```bash
# 1. Type-check everything — must be zero errors
pnpm check-types

# 2. Start dev servers
pnpm dev

# 3. Verify these pages all load without errors:
#    http://localhost:3000              → Landing page (hero, features, themes, footer)
#    http://localhost:3000/pricing      → Pricing with Razorpay cards
#    http://localhost:3000/explore      → Public form gallery
#    http://localhost:3000/auth/login   → Login page
#    http://localhost:3000/auth/register → Register page
#    http://localhost:3000/dashboard    → Dashboard (redirects to login if no session)
#    http://localhost:3000/f/demo-form  → Form filler (needs seeded form)

# 4. Test full flow:
#    Register → create form → add fields → publish → fill form at /f/[slug] → see analytics

# 5. Test Razorpay:
#    Go to /pricing → click "Upgrade to Pro" → use test card 4111 1111 1111 1111

# 6. Verify no emoji anywhere in the UI:
#    grep -r "🎬\|⭐\|✅\|❌\|🚀" apps/web/app apps/web/components
#    (should return no results)

# 7. Verify no lucide-react imports:
#    grep -r "lucide-react" apps/web/
#    (should return no results)

# 8. Mobile test — open http://localhost:3000/f/[slug] on phone or DevTools mobile view
#    The form filler must be fully usable on 375px screen width
```

---

## LIBRARIES USED IN THIS PHASE — SUMMARY

| Library               | Used for                                      |
|-----------------------|-----------------------------------------------|
| `framer-motion`       | Hero animations, question slide/fade/pop, thank-you reveal |
| `@dnd-kit/sortable`   | Drag-and-drop field reorder in builder canvas |
| `react-hook-form`     | All forms: login, register, new-form          |
| `@hookform/resolvers` | Connects Zod schemas to react-hook-form       |
| `@repo/schemas`       | Shared Zod validation, no local redefinitions |
| `recharts`            | Analytics: LineChart, BarChart                |
| `react-hot-toast`     | Success/error toasts globally                 |
| `react-confetti`      | Thank-you screen celebration                  |
| `zustand` + `immer`   | Form builder client state                     |
| `react-icons/ri`      | All icons — Remix Icons set (primary)         |
| `react-icons/tb`      | Tabler Icons (forms, analytics icons)         |
| `react-icons/si`      | Brand icons — SiRazorpay                      |
| `react-icons/md`      | Material — drag indicator                     |
| `better-auth/react`   | `useSession`, `signIn`, `signOut` on client   |

## WHAT COMES IN PHASE 3

- `FieldSettingsPanel` — right panel for editing validation, options, placeholders, conditional logic
- `BuilderPreview` — live preview of the form in selected theme
- QR code modal using `qrcode.react`
- CSV export endpoint and download button
- Form settings drawer (slug, visibility, response limit, expiry, password)
- Admin seed script runner
- `apps/web/app/(dashboard)/dashboard/forms/page.tsx` — full forms list with filter/search
- `apps/web/app/(dashboard)/dashboard/themes/page.tsx` — theme gallery with preview
