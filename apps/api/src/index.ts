import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { buildApp } from "./app/build-app";
import { getServerConfig } from "./lib/get-server-config";

function loadEnvironmentFile() {
  const candidatePaths = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(__dirname, "../../../.env"),
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      process.loadEnvFile(candidatePath);
      return;
    }
  }
}

async function start() {
  loadEnvironmentFile();
  const runtimeConfig = getServerConfig();
  const app = buildApp(runtimeConfig);

  try {
    await app.listen(runtimeConfig.server);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
