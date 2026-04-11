import { z } from "zod";

import { locationOptionSchema } from "./locations";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const temperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);
export const windSpeedUnitSchema = z.enum(["kmh", "mph"]);
export const precipitationUnitSchema = z.literal("mm");

export const weatherUnitsSchema = z.object({
  temperature: temperatureUnitSchema,
  windSpeed: windSpeedUnitSchema,
  precipitation: precipitationUnitSchema,
});

export const currentWeatherSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number().int().gte(0).lte(100),
  windSpeed: z.number().gte(0),
  precipitation: z.number().gte(0),
  conditionCode: z.string().min(1),
  conditionLabel: z.string().min(1),
  iconKey: z.string().min(1),
  observedAt: z.string().min(1),
});

export const hourlyForecastItemSchema = z.object({
  time: z.string().min(1),
  temperature: z.number(),
  precipitationProbability: z.number().int().gte(0).lte(100),
  iconKey: z.string().min(1),
  conditionCode: z.string().min(1),
  conditionLabel: z.string().min(1),
});

export const forecastDaySchema = z.object({
  date: isoDateSchema,
  dayLabel: z.string().min(1),
  minTemperature: z.number(),
  maxTemperature: z.number(),
  iconKey: z.string().min(1),
  conditionCode: z.string().min(1),
  conditionLabel: z.string().min(1),
  hourly: z.array(hourlyForecastItemSchema),
});

export const activitySuggestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["indoor", "outdoor", "flexible"]),
  reasonTag: z.enum(["rainy", "sunny", "hot", "cold", "windy", "mixed"]),
});

export const recommendationsSchema = z.object({
  items: z.array(activitySuggestionSchema).length(3),
  source: z.enum(["ai", "fallback", "placeholder"]),
});

export const weatherPageResponseSchema = z.object({
  location: locationOptionSchema,
  units: weatherUnitsSchema,
  current: currentWeatherSchema,
  daily: z.array(forecastDaySchema).min(1),
  recommendations: recommendationsSchema,
});

export const weatherQuerySchema = z.object({
  lat: z.coerce.number().gte(-90).lte(90),
  lon: z.coerce.number().gte(-180).lte(180),
  tempUnit: temperatureUnitSchema,
  windUnit: windSpeedUnitSchema,
});

export const weatherResponseSchema = weatherPageResponseSchema;

export type WeatherUnits = z.infer<typeof weatherUnitsSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type HourlyForecastItem = z.infer<typeof hourlyForecastItemSchema>;
export type ForecastDay = z.infer<typeof forecastDaySchema>;
export type ActivitySuggestion = z.infer<typeof activitySuggestionSchema>;
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
export type WeatherPageResponse = z.infer<typeof weatherPageResponseSchema>;
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
