import { queryOptions } from "@tanstack/react-query";
import { dashboardKeys, dashboardService } from "./service";

export const dashboardOptions = {
  metrics: () =>
    queryOptions({
      queryKey: dashboardKeys.metrics(),
      queryFn: dashboardService.getMetrics,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    }),
};
