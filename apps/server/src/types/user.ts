export const UserRole = {
  ADMIN: "admin",
  STUDENT: "student",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
