import { createFileRoute } from "@tanstack/react-router";
import { SessionsList } from "@/components/sessions/sessions-list";

export const Route = createFileRoute("/profile/sessions")({
  component: ProfileSessions,
});

function ProfileSessions() {
  return <SessionsList />;
}
