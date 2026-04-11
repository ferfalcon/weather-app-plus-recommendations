import { useState } from "react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Surface } from "../../../components/ui/surface";
import styles from "./location-search-empty-state.module.css";

const sampleLocations = ["Montevideo", "Seoul", "Vancouver"];

export function LocationSearchEmptyState() {
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className={styles.layout}>
      <Surface className={styles.hero}>
        <p className={styles.kicker}>Phase 1.3 foundation</p>
        <h1 className={styles.heading}>Start with a place.</h1>
        <p className={styles.copy}>
          Search for a city, region, or country to unlock weather details and
          practical recommendations. This phase sets the search-first layout
          without wiring the real request flow yet.
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit">Search</Button>
          </div>

          <p className={styles.helper}>
            Search behavior arrives in the next phase. This scaffold only
            establishes the interaction surface and layout.
          </p>
        </form>

        <div className={styles.samples}>
          <span className={styles.samplesLabel}>Quick examples</span>
          <div className={styles.sampleList}>
            {sampleLocations.map((location) => (
              <Button
                key={location}
                variant="secondary"
                onClick={() => setQuery(location)}
              >
                {location}
              </Button>
            ))}
          </div>
        </div>
      </Surface>

      <Surface as="aside" className={styles.sidebar}>
        <p className={styles.sidebarKicker}>Ready for next phase</p>
        <h2 className={styles.sidebarHeading}>What this screen is preparing</h2>
        <ul className={styles.checklist}>
          <li>Normalized weather payloads rendered from the internal API</li>
          <li>Search results and selection flows without guessing locations</li>
          <li>Secondary activity suggestions layered onto the weather view</li>
        </ul>
      </Surface>
    </section>
  );
}
