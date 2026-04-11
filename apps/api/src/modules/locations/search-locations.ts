import {
  locationSearchResponseSchema,
  type LocationOption,
} from "@weather-app-plus-recommendations/contracts";

import { fetchOpenMeteoLocationResults } from "./fetch-open-meteo-location-results";
import { mapOpenMeteoLocationResult } from "./map-open-meteo-location-result";

export async function searchLocations(query: string) {
  const providerResults = await fetchOpenMeteoLocationResults(query);

  const normalizedResults = providerResults
    .map(mapOpenMeteoLocationResult)
    .filter((result): result is LocationOption => result !== null);

  return locationSearchResponseSchema.parse(normalizedResults);
}
