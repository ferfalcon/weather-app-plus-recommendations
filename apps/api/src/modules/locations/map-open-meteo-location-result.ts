import type { LocationOption } from "@weather-app-plus-recommendations/contracts";

import type { OpenMeteoLocationResult } from "./fetch-open-meteo-location-results";

function getFirstNonEmptyValue(values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export function mapOpenMeteoLocationResult(
  result: OpenMeteoLocationResult,
): LocationOption | null {
  const name = typeof result.name === "string" ? result.name.trim() : "";
  const country = typeof result.country === "string" ? result.country.trim() : "";
  const timezone = typeof result.timezone === "string" ? result.timezone.trim() : "";

  if (!name || !country || !timezone) {
    return null;
  }

  if (typeof result.latitude !== "number" || typeof result.longitude !== "number") {
    return null;
  }

  const region = getFirstNonEmptyValue([
    result.admin1,
    result.admin2,
    result.admin3,
    result.admin4,
  ]);

  return {
    id:
      typeof result.id === "number"
        ? String(result.id)
        : `${name}:${result.latitude}:${result.longitude}`,
    name,
    region,
    country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone,
  };
}
