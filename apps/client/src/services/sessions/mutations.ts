import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsKeys, sessionsService } from "./service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { catchAxiosError } from "@/lib/catch-axios-error";

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (sessionId: string) => sessionsService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.list() });
      toast.success(t("profile.sessions.sessionRevoked") as string);
    },
    onError: catchAxiosError,
  });
};

export const useRevokeAllSessionsMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => sessionsService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.list() });
      toast.success(t("profile.sessions.allSessionsRevoked") as string);
    },
    onError: catchAxiosError,
  });
};
