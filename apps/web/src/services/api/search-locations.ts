import {
  locationSearchResponseSchema,
  type LocationSearchResponse,
} from "@weather-app-plus-recommendations/contracts";

import { ApiError, getApiErrorMessage } from "./api-error";
import { createApiUrl } from "./client";

export async function searchLocations(query: string): Promise<LocationSearchResponse> {
  const url = new URL(createApiUrl("/api/locations/search"));

  url.searchParams.set("q", query);

  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new ApiError(
      "The app API is still starting or unavailable. Try the search again in a moment.",
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
      getApiErrorMessage(responseBody) ?? "Unable to search locations right now.";

    throw new ApiError(message, response.status);
  }

  return locationSearchResponseSchema.parse(responseBody);
}
