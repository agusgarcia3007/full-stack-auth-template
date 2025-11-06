import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/services/dashboard/queries";
import { CircleDollarSign, TrendingUp, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  const businessCards = [
    {
      title: t("dashboard.totalUsers.title"),
      period: t("dashboard.totalUsers.period"),
      key: "totalUsers" as const,
      dataKey: "dailyRegistrations" as const,
      color: "var(--color-emerald-500)",
      icon: CircleDollarSign,
      gradientId: "totalUsersGradient",
    },
    {
      title: t("dashboard.newUsers.title"),
      period: t("dashboard.newUsers.period"),
      key: "newUsers" as const,
      dataKey: "dailyRegistrations" as const,
      color: "var(--color-blue-500)",
      icon: UserPlus,
      gradientId: "newUsersGradient",
    },
    {
      title: t("dashboard.activeUsers.title"),
      period: t("dashboard.activeUsers.period"),
      key: "activeUsers" as const,
      dataKey: "dailyRegistrations" as const,
      color: "var(--color-violet-500)",
      icon: TrendingUp,
      gradientId: "activeUsersGradient",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>

                <div className="flex items-end gap-2.5 justify-between">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-16" />
                  </div>

                  <Skeleton className="max-w-40 h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-destructive">{t("dashboard.error")}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {businessCards.map((card, i) => {
          const Icon = card.icon;
          const value = metrics[card.key];
          const chartData = metrics[card.dataKey];

          return (
            <Card key={i} className="flex flex-col">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon className="size-5" style={{ color: card.color }} />
                  <span className="text-base font-semibold">{card.title}</span>
                </div>

                <div className="flex items-end gap-2.5 justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {card.period}
                    </div>

                    <div className="text-3xl font-bold text-foreground tracking-tight">
                      {value.toLocaleString()}
                    </div>
                  </div>

                  <div className="max-w-40 h-16 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 5,
                          left: 5,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id={card.gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={card.color}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="100%"
                              stopColor={card.color}
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                          <filter
                            id={`dotShadow${i}`}
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                          >
                            <feDropShadow
                              dx="2"
                              dy="2"
                              stdDeviation="3"
                              floodColor="rgba(0,0,0,0.5)"
                            />
                          </filter>
                        </defs>

                        <Tooltip
                          cursor={{
                            stroke: card.color,
                            strokeWidth: 1,
                            strokeDasharray: "2 2",
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value as number;

                              return (
                                <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
                                  <p className="text-sm font-semibold text-foreground">
                                    {value}{" "}
                                    {value === 1
                                      ? t("dashboard.tooltip.user")
                                      : t("dashboard.tooltip.users")}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={card.color}
                          fill={`url(#${card.gradientId})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: card.color,
                            stroke: "white",
                            strokeWidth: 2,
                            filter: `url(#dotShadow${i})`,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
