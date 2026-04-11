import { useEffect, useState } from "react";

import type {
  ForecastDay,
  LocationOption,
  WeatherPageResponse,
  WeatherQuery,
} from "@weather-app-plus-recommendations/contracts";

import styles from "./weather-view.module.css";

type SelectedWeatherUnits = Pick<WeatherQuery, "tempUnit" | "windUnit">;

type WeatherViewProps = {
  highlightedLocation: LocationOption;
  isRefreshing?: boolean;
  onTemperatureUnitChange: (tempUnit: WeatherQuery["tempUnit"]) => void;
  onWindUnitChange: (windUnit: WeatherQuery["windUnit"]) => void;
  selectedUnits: SelectedWeatherUnits;
  title: string;
  weather: WeatherPageResponse;
};

const iconGlyphByKey: Record<string, string> = {
  sunny: "SUN",
  "partly-cloudy": "PART",
  cloudy: "CLOUD",
  overcast: "OVER",
  fog: "FOG",
  drizzle: "DRIZ",
  rain: "RAIN",
  snow: "SNOW",
  storm: "STORM",
};

function formatLocationLabel(location: LocationOption) {
  if (location.region) {
    return `${location.name}, ${location.region}, ${location.country}`;
  }

  return `${location.name}, ${location.country}`;
}

function getWeatherIconGlyph(iconKey: string) {
  return iconGlyphByKey[iconKey] ?? "CLOUD";
}

function formatTemperature(value: number, unit: WeatherPageResponse["units"]["temperature"]) {
  const symbol = unit === "fahrenheit" ? "F" : "C";

  return `${Math.round(value)}°${symbol}`;
}

function formatWindSpeed(value: number, unit: WeatherPageResponse["units"]["windSpeed"]) {
  const label = unit === "mph" ? "mph" : "km/h";

  return `${Math.round(value)} ${label}`;
}

function formatPrecipitation(value: number) {
  return `${value.toFixed(1)} mm`;
}

function formatTemperatureUnitLabel(unit: WeatherQuery["tempUnit"]) {
  return unit === "fahrenheit" ? "Fahrenheit (°F)" : "Celsius (°C)";
}

function formatWindUnitLabel(unit: WeatherQuery["windUnit"]) {
  return unit === "mph" ? "Miles per hour (mph)" : "Kilometers per hour (km/h)";
}

function formatObservedTime(time: string) {
  if (time.length >= 16) {
    return time.slice(11, 16);
  }

  return time;
}

function formatHourlyTime(time: string) {
  if (time.length >= 16) {
    return time.slice(11, 16);
  }

  return time;
}

function getHourlyForecastDay(
  dailyForecast: ForecastDay[],
  selectedDayDate: string | null,
) {
  return dailyForecast.find((day) => day.date === selectedDayDate) ?? dailyForecast[0] ?? null;
}

