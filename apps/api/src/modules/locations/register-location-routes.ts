import type { FastifyInstance } from "fastify";

import {
  locationSearchQuerySchema,
  type LocationSearchQuery,
} from "@weather-app-plus-recommendations/contracts";

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
      request.log.error({ error }, "Location search provider request failed.");

      return reply.code(502).send({
        message: "Location search provider unavailable.",
      });
    }
  });
}
