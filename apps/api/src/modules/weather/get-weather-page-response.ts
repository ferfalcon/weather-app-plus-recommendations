import type { FastifyBaseLogger } from "fastify";

import type {
  LocationOption,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";
import { weatherResponseSchema } from "@weather-app-plus-recommendations/contracts";

import type { ApiRuntimeConfig } from "../../lib/get-server-config";
import { getRecommendations } from "../recommendations/get-recommendations";
import { searchLocations } from "../locations/search-locations";
import {
  buildOpenMeteoWeatherForecastRequestUrl,
  fetchOpenMeteoWeatherForecast,
  WeatherProviderError,
  type OpenMeteoForecastResponse,
} from "./fetch-open-meteo-weather-forecast";
import { mapOpenMeteoWeatherResponse } from "./map-open-meteo-weather-response";

function formatTimezoneToken(value: string) {
  return value.replaceAll("_", " ").trim();
}

function getTimezoneSearchTerm(timezone: string) {
  const timezoneParts = timezone.split("/").filter(Boolean);
  const searchToken = timezoneParts.at(-1);

  if (!searchToken) {
    return null;
  }

  const normalizedToken = formatTimezoneToken(searchToken);

  return normalizedToken.length > 0 ? normalizedToken : null;
}

function calculateDistanceScore(
  candidate: LocationOption,
  latitude: number,
  longitude: number,
) {
  return (
    Math.abs(candidate.latitude - latitude) +
    Math.abs(candidate.longitude - longitude)
  );
}

function buildFallbackLocation(
  forecast: OpenMeteoForecastResponse,
  query: WeatherQuery,
): LocationOption {
  const timezone =
    typeof forecast.timezone === "string" && forecast.timezone.trim().length > 0
      ? forecast.timezone.trim()
      : "UTC";
  const timezoneParts = timezone.split("/").filter(Boolean);
  const fallbackName =
    timezoneParts.length > 0
      ? formatTimezoneToken(timezoneParts.at(-1) ?? "")
      : `${query.lat.toFixed(2)}, ${query.lon.toFixed(2)}`;
  const fallbackCountry =
    timezoneParts.length > 1
      ? formatTimezoneToken(timezoneParts[0] ?? "")
      : timezone;

  return {
    id: `weather:${query.lat.toFixed(4)}:${query.lon.toFixed(4)}`,
    name: fallbackName || `${query.lat.toFixed(2)}, ${query.lon.toFixed(2)}`,
    country: fallbackCountry || timezone,
    latitude: query.lat,
    longitude: query.lon,
    timezone,
  };
}

async function resolveWeatherLocation(
  forecast: OpenMeteoForecastResponse,
  query: WeatherQuery,
) {
  const fallbackLocation = buildFallbackLocation(forecast, query);
  const searchTerm = getTimezoneSearchTerm(fallbackLocation.timezone);

  if (!searchTerm) {
    return fallbackLocation;
  }

  try {
    const matchingLocations = await searchLocations(searchTerm);
    const timezoneMatches = matchingLocations.filter(
      (location) => location.timezone === fallbackLocation.timezone,
    );
    const candidates = timezoneMatches.length > 0 ? timezoneMatches : matchingLocations;
    const nearestLocation = candidates.sort((left, right) => {
      return (
        calculateDistanceScore(left, query.lat, query.lon) -
        calculateDistanceScore(right, query.lat, query.lon)
      );
    })[0];

    return nearestLocation ?? fallbackLocation;
  } catch {
    return fallbackLocation;
  }
}

export async function getWeatherPageResponse(
  query: WeatherQuery,
  runtimeConfig: ApiRuntimeConfig,
  logger?: {
    info: FastifyBaseLogger["info"];
  },
) {
  const forecast = await fetchOpenMeteoWeatherForecast(query);
  const location = await resolveWeatherLocation(forecast, query);
  const requestUrl = buildOpenMeteoWeatherForecastRequestUrl(query);
  let mappedWeather: ReturnType<typeof mapOpenMeteoWeatherResponse>;

  try {
    mappedWeather = mapOpenMeteoWeatherResponse({
      forecast,
      location,
      query,
    });
  } catch (error) {
    throw new WeatherProviderError(
      "Open-Meteo weather response was missing required fields.",
      {
        cause: error,
        requestUrl,
        responseBodyText: undefined,
        status: 200,
      },
    );
  }

  const recommendations = await getRecommendations({
    current: mappedWeather.current,
    daily: mappedWeather.daily,
    geminiApiKey: runtimeConfig.geminiApiKey,
    logger,
    units: mappedWeather.units,
  });

  return weatherResponseSchema.parse({
    ...mappedWeather,
    recommendations,
  });
}
