import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon }    from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { env } from "./env";

// ── DB connection (Neon serverless) ───────────────────────────────────────────
const neonSql = neon(env.DATABASE_URL);
const db = drizzle(neonSql, { schema });

// ── Clean database before re-seeding ──────────────────────────────────────────
async function cleanDatabase() {
  console.log("Cleaning existing seed data...");
  // Delete in reverse dependency order
  await db.delete(schema.responseAnswersTable);
  await db.delete(schema.responsesTable);
  await db.delete(schema.formFieldsTable);
  await db.delete(schema.formsTable);
  await db.delete(schema.formThemesTable);
  // Keep users — just delete the demo user
  await db.delete(schema.usersTable)
    .where(eq(schema.usersTable.email, "demo@auraform.app"));
  console.log("Database cleaned.\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomBetween(0, daysAgo));
  d.setHours(randomBetween(8, 22), randomBetween(0, 59));
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function uuid(): string {
  return crypto.randomUUID();
}

// ── Theme definitions ──────────────────────────────────────────────────────────
const THEMES = [
  {
    name: "Netflix",      slug: "netflix",      category: "streaming",
    isPro: false,
    config: {
      bgColor: "#141414", accentColor: "#E50914", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "bebas-neue", fontSize: "lg",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#E50914",
      questionAnimation: "slide", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "WhatsApp",     slug: "whatsapp",     category: "social",
    isPro: false,
    config: {
      bgColor: "#075E54", accentColor: "#25D366", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", fontSize: "md",
      buttonStyle: "pill", progressStyle: "bar", progressColor: "#25D366",
      questionAnimation: "fade", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Pink City Jaipur", slug: "pink-city", category: "culture",
    isPro: false,
    config: {
      bgColor: "#8B1A4A", accentColor: "#F7A8C4", textColor: "#FFFFFF",
      questionColor: "#FFE4EF", fontFamily: "playfair-display", fontSize: "lg",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#F7A8C4",
      questionAnimation: "fade", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Anime Dark",   slug: "anime-dark",   category: "anime",
    isPro: false,
    config: {
      bgColor: "#0D0D1A", accentColor: "#7C3AED", textColor: "#E2E8F0",
      questionColor: "#F1F5F9", fontFamily: "noto-sans", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#7C3AED",
      questionAnimation: "pop", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Discord",      slug: "discord",      category: "gaming",
    isPro: false,
    config: {
      bgColor: "#313338", accentColor: "#5865F2", textColor: "#DBDEE1",
      questionColor: "#FFFFFF", fontFamily: "inter", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#5865F2",
      questionAnimation: "fade", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "macOS",        slug: "macos",        category: "operating-system",
    isPro: true,
    config: {
      bgColor: "#1C1C1E", accentColor: "#0A84FF", textColor: "#FFFFFF",
      questionColor: "#EBEBF5", fontFamily: "inter", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#0A84FF",
      questionAnimation: "slide", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Spotify",      slug: "spotify",      category: "streaming",
    isPro: true,
    config: {
      bgColor: "#121212", accentColor: "#1DB954", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "dm-sans", fontSize: "md",
      buttonStyle: "pill", progressStyle: "bar", progressColor: "#1DB954",
      questionAnimation: "slide", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Startup",      slug: "startup",      category: "startup",
    isPro: false,
    config: {
      bgColor: "#0A0A0A", accentColor: "#FF6B35", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "percentage", progressColor: "#FF6B35",
      questionAnimation: "slide", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "India Pride",  slug: "india-pride",  category: "culture",
    isPro: false,
    config: {
      bgColor: "#FFFFFF", accentColor: "#FF9933", textColor: "#000080",
      questionColor: "#000080", fontFamily: "poppins", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#138808",
      questionAnimation: "slide", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Cyberpunk",    slug: "cyberpunk",    category: "gaming",
    isPro: true,
    config: {
      bgColor: "#0D001A", accentColor: "#00FFFF", textColor: "#00FFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", fontSize: "md",
      buttonStyle: "square", progressStyle: "bar", progressColor: "#FF00FF",
      questionAnimation: "pop", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Minimal Light", slug: "minimal-light", category: "minimal",
    isPro: false,
    config: {
      bgColor: "#FAFAFA", accentColor: "#111111", textColor: "#111111",
      questionColor: "#111111", fontFamily: "geist", fontSize: "md",
      buttonStyle: "square", progressStyle: "bar", progressColor: "#111111",
      questionAnimation: "fade", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    name: "YouTube",      slug: "youtube",      category: "streaming",
    isPro: false,
    config: {
      bgColor: "#0F0F0F", accentColor: "#FF0000", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#FF0000",
      questionAnimation: "slide", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Windows 11",   slug: "windows-11",   category: "operating-system",
    isPro: true,
    config: {
      bgColor: "#003087", accentColor: "#00ADEF", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "inter", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#00ADEF",
      questionAnimation: "slide", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
] as const;

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  console.log("Starting AuraForm seed...\n");

  // Clean existing seed data first
  await cleanDatabase();

  // ── 1. Seed themes ──────────────────────────────────────────────────────────
  console.log("Seeding themes...");
  const themeIdMap: Record<string, string> = {};

  for (const t of THEMES) {
    const id = uuid();
    await db.insert(schema.formThemesTable).values({
      id,
      name:      t.name,
      slug:      t.slug,
      category:  t.category,
      config:    t.config as never,
      isPro:     t.isPro,
      isCustom:  false,
    }).onConflictDoNothing();

    // Fetch the actual ID in case it already existed
    const existing = await db.query.formThemesTable.findFirst({
      where: eq(schema.formThemesTable.slug, t.slug),
      columns: { id: true },
    });
    if (existing) themeIdMap[t.slug] = existing.id;
  }
  console.log(`  ${THEMES.length} themes seeded.\n`);

  // ── 2. Seed demo user ───────────────────────────────────────────────────────
  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const demoUserId   = uuid();

  await db.insert(schema.usersTable).values({
    id:            demoUserId,
    name:      "Demo Creator",
    email:         "demo@auraform.app",
    emailVerified: true,
    passwordHash,
    plan:          "pro",
  }).onConflictDoNothing();

  const demoUser = await db.query.usersTable.findFirst({
    where: eq(schema.usersTable.email, "demo@auraform.app"),
    columns: { id: true, name: true },
  });
  const userId = demoUser!.id;
  console.log(`  Demo user ready: demo@auraform.app / Demo1234!\n`);

  // ── 3. Seed 5 themed forms ──────────────────────────────────────────────────
  console.log("Seeding forms...");

  const forms = await seedAllForms(userId, themeIdMap);
  console.log(`  ${forms.length} forms seeded.\n`);

  // ── 4. Seed responses ───────────────────────────────────────────────────────
  console.log("Seeding responses...");
  let totalResponses = 0;

  for (const form of forms) {
    const count = await seedResponses(form);
    console.log(`  ${count} responses for "${form.title}"`);
    totalResponses += count;
  }
  console.log(`\n  Total responses seeded: ${totalResponses}\n`);

  console.log("Seed complete! Open http://localhost:3000 to see it.\n");
  console.log("Demo credentials:");
  console.log("  Email:    demo@auraform.app");
  console.log("  Password: Demo1234!\n");

  process.exit(0);
}

// ── Form definitions ──────────────────────────────────────────────────────────
async function seedAllForms(
  userId: string,
  themeIdMap: Record<string, string>
): Promise<SeedForm[]> {
  const forms: SeedForm[] = [];

  // ── Form 1: Netflix Watchlist Survey ─────────────────────────────────────
  const form1 = await createForm({
    userId,
    title:       "Netflix Watchlist Survey",
    description: "Help us understand what you love watching. Takes 2 minutes.",
    slug:        "netflix-watchlist",
    themeId:     themeIdMap["netflix"]!,
    visibility:  "public",
    viewCount:   312,
    responseCount: 0,
    thankYouTitle:   "Thanks for watching!",
    thankYouMessage: "Your picks help us recommend better shows.",
  });

  const f1Fields = await createFields(form1.id, [
    {
      type: "welcome_screen", label: "Welcome to the Netflix Watchlist Survey",
      description: "We want to know what you love watching. This takes about 90 seconds.",
      buttonLabel: "Start survey", order: 0, required: false,
    },
    {
      type: "single_select", label: "What is your favourite Netflix genre?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "Thriller & Crime",  value: "thriller",     order: 0 },
        { id: uuid(), label: "Sci-Fi & Fantasy",  value: "sci-fi",       order: 1 },
        { id: uuid(), label: "Romance & Drama",   value: "romance",      order: 2 },
        { id: uuid(), label: "Comedy",            value: "comedy",       order: 3 },
        { id: uuid(), label: "Documentary",       value: "documentary",  order: 4 },
        { id: uuid(), label: "Horror",            value: "horror",       order: 5 },
        { id: uuid(), label: "Action & Adventure",value: "action",       order: 6 },
      ],
    },
    {
      type: "multi_select", label: "Which original series have you watched?",
      required: true, order: 2,
      options: [
        { id: uuid(), label: "Stranger Things",   value: "stranger_things",  order: 0 },
        { id: uuid(), label: "Money Heist",       value: "money_heist",      order: 1 },
        { id: uuid(), label: "Squid Game",        value: "squid_game",       order: 2 },
        { id: uuid(), label: "Dark",              value: "dark",             order: 3 },
        { id: uuid(), label: "Wednesday",         value: "wednesday",        order: 4 },
        { id: uuid(), label: "Sacred Games",      value: "sacred_games",     order: 5 },
      ],
    },
    {
      type: "rating", label: "How would you rate your overall Netflix experience?",
      description: "1 = terrible, 5 = amazing",
      required: true, order: 3,
    },
    {
      type: "scale", label: "How likely are you to recommend Netflix to a friend?",
      description: "0 = not at all, 10 = extremely likely",
      required: true, order: 4,
    },
    {
      type: "yes_no", label: "Have you used the download feature for offline viewing?",
      required: false, order: 5,
    },
    {
      type: "short_text", label: "What is one show you wish Netflix would bring back?",
      placeholder: "e.g. The OA, Marco Polo...",
      required: false, order: 6,
    },
    {
      type: "email", label: "Enter your email to receive personalised recommendations",
      placeholder: "you@example.com",
      required: false, order: 7,
    },
  ]);

  forms.push({ ...form1, fields: f1Fields, responseTarget: 89 });

  // ── Form 2: Pink City Jaipur Tourism ──────────────────────────────────────
  const form2 = await createForm({
    userId,
    title:        "Pink City Jaipur — Visitor Experience",
    description:  "Tell us about your Jaipur trip. Your feedback shapes the tourism experience.",
    slug:         "jaipur-visitor",
    themeId:      themeIdMap["pink-city"]!,
    visibility:   "public",
    viewCount:    178,
    responseCount: 0,
    thankYouTitle:   "Padharo Mhare Des!",
    thankYouMessage: "Thank you for sharing your Jaipur experience.",
  });

  const f2Fields = await createFields(form2.id, [
    {
      type: "welcome_screen", label: "Welcome to the Pink City Survey",
      description: "Share your Jaipur experience in under 2 minutes.",
      buttonLabel: "Begin", order: 0, required: false,
    },
    {
      type: "single_select", label: "Which city did you travel from to reach Jaipur?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "Delhi",      value: "delhi",     order: 0 },
        { id: uuid(), label: "Mumbai",     value: "mumbai",    order: 1 },
        { id: uuid(), label: "Bangalore",  value: "bangalore", order: 2 },
        { id: uuid(), label: "Hyderabad",  value: "hyderabad", order: 3 },
        { id: uuid(), label: "Chennai",    value: "chennai",   order: 4 },
        { id: uuid(), label: "Abroad",     value: "abroad",    order: 5 },
        { id: uuid(), label: "Other",      value: "other",     order: 6 },
      ],
    },
    {
      type: "multi_select", label: "Which attractions did you visit?",
      required: true, order: 2,
      options: [
        { id: uuid(), label: "Amber Fort",      value: "amber_fort",     order: 0 },
        { id: uuid(), label: "Hawa Mahal",      value: "hawa_mahal",     order: 1 },
        { id: uuid(), label: "City Palace",     value: "city_palace",    order: 2 },
        { id: uuid(), label: "Jantar Mantar",   value: "jantar_mantar",  order: 3 },
        { id: uuid(), label: "Nahargarh Fort",  value: "nahargarh",      order: 4 },
        { id: uuid(), label: "Johari Bazaar",   value: "johari_bazaar",  order: 5 },
        { id: uuid(), label: "Albert Hall",     value: "albert_hall",    order: 6 },
      ],
    },
    {
      type: "rating", label: "How would you rate the Jaipur street food experience?",
      required: true, order: 3,
    },
    {
      type: "number", label: "How many days did you spend in Jaipur?",
      placeholder: "e.g. 3",
      required: true, order: 4,
      validation: { min: 1, max: 30 },
    },
    {
      type: "single_select", label: "How did you primarily get around Jaipur?",
      required: true, order: 5,
      options: [
        { id: uuid(), label: "Auto-rickshaw",  value: "auto",      order: 0 },
        { id: uuid(), label: "Ola / Uber",     value: "cab",       order: 1 },
        { id: uuid(), label: "Rental bike",    value: "bike",      order: 2 },
        { id: uuid(), label: "Cycle rickshaw", value: "cycle",     order: 3 },
        { id: uuid(), label: "Private car",    value: "car",       order: 4 },
        { id: uuid(), label: "Walked",         value: "walk",      order: 5 },
      ],
    },
    {
      type: "scale", label: "How likely are you to recommend Jaipur to a friend?",
      required: true, order: 6,
    },
    {
      type: "long_text", label: "Any suggestions to improve the tourist experience in Jaipur?",
      placeholder: "Share your honest thoughts...",
      required: false, order: 7,
    },
  ]);

  forms.push({ ...form2, fields: f2Fields, responseTarget: 61 });

  // ── Form 3: Anime Character Poll ──────────────────────────────────────────
  const form3 = await createForm({
    userId,
    title:        "Anime Character Popularity Poll 2024",
    description:  "Vote for your favourite characters across all time and see the live results.",
    slug:         "anime-character-poll",
    themeId:      themeIdMap["anime-dark"]!,
    visibility:   "public",
    viewCount:    543,
    responseCount: 0,
    thankYouTitle:   "Sugoi! Your vote is counted.",
    thankYouMessage: "See you in the next poll, senpai.",
  });

  const f3Fields = await createFields(form3.id, [
    {
      type: "single_select",
      label: "Who is your all-time favourite shonen protagonist?",
      required: true, order: 0,
      options: [
        { id: uuid(), label: "Naruto Uzumaki",    value: "naruto",  order: 0 },
        { id: uuid(), label: "Monkey D. Luffy",   value: "luffy",   order: 1 },
        { id: uuid(), label: "Goku",              value: "goku",    order: 2 },
        { id: uuid(), label: "Izuku Midoriya",    value: "deku",    order: 3 },
        { id: uuid(), label: "Levi Ackermann",    value: "levi",    order: 4 },
        { id: uuid(), label: "Tanjiro Kamado",    value: "tanjiro", order: 5 },
        { id: uuid(), label: "Edward Elric",      value: "edward",  order: 6 },
      ],
    },
    {
      type: "multi_select", label: "Which anime series are you currently watching?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "One Piece",             value: "one_piece",     order: 0 },
        { id: uuid(), label: "Jujutsu Kaisen",        value: "jjk",           order: 1 },
        { id: uuid(), label: "Demon Slayer",          value: "demon_slayer",  order: 2 },
        { id: uuid(), label: "Attack on Titan",       value: "aot",           order: 3 },
        { id: uuid(), label: "Chainsaw Man",          value: "chainsaw_man",  order: 4 },
        { id: uuid(), label: "Hunter x Hunter",       value: "hxh",           order: 5 },
        { id: uuid(), label: "Vinland Saga",          value: "vinland",       order: 6 },
      ],
    },
    {
      type: "rating", label: "Rate Demon Slayer: Kimetsu no Yaiba overall",
      description: "1 = not for me, 5 = masterpiece",
      required: true, order: 2,
    },
    {
      type: "single_select", label: "Which animation studio do you rate highest?",
      required: true, order: 3,
      options: [
        { id: uuid(), label: "ufotable",        value: "ufotable",  order: 0 },
        { id: uuid(), label: "MAPPA",           value: "mappa",     order: 1 },
        { id: uuid(), label: "Toei Animation",  value: "toei",      order: 2 },
        { id: uuid(), label: "Wit Studio",      value: "wit",       order: 3 },
        { id: uuid(), label: "Bones",           value: "bones",     order: 4 },
        { id: uuid(), label: "A-1 Pictures",    value: "a1",        order: 5 },
      ],
    },
    {
      type: "scale", label: "How would you rate the current 'golden age of anime' (2020–2024)?",
      required: true, order: 4,
    },
    {
      type: "yes_no", label: "Do you prefer dubbed or subbed anime?",
      required: false, order: 5,
    },
    {
      type: "short_text", label: "Name one underrated anime everyone should watch",
      placeholder: "e.g. Vinland Saga, Mushishi...",
      required: false, order: 6,
    },
  ]);

  forms.push({ ...form3, fields: f3Fields, responseTarget: 134 });

  // ── Form 4: Startup Idea Validator (unlisted) ──────────────────────────────
  const form4 = await createForm({
    userId,
    title:        "Startup Idea Validator — AuraForm v2 Features",
    description:  "Help us prioritise what to build next in AuraForm. Takes 3 minutes.",
    slug:         "auraform-feature-vote",
    themeId:      themeIdMap["startup"]!,
    visibility:   "unlisted",
    viewCount:    88,
    responseCount: 0,
    thankYouTitle:   "Your input is gold.",
    thankYouMessage: "We read every response. Thank you for helping shape AuraForm.",
  });

  const f4Fields = await createFields(form4.id, [
    {
      type: "single_select",
      label: "Which upcoming AuraForm feature excites you most?",
      required: true, order: 0,
      options: [
        { id: uuid(), label: "Conditional logic between questions",   value: "conditional",  order: 0 },
        { id: uuid(), label: "File upload field",                     value: "file_upload",  order: 1 },
        { id: uuid(), label: "Multi-page forms",                      value: "multi_page",   order: 2 },
        { id: uuid(), label: "Team collaboration",                    value: "team",         order: 3 },
        { id: uuid(), label: "Custom domain support",                 value: "domain",       order: 4 },
        { id: uuid(), label: "Zapier / webhook integrations",         value: "webhooks",     order: 5 },
        { id: uuid(), label: "AI-generated forms from a prompt",      value: "ai_gen",       order: 6 },
      ],
    },
    {
      type: "rating", label: "How would you rate AuraForm's current form builder experience?",
      required: true, order: 1,
    },
    {
      type: "scale",
      label: "How likely are you to pay for a Pro plan at ₹499/month?",
      description: "0 = definitely not, 10 = already paid",
      required: true, order: 2,
    },
    {
      type: "single_select",
      label: "Which Typeform feature do you miss most in AuraForm?",
      required: false, order: 3,
      options: [
        { id: uuid(), label: "Hidden fields",        value: "hidden",      order: 0 },
        { id: uuid(), label: "Custom thank-you page",value: "thankyou",    order: 1 },
        { id: uuid(), label: "Payment collection",   value: "payment",     order: 2 },
        { id: uuid(), label: "Calculator fields",    value: "calculator",  order: 3 },
        { id: uuid(), label: "None — AuraForm is better", value: "none", order: 4 },
      ],
    },
    {
      type: "long_text",
      label: "Describe the perfect form builder for your use case",
      placeholder: "I would use it for... the key feature I need is...",
      required: false, order: 4,
    },
    {
      type: "email",
      label: "Email — if you want early access to new features",
      placeholder: "founder@startup.com",
      required: false, order: 5,
    },
  ]);

  forms.push({ ...form4, fields: f4Fields, responseTarget: 42 });

  // ── Form 5: Discord Community Server Feedback ─────────────────────────────
  const form5 = await createForm({
    userId,
    title:        "Gaming Community — Server Feedback Survey",
    description:  "Rate our Discord server and help us make it better for everyone.",
    slug:         "discord-server-feedback",
    themeId:      themeIdMap["discord"]!,
    visibility:   "public",
    viewCount:    195,
    responseCount: 0,
    thankYouTitle:   "GG! Thanks for the feedback.",
    thankYouMessage: "We will post results in #announcements this weekend.",
  });

  const f5Fields = await createFields(form5.id, [
    {
      type: "single_select",
      label: "How long have you been a member of our server?",
      required: true, order: 0,
      options: [
        { id: uuid(), label: "Less than a week",  value: "< 1 week",   order: 0 },
        { id: uuid(), label: "1–4 weeks",         value: "1-4 weeks",  order: 1 },
        { id: uuid(), label: "1–3 months",        value: "1-3 months", order: 2 },
        { id: uuid(), label: "3–12 months",       value: "3-12 months",order: 3 },
        { id: uuid(), label: "Over a year",       value: "> 1 year",   order: 4 },
      ],
    },
    {
      type: "multi_select",
      label: "Which channels do you visit most often?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "#general",          value: "general",   order: 0 },
        { id: uuid(), label: "#memes",            value: "memes",     order: 1 },
        { id: uuid(), label: "#game-discussion",  value: "game-disc", order: 2 },
        { id: uuid(), label: "#looking-for-group",value: "lfg",       order: 3 },
        { id: uuid(), label: "#announcements",    value: "announce",  order: 4 },
        { id: uuid(), label: "#art-showcase",     value: "art",       order: 5 },
      ],
    },
    {
      type: "rating",
      label: "How would you rate the quality of moderation?",
      description: "1 = needs major improvement, 5 = excellent",
      required: true, order: 2,
    },
    {
      type: "scale",
      label: "How active do you feel this community is?",
      description: "0 = dead server, 10 = super active",
      required: true, order: 3,
    },
    {
      type: "yes_no",
      label: "Have you participated in any of our community events?",
      required: false, order: 4,
    },
    {
      type: "single_select",
      label: "What type of event would you most like to see?",
      required: false, order: 5,
      options: [
        { id: uuid(), label: "Game night / tournament", value: "game_night",   order: 0 },
        { id: uuid(), label: "Art contest",             value: "art_contest",  order: 1 },
        { id: uuid(), label: "Watch party",             value: "watch_party",  order: 2 },
        { id: uuid(), label: "AMA with streamers",      value: "ama",          order: 3 },
        { id: uuid(), label: "Trivia night",            value: "trivia",       order: 4 },
      ],
    },
    {
      type: "long_text",
      label: "Any suggestions for improving the server?",
      placeholder: "I would love to see...",
      required: false, order: 6,
    },
  ]);

  forms.push({ ...form5, fields: f5Fields, responseTarget: 97 });

  return forms;
}

// ── Helpers for creating forms and fields ─────────────────────────────────────
interface SeedForm {
  id:            string;
  title:         string;
  slug:          string | null;
  userId:        string;
  fields:        Array<typeof schema.formFieldsTable.$inferSelect>;
  responseTarget: number;
}

async function createForm(opts: {
  userId:        string;
  title:         string;
  description:   string;
  slug:          string;
  themeId:       string;
  visibility:    "public" | "unlisted";
  viewCount:     number;
  responseCount: number;
  thankYouTitle: string;
  thankYouMessage: string;
}): Promise<typeof schema.formsTable.$inferSelect> {
  const id = uuid();
  await db.insert(schema.formsTable).values({
    id,
    userId:        opts.userId,
    themeId:       opts.themeId,
    title:         opts.title,
    description:   opts.description,
    slug:          opts.slug,
    status:        "published",
    visibility:    opts.visibility,
    notifyOnResponse: true,
    showBranding:  true,
    viewCount:     opts.viewCount,
    responseCount: 0,
    thankYouTitle: opts.thankYouTitle,
    thankYouMessage: opts.thankYouMessage,
    publishedAt:   new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
  }).onConflictDoNothing();

  const form = await db.query.formsTable.findFirst({
    where: eq(schema.formsTable.slug, opts.slug),
  });
  return form!;
}

async function createFields(
  formId: string,
  fields: Array<{
    type:        string;
    label:       string;
    description?: string;
    placeholder?: string;
    buttonLabel?: string;
    required:    boolean;
    order:       number;
    options?:    Array<{ id: string; label: string; value: string; order: number }>;
    validation?: Record<string, unknown>;
  }>
): Promise<Array<typeof schema.formFieldsTable.$inferSelect>> {
  for (const f of fields) {
    const id = uuid();
    await db.insert(schema.formFieldsTable).values({
      id,
      formId,
      type:        f.type as never,
      label:       f.label,
      description: f.description ?? null,
      placeholder: f.placeholder ?? null,
      buttonLabel: f.buttonLabel ?? null,
      required:    f.required,
      order:       f.order,
      options:     (f.options as never) ?? null,
      validation:  (f.validation as never) ?? null,
    });
  }

  return db.query.formFieldsTable.findMany({
    where: eq(schema.formFieldsTable.formId, formId),
    orderBy: (t, { asc }) => [asc(t.order)],
  });
}

// ── Response seeding ──────────────────────────────────────────────────────────
async function seedResponses(form: SeedForm): Promise<number> {
  const interactiveFields = form.fields.filter(
    (f) => !["welcome_screen", "thank_you_screen", "statement"].includes(f.type)
  );

  let seeded = 0;

  for (let i = 0; i < form.responseTarget; i++) {
    const responseId = uuid();
    const submittedAt = randomDate(30);

    await db.insert(schema.responsesTable).values({
      id:          responseId,
      formId:      form.id,
      ipHash:      `seed_hash_${i}`,
      userAgent:   pick(USER_AGENTS),
      timeToCompleteMs: randomBetween(45000, 240000),
      submittedAt,
    });

    // Generate realistic answers for each field
    for (const field of interactiveFields) {
      const value = generateAnswer(field);
      if (value === null) continue;

      await db.insert(schema.responseAnswersTable).values({
        id:         uuid(),
        responseId,
        fieldId:    field.id,
        value:      value as never,
      });
    }

    seeded++;
  }

  // Update response count
  await db.update(schema.formsTable)
    .set({ responseCount: seeded })
    .where(eq(schema.formsTable.id, form.id));

  return seeded;
}

// ── Answer generators ─────────────────────────────────────────────────────────
function generateAnswer(
  field: typeof schema.formFieldsTable.$inferSelect
): string | number | boolean | string[] | null {
  const opts = field.options as Array<{ value: string }> | null;

  switch (field.type) {
    case "short_text":
      return pick(SHORT_TEXT_ANSWERS);

    case "long_text":
      return pick(LONG_TEXT_ANSWERS);

    case "email":
      // 60% fill rate for optional email fields
      if (!field.required && Math.random() > 0.6) return null;
      return `user${randomBetween(1, 9999)}@example.com`;

    case "number": {
      const validation = field.validation as { min?: number; max?: number } | null;
      const min = validation?.min ?? 1;
      const max = validation?.max ?? 10;
      return randomBetween(min, max);
    }

    case "single_select":
      if (!opts?.length) return null;
      return pick(opts).value;

    case "multi_select": {
      if (!opts?.length) return null;
      const shuffled = [...opts].sort(() => Math.random() - 0.5);
      const count    = randomBetween(1, Math.min(3, opts.length));
      return shuffled.slice(0, count).map((o) => o.value);
    }

    case "dropdown":
      if (!opts?.length) return null;
      return pick(opts).value;

    case "rating":
      // Weighted towards 4-5 stars (makes analytics look realistic)
      return pick([3, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2, 5, 5]);

    case "scale":
      // Weighted towards 7-10 (NPS-style distribution)
      return pick([6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 7, 8, 5, 10]);

    case "yes_no":
      return Math.random() > 0.35; // 65% say yes

    case "date": {
      const d = randomDate(365);
      return d.toISOString().split("T")[0]!;
    }

    case "checkbox":
      return Math.random() > 0.3;

    case "phone":
      if (!field.required && Math.random() > 0.5) return null;
      return `+91${randomBetween(7000000000, 9999999999)}`;

    case "url":
      if (!field.required && Math.random() > 0.4) return null;
      return pick(["https://github.com", "https://twitter.com", "https://linkedin.com"]);

    default:
      return null;
  }
}

// ── Sample answer pools ───────────────────────────────────────────────────────
const SHORT_TEXT_ANSWERS = [
  "The OA",
  "Dark",
  "Parasyte: The Maxim",
  "Made in Abyss",
  "Steins;Gate",
  "Mob Psycho 100",
  "Ping Pong The Animation",
  "Mushishi",
  "Barakamon",
  "Rainbow",
  "I would love to see better regional Indian content.",
  "More thriller content please!",
  "Please bring back Mindhunter.",
  "Gangs of Wasseypur deserves a sequel.",
  "Better subtitles for regional languages.",
];

const LONG_TEXT_ANSWERS = [
  "I think the experience is great overall but could use improvements in discoverability. I often find great shows by accident rather than through recommendations.",
  "Would love to see more regional content. There are so many great stories from smaller cities that deserve a global platform.",
  "The interface is clean and fast. My main suggestion would be to add a playlist or watchlist feature that syncs across devices better.",
  "I really enjoy the community but feel the event frequency is a bit low. More regular activities would keep members engaged.",
  "Great server overall! I would love to see more watch-together events for anime premieres. The reaction threads are always fun.",
  "The form builder is intuitive. My main ask would be better analytics — specifically per-question drop-off so I can see where people are giving up.",
  "I have been using this for my college research surveys. The Jaipur theme was perfect for our heritage documentation project. Incredible work!",
  "Would love conditional logic so I can skip irrelevant questions based on earlier answers. That would make surveys feel much more personal.",
  "The QR code feature is brilliant. I printed it on our event posters and got 3x more responses than our previous Google Form.",
];

const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; Samsung Galaxy S22) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile Safari/537.36",
];

// ── Run ───────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
