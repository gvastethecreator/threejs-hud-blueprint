export type HudErrorCode =
  | "INVALID_ARGUMENT"
  | "INVALID_STATE"
  | "FEATURE_UNAVAILABLE"
  | "CAPABILITY_MISMATCH"
  | "RESOURCE_DISPOSED"
  | "FONT_LOAD_FAILED"
  | "BACKEND_FAILED";

export type HudErrorDetails = Readonly<Record<string, string | number | boolean | null>>;

export class HudError extends Error {
  readonly code: HudErrorCode;
  readonly details: HudErrorDetails;

  override readonly cause: unknown;

  constructor(code: HudErrorCode, message: string, details: HudErrorDetails = {}, cause?: unknown) {
    super(message);
    this.name = "HudError";
    this.code = code;
    this.details = Object.freeze({ ...details });
    this.cause = cause;
  }
}

export class HudFeatureUnavailableError extends HudError {
  constructor(feature: string, ticket?: string) {
    super("FEATURE_UNAVAILABLE", `${feature} is not available.`, {
      feature,
      ticket: ticket ?? null,
    });
    this.name = "HudFeatureUnavailableError";
  }
}
