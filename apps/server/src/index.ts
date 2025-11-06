import { env } from "@/lib/env";
import { limiter } from "@/lib/limiter";
import { securityHeaders } from "@/middleware/security";
import { account } from "@/routes/account";
import { dashboard } from "@/routes/admin/dashboard";
import { users } from "@/routes/admin/users";
import { auth } from "@/routes/auth";
import { sessions } from "@/routes/sessions";
import type { Variables } from "@/types/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serveStatic } from "hono/bun";

const app = new Hono<{ Variables: Variables }>()
  .use(logger())
  .use(prettyJSON())
  .use(securityHeaders)
  .use(cors())
  .use(limiter);

app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

app.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.route("/auth", auth);
app.route("/admin/dashboard", dashboard);
app.route("/admin/users", users);
app.route("/sessions", sessions);
app.route("/account", account);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
