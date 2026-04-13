import { useEffect, useId, useState } from "react";

import type {
  ForecastDay,
  LocationOption,
  WeatherPageResponse,
} from "@weather-app-plus-recommendations/contracts";

import drizzleIcon from "../../../assets/images/icon-drizzle.webp";
import fogIcon from "../../../assets/images/icon-fog.webp";
import overcastIcon from "../../../assets/images/icon-overcast.webp";
import partlyCloudyIcon from "../../../assets/images/icon-partly-cloudy.webp";
import rainIcon from "../../../assets/images/icon-rain.webp";
import snowIcon from "../../../assets/images/icon-snow.webp";
import stormIcon from "../../../assets/images/icon-storm.webp";
import sunnyIcon from "../../../assets/images/icon-sunny.webp";
import styles from "./weather-view.module.css";

type WeatherViewProps = {
  highlightedLocation: LocationOption;
  isRefreshing?: boolean;
  weather: WeatherPageResponse;
};

const iconAssetByKey: Record<string, string> = {
  sunny: sunnyIcon,
  "partly-cloudy": partlyCloudyIcon,
  cloudy: overcastIcon,
  overcast: overcastIcon,
  fog: fogIcon,
  drizzle: drizzleIcon,
  rain: rainIcon,
  snow: snowIcon,
  storm: stormIcon,
};

function getWeatherIconAsset(iconKey: string) {
  return iconAssetByKey[iconKey] ?? overcastIcon;
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
  const summaryLocationLabel = formatSummaryLocation(highlightedLocation);
  const summaryDateLabel = formatSummaryDate(
    weather.daily[0]?.date,
    weather.daily[0]?.dayLabel,
  );

  return (
    <div className={styles.layout}>
      {isRefreshing ? (
        <p aria-live="polite" className={styles.refreshingNotice} role="status">
          Refreshing forecast for {summaryLocationLabel}.
        </p>
      ) : null}

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.currentSection} aria-labelledby="current-weather-heading">
            <div className={styles.currentSummary}>
              <div className={styles.currentCopy}>
                <p className={styles.currentLabel}>Current weather</p>
                <h2 className={styles.currentHeading} id="current-weather-heading">
                  {summaryLocationLabel}
                </h2>
                <p className={styles.currentContext}>
                  {summaryDateLabel ? `${summaryDateLabel} · ` : ""}
                  Observed at {formatObservedTime(weather.current.observedAt)} in{" "}
                  {highlightedLocation.timezone}
                </p>
                <p className={styles.currentCondition}>{weather.current.conditionLabel}</p>
              </div>

              <div className={styles.currentFigure}>
                <span className={styles.currentIcon} aria-hidden="true">
                  <img
                    alt=""
                    className={styles.currentIconImage}
                    height="96"
                    src={getWeatherIconAsset(weather.current.iconKey)}
                    width="96"
                  />
                </span>
                <p className={styles.currentTemperature}>
                  {formatTemperature(weather.current.temperature, weather.units.temperature)}
                </p>
              </div>
            </div>
          </section>

          <dl
            aria-label="Current weather supporting metrics"
            className={styles.metricsGrid}
          >
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
                      <img
                        alt=""
                        aria-hidden="true"
                        className={styles.dailyIconImage}
                        height="52"
                        src={getWeatherIconAsset(day.iconKey)}
                        width="52"
                      />
                      <span className={styles.dailyConditionText}>{day.conditionLabel}</span>
                    </div>
                    <div className={styles.dailyTemperatures}>
                      <span className={styles.dailyTemperatureHigh}>
                        {formatTemperature(day.maxTemperature, weather.units.temperature)}
                      </span>
                      <span className={styles.dailyTemperatureLow}>
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
              <div className={styles.hourlyHeadingGroup}>
                <h3 className={styles.sectionHeading} id="hourly-forecast-heading">
                  Hourly forecast
                </h3>
                <p className={styles.hourlySubheading}>
                  {hourlyForecastDay
                    ? `Showing ${hourlyForecastDay.dayLabel}`
                    : "Hourly forecast unavailable"}
                </p>
              </div>

              {weather.daily.length > 0 ? (
                <label className={styles.daySelectField}>
                  <span className={styles.daySelectLabel}>Day</span>
                  <select
                    aria-controls={hourlyForecastListId}
                    aria-label="Select a day for the hourly forecast"
                    className={styles.daySelect}
                    value={hourlyForecastDay?.date ?? ""}
                    onChange={(event) => setSelectedHourlyDayDate(event.target.value)}
                  >
                    {weather.daily.map((day) => (
                      <option key={day.date} value={day.date}>
                        {day.dayLabel}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            {hourlyForecastDay ? (
              <ul className={styles.hourlyList} id={hourlyForecastListId}>
                {hourlyForecastDay.hourly.map((hour) => (
                  <li className={styles.hourlyCard} key={hour.time}>
                    <div className={styles.hourlyLead}>
                      <img
                        alt=""
                        aria-hidden="true"
                        className={styles.hourlyIconImage}
                        height="40"
                        src={getWeatherIconAsset(hour.iconKey)}
                        width="40"
                      />
                      <div className={styles.hourlyCopy}>
                        <p className={styles.hourlyTime}>{formatHourlyTime(hour.time)}</p>
                        <p className={styles.hourlyCondition}>{hour.conditionLabel}</p>
                      </div>
                    </div>
                    <div className={styles.hourlyValues}>
                      <p className={styles.hourlyTemperature}>
                        {formatTemperature(hour.temperature, weather.units.temperature)}
                      </p>
                      <p className={styles.hourlyRain}>
                        Rain {hour.precipitationProbability}%
                      </p>
                    </div>
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
