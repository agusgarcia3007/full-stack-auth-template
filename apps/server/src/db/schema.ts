import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "student"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum().notNull().default("student"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("users_email_idx").on(table.email),
]);

export const tokenTypeEnum = pgEnum("token_type", [
  "access",
  "refresh",
  "password_reset",
  "email_verification",
  "email_change",
]);

export const tokensTable = pgTable(
  "tokens",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    type: tokenTypeEnum().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    revoked: boolean().notNull().default(false),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("tokens_token_idx").on(table.token),
    index("tokens_user_id_type_revoked_idx").on(
      table.userId,
      table.type,
      table.revoked
    ),
    index("tokens_expires_at_revoked_idx").on(
      table.expiresAt,
      table.revoked
    ),
  ]
);
