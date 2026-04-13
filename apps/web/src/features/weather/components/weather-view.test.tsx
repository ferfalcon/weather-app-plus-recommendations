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

    fireEvent.change(screen.getByLabelText("Temperature unit"), {
      target: { value: "fahrenheit" },
    });
    fireEvent.change(screen.getByLabelText("Wind speed unit"), {
      target: { value: "mph" },
    });

    expect(onTemperatureUnitChange).toHaveBeenCalledWith("fahrenheit");
    expect(onWindUnitChange).toHaveBeenCalledWith("mph");
  });

  it("switches the hourly forecast day using local UI state", () => {
    renderWeatherView();

    const daySelect = screen.getByLabelText("Select a day for the hourly forecast");

    expect(daySelect).toHaveValue("2024-06-10");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Hourly forecast",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing Today")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.queryByText("11:00")).not.toBeInTheDocument();

    fireEvent.change(daySelect, {
      target: { value: "2024-06-11" },
    });

    expect(daySelect).toHaveValue("2024-06-11");
    expect(screen.getByText("Showing Tomorrow")).toBeInTheDocument();
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
