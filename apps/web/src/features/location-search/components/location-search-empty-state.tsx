import { useEffect, useState, type FormEvent } from "react";

import { useQuery } from "@tanstack/react-query";
import type {
  LocationOption,
  WeatherPageResponse,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Surface } from "../../../components/ui/surface";
import { WeatherView } from "../../../features/weather/components/weather-view";
import { ApiError } from "../../../services/api/api-error";
import { getWeather } from "../../../services/api/get-weather";
import { searchLocations } from "../../../services/api/search-locations";
import styles from "./location-search-empty-state.module.css";

const sampleLocations = ["Montevideo", "Seoul", "Vancouver"];

const defaultWeatherUnits = {
  tempUnit: "celsius",
  windUnit: "kmh",
} satisfies Pick<WeatherQuery, "tempUnit" | "windUnit">;

function formatLocationLabel(location: LocationOption) {
  const regionDetails = location.region
    ? `${location.region}, ${location.country}`
    : location.country;

  return `${location.name}, ${regionDetails}`;
}

function getSearchFeedbackMessage(options: {
  hasLocationSearchError: boolean;
  hasWeatherError: boolean;
  hasWeatherSuccess: boolean;
  isSearching: boolean;
  isWeatherLoading: boolean;
  resultCount: number;
  selectedLocation: LocationOption | null;
  submittedQuery: string;
}) {
  const {
    hasLocationSearchError,
    hasWeatherError,
    hasWeatherSuccess,
    isSearching,
    isWeatherLoading,
    resultCount,
    selectedLocation,
    submittedQuery,
  } = options;

  if (!submittedQuery) {
    return "Search for a city, region, or country to see matching locations.";
  }

  if (selectedLocation && isWeatherLoading) {
    return `Loading weather for ${formatLocationLabel(selectedLocation)}.`;
  }

  if (selectedLocation && hasWeatherError) {
    return `Weather loading failed for ${formatLocationLabel(selectedLocation)}.`;
  }

  if (selectedLocation && hasWeatherSuccess) {
    return `Showing live weather for ${formatLocationLabel(selectedLocation)}.`;
  }

  if (hasLocationSearchError) {
    return `Location search failed for "${submittedQuery}".`;
  }

  if (isSearching) {
    return `Searching for matches for "${submittedQuery}"...`;
  }

  if (resultCount === 0) {
    return `No locations found for "${submittedQuery}".`;
  }

  return `${resultCount} matching ${
    resultCount === 1 ? "location" : "locations"
  } found for "${submittedQuery}".`;
}

