export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorResponse = {
  message?: string;
};

export function getApiErrorMessage(responseBody: unknown) {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "message" in responseBody &&
    typeof (responseBody as ApiErrorResponse).message === "string"
  ) {
    return (responseBody as ApiErrorResponse).message;
  }

  return null;
}
