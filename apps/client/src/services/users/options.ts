import { queryOptions } from "@tanstack/react-query";
import { usersService, usersKeys, type UsersListParams } from "./service";

export const usersOptions = {
  list: (params?: UsersListParams) =>
    queryOptions({
      queryKey: usersKeys.list(params),
      queryFn: () => usersService.getUsers(params),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: usersKeys.detail(id),
      queryFn: () => usersService.getUser(id),
    }),
};
