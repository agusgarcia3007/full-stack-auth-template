import { Hono } from "hono";
import type { Variables } from "@/types/hono";
import { authMiddleware } from "@/middleware/auth";
import { getUserActiveSessions, revokeSession, revokeAllUserTokens } from "@/lib/auth";
import { ERROR_CODES } from "@/constants/error-codes";
import { logger } from "@/lib/logger";
import { z } from "zod";

const sessions = new Hono<{ Variables: Variables }>();

sessions.use("*", authMiddleware);

const revokeSessionSchema = z.object({
  sessionId: z.uuid(),
});

sessions.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const activeSessions = await getUserActiveSessions(userId);

    return c.json({ sessions: activeSessions });
  } catch (error) {
    logger.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

sessions.delete("/:sessionId", async (c) => {
  try {
    const userId = c.get("userId");
    const { sessionId } = revokeSessionSchema.parse({
      sessionId: c.req.param("sessionId"),
    });

    const success = await revokeSession(sessionId, userId);

    if (!success) {
      return c.json(
        {
          error: "Session not found or already revoked",
          code: ERROR_CODES.INVALID_TOKEN,
        },
        404
      );
    }

    return c.json({ message: "Session revoked successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: "Invalid input",
          code: ERROR_CODES.INVALID_INPUT,
          details: error.issues,
        },
        400
      );
    }
    logger.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

sessions.delete("/", async (c) => {
  try {
    const userId = c.get("userId");
    await revokeAllUserTokens(userId);

    return c.json({ message: "All sessions revoked successfully" });
  } catch (error) {
    logger.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

export { sessions };
