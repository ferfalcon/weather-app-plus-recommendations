import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

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

  app.register(registerLocationRoutes, {
    prefix: "/api/locations",
  });

  app.register(registerWeatherRoutes, {
    prefix: "/api/weather",
  });

  return app;
}
