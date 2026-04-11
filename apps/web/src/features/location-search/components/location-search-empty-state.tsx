import { useState, type FormEvent } from "react";

import { useQuery } from "@tanstack/react-query";
import type { LocationOption } from "@weather-app-plus-recommendations/contracts";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Surface } from "../../../components/ui/surface";
import { ApiError, searchLocations } from "../../../services/api/search-locations";
import styles from "./location-search-empty-state.module.css";

const sampleLocations = ["Montevideo", "Seoul", "Vancouver"];

function formatLocationLabel(location: LocationOption) {
  const regionDetails = location.region
    ? `${location.region}, ${location.country}`
    : location.country;

  return `${location.name}, ${regionDetails}`;
}

function getSearchFeedbackMessage(options: {
  submittedQuery: string;
  selectedLocation: LocationOption | null;
  isSearching: boolean;
  isError: boolean;
  resultCount: number;
}) {
  const {
    submittedQuery,
    selectedLocation,
    isSearching,
    isError,
    resultCount,
  } = options;

  if (!submittedQuery) {
    return "Search for a city, region, or country to see matching locations.";
  }

  if (selectedLocation) {
    return `Selected ${formatLocationLabel(selectedLocation)}. Weather loading comes next.`;
  }

  if (isSearching) {
    return `Searching for matches for "${submittedQuery}"...`;
  }

  if (isError) {
    return `Location search failed for "${submittedQuery}".`;
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
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const locationSearchQuery = useQuery({
    queryKey: ["location-search", submittedQuery],
    queryFn: () => searchLocations(submittedQuery),
    enabled: submittedQuery.length > 0,
  });

  const locations = locationSearchQuery.data ?? [];
  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? null;
  const trimmedQuery = query.trim();
  const isSearching = locationSearchQuery.isPending || locationSearchQuery.isFetching;
  const hasSearchResults = locations.length > 0;
  const hasNoResults =
    submittedQuery.length > 0 && locationSearchQuery.isSuccess && locations.length === 0;
  const searchErrorMessage =
    locationSearchQuery.error instanceof ApiError
      ? locationSearchQuery.error.message
      : "Unable to search locations right now.";
  const searchFeedbackMessage = getSearchFeedbackMessage({
    submittedQuery,
    selectedLocation,
    isSearching,
    isError: locationSearchQuery.isError,
    resultCount: locations.length,
  });

  function submitSearch(nextQuery: string) {
    setSelectedLocationId(null);

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

  function handleLocationSelect(locationId: string) {
    setSelectedLocationId(locationId);
  }

  return (
    <section className={styles.layout}>
      <Surface className={styles.hero}>
        <p className={styles.kicker}>Phase 2.4 location search</p>
        <h1 className={styles.heading}>Start with a place.</h1>
        <p className={styles.copy}>
          Search for a city, region, or country to unlock weather details and
          practical recommendations. Search now runs through the app API and
          keeps ambiguous matches selectable instead of guessing.
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
                const isSelected = location.id === selectedLocationId;

                return (
                  <li key={location.id}>
                    <button
                      aria-pressed={isSelected}
                      className={`${styles.resultButton} ${
                        isSelected ? styles.resultButtonSelected : ""
                      }`}
                      onClick={() => handleLocationSelect(location.id)}
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
        <p className={styles.sidebarKicker}>
          {selectedLocation ? "Selected location" : "Ready for next phase"}
        </p>
        <h2 className={styles.sidebarHeading}>
          {selectedLocation ? selectedLocation.name : "What this screen is preparing"}
        </h2>

        {selectedLocation ? (
          <div className={styles.selectionCard}>
            <p className={styles.selectionLabel}>{formatLocationLabel(selectedLocation)}</p>
            <dl className={styles.selectionDetails}>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {selectedLocation.latitude.toFixed(2)}, {selectedLocation.longitude.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt>Timezone</dt>
                <dd>{selectedLocation.timezone}</dd>
              </div>
            </dl>
            <p className={styles.selectionCopy}>
              This selection stays in local UI state for now. The next phase can
              use it to request the weather payload without guessing.
            </p>
          </div>
        ) : (
          <ul className={styles.checklist}>
            <li>Normalized weather payloads rendered from the internal API</li>
            <li>Search results and selection flows without guessing locations</li>
            <li>Secondary activity suggestions layered onto the weather view</li>
          </ul>
        )}
      </Surface>
    </section>
  );
}
