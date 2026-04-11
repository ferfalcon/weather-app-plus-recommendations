import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/modules/weather/get-weather-page-response", () => ({
  getWeatherPageResponse: vi.fn(),
}));

import { weatherResponseSchema } from "@weather-app-plus-recommendations/contracts";

import { buildApp } from "../../../src/app/build-app";
import { type ApiRuntimeConfig } from "../../../src/lib/get-server-config";
import { WeatherProviderError } from "../../../src/modules/weather/fetch-open-meteo-weather-forecast";
import { getWeatherPageResponse } from "../../../src/modules/weather/get-weather-page-response";

const runtimeConfig: ApiRuntimeConfig = {
  corsOrigins: ["http://127.0.0.1:5173"],
  geminiApiKey: undefined,
  logLevel: "silent",
  server: {
    host: "127.0.0.1",
    port: 3001,
  },
};

const weatherPageResponse = {
  location: {
    id: "montevideo-uy",
    name: "Montevideo",
    region: "Montevideo Department",
    country: "Uruguay",
    latitude: -34.9,
    longitude: -56.16,
    timezone: "America/Montevideo",
  },
  units: {
    temperature: "celsius" as const,
    windSpeed: "kmh" as const,
    precipitation: "mm" as const,
  },
  current: {
    temperature: 18.3,
    feelsLike: 17.8,
    humidity: 71,
    windSpeed: 13.4,
    precipitation: 0.7,
    conditionCode: "wmo-1",
    conditionLabel: "Mainly clear",
    iconKey: "partly-cloudy",
    observedAt: "2024-06-10T12:00",
  },
  daily: [
    {
      date: "2024-06-10",
      dayLabel: "Today",
      minTemperature: 10.1,
      maxTemperature: 20.4,
      iconKey: "sunny",
      conditionCode: "wmo-0",
      conditionLabel: "Clear sky",
      hourly: [
        {
          time: "2024-06-10T09:00",
          temperature: 15.2,
          precipitationProbability: 5,
          iconKey: "sunny",
          conditionCode: "wmo-0",
          conditionLabel: "Clear sky",
        },
      ],
    },
  ],
  recommendations: {
    source: "fallback" as const,
    items: [
      {
        title: "Plan an indoor museum stop",
        description: "A museum or gallery visit is an easy way to stay comfortable.",
        type: "indoor" as const,
        reasonTag: "rainy" as const,
      },
      {
        title: "Use a cafe as a weather break",
        description: "A cafe stop can help you wait out changing conditions.",
        type: "indoor" as const,
        reasonTag: "rainy" as const,
      },
      {
        title: "Keep a short route with cover",
        description: "Pair a short walk with a nearby indoor backup.",
        type: "flexible" as const,
        reasonTag: "rainy" as const,
      },
    ],
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/weather", () => {
  it("returns a 400 with the normalized invalid-query shape", async () => {
    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/weather?lat=999&lon=-56.16&tempUnit=celsius&windUnit=kmh",
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        message: "Invalid weather query.",
        issues: {
          lat: ["Too big: expected number to be <=90"],
        },
      });
    } finally {
      await app.close();
    }
  });

  it("returns a normalized success payload without calling the real provider", async () => {
    vi.mocked(getWeatherPageResponse).mockResolvedValue(weatherPageResponse);

    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/weather?lat=-34.9&lon=-56.16&tempUnit=celsius&windUnit=kmh",
      });

      expect(response.statusCode).toBe(200);
      expect(weatherResponseSchema.parse(response.json())).toEqual(weatherPageResponse);
    } finally {
      await app.close();
    }
  });

  it("maps provider failures into the normalized error shape", async () => {
    vi.mocked(getWeatherPageResponse).mockRejectedValue(
      new WeatherProviderError("provider unavailable", {
        requestUrl: "https://example.com/weather",
        responseBodyText: "{\"error\":\"bad gateway\"}",
        status: 502,
      }),
    );

    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/weather?lat=-34.9&lon=-56.16&tempUnit=celsius&windUnit=kmh",
      });

      expect(response.statusCode).toBe(502);
      expect(response.json()).toEqual({
        message: "Weather provider unavailable.",
      });
    } finally {
      await app.close();
    }
  });
});
