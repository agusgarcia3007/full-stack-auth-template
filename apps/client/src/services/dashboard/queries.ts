import { useQuery } from "@tanstack/react-query";
import { dashboardOptions } from "./options";

export function useDashboardMetrics() {
  return useQuery(dashboardOptions.metrics());
}
