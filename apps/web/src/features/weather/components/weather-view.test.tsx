import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createWeatherPageResponse, testLocation } from "../../../test/fixtures";
import { WeatherView } from "./weather-view";

function renderWeatherView() {
  const onTemperatureUnitChange = vi.fn();
  const onWindUnitChange = vi.fn();

  render(
    <WeatherView
      highlightedLocation={testLocation}
      onTemperatureUnitChange={onTemperatureUnitChange}
      onWindUnitChange={onWindUnitChange}
      selectedUnits={{
        tempUnit: "celsius",
        windUnit: "kmh",
      }}
      title="Live weather from the app API"
      weather={createWeatherPageResponse()}
    />,
  );

  return {
    onTemperatureUnitChange,
    onWindUnitChange,
  };
}

describe("WeatherView", () => {
  it("fires the unit change callbacks with the next requested units", () => {
    const { onTemperatureUnitChange, onWindUnitChange } = renderWeatherView();

    fireEvent.change(screen.getByLabelText("Temperature"), {
      target: { value: "fahrenheit" },
    });
    fireEvent.change(screen.getByLabelText("Wind speed"), {
      target: { value: "mph" },
    });

    expect(onTemperatureUnitChange).toHaveBeenCalledWith("fahrenheit");
    expect(onWindUnitChange).toHaveBeenCalledWith("mph");
  });

  it("switches the hourly forecast day using local UI state", () => {
    renderWeatherView();

    const todayButton = screen.getByRole("button", { name: /Today/i });
    const tomorrowButton = screen.getByRole("button", { name: /Tomorrow/i });

    expect(todayButton).toHaveAttribute("aria-pressed", "true");
    expect(tomorrowButton).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Hourly forecast for Today",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.queryByText("11:00")).not.toBeInTheDocument();

    fireEvent.click(tomorrowButton);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Hourly forecast for Tomorrow",
      }),
    ).toBeInTheDocument();
    expect(todayButton).toHaveAttribute("aria-pressed", "false");
    expect(tomorrowButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("11:00")).toBeInTheDocument();
    expect(screen.queryByText("09:00")).not.toBeInTheDocument();
  });

  it("renders normalized recommendation data from the weather payload", () => {
    renderWeatherView();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Suggestions for today",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Plan an indoor museum stop")).toBeInTheDocument();
    expect(screen.getByText("Use a cafe as a weather break")).toBeInTheDocument();
    expect(screen.getByText("Keep a short route with cover")).toBeInTheDocument();
    expect(screen.getAllByText("Fallback")).toHaveLength(3);
  });
});
