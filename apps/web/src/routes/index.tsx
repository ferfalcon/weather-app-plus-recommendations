import { createFileRoute } from "@tanstack/react-router";

import { LocationSearchEmptyState } from "../features/location-search/components/location-search-empty-state";
import { validateLocationSearchPageSearch } from "../features/location-search/location-search-page-search";

function HomePage() {
  return <LocationSearchEmptyState />;
}

export const Route = createFileRoute("/")({
  component: HomePage,
  validateSearch: validateLocationSearchPageSearch,
});
