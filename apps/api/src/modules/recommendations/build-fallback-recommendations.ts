import type {
  CurrentWeather,
  ForecastDay,
  WeatherPageResponse,
  WeatherUnits,
} from "@weather-app-plus-recommendations/contracts";

type RecommendationItem = WeatherPageResponse["recommendations"]["items"][number];
type RecommendationReasonTag = RecommendationItem["reasonTag"];

type BuildFallbackRecommendationsInput = {
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

function getRecommendationReasonTag({
  current,
  daily,
  units,
}: BuildFallbackRecommendationsInput): RecommendationReasonTag {
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

function buildRecommendationsForReasonTag(
  reasonTag: RecommendationReasonTag,
): RecommendationItem[] {
  switch (reasonTag) {
    case "rainy":
      return [
        {
          title: "Plan an indoor museum stop",
          description:
            "A museum or gallery visit is an easy way to stay comfortable through wet spells.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Use a cafe as a weather break",
          description:
            "A longer coffee or lunch stop can help you wait out showers without rushing.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Keep a short route with cover",
          description:
            "If you still want to explore, keep walks brief and choose an indoor backup nearby.",
          type: "flexible",
          reasonTag,
        },
      ];
    case "sunny":
      return [
        {
          title: "Take a park or waterfront walk",
          description:
            "Brighter conditions are a good fit for a relaxed outdoor walk with photo stops.",
          type: "outdoor",
          reasonTag,
        },
        {
          title: "Build an open-air sightseeing loop",
          description:
            "Today suits landmarks, plazas, and other outdoor stops you can enjoy at an easy pace.",
          type: "outdoor",
          reasonTag,
        },
        {
          title: "Leave room for a shaded break",
          description:
            "A flexible lunch or coffee stop keeps the day comfortable while you stay outside longer.",
          type: "flexible",
          reasonTag,
        },
      ];
    case "hot":
      return [
        {
          title: "Start with a shaded morning walk",
          description:
            "If you want outdoor time, go earlier and stick to routes with shade and regular breaks.",
          type: "outdoor",
          reasonTag,
        },
        {
          title: "Shift midday plans indoors",
          description:
            "A museum, gallery, or indoor market is a safer choice when the day heats up.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Slow the pace with a cool stop",
          description:
            "Use a cafe or quiet indoor break to avoid the hottest part of the day.",
          type: "flexible",
          reasonTag,
        },
      ];
    case "cold":
      return [
        {
          title: "Prioritize indoor sightseeing",
          description:
            "Museums, galleries, and indoor exhibits make the day easier when temperatures stay low.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Add a warm cafe break",
          description:
            "A coffee stop between activities keeps the day comfortable without overextending time outside.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Keep outdoor time short",
          description:
            "Short photo walks can still work if you pair them with nearby indoor stops.",
          type: "flexible",
          reasonTag,
        },
      ];
    case "windy":
      return [
        {
          title: "Choose sheltered walking routes",
          description:
            "Shorter streets, arcades, or more protected areas usually feel better in stronger wind.",
          type: "flexible",
          reasonTag,
        },
        {
          title: "Mix in an indoor market stop",
          description:
            "Indoor browsing gives you a practical break if exposed areas start to feel uncomfortable.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Keep a museum or cafe backup",
          description:
            "A nearby indoor option makes it easier to adjust plans quickly if gusts build later on.",
          type: "indoor",
          reasonTag,
        },
      ];
    case "mixed":
      return [
        {
          title: "Keep plans flexible",
          description:
            "A light sightseeing route works best when you leave room to adjust as conditions shift.",
          type: "flexible",
          reasonTag,
        },
        {
          title: "Pick one reliable indoor stop",
          description:
            "A museum, gallery, or indoor market gives you a simple fallback without overplanning.",
          type: "indoor",
          reasonTag,
        },
        {
          title: "Use short outdoor windows",
          description:
            "Brief walks between cafe or indoor breaks can make the most of a less settled day.",
          type: "flexible",
          reasonTag,
        },
      ];
  }
}

export function buildFallbackRecommendations(
  input: BuildFallbackRecommendationsInput,
): WeatherPageResponse["recommendations"] {
  const reasonTag = getRecommendationReasonTag(input);

  return {
    items: buildRecommendationsForReasonTag(reasonTag),
    source: "fallback",
  };
}
