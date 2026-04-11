import { buildApp } from "./app/build-app";
import { getServerConfig } from "./lib/get-server-config";

async function start() {
  const app = buildApp();
  const serverConfig = getServerConfig();

  try {
    await app.listen(serverConfig);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
