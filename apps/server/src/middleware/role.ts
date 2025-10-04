import { createMiddleware } from "hono/factory";
import type { Variables } from "@/types/hono";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UserRole } from "@/types/user";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      columns: {
        role: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return c.json(
        {
          error: "Forbidden",
          message: "You don't have permission to access this resource",
        },
        403
      );
    }

    c.set("userRole", user.role as UserRole);
    await next();
  });
};

export const requireAdmin = requireRole(UserRole.ADMIN);
