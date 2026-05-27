import { z } from "zod";

export const buttonStyleSchema = z.enum(["rounded", "square", "pill"]);
export const progressStyleSchema = z.enum(["bar", "dots", "percentage", "none"]);
export const animationSchema = z.enum(["slide", "fade", "pop", "none"]);
export const fontFamilySchema = z.enum([
  "inter",
  "geist",
  "bebas-neue",
  "space-grotesk",
  "noto-sans",
  "roboto",
  "poppins",
  "playfair-display",
  "outfit",
  "dm-sans",
]);

export const themeConfigSchema = z.object({
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  bgImage: z.string().url().optional().nullable(),
  bgOverlayOpacity: z.number().min(0).max(1).default(0),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  questionColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  fontFamily: fontFamilySchema.default("inter"),
  fontSize: z.enum(["sm", "md", "lg"]).default("md"),
  buttonStyle: buttonStyleSchema.default("rounded"),
  buttonBgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  progressStyle: progressStyleSchema.default("bar"),
  progressColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  questionAnimation: animationSchema.default("slide"),
  thankYouAnimation: z.enum(["confetti", "fireworks", "checkmark", "minimal"]).default("confetti"),
  logoUrl: z.string().url().optional().nullable(),
  customCss: z.string().max(5000, "Custom CSS too large").optional().nullable(),
  questionBgColor: z.string().regex(/^(#[0-9a-fA-F]{6}|rgba?\([^)]+\))$/).optional().nullable(),
  questionBackdropBlur: z.string().optional().nullable(),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

// The 20 predefined themes
export const PREDEFINED_THEMES = [
  {
    slug: "netflix",
    name: "Netflix",
    category: "streaming",
    isPro: false,
    config: {
      bgColor: "#141414", accentColor: "#E50914", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "bebas-neue", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#E50914", questionAnimation: "slide",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    category: "social",
    isPro: false,
    config: {
      bgColor: "#075E54", accentColor: "#25D366", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", buttonStyle: "pill",
      progressStyle: "bar", progressColor: "#25D366", questionAnimation: "fade",
      thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "youtube",
    name: "YouTube",
    category: "streaming",
    isPro: false,
    config: {
      bgColor: "#0F0F0F", accentColor: "#FF0000", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#FF0000", questionAnimation: "slide",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "instagram",
    name: "Instagram",
    category: "social",
    isPro: false,
    config: {
      bgColor: "#0A0A0A", accentColor: "#E1306C", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "inter", buttonStyle: "pill",
      progressStyle: "dots", progressColor: "#E1306C", questionAnimation: "pop",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "pink-city",
    name: "Pink City Jaipur",
    category: "culture",
    isPro: false,
    config: {
      bgColor: "#8B1A4A", accentColor: "#F7A8C4", textColor: "#FFFFFF",
      questionColor: "#FFE4EF", fontFamily: "playfair-display", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#F7A8C4", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "anime-dark",
    name: "Anime Dark",
    category: "anime",
    isPro: false,
    config: {
      bgColor: "#0D0D1A", accentColor: "#7C3AED", textColor: "#E2E8F0",
      questionColor: "#F1F5F9", fontFamily: "noto-sans", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#7C3AED", questionAnimation: "pop",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "macos",
    name: "macOS",
    category: "operating-system",
    isPro: true,
    config: {
      bgColor: "#1C1C1E", accentColor: "#0A84FF", textColor: "#FFFFFF",
      questionColor: "#EBEBF5", fontFamily: "inter", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#0A84FF", questionAnimation: "slide",
      thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "discord",
    name: "Discord",
    category: "gaming",
    isPro: false,
    config: {
      bgColor: "#313338", accentColor: "#5865F2", textColor: "#DBDEE1",
      questionColor: "#FFFFFF", fontFamily: "inter", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#5865F2", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "startup",
    name: "Startup",
    category: "startup",
    isPro: false,
    config: {
      bgColor: "#0A0A0A", accentColor: "#FF6B35", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", buttonStyle: "rounded",
      progressStyle: "percentage", progressColor: "#FF6B35", questionAnimation: "slide",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "streaming",
    isPro: true,
    config: {
      bgColor: "#121212", accentColor: "#1DB954", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "dm-sans", buttonStyle: "pill",
      progressStyle: "bar", progressColor: "#1DB954", questionAnimation: "slide",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "minimal-light",
    name: "Minimal Light",
    category: "minimal",
    isPro: false,
    config: {
      bgColor: "#FAFAFA", accentColor: "#111111", textColor: "#111111",
      questionColor: "#111111", fontFamily: "geist", buttonStyle: "square",
      progressStyle: "bar", progressColor: "#111111", questionAnimation: "fade",
      thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "india-pride",
    name: "India Pride",
    category: "culture",
    isPro: false,
    config: {
      bgColor: "#FFFFFF", accentColor: "#FF9933", textColor: "#000080",
      questionColor: "#000080", fontFamily: "poppins", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#138808", questionAnimation: "slide",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "cyberpunk",
    name: "Cyberpunk",
    category: "gaming",
    isPro: true,
    config: {
      bgColor: "#0D001A", accentColor: "#00FFFF", textColor: "#00FFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", buttonStyle: "square",
      progressStyle: "bar", progressColor: "#FF00FF", questionAnimation: "pop",
      thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    slug: "jaipur-corporate",
    name: "Jaipur Corporate",
    category: "professional",
    isPro: false,
    config: {
      bgColor: "#8B1A4A", accentColor: "#F7A8C4", textColor: "#FFFFFF",
      questionColor: "#FFE4EF", fontFamily: "playfair-display", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#F7A8C4", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0.6,
      bgImage: "https://i.pinimg.com/736x/1e/fc/b6/1efcb69b698f8956f71d19a51044d77d.jpg",
    },
  },
  {
    slug: "amer-fort",
    name: "Amer Fort",
    category: "culture",
    isPro: false,
    config: {
      bgColor: "#C47242", accentColor: "#FDE6D8", textColor: "#FFFFFF",
      questionColor: "#FDF2E9", fontFamily: "playfair-display", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#FDE6D8", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0.5,
      bgImage: "https://i.pinimg.com/736x/68/2f/eb/682febeb9b84e2a125dc0cbd67fff674.jpg",
    },
  },
  {
    slug: "liquid-glass",
    name: "Liquid Glass",
    category: "cinematic",
    isPro: true,
    config: {
      bgColor: "#0f172a", accentColor: "#38bdf8", textColor: "#ffffff",
      questionColor: "#ffffff", fontFamily: "inter", buttonStyle: "rounded",
      progressStyle: "bar", progressColor: "#38bdf8", questionAnimation: "fade",
      thankYouAnimation: "confetti", bgOverlayOpacity: 0.2,
      bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      questionBgColor: "rgba(255, 255, 255, 0.05)",
      questionBackdropBlur: "12px",
    },
  },
] as const;
