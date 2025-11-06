import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getAccessToken } from "@/lib/auth";
import { User, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionsList } from "@/components/sessions/sessions-list";
import { useProfile } from "@/services/profile/queries";

const profileSearchSchema = z.object({
  tab: z.enum(["general", "sessions"]).optional().default("general"),
});

export const Route = createFileRoute("/__app/profile")({
  validateSearch: profileSearchSchema,
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tab } = Route.useSearch();
  const { data: profile, isLoading } = useProfile();

  const handleTabChange = (value: string) => {
    navigate({
      to: "/profile",
      search: { tab: value as "general" | "sessions" },
    });
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="font-bold text-2xl md:text-3xl">{t("profile.title")}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{t("profile.description")}</p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="w-full md:w-fit grid grid-cols-2 md:flex">
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t("profile.tabs.general")}</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">{t("profile.tabs.sessions")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.general.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ) : profile ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.general.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("profile.general.name")}</p>
                  <p className="text-sm text-muted-foreground">{profile.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("profile.general.email")}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("profile.general.userId")}</p>
                  <p className="text-sm text-muted-foreground">{profile.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("profile.general.role")}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
