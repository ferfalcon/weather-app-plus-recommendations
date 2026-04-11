import type { FastifyInstance } from "fastify";

import {
  locationSearchQuerySchema,
  locationSearchResponseSchema,
  type LocationSearchQuery,
} from "@weather-app-plus-recommendations/contracts";

export async function registerLocationRoutes(app: FastifyInstance) {
  app.get<{ Querystring: LocationSearchQuery }>("/search", async (request, reply) => {
    const queryResult = locationSearchQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.code(400).send({
        message: "Invalid location search query.",
        issues: queryResult.error.flatten().fieldErrors,
      });
    }

    const responseBody = locationSearchResponseSchema.parse([]);

    return reply.send(responseBody);
  });
}
