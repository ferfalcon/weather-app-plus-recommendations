const defaultHost = "0.0.0.0";
const defaultPort = 3001;
const defaultCorsOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
] as const;
const supportedLogLevels = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
] as const;

export type ApiLogLevel = (typeof supportedLogLevels)[number];

export type ApiRuntimeConfig = {
  corsOrigins: string[];
  logLevel: ApiLogLevel;
  server: {
    host: string;
    port: number;
  };
};

type RuntimeEnv = NodeJS.ProcessEnv;

function getNonEmptyValue(value: string | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function parsePort(value: string | undefined) {
  const normalizedValue = getNonEmptyValue(value);

  if (normalizedValue === undefined) {
    return defaultPort;
  }

  const port = Number.parseInt(normalizedValue, 10);

  if (Number.isNaN(port) || port < 1 || port > 65_535) {
    return defaultPort;
  }

  return port;
}

function parseLogLevel(value: string | undefined): ApiLogLevel {
  const normalizedValue = getNonEmptyValue(value);

  if (
    normalizedValue !== undefined &&
    supportedLogLevels.includes(normalizedValue as ApiLogLevel)
  ) {
    return normalizedValue as ApiLogLevel;
  }

  return "info";
}

function parseCorsOrigins(value: string | undefined) {
  const normalizedValue = getNonEmptyValue(value);

  if (normalizedValue === undefined) {
    return [...defaultCorsOrigins];
  }

  const origins = normalizedValue
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : [...defaultCorsOrigins];
}

export function getServerConfig(env: RuntimeEnv = process.env): ApiRuntimeConfig {
  return {
    corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
    logLevel: parseLogLevel(env.LOG_LEVEL),
    server: {
      host: getNonEmptyValue(env.HOST) ?? defaultHost,
      port: parsePort(env.PORT),
    },
  };
}
