import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAiRecommendations } from "../../../src/modules/recommendations/build-ai-recommendations";

const recommendationInput = {
  apiKey: "test-api-key",
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildAiRecommendations", () => {
  it("returns a fallback result when the provider request fails before a response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNRESET")),
    );

    const result = await buildAiRecommendations(recommendationInput);

    expect(result).toEqual({
      detail: "connect ECONNRESET",
      reason: "provider_request_failed",
      status: "fallback",
    });
  });

  it("returns AI recommendations when the provider responds with valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [
                    {
                      text: JSON.stringify([
                        {
                          title: "Plan a cafe break",
                          description:
                            "Choose an indoor stop with a short walk so the rain stays manageable.",
                          type: "indoor",
                          reasonTag: "rainy",
                        },
                        {
                          title: "Keep a flexible umbrella window",
                          description:
                            "Use lighter rain gaps for quick sightseeing and move back inside when showers build.",
                          type: "flexible",
                          reasonTag: "rainy",
                        },
                        {
                          title: "Visit a covered market",
                          description:
                            "A covered market gives you local atmosphere without committing to long outdoor stretches.",
                          type: "indoor",
                          reasonTag: "rainy",
                        },
                      ]),
                    },
                  ],
                },
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      ),
    );

    const result = await buildAiRecommendations(recommendationInput);

    expect(result.status).toBe("success");
    expect(result).toEqual({
      items: [
        {
          title: "Plan a cafe break",
          description:
            "Choose an indoor stop with a short walk so the rain stays manageable.",
          type: "indoor",
          reasonTag: "rainy",
        },
        {
          title: "Keep a flexible umbrella window",
          description:
            "Use lighter rain gaps for quick sightseeing and move back inside when showers build.",
          type: "flexible",
          reasonTag: "rainy",
        },
        {
          title: "Visit a covered market",
          description:
            "A covered market gives you local atmosphere without committing to long outdoor stretches.",
          type: "indoor",
          reasonTag: "rainy",
        },
      ],
      status: "success",
    });
  });
});
