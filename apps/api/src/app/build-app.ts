import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import {
  InvalidRequestError,
  UpstreamProviderError,
} from "../lib/app-errors";
import type { ApiRuntimeConfig } from "../lib/get-server-config";

import { registerLocationRoutes } from "../modules/locations/register-location-routes";
import { registerWeatherRoutes } from "../modules/weather/register-weather-routes";

export function buildApp(runtimeConfig: ApiRuntimeConfig) {
  const allowedOrigins = new Set(runtimeConfig.corsOrigins);
  const app = Fastify({
    logger: {
      level: runtimeConfig.logLevel,
    },
  });

  app.register(fastifyCors, {
    origin(origin, callback) {
      if (origin === undefined || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof InvalidRequestError) {
      return reply.code(error.statusCode).send({
        message: error.message,
        issues: error.issues,
      });
    }

    if (error instanceof UpstreamProviderError) {
      request.log.error(
        {
          err: error.cause ?? error,
          ...error.logContext,
        },
        error.logMessage,
      );

      return reply.code(error.statusCode).send({
        message: error.message,
      });
    }

    request.log.error({ err: error }, "Request failed unexpectedly.");

    return reply.code(500).send({
      message: "Internal server error.",
    });
  });

  app.get("/healthz", async () => ({
    status: "ok",
  }));

  app.register(registerLocationRoutes, {
    prefix: "/api/locations",
  });

  app.register(registerWeatherRoutes, {
    prefix: "/api/weather",
    runtimeConfig,
  });

  return app;
}
