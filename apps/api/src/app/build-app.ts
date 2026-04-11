import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { registerLocationRoutes } from "../modules/locations/register-location-routes";
import { registerWeatherRoutes } from "../modules/weather/register-weather-routes";

const allowedOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);

export function buildApp() {
  const app = Fastify({
    logger: true,
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
