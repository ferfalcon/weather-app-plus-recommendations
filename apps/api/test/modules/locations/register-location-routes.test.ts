import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/modules/locations/search-locations", () => ({
  searchLocations: vi.fn(),
}));

import { locationSearchResponseSchema } from "@weather-app-plus-recommendations/contracts";

import { buildApp } from "../../../src/app/build-app";
import { type ApiRuntimeConfig } from "../../../src/lib/get-server-config";
import { LocationSearchProviderError } from "../../../src/modules/locations/fetch-open-meteo-location-results";
import { searchLocations } from "../../../src/modules/locations/search-locations";

const runtimeConfig: ApiRuntimeConfig = {
  corsOrigins: ["http://127.0.0.1:5173"],
  geminiApiKey: undefined,
  logLevel: "silent",
  server: {
    host: "127.0.0.1",
    port: 3001,
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/locations/search", () => {
  it("returns a 400 with the normalized invalid-query shape", async () => {
    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/locations/search?q=",
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        message: "Invalid location search query.",
        issues: {
          q: ["Too small: expected string to have >=1 characters"],
        },
      });
    } finally {
      await app.close();
    }
  });

  it("returns a normalized success payload without calling the real provider", async () => {
    const locationResults = [
      {
        id: "montevideo-uy",
        name: "Montevideo",
        region: "Montevideo Department",
        country: "Uruguay",
        latitude: -34.9,
        longitude: -56.16,
        timezone: "America/Montevideo",
      },
    ];

    vi.mocked(searchLocations).mockResolvedValue(locationResults);

    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/locations/search?q=montevideo",
      });

      expect(response.statusCode).toBe(200);
      expect(locationSearchResponseSchema.parse(response.json())).toEqual(locationResults);
    } finally {
      await app.close();
    }
  });

  it("maps provider failures into the normalized error shape", async () => {
    vi.mocked(searchLocations).mockRejectedValue(
      new LocationSearchProviderError("provider unavailable", {
        requestUrl: "https://example.com/search",
        responseBodyText: "{\"error\":\"bad gateway\"}",
        status: 502,
      }),
    );

    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/locations/search?q=montevideo",
      });

      expect(response.statusCode).toBe(502);
      expect(response.json()).toEqual({
        message: "Location search provider unavailable.",
      });
    } finally {
      await app.close();
    }
  });
});
