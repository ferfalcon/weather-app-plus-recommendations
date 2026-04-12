import { Button } from "../../../components/ui/button";
import styles from "./location-search-empty-state.module.css";

type LocationSearchQuickSearchesProps = {
  sampleLocations: readonly string[];
  onSampleLocationClick: (location: string) => void;
};

export function LocationSearchQuickSearches({
  sampleLocations,
  onSampleLocationClick,
}: LocationSearchQuickSearchesProps) {
  return (
    <div className={styles.samples}>
      <span className={styles.samplesLabel}>Try a quick search</span>
      <div className={styles.sampleList}>
        {sampleLocations.map((location) => (
          <Button
            key={location}
            aria-label={`Search for ${location}`}
            className={styles.sampleButton}
            variant="secondary"
            onClick={() => onSampleLocationClick(location)}
          >
            {location}
          </Button>
        ))}
      </div>
    </div>
  );
}
