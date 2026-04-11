import type {
  LocationOption,
  WeatherPageResponse,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import type { OpenMeteoForecastResponse } from "./fetch-open-meteo-weather-forecast";
import { mapOpenMeteoWeatherCode } from "./map-open-meteo-weather-code";

type MapWeatherResponseOptions = {
  forecast: OpenMeteoForecastResponse;
  location: LocationOption;
  query: WeatherQuery;
};

const placeholderRecommendations = [
  {
    title: "Check back for tailored suggestions",
    description:
      "Recommendations stay in the response for contract compatibility while Phase 2.5 focuses on real weather data.",
    type: "flexible" as const,
    reasonTag: "mixed" as const,
  },
  {
    title: "Use the forecast to shape your plan",
    description:
      "The weather payload is now live from Open-Meteo, so current conditions and upcoming changes are ready for the UI.",
    type: "outdoor" as const,
    reasonTag: "sunny" as const,
  },
  {
    title: "Keep an indoor backup option nearby",
    description:
      "Recommendation fallback rules and Gemini integration are intentionally deferred to later phases.",
    type: "indoor" as const,
    reasonTag: "rainy" as const,
  },
];

function roundValue(value: number) {
  return Number(value.toFixed(1));
}

function getDayLabel(date: string, index: number) {
  if (index === 0) {
    return "Today";
  }

  if (index === 1) {
    return "Tomorrow";
  }

  const parsedDate = new Date(`${date}T12:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(parsedDate);
}

function getStringArray(values: unknown) {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
}

function getNumberArray(values: unknown) {
  return Array.isArray(values) ? values.filter((value): value is number => typeof value === "number") : [];
}

function getWeatherLocationTimezone(forecast: OpenMeteoForecastResponse) {
  return typeof forecast.timezone === "string" && forecast.timezone.trim().length > 0
    ? forecast.timezone.trim()
    : "UTC";
}

export function mapOpenMeteoWeatherResponse({
  forecast,
  location,
  query,
}: MapWeatherResponseOptions): WeatherPageResponse {
  const current = forecast.current;

  if (
    typeof current?.time !== "string" ||
    typeof current.temperature_2m !== "number" ||
    typeof current.apparent_temperature !== "number" ||
    typeof current.relative_humidity_2m !== "number" ||
    typeof current.precipitation !== "number" ||
    typeof current.wind_speed_10m !== "number"
  ) {
    throw new Error("Open-Meteo current weather payload is incomplete.");
  }

  const dailyDates = getStringArray(forecast.daily?.time);
  const dailyWeatherCodes = getNumberArray(forecast.daily?.weather_code);
  const dailyMaxTemperatures = getNumberArray(forecast.daily?.temperature_2m_max);
  const dailyMinTemperatures = getNumberArray(forecast.daily?.temperature_2m_min);
  const hourlyTimes = getStringArray(forecast.hourly?.time);
  const hourlyTemperatures = getNumberArray(forecast.hourly?.temperature_2m);
  const hourlyPrecipitationProbabilities = getNumberArray(
    forecast.hourly?.precipitation_probability,
  );
  const hourlyWeatherCodes = getNumberArray(forecast.hourly?.weather_code);

  const daily = dailyDates
    .map((date, index) => {
      const weatherCode = dailyWeatherCodes[index];
      const maxTemperature = dailyMaxTemperatures[index];
      const minTemperature = dailyMinTemperatures[index];

      if (
        typeof weatherCode !== "number" ||
        typeof maxTemperature !== "number" ||
        typeof minTemperature !== "number"
      ) {
        return null;
      }

      const condition = mapOpenMeteoWeatherCode(weatherCode);
      const hourly = hourlyTimes
        .map((time, hourlyIndex) => {
          if (!time.startsWith(`${date}T`)) {
            return null;
          }

          const temperature = hourlyTemperatures[hourlyIndex];
          const precipitationProbability =
            hourlyPrecipitationProbabilities[hourlyIndex];
          const hourlyWeatherCode = hourlyWeatherCodes[hourlyIndex];

          if (
            typeof temperature !== "number" ||
            typeof precipitationProbability !== "number"
          ) {
            return null;
          }

          const hourlyCondition = mapOpenMeteoWeatherCode(hourlyWeatherCode);

          return {
            time,
            temperature: roundValue(temperature),
            precipitationProbability: Math.round(precipitationProbability),
            iconKey: hourlyCondition.iconKey,
            conditionCode: hourlyCondition.conditionCode,
            conditionLabel: hourlyCondition.conditionLabel,
          };
        })
        .filter((hour): hour is NonNullable<typeof hour> => hour !== null);

      return {
        date,
        dayLabel: getDayLabel(date, index),
        minTemperature: roundValue(minTemperature),
        maxTemperature: roundValue(maxTemperature),
        iconKey: condition.iconKey,
        conditionCode: condition.conditionCode,
        conditionLabel: condition.conditionLabel,
        hourly,
      };
    })
    .filter((day): day is NonNullable<typeof day> => day !== null);

  if (daily.length === 0) {
    throw new Error("Open-Meteo daily forecast payload is incomplete.");
  }

  const currentCondition = mapOpenMeteoWeatherCode(current.weather_code);

  return {
    location: {
      ...location,
      latitude: query.lat,
      longitude: query.lon,
      timezone: getWeatherLocationTimezone(forecast),
    },
    units: {
      temperature: query.tempUnit,
      windSpeed: query.windUnit,
      precipitation: "mm",
    },
    current: {
      temperature: roundValue(current.temperature_2m),
      feelsLike: roundValue(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: roundValue(current.wind_speed_10m),
      precipitation: roundValue(current.precipitation),
      conditionCode: currentCondition.conditionCode,
      conditionLabel: currentCondition.conditionLabel,
      iconKey: currentCondition.iconKey,
      observedAt: current.time,
    },
    daily,
    recommendations: {
      items: placeholderRecommendations,
      source: "placeholder",
    },
  };
}
