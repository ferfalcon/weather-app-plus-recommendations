import type { LocationOption } from "@weather-app-plus-recommendations/contracts";

export function formatLocationLabel(location: LocationOption) {
  const regionDetails = location.region
    ? `${location.region}, ${location.country}`
    : location.country;

  return `${location.name}, ${regionDetails}`;
}
