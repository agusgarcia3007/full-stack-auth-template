import { db } from "@/db";
import { tokensTable } from "@/db/schema";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";
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

  await db.insert(tokensTable).values({
    userId,
    token,
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

  await db.insert(tokensTable).values({
    userId,
    token,
    type: "refresh",
    expiresAt,
  });

  return token;
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const payload = await verify(token, env.JWT_SECRET);

    const [dbToken] = await db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.token, token))
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
  await db
    .update(tokensTable)
    .set({
      revoked: true,
      revokedAt: new Date(),
    })
    .where(eq(tokensTable.token, token));
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
