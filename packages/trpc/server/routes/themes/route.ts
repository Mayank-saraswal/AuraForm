import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { eq } from "drizzle-orm";
import { db } from "@repo/database";
import { formThemesTable } from "@repo/database";
import { uuidParamSchema } from "@repo/schemas";
import { openApiMeta } from "../../utils/path-generator";

export const themesRouter = router({
  list: publicProcedure
    .meta(openApiMeta("GET", "/themes", ["Themes"]))
    .query(async () => {
      return db.query.formThemesTable.findMany({
        where: eq(formThemesTable.isCustom, false),
        orderBy: (t, { asc }) => [asc(t.name)],
      });
    }),

  getById: publicProcedure
    .meta(openApiMeta("GET", "/themes/{id}", ["Themes"]))
    .input(uuidParamSchema)
    .query(async ({ input }) => {
      const theme = await db.query.formThemesTable.findFirst({
        where: eq(formThemesTable.id, input.id),
      });
      if (!theme) throw new Error("Theme not found.");
      return theme;
    }),
});
