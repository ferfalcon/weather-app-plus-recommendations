import type { FastifyInstance } from "fastify";

import { locationSearchQuerySchema } from "@weather-app-plus-recommendations/contracts";

import {
  InvalidRequestError,
  UpstreamProviderError,
} from "../../lib/app-errors";
import { LocationSearchProviderError } from "./fetch-open-meteo-location-results";
import { searchLocations } from "./search-locations";

export async function registerLocationRoutes(app: FastifyInstance) {
  app.get("/search", async (request) => {
    const queryResult = locationSearchQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      throw new InvalidRequestError(
        "Invalid location search query.",
        queryResult.error.flatten().fieldErrors,
      );
    }

    const validatedQuery = queryResult.data;

    try {
      return await searchLocations(validatedQuery.q);
    } catch (error) {
      if (error instanceof LocationSearchProviderError) {
        throw new UpstreamProviderError("Location search provider unavailable.", {
          cause: error,
          logContext: {
            providerRequestUrl: error.requestUrl,
            providerResponseBody: error.responseBodyText,
            providerStatus: error.status,
            query: validatedQuery.q,
          },
          logMessage: "Location search provider request failed.",
        });
      }

      throw error;
    }
  });
}
