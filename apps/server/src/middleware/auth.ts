import { createMiddleware } from "hono/factory";
import { verifyToken } from "@/lib/auth";
import type { Variables } from "@/types/hono";

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }

  const token = authHeader.substring(7);
  const userId = await verifyToken(token);

  if (!userId) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("userId", userId);
  c.set("token", token);

  await next();
});
