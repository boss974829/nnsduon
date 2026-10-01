import { createFileRoute } from "@tanstack/react-router";
import { RollcallApp } from "@/components/rollcall-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <RollcallApp />;
}
