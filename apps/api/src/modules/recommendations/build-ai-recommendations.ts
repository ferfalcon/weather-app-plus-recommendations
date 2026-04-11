import { request as httpsRequest } from "node:https";

import {
  activitySuggestionSchema,
  type ForecastDay,
  type WeatherPageResponse,
} from "@weather-app-plus-recommendations/contracts";

import {
  getRecommendationReasonTag,
  type BuildRecommendationContextInput,
} from "./get-recommendation-reason-tag";

type RecommendationItems = WeatherPageResponse["recommendations"]["items"];

type BuildAiRecommendationsInput = BuildRecommendationContextInput & {
  apiKey: string;
};

export type BuildAiRecommendationsResult =
  | {
      items: RecommendationItems;
      status: "success";
    }
  | {
      detail?: string | undefined;
      finishReason?: string | undefined;
      providerStatus?: number | undefined;
      reason:
        | "candidate_json_parse_failed"
        | "candidate_missing"
        | "candidate_not_stopped"
        | "provider_http_error"
        | "provider_request_failed"
        | "response_json_parse_failed"
        | "schema_validation_failed"
        | "weak_output";
      status: "fallback";
    };

type ProviderHttpResponse = {
  bodyText: string;
  status: number | undefined;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
};

const GEMINI_GENERATE_CONTENT_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
const geminiRequestTimeoutMs = 5_000;
const minimumDescriptionLength = 24;
const aiRecommendationItemsSchema = activitySuggestionSchema.array().length(3);

function buildGeminiRequestUrl(apiKey: string) {
  const url = new URL(GEMINI_GENERATE_CONTENT_URL);

  url.searchParams.set("key", apiKey);

  return url.toString();
}

function getHighestPrecipitationProbability(day: ForecastDay | null) {
  if (!day) {
    return 0;
  }

  return day.hourly.reduce((highestProbability, hour) => {
    return Math.max(highestProbability, hour.precipitationProbability);
  }, 0);
}

function buildWeatherContext({
  current,
  daily,
  units,
}: BuildRecommendationContextInput) {
  const today = daily[0] ?? null;
  const reasonTag = getRecommendationReasonTag({
    current,
    daily,
    units,
  });

  return {
    current: {
      conditionLabel: current.conditionLabel,
      humidity: current.humidity,
      iconKey: current.iconKey,
      feelsLike: current.feelsLike,
      precipitation: current.precipitation,
      temperature: current.temperature,
      windSpeed: current.windSpeed,
    },
    firstForecastDay: today
      ? {
          conditionLabel: today.conditionLabel,
          date: today.date,
          dayLabel: today.dayLabel,
          highestPrecipitationProbability: getHighestPrecipitationProbability(today),
          iconKey: today.iconKey,
          maxTemperature: today.maxTemperature,
          minTemperature: today.minTemperature,
        }
      : null,
    reasonTag,
    units,
  };
}

function buildGeminiPrompt(input: BuildRecommendationContextInput) {
  const weatherContext = buildWeatherContext(input);

  return [
    "Generate generic, tourist-friendly activity suggestions from structured weather data only.",
    "Return only a JSON array with exactly 3 objects.",
    "Each object must include title, description, type, and reasonTag.",
    "Allowed type values: indoor, outdoor, flexible.",
    `Use reasonTag ${weatherContext.reasonTag} for every item.`,
    "Descriptions must be practical, concise, and at least one full sentence.",
    "Do not name real venues, businesses, neighborhoods, landmarks, maps, booking links, or unsupported local claims.",
    "Do not include risky advice or mention having incomplete information.",
    "",
    `Weather context: ${JSON.stringify(weatherContext)}`,
  ].join("\n");
}

function requestGeminiRecommendations(
  requestUrl: string,
  requestBodyText: string,
): Promise<ProviderHttpResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(requestUrl);
    const request = httpsRequest(
      {
        family: 4,
        headers: {
          accept: "application/json",
          "content-length": Buffer.byteLength(requestBodyText, "utf8"),
          "content-type": "application/json",
        },
        hostname: url.hostname,
        method: "POST",
        path: `${url.pathname}${url.search}`,
        port: url.port || 443,
        protocol: url.protocol,
      },
      (response) => {
        const chunks: string[] = [];

        response.setEncoding("utf8");
        response.on("data", (chunk: string) => {
          chunks.push(chunk);
        });
        response.on("end", () => {
          resolve({
            bodyText: chunks.join(""),
            status: response.statusCode,
          });
        });
      },
    );

    request.setTimeout(geminiRequestTimeoutMs, () => {
      const timeoutError = new Error(
        `Gemini request timed out after ${geminiRequestTimeoutMs}ms.`,
      );

      timeoutError.name = "TimeoutError";
      request.destroy(timeoutError);
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.write(requestBodyText);
    request.end();
  });
}

