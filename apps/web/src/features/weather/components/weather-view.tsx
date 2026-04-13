import { useEffect, useId, useState } from "react";

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

function formatSummaryLocation(location: LocationOption) {
  return `${location.name}, ${location.country}`;
}

function formatSummaryDate(date: string | undefined, dayLabel: string | undefined) {
  if (!date) {
    return dayLabel ?? "";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dayLabel ? `${dayLabel} · ${date}` : date;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
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

function formatRecommendationMetaLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatRecommendationSourceLabel(
  source: WeatherPageResponse["recommendations"]["source"],
) {
  switch (source) {
    case "ai":
      return "AI";
    case "fallback":
      return "Fallback";
    case "placeholder":
      return "Placeholder";
  }
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
  const hourlyForecastListId = useId();
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
  const locationLabel = formatLocationLabel(highlightedLocation);
  const summaryLocationLabel = formatSummaryLocation(highlightedLocation);
  const summaryDateLabel = formatSummaryDate(
    weather.daily[0]?.date,
    weather.daily[0]?.dayLabel,
  );
  const requestedUnitsMatchWeatherUnits =
    weather.units.temperature === selectedUnits.tempUnit &&
    weather.units.windSpeed === selectedUnits.windUnit;

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.headerIntro}>
          <p className={styles.kicker}>{title}</p>
          <h2 className={styles.heading}>{locationLabel}</h2>
        </div>

        <div className={styles.headerAside}>
          <div className={styles.headerMeta}>
            <p className={styles.timezone}>Timezone: {highlightedLocation.timezone}</p>
            <p className={styles.observedAt}>
              Observed at {formatObservedTime(weather.current.observedAt)}
            </p>
            {isRefreshing ? (
              <p aria-live="polite" className={styles.refreshing} role="status">
                Refreshing forecast...
              </p>
            ) : null}
          </div>

          <section className={styles.unitsPanel} aria-labelledby="forecast-display-heading">
            <div className={styles.unitsPanelHeader}>
              <p className={styles.sectionKicker}>Forecast display</p>
              <h3 className={styles.sectionHeadingCompact} id="forecast-display-heading">
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
                  )}. The cards below keep the last successful forecast visible until the refreshed values arrive.`}
            </p>
          </section>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.currentSection} aria-labelledby="current-weather-heading">
            <div className={styles.currentSummary}>
              <div className={styles.currentCopy}>
                <p className={styles.currentLabel}>Current weather</p>
                <h3 className={styles.currentHeading} id="current-weather-heading">
                  {summaryLocationLabel}
                </h3>
                <p className={styles.currentCondition}>{weather.current.conditionLabel}</p>
                <p className={styles.currentContext}>
                  {summaryDateLabel ? `${summaryDateLabel} · ` : ""}
                  Observed at {formatObservedTime(weather.current.observedAt)} in{" "}
                  {highlightedLocation.timezone}
                </p>
              </div>

              <div className={styles.currentFigure}>
                <span className={styles.currentIcon} aria-hidden="true">
                  {getWeatherIconGlyph(weather.current.iconKey)}
                </span>
                <p className={styles.currentTemperature}>
                  {formatTemperature(weather.current.temperature, weather.units.temperature)}
                </p>
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

          <section
            className={styles.recommendationsSection}
            aria-labelledby="recommendations-heading"
          >
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>Suggestions</p>
              <h3 className={styles.sectionHeading} id="recommendations-heading">
                Suggestions for today
              </h3>
            </div>

            <p className={styles.recommendationsCopy}>
              These suggestions use the same normalized weather payload shown above.
            </p>

            <ul className={styles.recommendationsList}>
              {weather.recommendations.items.map((recommendation) => (
                <li className={styles.recommendationCard} key={recommendation.title}>
                  <div className={styles.recommendationMeta}>
                    <span className={styles.recommendationBadge}>
                      {formatRecommendationSourceLabel(weather.recommendations.source)}
                    </span>
                    <span className={styles.recommendationBadge}>
                      {formatRecommendationMetaLabel(recommendation.type)}
                    </span>
                    <span className={styles.recommendationBadge}>
                      {formatRecommendationMetaLabel(recommendation.reasonTag)}
                    </span>
                  </div>
                  <h4 className={styles.recommendationTitle}>{recommendation.title}</h4>
                  <p className={styles.recommendationDescription}>
                    {recommendation.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`${styles.forecastSection} ${styles.dailySection}`}
            aria-labelledby="daily-forecast-heading"
          >
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>7-day outlook</p>
              <h3 className={styles.sectionHeading} id="daily-forecast-heading">
                Daily forecast
              </h3>
            </div>

            <ul className={styles.dailyList}>
              {weather.daily.map((day) => {
                const isHourlyDaySelected = day.date === hourlyForecastDay?.date;

                return (
                  <li
                    className={`${styles.dailyCard} ${
                      isHourlyDaySelected ? styles.dailyCardSelected : ""
                    }`}
                    key={day.date}
                  >
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
                      <span>
                        {formatTemperature(day.maxTemperature, weather.units.temperature)}
                      </span>
                      <span>
                        {formatTemperature(day.minTemperature, weather.units.temperature)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className={styles.railColumn}>
          <section
            className={`${styles.forecastSection} ${styles.hourlySection}`}
            aria-labelledby="hourly-forecast-heading"
          >
            <div className={styles.hourlyHeader}>
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
                        aria-controls={hourlyForecastListId}
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
            </div>

            {hourlyForecastDay ? (
              <ul className={styles.hourlyList} id={hourlyForecastListId}>
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
        </aside>
      </div>
    </div>
  );
}
