import {
  weatherResponseSchema,
  type WeatherPageResponse,
  type WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import { ApiError, getApiErrorMessage } from "./api-error";
import { createApiUrl } from "./client";

export async function getWeather(query: WeatherQuery): Promise<WeatherPageResponse> {
  const url = new URL(createApiUrl("/api/weather"));

  url.searchParams.set("lat", String(query.lat));
  url.searchParams.set("lon", String(query.lon));
  url.searchParams.set("tempUnit", query.tempUnit);
  url.searchParams.set("windUnit", query.windUnit);

  const response = await fetch(url);

  let responseBody: unknown = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const message =
      getApiErrorMessage(responseBody) ?? "Unable to load weather right now.";

    throw new ApiError(message, response.status);
  }

  return weatherResponseSchema.parse(responseBody);
}
