import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { SessionCard } from "./session-card";
import { useSessionsQuery } from "@/services/sessions/queries";
import {
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
} from "@/services/sessions/mutations";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SessionsList() {
  const { t } = useTranslation();
  const { data: sessions, isLoading, error } = useSessionsQuery();
  const revokeSessionMutation = useRevokeSessionMutation();
  const revokeAllMutation = useRevokeAllSessionsMutation();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  const handleRevokeAll = () => {
    revokeAllMutation.mutate();
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("profile.sessions.title", "Active Sessions")}
          </CardTitle>
          <CardDescription>
            {t(
              "profile.sessions.description",
              "Manage your active sessions across devices"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("profile.sessions.title", "Active Sessions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              {t("profile.sessions.error", "Failed to load sessions")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSessionId = sessions?.[0]?.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {t("profile.sessions.title", "Active Sessions")}
            </CardTitle>
            <CardDescription>
              {t(
                "profile.sessions.description",
                "Manage your active sessions across devices"
              )}
            </CardDescription>
          </div>
          {sessions && sessions.length > 1 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {t(
                    "profile.sessions.revokeAllOthers",
                    "Close all other sessions"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t(
                      "profile.sessions.confirmRevokeAllTitle",
                      "Are you sure?"
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "profile.sessions.confirmRevokeAll",
                      "This will close all other active sessions. You will need to log in again on those devices."
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button onClick={handleRevokeAll}>
                    {t("common.confirm", "Confirm")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!sessions || sessions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle />
              </EmptyMedia>
              <EmptyTitle>
                {t("profile.sessions.noSessions", "No active sessions")}
              </EmptyTitle>
              <EmptyDescription>
                {t(
                  "profile.sessions.noSessionsDescription",
                  "You don't have any active sessions"
                )}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrent={index === 0 || session.id === currentSessionId}
              onRevoke={handleRevokeSession}
              isRevoking={revokeSessionMutation.isPending}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
