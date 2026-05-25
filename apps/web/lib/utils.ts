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
