import type { WeatherQuery } from "@weather-app-plus-recommendations/contracts";

import unitsIcon from "../assets/images/icon-units.svg";
import styles from "./app-shell-unit-controls.module.css";

type AppShellUnitControlsProps = {
  selectedUnits: Pick<WeatherQuery, "tempUnit" | "windUnit">;
  onTemperatureUnitChange: (tempUnit: WeatherQuery["tempUnit"]) => void;
  onWindUnitChange: (windUnit: WeatherQuery["windUnit"]) => void;
};

export function AppShellUnitControls({
  selectedUnits,
  onTemperatureUnitChange,
  onWindUnitChange,
}: AppShellUnitControlsProps) {
  return (
    <section className={styles.wrapper} aria-labelledby="header-units-heading">
      <h2 className={styles.visuallyHidden} id="header-units-heading">
        Forecast units
      </h2>

      <div className={styles.labelGroup}>
        <img alt="" aria-hidden="true" className={styles.icon} src={unitsIcon} />
        <span className={styles.label}>Units</span>
      </div>

      <div className={styles.controls}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Temp</span>
          <select
            aria-label="Temperature unit"
            className={styles.select}
            value={selectedUnits.tempUnit}
            onChange={(event) =>
              onTemperatureUnitChange(event.target.value as WeatherQuery["tempUnit"])
            }
          >
            <option value="celsius">°C</option>
            <option value="fahrenheit">°F</option>
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Wind</span>
          <select
            aria-label="Wind speed unit"
            className={styles.select}
            value={selectedUnits.windUnit}
            onChange={(event) =>
              onWindUnitChange(event.target.value as WeatherQuery["windUnit"])
            }
          >
            <option value="kmh">km/h</option>
            <option value="mph">mph</option>
          </select>
        </label>

        <div className={styles.fixedField}>
          <span className={styles.fieldLabel}>Rain</span>
          <span className={styles.fixedValue}>mm</span>
        </div>
      </div>
    </section>
  );
}
