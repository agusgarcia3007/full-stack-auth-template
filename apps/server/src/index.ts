import { env } from "@/lib/env";
import { limiter } from "@/lib/limiter";
import { auth } from "@/routes/auth";
import { users } from "@/routes/admin/users";
import type { Variables } from "@/types/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono<{ Variables: Variables }>()
  .use(logger())
  .use(prettyJSON())
  .use(cors())
  .use(limiter);

app.route("/auth", auth);
app.route("/admin/users", users);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
