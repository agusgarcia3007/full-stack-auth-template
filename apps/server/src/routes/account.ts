import { Hono } from "hono";
import type { Variables } from "@/types/hono";
import { authMiddleware } from "@/middleware/auth";
import { db } from "@/db";
import { usersTable, tokensTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, verifyPassword, revokeAllUserTokens } from "@/lib/auth";
import { sendEmail } from "@/lib/send-email";
import { env } from "@/lib/env";
import { ERROR_CODES } from "@/constants/error-codes";
import { z } from "zod";
import { renderEmailChangeVerification } from "@/emails/templates";

const account = new Hono<{ Variables: Variables }>();

account.use("*", authMiddleware);

account.get("/profile", async (c) => {
  try {
    const userId = c.get("userId");

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return c.json(
        { error: "User not found", code: ERROR_CODES.USER_NOT_FOUND },
        404
      );
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const changeEmailSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const verifyEmailChangeSchema = z.object({
  token: z.string(),
});

account.patch("/password", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return c.json(
        { error: "User not found", code: ERROR_CODES.USER_NOT_FOUND },
        404
      );
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return c.json(
        {
          error: "Current password is incorrect",
          code: ERROR_CODES.INVALID_CREDENTIALS,
        },
        400
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({ passwordHash: newPasswordHash })
        .where(eq(usersTable.id, userId));

      await tx
        .update(tokensTable)
        .set({ revoked: true, revokedAt: new Date() })
        .where(eq(tokensTable.userId, userId));
    });

    return c.json({
      message: "Password changed successfully. Please log in again.",
    });
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
    console.error(error);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

account.patch("/email", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { email, password } = changeEmailSchema.parse(body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return c.json(
        { error: "User not found", code: ERROR_CODES.USER_NOT_FOUND },
        404
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return c.json(
        {
          error: "Password is incorrect",
          code: ERROR_CODES.INVALID_CREDENTIALS,
        },
        400
      );
    }

    const [existingEmail] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingEmail) {
      return c.json(
        {
          error: "Email already in use",
          code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        },
        400
      );
    }

    const changeToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.transaction(async (tx) => {
      await tx
        .update(tokensTable)
        .set({ revoked: true, revokedAt: new Date() })
        .where(
          and(
            eq(tokensTable.userId, userId),
            eq(tokensTable.type, "email_change"),
            eq(tokensTable.revoked, false)
          )
        );

      await tx.insert(tokensTable).values({
        userId,
        token: changeToken,
        type: "email_change",
        expiresAt,
      });
    });

    const verificationUrl = `${env.CLIENT_URL}/verify-email-change?token=${changeToken}&email=${encodeURIComponent(email)}`;
    const emailTemplate = renderEmailChangeVerification({ verificationUrl });

    sendEmail(email, emailTemplate.subject, emailTemplate.html).catch((error) =>
      console.error("Failed to send email change verification:", error)
    );

    return c.json({
      message: "Verification email sent. Please check your new email address.",
    });
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
    console.error(error);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

account.post("/verify-email-change", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = verifyEmailChangeSchema.parse(body);

    const [changeToken] = await db
      .select()
      .from(tokensTable)
      .where(
        and(
          eq(tokensTable.token, token),
          eq(tokensTable.type, "email_change"),
          eq(tokensTable.revoked, false)
        )
      )
      .limit(1);

    if (!changeToken || changeToken.expiresAt < new Date()) {
      return c.json(
        {
          error: "Invalid or expired token",
          code: ERROR_CODES.INVALID_TOKEN,
        },
        400
      );
    }

    const newEmail = c.req.query("email");
    if (!newEmail) {
      return c.json(
        {
          error: "Email parameter required",
          code: ERROR_CODES.INVALID_INPUT,
        },
        400
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({ email: newEmail, emailVerified: false })
        .where(eq(usersTable.id, changeToken.userId));

      await tx
        .update(tokensTable)
        .set({ revoked: true, revokedAt: new Date() })
        .where(eq(tokensTable.userId, changeToken.userId));
    });

    return c.json({
      message:
        "Email changed successfully. Please log in again and verify your new email.",
    });
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
    console.error(error);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

export { account };
