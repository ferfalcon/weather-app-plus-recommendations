import { buildApp } from "./app/build-app";
import { getServerConfig } from "./lib/get-server-config";

async function start() {
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
