import { createFileRoute } from "@tanstack/react-router";

import { LocationSearchEmptyState } from "../features/location-search/components/location-search-empty-state";

function HomePage() {
  return <LocationSearchEmptyState />;
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
