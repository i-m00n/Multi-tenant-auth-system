export class SdkError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "SdkError";
  }
}

export class AuthError extends SdkError {
  constructor(body: unknown) {
    super("Authentication failed", 401, body);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends SdkError {
  constructor(body: unknown) {
    super("Insufficient permissions", 403, body);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends SdkError {
  constructor(body: unknown) {
    super("Resource not found", 404, body);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends SdkError {
  constructor(
    public readonly retryAfter: number,
    body: unknown,
  ) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`, 429, body);
    this.name = "RateLimitError";
  }
}

export class ValidationError extends SdkError {
  constructor(
    public readonly errors: { field: string; message: string }[],
    body: unknown,
  ) {
    super("Validation failed", 400, body);
    this.name = "ValidationError";
  }
}
