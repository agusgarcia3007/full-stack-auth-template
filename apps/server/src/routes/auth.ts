import { Hono } from "hono";
import { db } from "@/db";
import { usersTable, tokensTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  revokeToken,
  verifyToken,
  getUserActiveSessions,
  revokeSession,
  revokeAllUserTokens,
} from "@/lib/auth";
import { z } from "zod";
import { sendEmail } from "@/lib/send-email";
import { env } from "@/lib/env";
import { ERROR_CODES } from "@/constants/error-codes";
import {
  renderWelcomeVerification,
  renderPasswordReset,
  renderResendVerification,
} from "@/emails/templates";

const auth = new Hono();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const resendVerificationSchema = z.object({
  email: z.email(),
});

auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = registerSchema.parse(body);

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser) {
      return c.json(
        {
          error: "Email already registered",
          code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        },
        400
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          email,
          passwordHash,
          name,
        })
        .returning();

      await tx.insert(tokensTable).values({
        userId: newUser.id,
        token: verificationToken,
        type: "email_verification",
        expiresAt,
      });

      return newUser;
    });

    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, user.role);

    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const emailTemplate = renderWelcomeVerification({ verificationUrl });

    sendEmail(email, emailTemplate.subject, emailTemplate.html).catch((error) =>
      console.error("Failed to send verification email:", error)
    );

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
      message: "Please check your email to verify your account",
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
    console.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return c.json(
        { error: "Invalid credentials", code: ERROR_CODES.INVALID_CREDENTIALS },
        400
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return c.json(
        { error: "Invalid credentials", code: ERROR_CODES.INVALID_CREDENTIALS },
        400
      );
    }

    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, user.role);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
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
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

auth.post("/logout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 400);
    }

    const token = authHeader.substring(7);
    await revokeToken(token);

    return c.json({ message: "Logged out successfully" });
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
});

auth.post("/refresh", async (c) => {
  try {
    const body = await c.req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return c.json(
        {
          error: "Refresh token required",
          code: ERROR_CODES.REFRESH_TOKEN_REQUIRED,
        },
        400
      );
    }

    const userId = await verifyToken(refreshToken);

    if (!userId) {
      return c.json(
        {
          error: "Invalid or expired refresh token",
          code: ERROR_CODES.INVALID_REFRESH_TOKEN,
        },
        400
      );
    }

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

    await revokeToken(refreshToken);

    const accessToken = await generateAccessToken(userId, user.role);
    const newRefreshToken = await generateRefreshToken(userId, user.role);

    return c.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("[AUTH] Token refresh error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

auth.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return c.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(tokensTable).values({
      userId: user.id,
      token: resetToken,
      type: "password_reset",
      expiresAt,
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailTemplate = renderPasswordReset({ resetUrl });

    sendEmail(email, emailTemplate.subject, emailTemplate.html).catch((error) =>
      console.error("Failed to send password reset email:", error)
    );

    return c.json({
      message: "If the email exists, a reset link has been sent",
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
    console.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

auth.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const [resetToken] = await db
      .select()
      .from(tokensTable)
      .where(
        and(
          eq(tokensTable.token, token),
          eq(tokensTable.type, "password_reset"),
          eq(tokensTable.revoked, false)
        )
      )
      .limit(1);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return c.json(
        {
          error: "Invalid or expired reset token",
          code: ERROR_CODES.INVALID_RESET_TOKEN,
        },
        400
      );
    }

    const passwordHash = await hashPassword(password);

    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, resetToken.userId));

    await db
      .update(tokensTable)
      .set({ revoked: true, revokedAt: new Date() })
      .where(eq(tokensTable.id, resetToken.id));

    return c.json({ message: "Password reset successfully" });
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
    console.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

auth.post("/verify-email", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = verifyEmailSchema.parse(body);

    const [verificationToken] = await db
      .select()
      .from(tokensTable)
      .where(
        and(
          eq(tokensTable.token, token),
          eq(tokensTable.type, "email_verification"),
          eq(tokensTable.revoked, false)
        )
      )
      .limit(1);

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return c.json(
        {
          error: "Invalid or expired verification token",
          code: ERROR_CODES.INVALID_TOKEN,
        },
        400
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({ emailVerified: true })
        .where(eq(usersTable.id, verificationToken.userId));

      await tx
        .update(tokensTable)
        .set({ revoked: true, revokedAt: new Date() })
        .where(eq(tokensTable.id, verificationToken.id));
    });

    return c.json({ message: "Email verified successfully" });
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
    console.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

auth.post("/resend-verification", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = resendVerificationSchema.parse(body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return c.json(
        { message: "If the email exists, a verification email has been sent" }
      );
    }

    if (user.emailVerified) {
      return c.json(
        {
          error: "Email already verified",
          code: ERROR_CODES.EMAIL_ALREADY_VERIFIED,
        },
        400
      );
    }

    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.transaction(async (tx) => {
      await tx
        .update(tokensTable)
        .set({ revoked: true, revokedAt: new Date() })
        .where(
          and(
            eq(tokensTable.userId, user.id),
            eq(tokensTable.type, "email_verification"),
            eq(tokensTable.revoked, false)
          )
        );

      await tx.insert(tokensTable).values({
        userId: user.id,
        token: verificationToken,
        type: "email_verification",
        expiresAt,
      });
    });

    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const emailTemplate = renderResendVerification({ verificationUrl });

    sendEmail(email, emailTemplate.subject, emailTemplate.html).catch((error) =>
      console.error("Failed to send verification email:", error)
    );

    return c.json({
      message: "If the email exists, a verification email has been sent",
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
    console.error((error as Error).message);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

export { auth };
