import type {
  CurrentWeather,
  ForecastDay,
  WeatherPageResponse,
  WeatherUnits,
} from "@weather-app-plus-recommendations/contracts";

type RecommendationItem = WeatherPageResponse["recommendations"]["items"][number];

export type BuildRecommendationContextInput = {
  current: CurrentWeather;
  daily: ForecastDay[];
  units: WeatherUnits;
};

const rainyIconKeys = new Set(["drizzle", "rain", "storm"]);
const sunnyIconKeys = new Set(["sunny", "partly-cloudy"]);

function toCelsius(value: number, unit: WeatherUnits["temperature"]) {
  return unit === "fahrenheit" ? ((value - 32) * 5) / 9 : value;
}

function toKilometersPerHour(value: number, unit: WeatherUnits["windSpeed"]) {
  return unit === "mph" ? value * 1.60934 : value;
}

function getTodayForecast(daily: ForecastDay[]) {
  return daily[0] ?? null;
}

function getHighestPrecipitationProbability(day: ForecastDay | null) {
  if (!day) {
    return 0;
  }

  return day.hourly.reduce((highestProbability, hour) => {
    return Math.max(highestProbability, hour.precipitationProbability);
  }, 0);
}

export function getRecommendationReasonTag({
  current,
  daily,
  units,
}: BuildRecommendationContextInput): RecommendationItem["reasonTag"] {
  const today = getTodayForecast(daily);
  const currentTemperatureC = toCelsius(current.temperature, units.temperature);
  const currentWindKmh = toKilometersPerHour(current.windSpeed, units.windSpeed);
  const todayMaxTemperatureC = today
    ? toCelsius(today.maxTemperature, units.temperature)
    : currentTemperatureC;
  const todayMinTemperatureC = today
    ? toCelsius(today.minTemperature, units.temperature)
    : currentTemperatureC;
  const highestPrecipitationProbability = getHighestPrecipitationProbability(today);
  const hasRainyConditions =
    rainyIconKeys.has(current.iconKey) ||
    rainyIconKeys.has(today?.iconKey ?? "") ||
    current.precipitation >= 0.2 ||
    highestPrecipitationProbability >= 55;
  const hasHotConditions = currentTemperatureC >= 30 || todayMaxTemperatureC >= 30;
  const hasColdConditions =
    current.iconKey === "snow" ||
    today?.iconKey === "snow" ||
    currentTemperatureC <= 8 ||
    todayMinTemperatureC <= 6;
  const hasWindyConditions = currentWindKmh >= 28;
  const hasSunnyConditions =
    sunnyIconKeys.has(current.iconKey) ||
    sunnyIconKeys.has(today?.iconKey ?? "");
  const hasMildTemperatureRange = todayMaxTemperatureC >= 16 && todayMaxTemperatureC <= 28;

  if (hasRainyConditions) {
    return "rainy";
  }

  if (hasHotConditions) {
    return "hot";
  }

  if (hasColdConditions) {
    return "cold";
  }

  if (hasWindyConditions) {
    return "windy";
  }

  if (hasSunnyConditions && hasMildTemperatureRange) {
    return "sunny";
  }

  return "mixed";
}
