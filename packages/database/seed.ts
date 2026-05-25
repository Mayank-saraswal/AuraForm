import { db } from "./index";
import { formThemesTable, usersTable, formsTable, formFieldsTable, responsesTable, responseAnswersTable } from "./schema";
import { PREDEFINED_THEMES } from "@repo/schemas";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // 1. Seed all predefined themes
  for (const theme of PREDEFINED_THEMES) {
    await db.insert(formThemesTable).values({
      name: theme.name,
      slug: theme.slug,
      category: theme.category,
      config: theme.config as never,
      isPro: theme.isPro,
      isCustom: false,
    }).onConflictDoNothing();
  }
  console.log("Themes seeded.");

  // 2. Create demo user
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const [demoUser] = await db.insert(usersTable).values({
    fullName: "Demo Creator",
    email: "demo@formcraft.app",
    emailVerified: true,
    passwordHash,
    plan: "pro",
  }).onConflictDoNothing().returning();
  console.log("Demo user seeded:", demoUser?.email);

  // 3. Create 5 sample forms with fields and responses
  // (see full seed script in docs — forms: Netflix Watchlist, Jaipur Tourism,
  //  Startup Validator, Anime Poll, WhatsApp Feature Request)

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
