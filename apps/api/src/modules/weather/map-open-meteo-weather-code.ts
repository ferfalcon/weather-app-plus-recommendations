type WeatherPresentation = {
  conditionCode: string;
  conditionLabel: string;
  iconKey: string;
};

const fallbackWeatherPresentation: WeatherPresentation = {
  conditionCode: "wmo-unknown",
  conditionLabel: "Unknown conditions",
  iconKey: "cloudy",
};

const weatherCodeMap = new Map<number, WeatherPresentation>([
  [
    0,
    {
      conditionCode: "wmo-0",
      conditionLabel: "Clear sky",
      iconKey: "sunny",
    },
  ],
  [
    1,
    {
      conditionCode: "wmo-1",
      conditionLabel: "Mainly clear",
      iconKey: "partly-cloudy",
    },
  ],
  [
    2,
    {
      conditionCode: "wmo-2",
      conditionLabel: "Partly cloudy",
      iconKey: "partly-cloudy",
    },
  ],
  [
    3,
    {
      conditionCode: "wmo-3",
      conditionLabel: "Overcast",
      iconKey: "overcast",
    },
  ],
  [
    45,
    {
      conditionCode: "wmo-45",
      conditionLabel: "Fog",
      iconKey: "fog",
    },
  ],
  [
    48,
    {
      conditionCode: "wmo-48",
      conditionLabel: "Depositing rime fog",
      iconKey: "fog",
    },
  ],
  [
    51,
    {
      conditionCode: "wmo-51",
      conditionLabel: "Light drizzle",
      iconKey: "drizzle",
    },
  ],
  [
    53,
    {
      conditionCode: "wmo-53",
      conditionLabel: "Moderate drizzle",
      iconKey: "drizzle",
    },
  ],
  [
    55,
    {
      conditionCode: "wmo-55",
      conditionLabel: "Dense drizzle",
      iconKey: "drizzle",
    },
  ],
  [
    56,
    {
      conditionCode: "wmo-56",
      conditionLabel: "Light freezing drizzle",
      iconKey: "drizzle",
    },
  ],
  [
    57,
    {
      conditionCode: "wmo-57",
      conditionLabel: "Dense freezing drizzle",
      iconKey: "drizzle",
    },
  ],
  [
    61,
    {
      conditionCode: "wmo-61",
      conditionLabel: "Slight rain",
      iconKey: "rain",
    },
  ],
  [
    63,
    {
      conditionCode: "wmo-63",
      conditionLabel: "Moderate rain",
      iconKey: "rain",
    },
  ],
  [
    65,
    {
      conditionCode: "wmo-65",
      conditionLabel: "Heavy rain",
      iconKey: "rain",
    },
  ],
  [
    66,
    {
      conditionCode: "wmo-66",
      conditionLabel: "Light freezing rain",
      iconKey: "rain",
    },
  ],
  [
    67,
    {
      conditionCode: "wmo-67",
      conditionLabel: "Heavy freezing rain",
      iconKey: "rain",
    },
  ],
  [
    71,
    {
      conditionCode: "wmo-71",
      conditionLabel: "Slight snow",
      iconKey: "snow",
    },
  ],
  [
    73,
    {
      conditionCode: "wmo-73",
      conditionLabel: "Moderate snow",
      iconKey: "snow",
    },
  ],
  [
    75,
    {
      conditionCode: "wmo-75",
      conditionLabel: "Heavy snow",
      iconKey: "snow",
    },
  ],
  [
    77,
    {
      conditionCode: "wmo-77",
      conditionLabel: "Snow grains",
      iconKey: "snow",
    },
  ],
  [
    80,
    {
      conditionCode: "wmo-80",
      conditionLabel: "Slight rain showers",
      iconKey: "rain",
    },
  ],
  [
    81,
    {
      conditionCode: "wmo-81",
      conditionLabel: "Moderate rain showers",
      iconKey: "rain",
    },
  ],
  [
    82,
    {
      conditionCode: "wmo-82",
      conditionLabel: "Violent rain showers",
      iconKey: "rain",
    },
  ],
  [
    85,
    {
      conditionCode: "wmo-85",
      conditionLabel: "Slight snow showers",
      iconKey: "snow",
    },
  ],
  [
    86,
    {
      conditionCode: "wmo-86",
      conditionLabel: "Heavy snow showers",
      iconKey: "snow",
    },
  ],
  [
    95,
    {
      conditionCode: "wmo-95",
      conditionLabel: "Thunderstorm",
      iconKey: "storm",
    },
  ],
  [
    96,
    {
      conditionCode: "wmo-96",
      conditionLabel: "Thunderstorm with slight hail",
      iconKey: "storm",
    },
  ],
  [
    99,
    {
      conditionCode: "wmo-99",
      conditionLabel: "Thunderstorm with heavy hail",
      iconKey: "storm",
    },
  ],
]);

export function mapOpenMeteoWeatherCode(code: number | undefined) {
  if (typeof code !== "number") {
    return fallbackWeatherPresentation;
  }

  return weatherCodeMap.get(code) ?? {
    conditionCode: `wmo-${code}`,
    conditionLabel: "Unmapped weather condition",
    iconKey: "cloudy",
  };
}
