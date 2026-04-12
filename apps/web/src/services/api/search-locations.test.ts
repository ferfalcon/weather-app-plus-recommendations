import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./api-error";
import { searchLocations } from "./search-locations";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchLocations", () => {
  it("throws a friendly API-unavailable error when the request cannot connect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(searchLocations("Vancouver")).rejects.toMatchObject(
      {
        message:
          "The app API is still starting or unavailable. Try the search again in a moment.",
        name: "ApiError",
        status: 503,
      } satisfies Pick<ApiError, "message" | "name" | "status">,
    );
  });
});
