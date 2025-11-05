import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { getAccessToken } from "@/lib/auth";
import { User, Smartphone } from "lucide-react";

export const Route = createFileRoute("/profile")({
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
  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-2">
          <Link
            to="/profile"
            activeProps={{
              className: "font-medium text-primary",
            }}
            inactiveProps={{
              className: "text-muted-foreground hover:text-foreground",
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <User className="h-4 w-4" />
            General
          </Link>
          <Link
            to="/profile/sessions"
            activeProps={{
              className: "font-medium text-primary",
            }}
            inactiveProps={{
              className: "text-muted-foreground hover:text-foreground",
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <Smartphone className="h-4 w-4" />
            Sessions
          </Link>
        </aside>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
