import { queryOptions } from "@tanstack/react-query";
import { profileService, profileKeys } from "./service";
import { getAccessToken } from "@/lib/auth";

export const profileOptions = {
  get: () =>
    queryOptions({
      queryKey: profileKeys.get(),
      queryFn: () => profileService.getProfile(),
      enabled: !!getAccessToken(),
    }),
};