function getCandidateText(responseBody: GeminiGenerateContentResponse) {
  const candidate = responseBody.candidates?.[0];

  if (!candidate) {
    return {
      reason: "candidate_missing" as const,
      status: "fallback" as const,
    };
  }

  if (candidate.finishReason !== "STOP") {
    return {
      finishReason: candidate.finishReason,
      reason: "candidate_not_stopped" as const,
      status: "fallback" as const,
    };
  }

  const text = candidate.content?.parts
    ?.map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text || text.length === 0) {
    return {
      reason: "candidate_missing" as const,
      status: "fallback" as const,
    };
  }

  return {
    status: "success" as const,
    text,
  };
}

function normalizeTitle(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function passesQualityGate(
  items: RecommendationItems,
  expectedReasonTag: RecommendationItems[number]["reasonTag"],
) {
  const normalizedTitles = new Set<string>();

  for (const item of items) {
    const normalizedTitle = normalizeTitle(item.title);

    if (normalizedTitles.has(normalizedTitle)) {
      return false;
    }

    normalizedTitles.add(normalizedTitle);

    if (item.description.trim().length < minimumDescriptionLength) {
      return false;
    }

    if (item.reasonTag !== expectedReasonTag) {
      return false;
    }
  }

  return true;
}

export async function buildAiRecommendations({
  apiKey,
  current,
  daily,
  units,
}: BuildAiRecommendationsInput): Promise<BuildAiRecommendationsResult> {
  const requestUrl = buildGeminiRequestUrl(apiKey);
  const expectedReasonTag = getRecommendationReasonTag({
    current,
    daily,
    units,
  });
  const requestBodyText = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: buildGeminiPrompt({
              current,
              daily,
              units,
            }),
          },
        ],
        role: "user",
      },
    ],
    generationConfig: {
      maxOutputTokens: 320,
      responseMimeType: "application/json",
      thinkingConfig: {
        thinkingLevel: "minimal",
      },
      temperature: 0.2,
    },
  });

  let providerResponse: ProviderHttpResponse;

  try {
    providerResponse = await requestGeminiRecommendations(requestUrl, requestBodyText);
  } catch (error) {
    return {
      detail: error instanceof Error ? error.message : undefined,
      reason: "provider_request_failed",
      status: "fallback",
    };
  }

  if (
    providerResponse.status === undefined ||
    providerResponse.status < 200 ||
    providerResponse.status >= 300
  ) {
    return {
      detail: providerResponse.bodyText.trim() || undefined,
      providerStatus: providerResponse.status,
      reason: "provider_http_error",
      status: "fallback",
    };
  }

  let responseBody: GeminiGenerateContentResponse;

  try {
    responseBody = JSON.parse(providerResponse.bodyText) as GeminiGenerateContentResponse;
  } catch {
    return {
      reason: "response_json_parse_failed",
      status: "fallback",
    };
  }

  const candidateTextResult = getCandidateText(responseBody);

  if (candidateTextResult.status === "fallback") {
    return candidateTextResult;
  }

  let parsedCandidate: unknown;

  try {
    parsedCandidate = JSON.parse(candidateTextResult.text);
  } catch {
    return {
      reason: "candidate_json_parse_failed",
      status: "fallback",
    };
  }

  const itemsResult = aiRecommendationItemsSchema.safeParse(parsedCandidate);

  if (!itemsResult.success) {
    return {
      detail: itemsResult.error.message,
      reason: "schema_validation_failed",
      status: "fallback",
    };
  }

  if (!passesQualityGate(itemsResult.data, expectedReasonTag)) {
    return {
      reason: "weak_output",
      status: "fallback",
    };
  }

  return {
    items: itemsResult.data,
    status: "success",
  };
}
