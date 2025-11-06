import { Hono } from "hono";
import { db } from "@/db";
import { tokensTable, usersTable } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/role";
import type { Variables } from "@/types/hono";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { ERROR_CODES } from "@/constants/error-codes";

const dashboard = new Hono<{ Variables: Variables }>();

dashboard.use("*", authMiddleware, requireAdmin);

dashboard.get("/metrics", async (c) => {
  try {
    const now = new Date();
    const twentyEightDaysAgo = new Date(now);
    twentyEightDaysAgo.setDate(now.getDate() - 28);

    const [
      totalUsersResult,
      newUsersResult,
      activeUsersResult,
      dailyRegistrationsData,
    ] = await Promise.all([
      db.select({ count: count() }).from(usersTable),
      db
        .select({ count: count() })
        .from(usersTable)
        .where(gte(usersTable.createdAt, twentyEightDaysAgo)),
      db
        .select({
          count: sql<number>`COUNT(DISTINCT ${usersTable.id})`,
        })
        .from(usersTable)
        .innerJoin(tokensTable, eq(tokensTable.userId, usersTable.id))
        .where(
          and(
            gte(tokensTable.createdAt, twentyEightDaysAgo),
            eq(tokensTable.type, "access"),
            eq(tokensTable.revoked, false)
          )
        ),
      db
        .select({
          date: sql<string>`DATE(${usersTable.createdAt})`,
          count: count(),
        })
        .from(usersTable)
        .where(gte(usersTable.createdAt, twentyEightDaysAgo))
        .groupBy(sql`DATE(${usersTable.createdAt})`)
        .orderBy(sql`DATE(${usersTable.createdAt})`),
    ]);

    const dataMap = new Map(
      dailyRegistrationsData.map((r) => [r.date, Number(r.count)])
    );

    const dailyRegistrations = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyRegistrations.push({
        date: dateStr,
        value: dataMap.get(dateStr) ?? 0,
      });
    }

    return c.json({
      totalUsers: Number(totalUsersResult[0]?.count ?? 0),
      newUsers: Number(newUsersResult[0]?.count ?? 0),
      activeUsers: Number(activeUsersResult[0]?.count ?? 0),
      period: {
        start: twentyEightDaysAgo.toISOString(),
        end: now.toISOString(),
        days: 28,
      },
      dailyRegistrations,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return c.json(
      { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR },
      500
    );
  }
});

export { dashboard };
