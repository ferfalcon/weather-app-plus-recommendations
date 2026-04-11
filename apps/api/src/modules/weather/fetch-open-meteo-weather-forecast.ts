import { request as httpsRequest } from "node:https";

import type { WeatherQuery } from "@weather-app-plus-recommendations/contracts";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const weatherForecastRequestTimeoutMs = 8_000;

export type OpenMeteoForecastResponse = {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
  };
};

type WeatherProviderErrorOptions = {
  cause?: unknown;
  requestUrl: string;
  responseBodyText: string | undefined;
  status: number | undefined;
};

type ProviderHttpResponse = {
  bodyText: string;
  status: number | undefined;
};

export class WeatherProviderError extends Error {
  readonly requestUrl: string;
  readonly responseBodyText: string | undefined;
  readonly status: number | undefined;

  constructor(message: string, options: WeatherProviderErrorOptions) {
    super(message, {
      cause: options.cause,
    });

    this.name = "WeatherProviderError";
    this.requestUrl = options.requestUrl;
    this.responseBodyText = options.responseBodyText;
    this.status = options.status;
  }
}

function requestOpenMeteoWeatherForecast(
  requestUrl: string,
): Promise<ProviderHttpResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(requestUrl);

    const request = httpsRequest(
      {
        family: 4,
        headers: {
          accept: "application/json",
        },
        hostname: url.hostname,
        method: "GET",
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

    request.setTimeout(weatherForecastRequestTimeoutMs, () => {
      const timeoutError = new Error(
        `Open-Meteo weather request timed out after ${weatherForecastRequestTimeoutMs}ms.`,
      );

      timeoutError.name = "TimeoutError";
      request.destroy(timeoutError);
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}

function getTemperatureUnit(tempUnit: WeatherQuery["tempUnit"]) {
  return tempUnit === "fahrenheit" ? "fahrenheit" : "celsius";
}

function getWindSpeedUnit(windUnit: WeatherQuery["windUnit"]) {
  return windUnit === "mph" ? "mph" : "kmh";
}

export function buildOpenMeteoWeatherForecastRequestUrl(query: WeatherQuery) {
  const url = new URL(OPEN_METEO_FORECAST_URL);

  url.searchParams.set("latitude", String(query.lat));
  url.searchParams.set("longitude", String(query.lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    ["weather_code", "temperature_2m_max", "temperature_2m_min"].join(","),
  );
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "precipitation_probability", "weather_code"].join(","),
  );
  url.searchParams.set("temperature_unit", getTemperatureUnit(query.tempUnit));
  url.searchParams.set("wind_speed_unit", getWindSpeedUnit(query.windUnit));
  url.searchParams.set("precipitation_unit", "mm");

  return url.toString();
}

export async function fetchOpenMeteoWeatherForecast(query: WeatherQuery) {
  const requestUrl = buildOpenMeteoWeatherForecastRequestUrl(query);
  let providerResponse: ProviderHttpResponse;

  try {
    providerResponse = await requestOpenMeteoWeatherForecast(requestUrl);
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new WeatherProviderError(
        `Open-Meteo weather request timed out after ${weatherForecastRequestTimeoutMs}ms.`,
        {
          cause: error,
          requestUrl,
          responseBodyText: undefined,
          status: undefined,
        },
      );
    }

    throw new WeatherProviderError("Open-Meteo weather request failed.", {
      cause: error,
      requestUrl,
      responseBodyText: undefined,
      status: undefined,
    });
  }

  if (providerResponse.status === undefined) {
    throw new WeatherProviderError(
      "Open-Meteo weather request returned no HTTP status.",
      {
        requestUrl,
        responseBodyText: providerResponse.bodyText.trim() || undefined,
        status: undefined,
      },
    );
  }

  if (providerResponse.status < 200 || providerResponse.status >= 300) {
    const responseBodyText = providerResponse.bodyText.trim();

    throw new WeatherProviderError(
      `Open-Meteo weather request returned ${providerResponse.status}.`,
      {
        requestUrl,
        responseBodyText: responseBodyText || undefined,
        status: providerResponse.status,
      },
    );
  }

  try {
    return JSON.parse(providerResponse.bodyText) as OpenMeteoForecastResponse;
  } catch (error) {
    throw new WeatherProviderError(
      "Open-Meteo weather response could not be parsed as JSON.",
      {
        cause: error,
        requestUrl,
        responseBodyText: providerResponse.bodyText.trim() || undefined,
        status: providerResponse.status,
      },
    );
  }
}
