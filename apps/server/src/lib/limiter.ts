import { rateLimiter } from "hono-rate-limiter";

export const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) =>
    c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "",
});
