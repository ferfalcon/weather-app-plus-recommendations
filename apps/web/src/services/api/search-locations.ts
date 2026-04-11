import {
  locationSearchResponseSchema,
  type LocationSearchResponse,
} from "@weather-app-plus-recommendations/contracts";

import { createApiUrl } from "./client";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorResponse = {
  message?: string;
};

export async function searchLocations(query: string): Promise<LocationSearchResponse> {
  const url = new URL(createApiUrl("/api/locations/search"));

  url.searchParams.set("q", query);

  const response = await fetch(url);

  let responseBody: unknown = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const messageFromResponse =
      typeof responseBody === "object" &&
      responseBody !== null &&
      "message" in responseBody &&
      typeof (responseBody as ApiErrorResponse).message === "string"
        ? (responseBody as ApiErrorResponse).message
        : null;

    const message = messageFromResponse ?? "Unable to search locations right now.";

    throw new ApiError(message, response.status);
  }

  return locationSearchResponseSchema.parse(responseBody);
}
