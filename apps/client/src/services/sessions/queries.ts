import { useQuery } from "@tanstack/react-query";
import { sessionsKeys, sessionsService } from "./service";

export const useSessionsQuery = () => {
  return useQuery({
    queryKey: sessionsKeys.list(),
    queryFn: () => sessionsService.getSessions(),
  });
};
