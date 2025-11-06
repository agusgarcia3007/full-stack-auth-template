import AdminDashboard from "@/components/admin-dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminDashboard />;
}
