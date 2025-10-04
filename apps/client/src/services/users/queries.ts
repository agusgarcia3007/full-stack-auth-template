import { useQuery } from "@tanstack/react-query";
import { usersOptions } from "./options";
import type { UsersListParams } from "./service";

export function useUsersList(params?: UsersListParams) {
  return useQuery(usersOptions.list(params));
}

export function useUser(id: string) {
  return useQuery(usersOptions.detail(id));
}
