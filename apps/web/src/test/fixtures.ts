import type {
  LocationOption,
  WeatherPageResponse,
} from "@weather-app-plus-recommendations/contracts";

export const testLocation: LocationOption = {
  id: "montevideo-uy",
  name: "Montevideo",
  region: "Montevideo Department",
  country: "Uruguay",
  latitude: -34.9,
  longitude: -56.16,
  timezone: "America/Montevideo",
};

export function createWeatherPageResponse(): WeatherPageResponse {
  return {
    location: testLocation,
    units: {
      temperature: "celsius",
      windSpeed: "kmh",
      precipitation: "mm",
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
          {
            time: "2024-06-10T15:00",
            temperature: 19.5,
            precipitationProbability: 20,
            iconKey: "partly-cloudy",
            conditionCode: "wmo-1",
            conditionLabel: "Mainly clear",
          },
        ],
      },
      {
        date: "2024-06-11",
        dayLabel: "Tomorrow",
        minTemperature: 9.8,
        maxTemperature: 18.7,
        iconKey: "rain",
        conditionCode: "wmo-61",
        conditionLabel: "Slight rain",
        hourly: [
          {
            time: "2024-06-11T11:00",
            temperature: 14.9,
            precipitationProbability: 65,
            iconKey: "rain",
            conditionCode: "wmo-61",
            conditionLabel: "Slight rain",
          },
        ],
      },
    ],
    recommendations: {
      source: "fallback",
      items: [
        {
          title: "Plan an indoor museum stop",
          description: "A museum or gallery visit is an easy way to stay comfortable.",
          type: "indoor",
          reasonTag: "rainy",
        },
        {
          title: "Use a cafe as a weather break",
          description: "A cafe stop can help you wait out changing conditions.",
          type: "indoor",
          reasonTag: "rainy",
        },
        {
          title: "Keep a short route with cover",
          description: "Pair a short walk with a nearby indoor backup.",
          type: "flexible",
          reasonTag: "rainy",
        },
      ],
    },
  };
}
