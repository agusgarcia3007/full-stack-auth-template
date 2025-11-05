import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserRole, getAccessToken, decodeJWT } from "@/lib/auth";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/profile/")({
  component: ProfileIndex,
});

function ProfileIndex() {
  const { t } = useTranslation();
  const role = getUserRole();
  const token = getAccessToken();
  const payload = token ? decodeJWT(token) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.general.title", "Profile Information")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("profile.general.userId", "User ID")}
          </p>
          <p className="text-sm text-muted-foreground">{payload?.sub}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("profile.general.role", "Role")}
          </p>
          <p className="text-sm text-muted-foreground capitalize">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}
