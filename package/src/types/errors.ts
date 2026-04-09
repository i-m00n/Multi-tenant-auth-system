export class SdkError extends Error {
  public readonly statusCode: number;
  public readonly body: unknown;
  constructor(message: string, statusCode: number, body: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.body = body;
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
  public readonly retryAfter: number;
  constructor(retryAfter: number, body: unknown) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`, 429, body);
    this.retryAfter = retryAfter;
    this.name = "RateLimitError";
  }
}

export class ValidationError extends SdkError {
  public readonly errors: { field: string; message: string }[];
  constructor(errors: { field: string; message: string }[], body: unknown) {
    super("Validation failed", 400, body);
    this.name = "ValidationError";
    this.errors = errors;
  }
}
