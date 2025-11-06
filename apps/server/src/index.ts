import { env } from "@/lib/env";
import { limiter } from "@/lib/limiter";
import { account } from "@/routes/account";
import { users } from "@/routes/admin/users";
import { auth } from "@/routes/auth";
import { sessions } from "@/routes/sessions";
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

app.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.route("/auth", auth);
app.route("/admin/users", users);
app.route("/sessions", sessions);
app.route("/account", account);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
