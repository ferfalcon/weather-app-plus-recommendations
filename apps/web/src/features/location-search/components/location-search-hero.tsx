import type { FormEventHandler } from "react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import styles from "./location-search-empty-state.module.css";

type LocationSearchHeroProps = {
  helperText: string;
  inputId: string;
  isCompact: boolean;
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
  isCompact,
  isSearching,
  isSubmitDisabled,
  query,
  searchFeedbackId,
  onQueryChange,
  onSubmit,
}: LocationSearchHeroProps) {
  const introClassName = [styles.heroIntro, isCompact ? styles.heroIntroCompact : ""]
    .filter(Boolean)
    .join(" ");
  const headingClassName = [styles.heading, isCompact ? styles.headingCompact : ""]
    .filter(Boolean)
    .join(" ");
  const copyClassName = [styles.copy, isCompact ? styles.copyCompact : ""]
    .filter(Boolean)
    .join(" ");
  const formClassName = [styles.form, isCompact ? styles.formCompact : ""]
    .filter(Boolean)
    .join(" ");
  const formHeaderClassName = [
    styles.formHeader,
    isCompact ? styles.formHeaderCompact : "",
  ]
    .filter(Boolean)
    .join(" ");
  const searchControlsClassName = [
    styles.searchControls,
    isCompact ? styles.searchControlsCompact : "",
  ]
    .filter(Boolean)
    .join(" ");
  const searchInputClassName = [
    styles.searchInput,
    isCompact ? styles.searchInputCompact : "",
  ]
    .filter(Boolean)
    .join(" ");
  const submitButtonClassName = [
    styles.submitButton,
    isCompact ? styles.submitButtonCompact : "",
  ]
    .filter(Boolean)
    .join(" ");
  const helperClassName = [styles.helper, isCompact ? styles.helperCompact : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={introClassName}>
        <p className={styles.kicker}>{isCompact ? "Weather now" : "Search-first weather"}</p>
        <h1 className={headingClassName}>How&apos;s the sky looking today?</h1>
        <p className={copyClassName}>
          {isCompact
            ? "Search for another city, region, or country without pushing the forecast off screen."
            : "Search by city, region, or country, choose the right match, then read the forecast and practical suggestions in one place."}
        </p>
      </div>

      <form aria-busy={isSearching} className={formClassName} onSubmit={onSubmit}>
        <div className={formHeaderClassName}>
          <label className={styles.label} htmlFor={inputId}>
            Search location
          </label>
          <p className={styles.formHint}>City, region, or country</p>
        </div>

        <div className={searchControlsClassName}>
          <Input
            aria-describedby={searchFeedbackId}
            className={searchInputClassName}
            enterKeyHint="search"
            id={inputId}
            name="locationQuery"
            placeholder="Search for a place..."
            required
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <Button className={submitButtonClassName} disabled={isSubmitDisabled} type="submit">
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <p
          aria-atomic="true"
          aria-live="polite"
          className={helperClassName}
          id={searchFeedbackId}
          role="status"
        >
          {helperText}
        </p>
      </form>
    </>
  );
}
