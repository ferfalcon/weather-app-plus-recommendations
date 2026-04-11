import type {
  WeatherPageResponse,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

function getTemperatureValues(tempUnit: WeatherQuery["tempUnit"]) {
  if (tempUnit === "fahrenheit") {
    return {
      current: 72,
      feelsLike: 74,
      todayLow: 66,
      todayHigh: 77,
      tomorrowLow: 64,
      tomorrowHigh: 75,
      hourly: [68, 72, 76] as const,
      nextHourly: [66, 71, 74] as const,
    };
  }

  return {
    current: 22,
    feelsLike: 23,
    todayLow: 19,
    todayHigh: 25,
    tomorrowLow: 18,
    tomorrowHigh: 24,
    hourly: [20, 22, 24] as const,
    nextHourly: [19, 22, 23] as const,
  };
}

function getWindSpeedValue(windUnit: WeatherQuery["windUnit"]) {
  return windUnit === "mph" ? 9 : 14;
}

export function buildPlaceholderWeatherPageResponse(
  query: WeatherQuery,
): WeatherPageResponse {
  const temperatureValues = getTemperatureValues(query.tempUnit);
  const windSpeed = getWindSpeedValue(query.windUnit);

  return {
    location: {
      id: `placeholder-${query.lat.toFixed(2)}-${query.lon.toFixed(2)}`,
      name: "Placeholder City",
      region: "Placeholder Region",
      country: "Placeholder Country",
      latitude: query.lat,
      longitude: query.lon,
      timezone: "UTC",
    },
    units: {
      temperature: query.tempUnit,
      windSpeed: query.windUnit,
      precipitation: "mm",
    },
    current: {
      temperature: temperatureValues.current,
      feelsLike: temperatureValues.feelsLike,
      humidity: 58,
      windSpeed,
      precipitation: 0.4,
      conditionCode: "placeholder-partly-cloudy",
      conditionLabel: "Partly cloudy",
      iconKey: "partly-cloudy",
      observedAt: "2026-04-11T12:00:00Z",
    },
    daily: [
      {
        date: "2026-04-11",
        dayLabel: "Today",
        minTemperature: temperatureValues.todayLow,
        maxTemperature: temperatureValues.todayHigh,
        iconKey: "partly-cloudy",
        conditionCode: "placeholder-partly-cloudy",
        conditionLabel: "Partly cloudy",
        hourly: [
          {
            time: "2026-04-11T09:00:00Z",
            temperature: temperatureValues.hourly[0],
            precipitationProbability: 10,
            iconKey: "sunny",
            conditionCode: "placeholder-sunny",
            conditionLabel: "Sunny spells",
          },
          {
            time: "2026-04-11T12:00:00Z",
            temperature: temperatureValues.hourly[1],
            precipitationProbability: 15,
            iconKey: "partly-cloudy",
            conditionCode: "placeholder-partly-cloudy",
            conditionLabel: "Partly cloudy",
          },
          {
            time: "2026-04-11T15:00:00Z",
            temperature: temperatureValues.hourly[2],
            precipitationProbability: 20,
            iconKey: "partly-cloudy",
            conditionCode: "placeholder-partly-cloudy",
            conditionLabel: "Partly cloudy",
          },
        ],
      },
      {
        date: "2026-04-12",
        dayLabel: "Tomorrow",
        minTemperature: temperatureValues.tomorrowLow,
        maxTemperature: temperatureValues.tomorrowHigh,
        iconKey: "rain",
        conditionCode: "placeholder-light-rain",
        conditionLabel: "Light rain later",
        hourly: [
          {
            time: "2026-04-12T09:00:00Z",
            temperature: temperatureValues.nextHourly[0],
            precipitationProbability: 30,
            iconKey: "overcast",
            conditionCode: "placeholder-overcast",
            conditionLabel: "Overcast",
          },
          {
            time: "2026-04-12T12:00:00Z",
            temperature: temperatureValues.nextHourly[1],
            precipitationProbability: 45,
            iconKey: "rain",
            conditionCode: "placeholder-light-rain",
            conditionLabel: "Light rain",
          },
          {
            time: "2026-04-12T15:00:00Z",
            temperature: temperatureValues.nextHourly[2],
            precipitationProbability: 50,
            iconKey: "rain",
            conditionCode: "placeholder-light-rain",
            conditionLabel: "Light rain",
          },
        ],
      },
    ],
    recommendations: {
      source: "placeholder",
      items: [
        {
          title: "Take a short city walk",
          description: "Use this placeholder response to wire the forecast layout before provider data exists.",
          type: "outdoor",
          reasonTag: "sunny",
        },
        {
          title: "Keep an indoor backup plan",
          description: "The second forecast day hints at rain, so an indoor option keeps the UI realistic.",
          type: "flexible",
          reasonTag: "mixed",
        },
        {
          title: "Pause in a cafe later",
          description: "A simple indoor placeholder keeps the recommendation shape stable for future backend work.",
          type: "indoor",
          reasonTag: "rainy",
        },
      ],
    },
  };
}
