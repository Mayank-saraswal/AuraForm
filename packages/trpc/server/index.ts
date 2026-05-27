import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { formsRouter } from "./routes/forms/route";
import { fieldsRouter } from "./routes/fields/route";
import { responsesRouter } from "./routes/responses/route";
import { themesRouter } from "./routes/themes/route";
import { paymentsRouter } from "./routes/payments/route";
import { authRouter } from "./routes/auth/route";

export * from "./context";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  themes: themesRouter,
  payments: paymentsRouter,
});

export type ServerRouter = typeof serverRouter;
