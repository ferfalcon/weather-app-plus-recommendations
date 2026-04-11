import { describe, expect, it, vi } from "vitest";

vi.mock("../../../src/modules/recommendations/build-ai-recommendations", () => ({
  buildAiRecommendations: vi.fn(),
}));

import { buildAiRecommendations } from "../../../src/modules/recommendations/build-ai-recommendations";
import { getRecommendations } from "../../../src/modules/recommendations/get-recommendations";

const recommendationInput = {
  units: {
    temperature: "celsius" as const,
    windSpeed: "kmh" as const,
    precipitation: "mm" as const,
  },
  current: {
    temperature: 10,
    feelsLike: 8,
    humidity: 81,
    windSpeed: 19,
    precipitation: 2.3,
    conditionCode: "wmo-61",
    conditionLabel: "Slight rain",
    iconKey: "rain",
    observedAt: "2024-06-10T10:00",
  },
  daily: [
    {
      date: "2024-06-10",
      dayLabel: "Today",
      minTemperature: 7,
      maxTemperature: 12,
      iconKey: "rain",
      conditionCode: "wmo-61",
      conditionLabel: "Slight rain",
      hourly: [
        {
          time: "2024-06-10T10:00",
          temperature: 10,
          precipitationProbability: 75,
          iconKey: "rain",
          conditionCode: "wmo-61",
          conditionLabel: "Slight rain",
        },
      ],
    },
  ],
};

describe("getRecommendations", () => {
  it("returns fallback recommendations when GEMINI_API_KEY is missing", async () => {
    const logger = {
      info: vi.fn(),
    };

    const result = await getRecommendations({
      ...recommendationInput,
      geminiApiKey: undefined,
      logger,
    });

    expect(result.source).toBe("fallback");
    expect(result.items).toHaveLength(3);
    expect(buildAiRecommendations).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      {
        fallbackReason: "missing_api_key",
        recommendationSource: "fallback",
      },
      "Using fallback recommendations.",
    );
  });
});
