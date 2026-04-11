import type {
  CurrentWeather,
  ForecastDay,
  WeatherPageResponse,
  WeatherUnits,
} from "@weather-app-plus-recommendations/contracts";

import { buildAiRecommendations } from "./build-ai-recommendations";
import { buildFallbackRecommendations } from "./build-fallback-recommendations";

type RecommendationFallbackLogger = {
  info: (context: Record<string, unknown>, message: string) => void;
};

type GetRecommendationsInput = {
  current: CurrentWeather;
  daily: ForecastDay[];
  geminiApiKey: string | undefined;
  logger?: RecommendationFallbackLogger | undefined;
  units: WeatherUnits;
};

function shouldLogRecommendationFallback() {
  return process.env.NODE_ENV !== "production";
}

function logRecommendationFallback(
  logger: RecommendationFallbackLogger | undefined,
  context: Record<string, unknown>,
) {
  if (!logger || !shouldLogRecommendationFallback()) {
    return;
  }

  logger.info(context, "Using fallback recommendations.");
}

export async function getRecommendations({
  current,
  daily,
  geminiApiKey,
  logger,
  units,
}: GetRecommendationsInput): Promise<WeatherPageResponse["recommendations"]> {
  const fallbackRecommendations = buildFallbackRecommendations({
    current,
    daily,
    units,
  });

  if (!geminiApiKey) {
    logRecommendationFallback(logger, {
      fallbackReason: "missing_api_key",
      recommendationSource: "fallback",
    });

    return fallbackRecommendations;
  }

  const aiResult = await buildAiRecommendations({
    apiKey: geminiApiKey,
    current,
    daily,
    units,
  });

  if (aiResult.status === "fallback") {
    logRecommendationFallback(logger, {
      fallbackDetail: aiResult.detail,
      fallbackFinishReason: aiResult.finishReason,
      fallbackProviderStatus: aiResult.providerStatus,
      fallbackReason: aiResult.reason,
      recommendationSource: "fallback",
    });

    return fallbackRecommendations;
  }

  return {
    items: aiResult.items,
    source: "ai",
  };
}
