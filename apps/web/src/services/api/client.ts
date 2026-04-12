const defaultApiBaseUrl = "";

export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return defaultApiBaseUrl;
  }

  return configuredBaseUrl;
}

export function createApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    if (typeof window !== "undefined") {
      return new URL(normalizedPath, window.location.origin).toString();
    }

    return normalizedPath;
  }

  const normalizedBaseUrl = apiBaseUrl.endsWith("/")
    ? apiBaseUrl
    : `${apiBaseUrl}/`;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}
