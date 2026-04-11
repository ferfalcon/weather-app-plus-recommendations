type ValidationIssues = Record<string, string[] | undefined>;

type UpstreamProviderErrorOptions = {
  cause?: unknown;
  logContext?: Record<string, unknown>;
  logMessage: string;
};

export class InvalidRequestError extends Error {
  readonly issues: ValidationIssues;
  readonly statusCode = 400;

  constructor(message: string, issues: ValidationIssues) {
    super(message);

    this.name = "InvalidRequestError";
    this.issues = issues;
  }
}

export class UpstreamProviderError extends Error {
  readonly logContext: Record<string, unknown> | undefined;
  readonly logMessage: string;
  readonly statusCode = 502;

  constructor(message: string, options: UpstreamProviderErrorOptions) {
    super(message, {
      cause: options.cause,
    });

    this.name = "UpstreamProviderError";
    this.logContext = options.logContext;
    this.logMessage = options.logMessage;
  }
}
