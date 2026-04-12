import { useEffect, useId, useMemo, useState, type FormEvent } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
import {
  buildSelectedLocationFromSearch,
  type LocationSearchPageSearch,
} from "../location-search-page-search";
import styles from "./location-search-empty-state.module.css";

const sampleLocations = ["Montevideo", "Seoul", "Vancouver"];

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
  const navigate = useNavigate({ from: "/" });
  const routeSearch = useSearch({ from: "/" });
  const searchFeedbackId = useId();
  const locationResultsMetaId = useId();
  const submittedQuery = routeSearch.q ?? "";
  const selectedLocation = useMemo(() => {
    return buildSelectedLocationFromSearch(routeSearch);
  }, [
    routeSearch.country,
    routeSearch.lat,
    routeSearch.locationId,
    routeSearch.lon,
    routeSearch.name,
    routeSearch.region,
    routeSearch.timezone,
  ]);
  const selectedWeatherUnits = useMemo(
    () =>
      ({
        tempUnit: routeSearch.tempUnit,
        windUnit: routeSearch.windUnit,
      }) satisfies Pick<WeatherQuery, "tempUnit" | "windUnit">,
    [routeSearch.tempUnit, routeSearch.windUnit],
  );
  const [query, setQuery] = useState(submittedQuery);
  const [lastSuccessfulLocation, setLastSuccessfulLocation] =
    useState<LocationOption | null>(null);
  const [lastSuccessfulWeather, setLastSuccessfulWeather] =
    useState<WeatherPageResponse | null>(null);

  useEffect(() => {
    setQuery(submittedQuery);
  }, [submittedQuery]);

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
  const isSearching =
    submittedQuery.length > 0 && locationSearchQuery.fetchStatus === "fetching";
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
      : "Choose a place to load weather";
  const statusKicker = selectedLocation
    ? "Selected location"
    : lastSuccessfulLocation
      ? "Latest loaded forecast"
      : "Ready to search";

  function updateRouteSearch(
    updater: (previousSearch: LocationSearchPageSearch) => LocationSearchPageSearch,
  ) {
    void navigate({
      replace: true,
      search: (previousSearch) => updater(previousSearch),
      to: "/",
    });
  }

  function clearSelectedLocation(nextQuery: string) {
    updateRouteSearch((previousSearch) => ({
      tempUnit: previousSearch.tempUnit,
      windUnit: previousSearch.windUnit,
      q: nextQuery,
    }));
  }

  function submitSearch(nextQuery: string) {
    clearSelectedLocation(nextQuery);

    if (nextQuery === submittedQuery) {
      void locationSearchQuery.refetch();
      return;
    }
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
    updateRouteSearch((previousSearch) => ({
      ...previousSearch,
      country: location.country,
      lat: location.latitude,
      locationId: location.id,
      lon: location.longitude,
      name: location.name,
      q: submittedQuery,
      timezone: location.timezone,
      ...(location.region ? { region: location.region } : {}),
    }));
  }

  function handleTemperatureUnitChange(nextTempUnit: WeatherQuery["tempUnit"]) {
    if (selectedWeatherUnits.tempUnit === nextTempUnit) {
      return;
    }

    updateRouteSearch((previousSearch) => {
      return {
        ...previousSearch,
        tempUnit: nextTempUnit,
      };
    });
  }

  function handleWindUnitChange(nextWindUnit: WeatherQuery["windUnit"]) {
    if (selectedWeatherUnits.windUnit === nextWindUnit) {
      return;
    }

    updateRouteSearch((previousSearch) => {
      return {
        ...previousSearch,
        windUnit: nextWindUnit,
      };
    });
  }

  return (
    <section className={styles.layout}>
      <Surface className={styles.hero}>
        <p className={styles.kicker}>Search-first weather experience</p>
        <h1 className={styles.heading}>Search for a place, then read the forecast.</h1>
        <p className={styles.copy}>
          Search by city, region, or country, choose the right match, then check
          current conditions, daily outlooks, hourly detail, and practical
          suggestions without leaving the page.
        </p>

        <form
          aria-busy={isSearching}
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.label} htmlFor="location-query">
            Search location
          </label>

          <div className={styles.formRow}>
            <Input
              aria-describedby={searchFeedbackId}
              enterKeyHint="search"
              id="location-query"
              name="locationQuery"
              placeholder="Try Montevideo, Seoul, or Vancouver"
              required
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button
              className={styles.submitButton}
              disabled={!trimmedQuery || isSearching}
              type="submit"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <p
            aria-atomic="true"
            aria-live="polite"
            className={styles.helper}
            id={searchFeedbackId}
            role="status"
          >
            {searchFeedbackMessage}
          </p>
        </form>

        {isSearching ? (
          <div
            aria-atomic="true"
            aria-live="polite"
            className={styles.statusPanel}
            role="status"
          >
            <p className={styles.panelKicker}>Search in progress</p>
            <h2 className={styles.panelHeading}>Finding matching locations</h2>
            <p className={styles.panelCopy}>
              Searching the app API for matches for <strong>{submittedQuery}</strong>.
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
          <div
            aria-atomic="true"
            aria-live="polite"
            className={styles.noResultsPanel}
            role="status"
          >
            <p className={styles.panelKicker}>No matches</p>
            <h2 className={styles.panelHeading}>No locations matched this search</h2>
            <p className={styles.panelCopy}>
              We could not find any results for <strong>{submittedQuery}</strong>.
              Check the spelling or try a nearby city, region, or country.
            </p>
          </div>
        ) : null}

        {hasSearchResults ? (
          <section
            aria-describedby={locationResultsMetaId}
            aria-labelledby="location-results-heading"
            className={styles.resultsSection}
          >
            <div className={styles.resultsHeader}>
              <div>
                <p className={styles.panelKicker}>Choose a location</p>
                <h2 className={styles.resultsHeading} id="location-results-heading">
                  Select the right match
                </h2>
              </div>
              <p className={styles.resultsMeta} id={locationResultsMetaId}>
                {locations.length} result
                {locations.length === 1 ? "" : "s"}
              </p>
            </div>

            <ul className={styles.resultsList}>
              {locations.map((location, index) => {
                const isSelected = location.id === selectedLocation?.id;
                const resultMetaId = `${locationResultsMetaId}-${index}`;

                return (
                  <li key={location.id}>
                    <button
                      aria-describedby={resultMetaId}
                      aria-label={
                        isSelected
                          ? `${formatLocationLabel(location)}, selected location`
                          : `Select ${formatLocationLabel(location)}`
                      }
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
                        <span className={styles.resultMetaLine} id={resultMetaId}>
                          {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)} ·{" "}
                          {location.timezone}
                        </span>
                      </span>
                      <span aria-hidden="true" className={styles.resultBadge}>
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
          <span className={styles.samplesLabel}>Try a quick search</span>
          <div className={styles.sampleList}>
            {sampleLocations.map((location) => (
              <Button
                key={location}
                aria-label={`Search for ${location}`}
                className={styles.sampleButton}
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
            <div className={styles.selectionHeader}>
              <p className={styles.selectionLabel}>{formatLocationLabel(statusLocation)}</p>
              <span className={styles.selectionBadge}>
                {selectedLocation ? "Selected now" : "Latest loaded"}
              </span>
            </div>
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
                ? "Weather for this location loads below, and changing units requests a refreshed forecast from the API."
                : "The last successful forecast stays visible while a new request loads or if the next request fails."}
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
        <Surface
          aria-busy={isInitialWeatherLoad || isRefreshingWeather}
          as="section"
          className={styles.weatherPanel}
        >
          {isInitialWeatherLoad ? (
            <div
              aria-atomic="true"
              aria-live="polite"
              className={styles.statusPanel}
              role="status"
            >
              <p className={styles.panelKicker}>Weather loading</p>
              <h2 className={styles.panelHeading}>Fetching the forecast</h2>
              <p className={styles.panelCopy}>
                Loading weather for <strong>{formatLocationLabel(selectedLocation!)}</strong>{" "}
                through the app API.
              </p>
            </div>
          ) : null}

          {isRefreshingWeather ? (
            <div
              aria-atomic="true"
              aria-live="polite"
              className={styles.statusPanel}
              role="status"
            >
              <p className={styles.panelKicker}>Refresh in progress</p>
              <h2 className={styles.panelHeading}>Updating the selected forecast</h2>
              <p className={styles.panelCopy}>
                Keeping the last successful forecast visible while we load fresh
                weather for <strong>{formatLocationLabel(selectedLocation!)}</strong>.
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
              title={isShowingCurrentWeather ? "Live weather" : "Latest loaded weather"}
              weather={displayedWeather}
            />
          ) : null}
        </Surface>
      ) : null}
    </section>
  );
}
