// packages/database/index.ts
import "dotenv/config";
import { drizzle }       from "drizzle-orm/node-postgres";
import pg                from "pg";
import * as userSchema   from "./models/user";
import * as formSchema   from "./models/form";
import * as responseSchema from "./models/response";
import * as subscriptionSchema from "./models/subscription";
import * as relationSchema from "./schema";

const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"]!,
  max: 10,
});

// Merge ALL schema objects including relations into one object
const schema = {
  ...userSchema,
  ...formSchema,
  ...responseSchema,
  ...subscriptionSchema,
  ...relationSchema,
};

export const db = drizzle(pool, { schema });

// Re-export everything for use in other packages
export * from "drizzle-orm";
export * from "./schema";
export default db;
