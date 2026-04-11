import { Outlet, createRootRoute } from "@tanstack/react-router";

import { AppShell } from "../app/app-shell";

function RootComponent() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
