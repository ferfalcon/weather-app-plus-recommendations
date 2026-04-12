import { useEffect, useId, useMemo, useState, type FormEvent } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type {
  LocationOption,
  WeatherPageResponse,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import { Surface } from "../../../components/ui/surface";
import { WeatherView } from "../../../features/weather/components/weather-view";
import { ApiError } from "../../../services/api/api-error";
import { getWeather } from "../../../services/api/get-weather";
import { searchLocations } from "../../../services/api/search-locations";
import { LocationSearchHero } from "./location-search-hero";
import { LocationSearchQuickSearches } from "./location-search-quick-searches";
import { LocationSearchResults } from "./location-search-results";
import { LocationSearchSelectionSidebar } from "./location-search-selection-sidebar";
import { LocationSearchStatusPanel } from "./location-search-status-panel";
import { formatLocationLabel } from "./location-search-view-helpers";
import {
  buildSelectedLocationFromSearch,
  type LocationSearchPageSearch,
} from "../location-search-page-search";
import styles from "./location-search-empty-state.module.css";

const sampleLocations = ["Montevideo", "Seoul", "Vancouver"];

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
        <LocationSearchHero
          helperText={searchFeedbackMessage}
          inputId="location-query"
          isSearching={isSearching}
          isSubmitDisabled={!trimmedQuery || isSearching}
          query={query}
          searchFeedbackId={searchFeedbackId}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
        />
        <LocationSearchQuickSearches
          sampleLocations={sampleLocations}
          onSampleLocationClick={handleSampleLocationClick}
        />
        <LocationSearchResults
          hasLocationSearchError={locationSearchQuery.isError}
          hasNoResults={hasNoResults}
          isSearching={isSearching}
          locationResultsMetaId={locationResultsMetaId}
          locations={locations}
          searchErrorMessage={searchErrorMessage}
          selectedLocationId={selectedLocation?.id ?? null}
          submittedQuery={submittedQuery}
          onLocationSelect={handleLocationSelect}
        />
      </Surface>

      <Surface as="aside" className={styles.sidebar}>
        <LocationSearchSelectionSidebar
          isSelectedLocationActive={selectedLocation !== null}
          statusHeading={statusHeading}
          statusKicker={statusKicker}
          statusLocation={statusLocation}
        />
      </Surface>

      {selectedLocation || hasDisplayedWeather ? (
        <Surface
          aria-busy={isInitialWeatherLoad || isRefreshingWeather}
          as="section"
          className={styles.weatherPanel}
        >
          {isInitialWeatherLoad ? (
            <LocationSearchStatusPanel
              copy={
                <>
                  Loading weather for <strong>{formatLocationLabel(selectedLocation!)}</strong>{" "}
                  through the app API.
                </>
              }
              heading="Fetching the forecast"
              kicker="Weather loading"
              liveRegion
            />
          ) : null}

          {isRefreshingWeather ? (
            <LocationSearchStatusPanel
              copy={
                <>
                  Keeping the last successful forecast visible while we load fresh
                  weather for <strong>{formatLocationLabel(selectedLocation!)}</strong>.
                </>
              }
              heading="Updating the selected forecast"
              kicker="Refresh in progress"
              liveRegion
            />
          ) : null}

          {weatherQuery.isError ? (
            <LocationSearchStatusPanel
              copy={`${weatherErrorMessage}${
                lastSuccessfulWeather
                  ? " Showing the last successful weather result while the new request is unavailable."
                  : " Try selecting the location again in a moment."
              }`}
              heading="The API could not load this forecast"
              kicker="Weather error"
              role="alert"
              tone="error"
            />
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
