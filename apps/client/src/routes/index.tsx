import { createFileRoute } from "@tanstack/react-router";
import { LanguageSelector } from "@/components/language-selector";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Welcome</h1>
        <LanguageSelector />
      </div>
    </div>
  );
}
