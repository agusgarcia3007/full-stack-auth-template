import { createFileRoute, Link } from "@tanstack/react-router";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Welcome</h1>
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}
