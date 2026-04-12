import { spawn } from "node:child_process";

const apiPort = process.env.PORT?.trim() || "3001";
const apiHealthUrl = `http://127.0.0.1:${apiPort}/healthz`;
const apiStartupTimeoutMs = 30_000;
const apiPollIntervalMs = 500;

const childProcesses = new Set();
let shuttingDown = false;

function spawnWorkspaceCommand(args) {
  const childProcess = spawn("pnpm", args, {
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  childProcesses.add(childProcess);
  childProcess.on("exit", (code, signal) => {
    childProcesses.delete(childProcess);

    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    for (const runningProcess of childProcesses) {
      runningProcess.kill("SIGTERM");
    }

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });

  return childProcess;
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForApiReady() {
  const deadline = Date.now() + apiStartupTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(apiHealthUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the API process starts accepting connections.
    }

    await delay(apiPollIntervalMs);
  }

  throw new Error(
    `The API did not become ready within ${apiStartupTimeoutMs}ms at ${apiHealthUrl}.`,
  );
}

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const childProcess of childProcesses) {
    childProcess.kill(signal);
  }
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

async function start() {
  spawnWorkspaceCommand(["--filter", "@weather-app-plus-recommendations/api", "dev"]);

  await waitForApiReady();

  spawnWorkspaceCommand(["--filter", "@weather-app-plus-recommendations/web", "dev"]);
}

start().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "The dev environment failed to start.",
  );
  shutdown("SIGTERM");
  process.exit(1);
});
