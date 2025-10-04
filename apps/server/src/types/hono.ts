import type { UserRole } from "./user";

export type Variables = {
  userId: string;
  token: string;
  userRole?: UserRole;
};
