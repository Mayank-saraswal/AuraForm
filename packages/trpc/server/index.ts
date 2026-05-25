import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { formsRouter } from "./routes/forms/route";
import { fieldsRouter } from "./routes/fields/route";
import { responsesRouter } from "./routes/responses/route";
import { themesRouter } from "./routes/themes/route";
import { paymentsRouter } from "./routes/payments/route";

export * from "./context";
export { auth } from "./auth";

export const serverRouter = router({
  health: healthRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  themes: themesRouter,
  payments: paymentsRouter,
});

export type ServerRouter = typeof serverRouter;
