import Fastify from "fastify";

import { registerLocationRoutes } from "../modules/locations/register-location-routes";
import { registerWeatherRoutes } from "../modules/weather/register-weather-routes";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(registerLocationRoutes, {
    prefix: "/api/locations",
  });

  app.register(registerWeatherRoutes, {
    prefix: "/api/weather",
  });

  return app;
}