export function LocationSearchEmptyState() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [selectedWeatherUnits, setSelectedWeatherUnits] = useState<
    Pick<WeatherQuery, "tempUnit" | "windUnit">
  >(defaultWeatherUnits);
  const [lastSuccessfulLocation, setLastSuccessfulLocation] =
    useState<LocationOption | null>(null);
  const [lastSuccessfulWeather, setLastSuccessfulWeather] =
    useState<WeatherPageResponse | null>(null);

  const locationSearchQuery = useQuery({
    queryKey: ["location-search", submittedQuery],
    queryFn: () => searchLocations(submittedQuery),
    enabled: submittedQuery.length > 0,
  });

  const weatherQuery = useQuery({
    queryKey: [
      "weather",
      selectedLocation?.id ?? "idle",
      selectedLocation?.latitude ?? 0,
      selectedLocation?.longitude ?? 0,
      selectedWeatherUnits.tempUnit,
      selectedWeatherUnits.windUnit,
    ],
    queryFn: () => {
      if (!selectedLocation) {
        throw new Error("Selected location is required to request weather.");
      }

      return getWeather({
        lat: selectedLocation.latitude,
        lon: selectedLocation.longitude,
        tempUnit: selectedWeatherUnits.tempUnit,
        windUnit: selectedWeatherUnits.windUnit,
      });
    },
    enabled: selectedLocation !== null,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (
      selectedLocation &&
      weatherQuery.data &&
      weatherQuery.isSuccess &&
      !weatherQuery.isPlaceholderData
    ) {
      setLastSuccessfulLocation(selectedLocation);
      setLastSuccessfulWeather(weatherQuery.data);
    }
  }, [
    selectedLocation,
    weatherQuery.data,
    weatherQuery.isPlaceholderData,
    weatherQuery.isSuccess,
  ]);

  const locations = locationSearchQuery.data ?? [];
  const trimmedQuery = query.trim();
  const isSearching = locationSearchQuery.isPending || locationSearchQuery.isFetching;
  const isInitialWeatherLoad =
    selectedLocation !== null &&
    weatherQuery.isPending &&
    lastSuccessfulWeather === null;
  const isRefreshingWeather =
    selectedLocation !== null &&
    weatherQuery.isFetching &&
    lastSuccessfulWeather !== null;
  const hasSearchResults = locations.length > 0;
  const hasNoResults =
    submittedQuery.length > 0 && locationSearchQuery.isSuccess && locations.length === 0;
  const searchErrorMessage =
    locationSearchQuery.error instanceof ApiError
      ? locationSearchQuery.error.message
      : "Unable to search locations right now.";
  const weatherErrorMessage =
    weatherQuery.error instanceof ApiError
      ? weatherQuery.error.message
      : "Unable to load weather right now.";
  const isShowingCurrentWeather =
    selectedLocation !== null &&
    weatherQuery.data !== undefined &&
    !weatherQuery.isPlaceholderData;
  const displayedWeather = weatherQuery.data ?? lastSuccessfulWeather;
  const displayedWeatherLocation =
    isShowingCurrentWeather && selectedLocation
      ? selectedLocation
      : lastSuccessfulLocation;
  const hasDisplayedWeather =
    displayedWeather != null && displayedWeatherLocation !== null;
  const searchFeedbackMessage = getSearchFeedbackMessage({
    submittedQuery,
    selectedLocation,
    isSearching,
    hasLocationSearchError: locationSearchQuery.isError,
    isWeatherLoading: isInitialWeatherLoad || isRefreshingWeather,
    hasWeatherError: weatherQuery.isError,
    hasWeatherSuccess: isShowingCurrentWeather,
    resultCount: locations.length,
  });
  const statusLocation = selectedLocation ?? lastSuccessfulLocation;
  const statusHeading = selectedLocation
    ? selectedLocation.name
    : lastSuccessfulLocation
      ? lastSuccessfulLocation.name
      : "What this screen is doing now";
  const statusKicker = selectedLocation
    ? "Selected location"
    : lastSuccessfulLocation
      ? "Latest loaded location"
      : "Search-first weather flow";

  function submitSearch(nextQuery: string) {
    setSelectedLocation(null);

    if (nextQuery === submittedQuery) {
      void locationSearchQuery.refetch();
      return;
    }

    setSubmittedQuery(nextQuery);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedQuery) {
      return;
    }

    submitSearch(trimmedQuery);
  }

  function handleSampleLocationClick(location: string) {
    setQuery(location);
    submitSearch(location);
  }

  function handleLocationSelect(location: LocationOption) {
    setSelectedLocation(location);
  }

  function handleTemperatureUnitChange(nextTempUnit: WeatherQuery["tempUnit"]) {
    setSelectedWeatherUnits((currentUnits) => {
      if (currentUnits.tempUnit === nextTempUnit) {
        return currentUnits;
      }

      return {
        ...currentUnits,
        tempUnit: nextTempUnit,
      };
    });
  }

  function handleWindUnitChange(nextWindUnit: WeatherQuery["windUnit"]) {
    setSelectedWeatherUnits((currentUnits) => {
      if (currentUnits.windUnit === nextWindUnit) {
        return currentUnits;
      }

      return {
        ...currentUnits,
        windUnit: nextWindUnit,
      };
    });
  }

  return (
    <section className={styles.layout}>
      <Surface className={styles.hero}>
        <p className={styles.kicker}>Phase 2.6 units and day switching</p>
        <h1 className={styles.heading}>Search, refetch units, switch hourly days.</h1>
        <p className={styles.copy}>
          Location search still runs through the app API, and selecting a match
          now requests a real normalized weather payload with current conditions,
          extra metrics, a daily forecast, selectable hourly day detail, and
          backend-driven unit changes.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="location-query">
            Search location
          </label>

          <div className={styles.formRow}>
            <Input
              id="location-query"
              name="locationQuery"
              placeholder="Try Montevideo, Seoul, or Vancouver"
              required
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button disabled={!trimmedQuery || isSearching} type="submit">
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <p aria-live="polite" className={styles.helper} role="status">
            {searchFeedbackMessage}
          </p>
        </form>

        {isSearching ? (
          <div className={styles.statusPanel}>
            <p className={styles.panelKicker}>Search in progress</p>
            <h2 className={styles.panelHeading}>Finding matching locations</h2>
            <p className={styles.panelCopy}>
              Looking up results for <strong>{submittedQuery}</strong> through
              the backend geocoding flow.
            </p>
          </div>
        ) : null}

        {locationSearchQuery.isError ? (
          <div className={styles.errorPanel} role="alert">
            <p className={styles.panelKicker}>Search error</p>
            <h2 className={styles.panelHeading}>The API could not complete this search</h2>
            <p className={styles.panelCopy}>
              {searchErrorMessage} Try the search again in a moment.
            </p>
          </div>
        ) : null}

        {hasNoResults ? (
          <div className={styles.noResultsPanel}>
            <p className={styles.panelKicker}>No matches</p>
            <h2 className={styles.panelHeading}>No locations matched this search</h2>
            <p className={styles.panelCopy}>
              We could not find any results for <strong>{submittedQuery}</strong>.
              Check the spelling or try a nearby city, region, or country.
            </p>
          </div>
        ) : null}

        {hasSearchResults ? (
          <section aria-labelledby="location-results-heading" className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <div>
                <p className={styles.panelKicker}>Choose a location</p>
                <h2 className={styles.resultsHeading} id="location-results-heading">
                  Select the right match
                </h2>
              </div>
              <p className={styles.resultsMeta}>
                {locations.length} result
                {locations.length === 1 ? "" : "s"}
              </p>
            </div>

            <ul className={styles.resultsList}>
              {locations.map((location) => {
                const isSelected = location.id === selectedLocation?.id;

                return (
                  <li key={location.id}>
                    <button
                      aria-pressed={isSelected}
                      className={`${styles.resultButton} ${
                        isSelected ? styles.resultButtonSelected : ""
                      }`}
                      onClick={() => handleLocationSelect(location)}
                      type="button"
                    >
                      <span className={styles.resultText}>
                        <span className={styles.resultTitle}>
                          {formatLocationLabel(location)}
                        </span>
                        <span className={styles.resultMetaLine}>
                          {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)} ·{" "}
                          {location.timezone}
                        </span>
                      </span>
                      <span className={styles.resultBadge}>
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className={styles.samples}>
          <span className={styles.samplesLabel}>Quick examples</span>
          <div className={styles.sampleList}>
            {sampleLocations.map((location) => (
              <Button
                key={location}
                aria-label={`Search for ${location}`}
                variant="secondary"
                onClick={() => handleSampleLocationClick(location)}
              >
                {location}
              </Button>
            ))}
          </div>
        </div>
      </Surface>

      <Surface as="aside" className={styles.sidebar}>
        <p className={styles.sidebarKicker}>{statusKicker}</p>
        <h2 className={styles.sidebarHeading}>{statusHeading}</h2>

        {statusLocation ? (
          <div className={styles.selectionCard}>
            <p className={styles.selectionLabel}>{formatLocationLabel(statusLocation)}</p>
            <dl className={styles.selectionDetails}>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {statusLocation.latitude.toFixed(2)}, {statusLocation.longitude.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt>Timezone</dt>
                <dd>{statusLocation.timezone}</dd>
              </div>
            </dl>
            <p className={styles.selectionCopy}>
              {selectedLocation
                ? "This location and the requested units stay in local UI state while the weather query runs through TanStack Query."
                : "The last successful weather view stays visible until a new selection or unit change finishes loading."}
            </p>
          </div>
        ) : (
          <ul className={styles.checklist}>
            <li>Current weather and extra metrics from the internal API</li>
            <li>Daily forecast plus selectable hourly day detail from normalized data</li>
            <li>Backend refetches when units change without client-side conversion</li>
          </ul>
        )}
      </Surface>

      {selectedLocation || hasDisplayedWeather ? (
        <Surface as="section" className={styles.weatherPanel}>
          {isInitialWeatherLoad ? (
            <div className={styles.statusPanel}>
              <p className={styles.panelKicker}>Weather loading</p>
              <h2 className={styles.panelHeading}>Fetching the forecast</h2>
              <p className={styles.panelCopy}>
                Loading weather for <strong>{formatLocationLabel(selectedLocation!)}</strong>{" "}
                through the app API.
              </p>
            </div>
          ) : null}

          {weatherQuery.isError ? (
            <div className={styles.errorPanel} role="alert">
              <p className={styles.panelKicker}>Weather error</p>
              <h2 className={styles.panelHeading}>The API could not load this forecast</h2>
              <p className={styles.panelCopy}>
                {weatherErrorMessage}
                {lastSuccessfulWeather
                  ? " Showing the last successful weather result while the new request is unavailable."
                  : " Try selecting the location again in a moment."}
              </p>
            </div>
          ) : null}

          {hasDisplayedWeather ? (
            <WeatherView
              highlightedLocation={displayedWeatherLocation}
              isRefreshing={isRefreshingWeather}
              onTemperatureUnitChange={handleTemperatureUnitChange}
              onWindUnitChange={handleWindUnitChange}
              selectedUnits={selectedWeatherUnits}
              title={
                isShowingCurrentWeather
                  ? "Live weather from the app API"
                  : "Latest loaded weather"
              }
              weather={displayedWeather}
            />
          ) : null}
        </Surface>
      ) : null}
    </section>
  );
}
