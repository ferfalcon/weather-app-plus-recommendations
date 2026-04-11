const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

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

export async function fetchOpenMeteoLocationResults(query: string) {
  const url = new URL(OPEN_METEO_GEOCODING_URL);

  url.searchParams.set("name", query);
  url.searchParams.set("count", String(locationSearchResultLimit));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error("Open-Meteo geocoding request failed.", {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo geocoding request returned ${response.status}.`);
  }

  const responseBody = (await response.json()) as OpenMeteoGeocodingResponse;

  if (!Array.isArray(responseBody.results)) {
    return [];
  }

  return responseBody.results;
}
