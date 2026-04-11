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

export async function fetchOpenMeteoLocationResults(query: string) {
  const url = new URL(OPEN_METEO_GEOCODING_URL);

  url.searchParams.set("name", query);
  url.searchParams.set("count", String(locationSearchResultLimit));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const requestUrl = url.toString();
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, locationSearchRequestTimeoutMs);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      signal: abortController.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
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
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const responseBodyText = (await response.text()).trim();

    throw new LocationSearchProviderError(
      `Open-Meteo geocoding request returned ${response.status}.`,
      {
        requestUrl,
        responseBodyText: responseBodyText || undefined,
        status: response.status,
      },
    );
  }

  const responseBody = (await response.json()) as OpenMeteoGeocodingResponse;

  if (!Array.isArray(responseBody.results)) {
    return [];
  }

  return responseBody.results;
}
