import type { LocationOption } from "@weather-app-plus-recommendations/contracts";

import { formatLocationLabel } from "./location-search-view-helpers";
import styles from "./location-search-empty-state.module.css";

type LocationSearchSelectionSidebarProps = {
  isSelectedLocationActive: boolean;
  statusHeading: string;
  statusKicker: string;
  statusLocation: LocationOption | null;
};

export function LocationSearchSelectionSidebar({
  isSelectedLocationActive,
  statusHeading,
  statusKicker,
  statusLocation,
}: LocationSearchSelectionSidebarProps) {
  return (
    <>
      <p className={styles.sidebarKicker}>{statusKicker}</p>
      <h2 className={styles.sidebarHeading}>{statusHeading}</h2>

      {statusLocation ? (
        <div className={styles.selectionCard}>
          <div className={styles.selectionHeader}>
            <p className={styles.selectionLabel}>{formatLocationLabel(statusLocation)}</p>
            <span className={styles.selectionBadge}>
              {isSelectedLocationActive ? "Selected now" : "Latest loaded"}
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
            {isSelectedLocationActive
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
    </>
  );
}
