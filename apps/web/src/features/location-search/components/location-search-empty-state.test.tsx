import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../services/api/get-weather", () => ({
  getWeather: vi.fn(),
}));

vi.mock("../../../services/api/search-locations", () => ({
  searchLocations: vi.fn(),
}));

import { ApiError } from "../../../services/api/api-error";
import { getWeather } from "../../../services/api/get-weather";
import { searchLocations } from "../../../services/api/search-locations";
import { createWeatherPageResponse, testLocation } from "../../../test/fixtures";
import { renderWithQueryClient } from "../../../test/render-with-query-client";
import { LocationSearchEmptyState } from "./location-search-empty-state";

afterEach(() => {
  vi.clearAllMocks();
});

function renderLocationSearchEmptyState() {
  return renderWithQueryClient(<LocationSearchEmptyState />);
}

function submitSearch(query: string) {
  const input = screen.getByLabelText("Search location");

  fireEvent.change(input, {
    target: { value: query },
  });
  fireEvent.submit(input.closest("form")!);
}

describe("LocationSearchEmptyState", () => {
  it("renders the empty first-load search-first state", () => {
    renderLocationSearchEmptyState();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Search for a place, then read the forecast.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Search location")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Search for a city, region, or country to see matching locations.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No locations matched this search"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("The API could not load this forecast"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Search",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: "Finding matching locations",
      }),
    ).not.toBeInTheDocument();
    expect(searchLocations).not.toHaveBeenCalled();
  });

  it("shows the no-results state after a search returns no matches", async () => {
    vi.mocked(searchLocations).mockResolvedValue([]);

    renderLocationSearchEmptyState();

    submitSearch("Atlantis");

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "No locations matched this search",
      }),
    ).toBeInTheDocument();
    expect(searchLocations).toHaveBeenCalledWith("Atlantis");
  });

  it("marks the selected location button as pressed", async () => {
    vi.mocked(searchLocations).mockResolvedValue([testLocation]);

    renderLocationSearchEmptyState();

    submitSearch("Montevideo");

    const locationResultButton = await screen.findByRole("button", {
      name: /selected location|select montevideo/i,
    });

    expect(locationResultButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(locationResultButton);

    expect(locationResultButton).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the weather API error state after selecting a location", async () => {
    vi.mocked(searchLocations).mockResolvedValue([testLocation]);
    vi.mocked(getWeather).mockRejectedValue(
      new ApiError("Unable to load weather right now.", 502),
    );

    renderLocationSearchEmptyState();

    submitSearch("Montevideo");

    const locationResultButton = await screen.findByRole("button", {
      name: /Montevideo.*Uruguay/i,
    });

    fireEvent.click(locationResultButton);

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "The API could not load this forecast",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Unable to load weather right now\./i)).toBeInTheDocument();
    await waitFor(() => {
      expect(getWeather).toHaveBeenCalledWith({
        lat: -34.9,
        lon: -56.16,
        tempUnit: "celsius",
        windUnit: "kmh",
      });
    });
  });

  it("keeps recommendation rendering delegated to the normalized weather payload", async () => {
    vi.mocked(searchLocations).mockResolvedValue([testLocation]);
    vi.mocked(getWeather).mockResolvedValue(createWeatherPageResponse());

    renderLocationSearchEmptyState();

    submitSearch("Montevideo");

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Montevideo.*Uruguay/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "Suggestions for today",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Plan an indoor museum stop")).toBeInTheDocument();
  });
});
