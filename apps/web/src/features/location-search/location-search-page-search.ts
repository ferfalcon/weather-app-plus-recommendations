import type {
  LocationOption,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

type SearchRecord = Record<string, unknown>;

export type LocationSearchPageSearch = {
  country?: string;
  lat?: number;
  locationId?: string;
  name?: string;
  lon?: number;
  q?: string;
  region?: string;
  tempUnit: WeatherQuery["tempUnit"];
  timezone?: string;
  windUnit: WeatherQuery["windUnit"];
};

function parseOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return undefined;
}

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function parseTemperatureUnit(value: unknown): WeatherQuery["tempUnit"] {
  return value === "fahrenheit" ? "fahrenheit" : "celsius";
}

function parseWindUnit(value: unknown): WeatherQuery["windUnit"] {
  return value === "mph" ? "mph" : "kmh";
}

export function validateLocationSearchPageSearch(
  search: SearchRecord,
): LocationSearchPageSearch {
  const country = parseOptionalString(search.country);
  const lat = parseOptionalNumber(search.lat);
  const locationId = parseOptionalString(search.locationId);
  const lon = parseOptionalNumber(search.lon);
  const name = parseOptionalString(search.name);
  const q = parseOptionalString(search.q);
  const region = parseOptionalString(search.region);
  const timezone = parseOptionalString(search.timezone);

  return {
    ...(country ? { country } : {}),
    ...(lat !== undefined ? { lat } : {}),
    ...(locationId ? { locationId } : {}),
    ...(lon !== undefined ? { lon } : {}),
    ...(name ? { name } : {}),
    ...(q ? { q } : {}),
    ...(region ? { region } : {}),
    tempUnit: parseTemperatureUnit(search.tempUnit),
    ...(timezone ? { timezone } : {}),
    windUnit: parseWindUnit(search.windUnit),
  };
}

export function buildSelectedLocationFromSearch(
  search: LocationSearchPageSearch,
): LocationOption | null {
  if (
    !search.locationId ||
    !search.name ||
    !search.country ||
    !search.timezone ||
    search.lat === undefined ||
    search.lon === undefined
  ) {
    return null;
  }

  return {
    country: search.country,
    id: search.locationId,
    latitude: search.lat,
    longitude: search.lon,
    name: search.name,
    region: search.region,
    timezone: search.timezone,
  };
}