export function WeatherView({
  highlightedLocation,
  isRefreshing = false,
  onTemperatureUnitChange,
  onWindUnitChange,
  selectedUnits,
  title,
  weather,
}: WeatherViewProps) {
  const [selectedHourlyDayDate, setSelectedHourlyDayDate] = useState<string | null>(
    weather.daily[0]?.date ?? null,
  );

  useEffect(() => {
    setSelectedHourlyDayDate(weather.daily[0]?.date ?? null);
  }, [
    weather.daily[0]?.date,
    weather.location.id,
    weather.units.temperature,
    weather.units.windSpeed,
  ]);

  const hourlyForecastDay = getHourlyForecastDay(weather.daily, selectedHourlyDayDate);
  const requestedUnitsMatchWeatherUnits =
    weather.units.temperature === selectedUnits.tempUnit &&
    weather.units.windSpeed === selectedUnits.windUnit;

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>{title}</p>
          <h2 className={styles.heading}>{formatLocationLabel(highlightedLocation)}</h2>
        </div>
        <div className={styles.headerMeta}>
          <p className={styles.timezone}>{highlightedLocation.timezone}</p>
          <p className={styles.observedAt}>
            Observed at {formatObservedTime(weather.current.observedAt)}
          </p>
          {isRefreshing ? (
            <p className={styles.refreshing}>Refreshing forecast...</p>
          ) : null}
        </div>
      </div>

      <section className={styles.controlsSection} aria-labelledby="forecast-display-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Forecast display</p>
          <h3 className={styles.sectionHeading} id="forecast-display-heading">
            Units
          </h3>
        </div>

        <div className={styles.unitsGrid}>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Temperature</span>
            <select
              className={styles.unitSelect}
              value={selectedUnits.tempUnit}
              onChange={(event) =>
                onTemperatureUnitChange(event.target.value as WeatherQuery["tempUnit"])
              }
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </label>

          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Wind speed</span>
            <select
              className={styles.unitSelect}
              value={selectedUnits.windUnit}
              onChange={(event) =>
                onWindUnitChange(event.target.value as WeatherQuery["windUnit"])
              }
            >
              <option value="kmh">Kilometers per hour (km/h)</option>
              <option value="mph">Miles per hour (mph)</option>
            </select>
          </label>

          <div className={styles.controlField}>
            <span className={styles.controlLabel}>Precipitation</span>
            <p className={styles.unitValue}>Millimeters (mm)</p>
          </div>
        </div>

        <p aria-live="polite" className={styles.unitsStatus} role="status">
          {requestedUnitsMatchWeatherUnits
            ? `Forecast values are shown in ${formatTemperatureUnitLabel(
                weather.units.temperature,
              )}, ${formatWindUnitLabel(weather.units.windSpeed)}, and millimeters for precipitation.`
            : `Requested ${formatTemperatureUnitLabel(
                selectedUnits.tempUnit,
              )} and ${formatWindUnitLabel(
                selectedUnits.windUnit,
              )}. The cards below keep the last successful units until a refreshed forecast arrives.`}
        </p>
      </section>

      <section className={styles.currentSection} aria-labelledby="current-weather-heading">
        <div className={styles.currentSummary}>
          <span className={styles.currentIcon} aria-hidden="true">
            {getWeatherIconGlyph(weather.current.iconKey)}
          </span>
          <div>
            <p className={styles.currentLabel}>Current weather</p>
            <h3 className={styles.currentTemperature} id="current-weather-heading">
              {formatTemperature(weather.current.temperature, weather.units.temperature)}
            </h3>
            <p className={styles.currentCondition}>{weather.current.conditionLabel}</p>
          </div>
        </div>

        <dl className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <dt>Feels like</dt>
            <dd>{formatTemperature(weather.current.feelsLike, weather.units.temperature)}</dd>
          </div>
          <div className={styles.metricCard}>
            <dt>Humidity</dt>
            <dd>{weather.current.humidity}%</dd>
          </div>
          <div className={styles.metricCard}>
            <dt>Wind speed</dt>
            <dd>{formatWindSpeed(weather.current.windSpeed, weather.units.windSpeed)}</dd>
          </div>
          <div className={styles.metricCard}>
            <dt>Precipitation</dt>
            <dd>{formatPrecipitation(weather.current.precipitation)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.forecastSection} aria-labelledby="daily-forecast-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>7-day outlook</p>
          <h3 className={styles.sectionHeading} id="daily-forecast-heading">
            Daily forecast
          </h3>
        </div>

        <ul className={styles.dailyList}>
          {weather.daily.map((day) => (
            <li className={styles.dailyCard} key={day.date}>
              <div className={styles.dailyMeta}>
                <span className={styles.dailyDay}>{day.dayLabel}</span>
                <span className={styles.dailyDate}>{day.date}</span>
              </div>
              <div className={styles.dailyCondition}>
                <span aria-hidden="true" className={styles.dailyIcon}>
                  {getWeatherIconGlyph(day.iconKey)}
                </span>
                <span>{day.conditionLabel}</span>
              </div>
              <div className={styles.dailyTemperatures}>
                <span>{formatTemperature(day.maxTemperature, weather.units.temperature)}</span>
                <span>{formatTemperature(day.minTemperature, weather.units.temperature)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.forecastSection} aria-labelledby="hourly-forecast-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Hourly detail</p>
          <h3 className={styles.sectionHeading} id="hourly-forecast-heading">
            {hourlyForecastDay
              ? `Hourly forecast for ${hourlyForecastDay.dayLabel}`
              : "Hourly forecast unavailable"}
          </h3>
        </div>

        {weather.daily.length > 0 ? (
          <div
            aria-label="Select a day for the hourly forecast"
            className={styles.daySelector}
            role="group"
          >
            {weather.daily.map((day) => {
              const isSelected = day.date === hourlyForecastDay?.date;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`${styles.dayButton} ${
                    isSelected ? styles.dayButtonSelected : ""
                  }`}
                  key={day.date}
                  onClick={() => setSelectedHourlyDayDate(day.date)}
                  type="button"
                >
                  <span className={styles.dayButtonLabel}>{day.dayLabel}</span>
                  <span className={styles.dayButtonDate}>{day.date}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {hourlyForecastDay ? (
          <ul className={styles.hourlyList}>
            {hourlyForecastDay.hourly.map((hour) => (
              <li className={styles.hourlyCard} key={hour.time}>
                <p className={styles.hourlyTime}>{formatHourlyTime(hour.time)}</p>
                <span aria-hidden="true" className={styles.hourlyIcon}>
                  {getWeatherIconGlyph(hour.iconKey)}
                </span>
                <p className={styles.hourlyTemperature}>
                  {formatTemperature(hour.temperature, weather.units.temperature)}
                </p>
                <p className={styles.hourlyCondition}>{hour.conditionLabel}</p>
                <p className={styles.hourlyRain}>
                  Rain chance {hour.precipitationProbability}%
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyCopy}>
            Hourly details are unavailable for the selected forecast day.
          </p>
        )}
      </section>
    </div>
  );
}
