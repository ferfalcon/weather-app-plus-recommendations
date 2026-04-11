import { request as httpsRequest } from "node:https";

const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const locationSearchRequestTimeoutMs = 8_000;

export const locationSearchResultLimit = 8;

export type OpenMeteoLocationResult = {
  id?: number;
  name?: string;
  country?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoLocationResult[];
};

type LocationSearchProviderErrorOptions = {
  cause?: unknown;
  requestUrl: string;
  responseBodyText: string | undefined;
  status: number | undefined;
};

export class LocationSearchProviderError extends Error {
  readonly requestUrl: string;
  readonly responseBodyText: string | undefined;
  readonly status: number | undefined;

  constructor(message: string, options: LocationSearchProviderErrorOptions) {
    super(message, {
      cause: options.cause,
    });

    this.name = "LocationSearchProviderError";
    this.requestUrl = options.requestUrl;
    this.responseBodyText = options.responseBodyText;
    this.status = options.status;
  }
}

type ProviderHttpResponse = {
  bodyText: string;
  status: number | undefined;
};

function requestOpenMeteoLocationResults(requestUrl: string): Promise<ProviderHttpResponse> {
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

    request.setTimeout(locationSearchRequestTimeoutMs, () => {
      const timeoutError = new Error(
        `Open-Meteo geocoding request timed out after ${locationSearchRequestTimeoutMs}ms.`,
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

export async function fetchOpenMeteoLocationResults(query: string) {
  const url = new URL(OPEN_METEO_GEOCODING_URL);

  url.searchParams.set("name", query);
  url.searchParams.set("count", String(locationSearchResultLimit));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const requestUrl = url.toString();
  let providerResponse: ProviderHttpResponse;

  try {
    providerResponse = await requestOpenMeteoLocationResults(requestUrl);
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new LocationSearchProviderError(
        `Open-Meteo geocoding request timed out after ${locationSearchRequestTimeoutMs}ms.`,
        {
          cause: error,
          requestUrl,
          responseBodyText: undefined,
          status: undefined,
        },
      );
    }

    throw new LocationSearchProviderError("Open-Meteo geocoding request failed.", {
      cause: error,
      requestUrl,
      responseBodyText: undefined,
      status: undefined,
    });
  }

  if (providerResponse.status === undefined) {
    throw new LocationSearchProviderError(
      "Open-Meteo geocoding request returned no HTTP status.",
      {
        requestUrl,
        responseBodyText: providerResponse.bodyText.trim() || undefined,
        status: undefined,
      },
    );
  }

  if (providerResponse.status < 200 || providerResponse.status >= 300) {
    const responseBodyText = providerResponse.bodyText.trim();

    throw new LocationSearchProviderError(
      `Open-Meteo geocoding request returned ${providerResponse.status}.`,
      {
        requestUrl,
        responseBodyText: responseBodyText || undefined,
        status: providerResponse.status,
      },
    );
  }

  let responseBody: OpenMeteoGeocodingResponse;

  try {
    responseBody = JSON.parse(providerResponse.bodyText) as OpenMeteoGeocodingResponse;
  } catch (error) {
    throw new LocationSearchProviderError(
      "Open-Meteo geocoding response could not be parsed as JSON.",
      {
        cause: error,
        requestUrl,
        responseBodyText: providerResponse.bodyText.trim() || undefined,
        status: providerResponse.status,
      },
    );
  }

  if (!Array.isArray(responseBody.results)) {
    return [];
  }

  return responseBody.results;
}
