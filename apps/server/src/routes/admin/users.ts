import { Hono } from "hono";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, count, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/role";
import type { Variables } from "@/types/hono";
import {
  parseQueryParams,
  createPaginatedResponse,
  getOffset,
} from "@/lib/pagination";
import { buildFiltersCondition } from "@/lib/data-table-filters";
import { logger } from "@/lib/logger";
import { ERROR_CODES } from "@/constants/error-codes";

const users = new Hono<{ Variables: Variables }>();

users.use("*", authMiddleware, requireAdmin);

const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["admin", "student"]),
});

const updateUserSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "student"]).optional(),
  password: z.string().min(8).optional(),
});

users.get("/", async (c) => {
  try {
    const { pagination, sorting, filters } = parseQueryParams(c.req.query());

    const whereClause = buildFiltersCondition(filters, {
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    });

    const [{ total }] = await db
      .select({ total: count() })
      .from(usersTable)
      .where(whereClause);

    const columnMap: Record<string, any> = {
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    };

    const orderByClause =
      sorting.length > 0
        ? sorting.map((sort) => {
            const column = columnMap[sort.id] || usersTable.createdAt;
            return sort.desc ? desc(column) : asc(column);
          })
        : [desc(usersTable.createdAt)];

    const allUsers = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(pagination.limit)
      .offset(getOffset(pagination.page, pagination.limit));

    return c.json(createPaginatedResponse(allUsers, total, pagination));
  } catch (error) {
    logger.error("Error fetching users:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

users.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return c.json(
        { error: "User not found", code: ERROR_CODES.USER_NOT_FOUND },
        404
      );
    }

    return c.json({ user });
  } catch (error) {
    logger.error("Error fetching user:", { error });
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

users.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const data = createUserSchema.parse(body);

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
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

    const passwordHash = await hashPassword(data.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      });

    return c.json({ user }, 201);
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
    logger.error("Error creating user:", { error });
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

users.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = updateUserSchema.parse(body);

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!existingUser) {
      return c.json(
        { error: "User not found", code: ERROR_CODES.USER_NOT_FOUND },
        404
      );
    }

    if (data.email && data.email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .limit(1);

      if (emailExists) {
        return c.json(
          {
            error: "Email already registered",
            code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          },
          400
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.password)
      updateData.passwordHash = await hashPassword(data.password);

    const [user] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        role: usersTable.role,
        updatedAt: usersTable.updatedAt,
      });

    return c.json({ user });
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
    logger.error("Error updating user:", { error });
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

users.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const currentUserId = c.get("userId");

    if (id === currentUserId) {
      return c.json(
        {
          error: "Cannot delete your own account",
          code: ERROR_CODES.CANNOT_DELETE_OWN_ACCOUNT,
        },
        400
      );
    }

    const [deletedUser] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    if (!deletedUser) {
      return c.json(
        { error: "User not found", code: ERROR_CODES.USER_NOT_FOUND },
        404
      );
    }

    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user:", { error });
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

export { users };
