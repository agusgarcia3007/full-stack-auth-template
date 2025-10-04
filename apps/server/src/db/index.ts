import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// You can specify any property from the postgres-js connection options
export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
  },
  schema,
});
