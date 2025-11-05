import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { enUS, es, ptBR } from "date-fns/locale";
import type { Session } from "@/services/sessions/service";

interface SessionCardProps {
  session: Session;
  isCurrent: boolean;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

export function SessionCard({
  session,
  isCurrent,
  onRevoke,
  isRevoking,
}: SessionCardProps) {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    switch (i18n.language) {
      case "es":
        return es;
      case "pt":
        return ptBR;
      default:
        return enUS;
    }
  };

  const createdAtFormatted = formatDistanceToNow(new Date(session.createdAt), {
    addSuffix: true,
    locale: getLocale(),
  });

  const expiresAtFormatted = formatDistanceToNow(new Date(session.expiresAt), {
    addSuffix: true,
    locale: getLocale(),
  });

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {t("profile.sessions.sessionTitle", "Active Session")}
            </p>
            {isCurrent && (
              <Badge variant="secondary" className="text-xs">
                {t("profile.sessions.currentSession", "Current")}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {t("profile.sessions.createdAt", {
              defaultValue: "Created {{time}}",
              time: createdAtFormatted,
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            {t("profile.sessions.expiresAt", {
              defaultValue: "Expires {{time}}",
              time: expiresAtFormatted,
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={isCurrent || isRevoking}
          onClick={() => onRevoke(session.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
