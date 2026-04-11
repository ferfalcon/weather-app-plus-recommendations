const defaultApiBaseUrl = "http://localhost:3001";

export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return defaultApiBaseUrl;
  }

  return configuredBaseUrl;
}

export function createApiUrl(path: string) {
  const normalizedBaseUrl = getApiBaseUrl().endsWith("/")
    ? getApiBaseUrl()
    : `${getApiBaseUrl()}/`;

  return new URL(path, normalizedBaseUrl).toString();
}
