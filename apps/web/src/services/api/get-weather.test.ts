import { afterEach, describe, expect, it, vi } from "vitest";

import type { WeatherQuery } from "@weather-app-plus-recommendations/contracts";

import { ApiError } from "./api-error";
import { getWeather } from "./get-weather";

const weatherQuery = {
  lat: -34.9,
  lon: -56.16,
  tempUnit: "celsius",
  windUnit: "kmh",
} satisfies WeatherQuery;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getWeather", () => {
  it("throws a friendly API-unavailable error when the request cannot connect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(getWeather(weatherQuery)).rejects.toMatchObject(
      {
        message:
          "The app API is still starting or unavailable. Try loading weather again in a moment.",
        name: "ApiError",
        status: 503,
      } satisfies Pick<ApiError, "message" | "name" | "status">,
    );
  });
});
