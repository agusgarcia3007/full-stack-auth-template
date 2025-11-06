import { http } from "@/lib/http";

export interface DashboardMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  period: {
    start: string;
    end: string;
    days: number;
  };
  dailyRegistrations: Array<{
    date: string;
    value: number;
  }>;
}

export const dashboardKeys = {
  all: () => ["dashboard"] as const,
  metrics: () => [...dashboardKeys.all(), "metrics"] as const,
};

export const dashboardService = {
  getMetrics: async () => {
    const { data } = await http.get<DashboardMetrics>("/admin/dashboard/metrics");
    return data;
  },
};
