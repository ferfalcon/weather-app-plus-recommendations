import type { FormEventHandler } from "react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import styles from "./location-search-empty-state.module.css";

type LocationSearchHeroProps = {
  helperText: string;
  inputId: string;
  isSearching: boolean;
  isSubmitDisabled: boolean;
  query: string;
  searchFeedbackId: string;
  onQueryChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function LocationSearchHero({
  helperText,
  inputId,
  isSearching,
  isSubmitDisabled,
  query,
  searchFeedbackId,
  onQueryChange,
  onSubmit,
}: LocationSearchHeroProps) {
  return (
    <>
      <div className={styles.heroIntro}>
        <p className={styles.kicker}>Search-first weather experience</p>
        <h1 className={styles.heading}>Search for a place, then read the forecast.</h1>
        <p className={styles.copy}>
          Search by city, region, or country, choose the right match, then check
          current conditions, daily outlooks, hourly detail, and practical
          suggestions without leaving the page.
        </p>
      </div>

      <form aria-busy={isSearching} className={styles.form} onSubmit={onSubmit}>
        <div className={styles.formHeader}>
          <label className={styles.label} htmlFor={inputId}>
            Search location
          </label>
          <p className={styles.formHint}>City, region, or country</p>
        </div>

        <div className={styles.searchControls}>
          <Input
            aria-describedby={searchFeedbackId}
            className={styles.searchInput}
            enterKeyHint="search"
            id={inputId}
            name="locationQuery"
            placeholder="Try Montevideo, Seoul, or Vancouver"
            required
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <Button className={styles.submitButton} disabled={isSubmitDisabled} type="submit">
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
          {helperText}
        </p>
      </form>
    </>
  );
}
