import type { FastifyInstance } from "fastify";

import {
  weatherQuerySchema,
  weatherResponseSchema,
} from "@weather-app-plus-recommendations/contracts";

import { InvalidRequestError } from "../../lib/app-errors";
import { buildPlaceholderWeatherPageResponse } from "./build-placeholder-weather-page-response";

export async function registerWeatherRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const queryResult = weatherQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      throw new InvalidRequestError(
        "Invalid weather query.",
        queryResult.error.flatten().fieldErrors,
      );
    }

    const validatedQuery = queryResult.data;

    return weatherResponseSchema.parse(
      buildPlaceholderWeatherPageResponse(validatedQuery),
    );
  });
}
