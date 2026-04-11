import type { FastifyInstance } from "fastify";

import {
  weatherQuerySchema,
} from "@weather-app-plus-recommendations/contracts";

import {
  InvalidRequestError,
  UpstreamProviderError,
} from "../../lib/app-errors";
import type { ApiRuntimeConfig } from "../../lib/get-server-config";
import { WeatherProviderError } from "./fetch-open-meteo-weather-forecast";
import { getWeatherPageResponse } from "./get-weather-page-response";

type RegisterWeatherRoutesOptions = {
  runtimeConfig: ApiRuntimeConfig;
};

export async function registerWeatherRoutes(
  app: FastifyInstance,
  options: RegisterWeatherRoutesOptions,
) {
  app.get("/", async (request) => {
    const queryResult = weatherQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      throw new InvalidRequestError(
        "Invalid weather query.",
        queryResult.error.flatten().fieldErrors,
      );
    }

    const validatedQuery = queryResult.data;

    try {
      return await getWeatherPageResponse(
        validatedQuery,
        options.runtimeConfig,
        request.log,
      );
    } catch (error) {
      if (error instanceof WeatherProviderError) {
        throw new UpstreamProviderError("Weather provider unavailable.", {
          cause: error,
          logContext: {
            latitude: validatedQuery.lat,
            longitude: validatedQuery.lon,
            providerRequestUrl: error.requestUrl,
            providerResponseBody: error.responseBodyText,
            providerStatus: error.status,
            tempUnit: validatedQuery.tempUnit,
            windUnit: validatedQuery.windUnit,
          },
          logMessage: "Weather provider request failed.",
        });
      }

      throw error;
    }
  });
}
