import { describe, expect, it } from "vitest";

import type {
  LocationOption,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import type { OpenMeteoForecastResponse } from "../../../src/modules/weather/fetch-open-meteo-weather-forecast";
import { mapOpenMeteoWeatherResponse } from "../../../src/modules/weather/map-open-meteo-weather-response";

const location: LocationOption = {
  id: "montevideo-uy",
  name: "Montevideo",
  region: "Montevideo Department",
  country: "Uruguay",
  latitude: -34.91,
  longitude: -56.16,
  timezone: "America/New_York",
};

const query: WeatherQuery = {
  lat: -34.9,
  lon: -56.16,
  tempUnit: "celsius",
  windUnit: "kmh",
};

const forecast: OpenMeteoForecastResponse = {
  timezone: "America/Montevideo",
  current: {
    time: "2024-06-10T12:00",
    temperature_2m: 18.34,
    apparent_temperature: 17.84,
    relative_humidity_2m: 70.6,
    precipitation: 0.72,
    weather_code: 1,
    wind_speed_10m: 13.44,
  },
  daily: {
    time: ["2024-06-10", "2024-06-11", "2024-06-12"],
    weather_code: [0, 61, 3],
    temperature_2m_max: [20.44, 18.66, 16.34],
    temperature_2m_min: [10.12, 9.84, 8.55],
  },
  hourly: {
    time: [
      "2024-06-10T09:00",
      "2024-06-10T15:00",
      "2024-06-11T11:00",
      "2024-06-11T17:00",
      "2024-06-12T08:00",
    ],
    temperature_2m: [15.23, 19.48, 14.91, 12.83, 11.18],
    precipitation_probability: [5, 20, 65, 80, 40],
    weather_code: [0, 1, 61, 63, 3],
  },
};

function createMappedWeather() {
  return mapOpenMeteoWeatherResponse({
    forecast,
    location,
    query,
  });
}

describe("mapOpenMeteoWeatherResponse", () => {
  it("maps normalized current weather fields", () => {
    const result = createMappedWeather();

    expect(result.location).toEqual({
      ...location,
      latitude: query.lat,
      longitude: query.lon,
      timezone: "America/Montevideo",
    });
    expect(result.units).toEqual({
      temperature: "celsius",
      windSpeed: "kmh",
      precipitation: "mm",
    });
    expect(result.current).toEqual({
      temperature: 18.3,
      feelsLike: 17.8,
      humidity: 71,
      windSpeed: 13.4,
      precipitation: 0.7,
      conditionCode: "wmo-1",
      conditionLabel: "Mainly clear",
      iconKey: "partly-cloudy",
      observedAt: "2024-06-10T12:00",
    });
  });

  it("maps the daily forecast into the normalized contract", () => {
    const result = createMappedWeather();

    expect(result.daily).toHaveLength(3);
    expect(result.daily.map((day) => day.dayLabel)).toEqual([
      "Today",
      "Tomorrow",
      "Wed",
    ]);
    expect(result.daily[0]).toMatchObject({
      date: "2024-06-10",
      minTemperature: 10.1,
      maxTemperature: 20.4,
      conditionCode: "wmo-0",
      conditionLabel: "Clear sky",
      iconKey: "sunny",
    });
    expect(result.daily[1]).toMatchObject({
      date: "2024-06-11",
      minTemperature: 9.8,
      maxTemperature: 18.7,
      conditionCode: "wmo-61",
      conditionLabel: "Slight rain",
      iconKey: "rain",
    });
  });

  it("groups hourly forecast entries by day without mixing days", () => {
    const result = createMappedWeather();

    expect(result.daily[0]?.hourly.map((hour) => hour.time)).toEqual([
      "2024-06-10T09:00",
      "2024-06-10T15:00",
    ]);
    expect(result.daily[1]?.hourly.map((hour) => hour.time)).toEqual([
      "2024-06-11T11:00",
      "2024-06-11T17:00",
    ]);
    expect(result.daily[2]?.hourly.map((hour) => hour.time)).toEqual([
      "2024-06-12T08:00",
    ]);
    expect(result.daily[1]?.hourly[0]).toMatchObject({
      time: "2024-06-11T11:00",
      temperature: 14.9,
      precipitationProbability: 65,
      conditionCode: "wmo-61",
      conditionLabel: "Slight rain",
      iconKey: "rain",
    });
  });
});
