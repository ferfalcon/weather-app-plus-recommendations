import type { LocationOption } from "@weather-app-plus-recommendations/contracts";

import { formatLocationLabel } from "./location-search-view-helpers";
import styles from "./location-search-empty-state.module.css";
import { LocationSearchStatusPanel } from "./location-search-status-panel";

type LocationSearchResultsProps = {
  hasLocationSearchError: boolean;
  hasNoResults: boolean;
  isSearching: boolean;
  locationResultsMetaId: string;
  locations: LocationOption[];
  selectedLocationId: string | null;
  searchErrorMessage: string;
  submittedQuery: string;
  onLocationSelect: (location: LocationOption) => void;
};

export function LocationSearchResults({
  hasLocationSearchError,
  hasNoResults,
  isSearching,
  locationResultsMetaId,
  locations,
  selectedLocationId,
  searchErrorMessage,
  submittedQuery,
  onLocationSelect,
}: LocationSearchResultsProps) {
  const hasSearchResults = locations.length > 0;

  if (!isSearching && !hasLocationSearchError && !hasNoResults && !hasSearchResults) {
    return null;
  }

  return (
    <>
      {isSearching ? (
        <LocationSearchStatusPanel
          copy={
            <>
              Searching the app API for matches for <strong>{submittedQuery}</strong>.
            </>
          }
          heading="Finding matching locations"
          kicker="Search in progress"
          liveRegion
        />
      ) : null}

      {hasLocationSearchError ? (
        <LocationSearchStatusPanel
          copy={`${searchErrorMessage} Try the search again in a moment.`}
          heading="The API could not complete this search"
          kicker="Search error"
          role="alert"
          tone="error"
        />
      ) : null}

      {hasNoResults ? (
        <LocationSearchStatusPanel
          copy={
            <>
              We could not find any results for <strong>{submittedQuery}</strong>. Check
              the spelling or try a nearby city, region, or country.
            </>
          }
          heading="No locations matched this search"
          kicker="No matches"
          liveRegion
          tone="warning"
        />
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
              const isSelected = location.id === selectedLocationId;
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
                    onClick={() => onLocationSelect(location)}
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
    </>
  );
}
