import type { FastifyInstance } from "fastify";

import {
  locationSearchQuerySchema,
  type LocationSearchQuery,
} from "@weather-app-plus-recommendations/contracts";

import { LocationSearchProviderError } from "./fetch-open-meteo-location-results";
import { searchLocations } from "./search-locations";

export async function registerLocationRoutes(app: FastifyInstance) {
  app.get<{ Querystring: LocationSearchQuery }>("/search", async (request, reply) => {
    const queryResult = locationSearchQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.code(400).send({
        message: "Invalid location search query.",
        issues: queryResult.error.flatten().fieldErrors,
      });
    }

    try {
      const responseBody = await searchLocations(queryResult.data.q);

      return reply.send(responseBody);
    } catch (error) {
      if (error instanceof LocationSearchProviderError) {
        request.log.error(
          {
            err: error,
            providerRequestUrl: error.requestUrl,
            providerResponseBody: error.responseBodyText,
            providerStatus: error.status,
            query: queryResult.data.q,
          },
          "Location search provider request failed.",
        );
      } else {
        request.log.error(
          {
            err: error,
            query: queryResult.data.q,
          },
          "Location search failed unexpectedly.",
        );
      }

      return reply.code(502).send({
        message: "Location search provider unavailable.",
      });
    }
  });
}
