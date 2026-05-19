/**
 * Base error class for the application. All layer-specific errors should
 * extend this so the presentation layer can pattern-match cleanly.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly cause?: unknown;

  constructor(message: string, code = "APP_ERROR", cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
  }
}

/** Validation / business-rule violations originating from the domain layer. */
export class DomainError extends AppError {
  constructor(message: string, code = "DOMAIN_ERROR", cause?: unknown) {
    super(message, code, cause);
  }
}

/** Errors raised by data sources (SQLite, Supabase, file system, etc.). */
export class DataError extends AppError {
  constructor(message: string, code = "DATA_ERROR", cause?: unknown) {
    super(message, code, cause);
  }
}

/** Network / transport-level failures. */
export class NetworkError extends AppError {
  constructor(message: string, code = "NETWORK_ERROR", cause?: unknown) {
    super(message, code, cause);
  }
}

/** Authentication / authorization failures. */
export class AuthError extends AppError {
  constructor(message: string, code = "AUTH_ERROR", cause?: unknown) {
    super(message, code, cause);
  }
}

/** Resource not found in a data source. */
export class NotFoundError extends DataError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id "${id}" was not found.` : `${resource} not found.`,
      "NOT_FOUND",
    );
  }
}
