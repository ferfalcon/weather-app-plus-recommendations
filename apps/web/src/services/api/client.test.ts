import { describe, expect, it } from "vitest";

import { createApiUrl } from "./client";

describe("createApiUrl", () => {
  it("uses the current origin when no explicit API base URL is configured", () => {
    expect(createApiUrl("/api/locations/search")).toBe(
      "http://localhost:3000/api/locations/search",
    );
  });
});
