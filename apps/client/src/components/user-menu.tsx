import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSelector } from "@/components/language-selector";
import { useProfile } from "@/services/profile/queries";
import { useLogoutMutation } from "@/services/auth/mutations";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (isError || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate({ to: "/login" })}>
          {t("auth.loginButton")}
        </Button>
        <Button onClick={() => navigate({ to: "/signup" })}>
          {t("auth.signupButton")}
        </Button>
      </div>
    );
  }

  const initials = getUserInitials(profile.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{profile.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {profile.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="w-full cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>{t("userMenu.profile")}</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <LanguageSelector />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={() => logout()}
            className="w-full cursor-pointer"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span>{t("userMenu.logout")}</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
