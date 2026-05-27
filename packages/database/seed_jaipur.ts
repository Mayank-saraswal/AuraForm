import { db } from "./index";
import { formThemesTable } from "./models/form";
import { PREDEFINED_THEMES } from "@repo/schemas";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding Jaipur themes...");
  const newThemes = PREDEFINED_THEMES.filter(t => t.slug === "jaipur-corporate" || t.slug === "amer-fort");
  
  for (const t of newThemes) {
    const existing = await db.query.formThemesTable.findFirst({
      where: eq(formThemesTable.slug, t.slug),
    });
    
    if (!existing) {
      await db.insert(formThemesTable).values({
        name: t.name,
        slug: t.slug,
        category: t.category,
        isPro: t.isPro,
        config: t.config,
        isCustom: false,
      });
      console.log(`Inserted ${t.slug}`);
    } else {
      console.log(`${t.slug} already exists.`);
    }
  }
  
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
