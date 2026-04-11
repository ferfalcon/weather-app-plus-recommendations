import { describe, expect, it } from "vitest";

import { buildApp } from "../../src/app/build-app";
import { type ApiRuntimeConfig } from "../../src/lib/get-server-config";

const runtimeConfig: ApiRuntimeConfig = {
  corsOrigins: ["http://127.0.0.1:5173"],
  geminiApiKey: undefined,
  logLevel: "silent",
  server: {
    host: "127.0.0.1",
    port: 3001,
  },
};

describe("GET /healthz", () => {
  it("returns a tiny success payload for platform health checks", async () => {
    const app = buildApp(runtimeConfig);

    try {
      const response = await app.inject({
        method: "GET",
        url: "/healthz",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.json()).toEqual({
        status: "ok",
      });
    } finally {
      await app.close();
    }
  });
});
