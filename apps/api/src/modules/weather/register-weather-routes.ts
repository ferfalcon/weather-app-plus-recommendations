import type { FastifyInstance } from "fastify";

import {
  weatherQuerySchema,
  weatherResponseSchema,
  type WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import { buildPlaceholderWeatherPageResponse } from "./build-placeholder-weather-page-response";

export async function registerWeatherRoutes(app: FastifyInstance) {
  app.get<{ Querystring: WeatherQuery }>("/", async (request, reply) => {
    const queryResult = weatherQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.code(400).send({
        message: "Invalid weather query.",
        issues: queryResult.error.flatten().fieldErrors,
      });
    }

    const responseBody = weatherResponseSchema.parse(
      buildPlaceholderWeatherPageResponse(queryResult.data),
    );

    return reply.send(responseBody);
  });
}
