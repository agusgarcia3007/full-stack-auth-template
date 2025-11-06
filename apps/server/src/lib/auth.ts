import { db } from "@/db";
import { tokensTable } from "@/db/schema";
import { env } from "@/lib/env";
import { and, eq, lt } from "drizzle-orm";
import { sign, verify } from "hono/jwt";

export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
  });
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

async function hashToken(token: string): Promise<string> {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(token);
  return hasher.digest("hex");
}

export async function generateAccessToken(userId: string, role: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const payload = {
    sub: userId,
    role,
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
  };

  const token = await sign(payload, env.JWT_SECRET);
  const tokenHash = await hashToken(token);

  await db.insert(tokensTable).values({
    userId,
    token: tokenHash,
    type: "access",
    expiresAt,
  });

  return token;
}

export async function generateRefreshToken(userId: string, role: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const payload = {
    sub: userId,
    role,
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
  };

  const token = await sign(payload, env.JWT_SECRET);
  const tokenHash = await hashToken(token);

  await db.insert(tokensTable).values({
    userId,
    token: tokenHash,
    type: "refresh",
    expiresAt,
  });

  return token;
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const payload = await verify(token, env.JWT_SECRET);
    const tokenHash = await hashToken(token);

    const [dbToken] = await db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.token, tokenHash))
      .limit(1);

    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      return null;
    }

    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function revokeToken(token: string): Promise<void> {
  const tokenHash = await hashToken(token);
  await db
    .update(tokensTable)
    .set({
      revoked: true,
      revokedAt: new Date(),
    })
    .where(eq(tokensTable.token, tokenHash));
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await db
    .update(tokensTable)
    .set({
      revoked: true,
      revokedAt: new Date(),
    })
    .where(eq(tokensTable.userId, userId));
}

export async function getUserActiveSessions(userId: string) {
  const sessions = await db
    .select({
      id: tokensTable.id,
      createdAt: tokensTable.createdAt,
      expiresAt: tokensTable.expiresAt,
    })
    .from(tokensTable)
    .where(
      and(
        eq(tokensTable.userId, userId),
        eq(tokensTable.type, "refresh"),
        eq(tokensTable.revoked, false)
      )
    );

  return sessions;
}

export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(tokensTable)
    .set({
      revoked: true,
      revokedAt: new Date(),
    })
    .where(
      and(
        eq(tokensTable.id, sessionId),
        eq(tokensTable.userId, userId),
        eq(tokensTable.type, "refresh")
      )
    )
    .returning();

  return result.length > 0;
}

export async function cleanupRevokedTokens(userId?: string): Promise<void> {
  const conditions = [
    eq(tokensTable.revoked, true),
    lt(tokensTable.expiresAt, new Date())
  ];

  if (userId) {
    conditions.push(eq(tokensTable.userId, userId));
  }

  await db
    .delete(tokensTable)
    .where(and(...conditions));
}
