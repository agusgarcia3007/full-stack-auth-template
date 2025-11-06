import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__app/")({
  component: Index,
});

function Index() {
  return (
    <div className="container mx-auto p-8">{`online: ${
      navigator.onLine
    } at ${new Date().toLocaleString()}`}</div>
  );
}
