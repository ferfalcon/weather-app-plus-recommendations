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

  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new ApiError(
      "The app API is still starting or unavailable. Try loading weather again in a moment.",
      503,
    );
  }

  let responseBody: unknown;

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
