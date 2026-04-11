import { describe, expect, it } from "vitest";

import { recommendationsSchema } from "@weather-app-plus-recommendations/contracts";

import { buildFallbackRecommendations } from "../../../src/modules/recommendations/build-fallback-recommendations";

const recommendationInput = {
  units: {
    temperature: "celsius" as const,
    windSpeed: "kmh" as const,
    precipitation: "mm" as const,
  },
  current: {
    temperature: 23,
    feelsLike: 23,
    humidity: 52,
    windSpeed: 11,
    precipitation: 0,
    conditionCode: "wmo-0",
    conditionLabel: "Clear sky",
    iconKey: "sunny",
    observedAt: "2024-06-10T12:00",
  },
  daily: [
    {
      date: "2024-06-10",
      dayLabel: "Today",
      minTemperature: 16,
      maxTemperature: 25,
      iconKey: "sunny",
      conditionCode: "wmo-0",
      conditionLabel: "Clear sky",
      hourly: [
        {
          time: "2024-06-10T12:00",
          temperature: 23,
          precipitationProbability: 5,
          iconKey: "sunny",
          conditionCode: "wmo-0",
          conditionLabel: "Clear sky",
        },
      ],
    },
  ],
};

describe("buildFallbackRecommendations", () => {
  it("returns exactly three items", () => {
    const result = buildFallbackRecommendations(recommendationInput);

    expect(result.items).toHaveLength(3);
  });

  it('marks the recommendation source as "fallback"', () => {
    const result = buildFallbackRecommendations(recommendationInput);

    expect(result.source).toBe("fallback");
  });

  it("stays within the normalized recommendation contract shape", () => {
    const result = buildFallbackRecommendations(recommendationInput);

    expect(recommendationsSchema.parse(result)).toEqual(result);
  });
});
