import type { TextBackendCapabilities } from "../contracts/capabilities.js";
import { HudFeatureUnavailableError } from "../contracts/errors.js";
import type { GlyphRun, TextBackend } from "./contracts.js";

export class PlannedTextBackend implements TextBackend {
  readonly id: string;
  readonly capabilities: TextBackendCapabilities;
  private readonly ticket: string;

  constructor(capabilities: TextBackendCapabilities, ticket: string) {
    this.id = capabilities.id;
    this.capabilities = capabilities;
    this.ticket = ticket;
  }

  prepare(_run: GlyphRun): never {
    throw new HudFeatureUnavailableError(`Text backend ${this.id}`, this.ticket);
  }

  update(_prepared: unknown, _run: GlyphRun): never {
    throw new HudFeatureUnavailableError(`Text backend ${this.id}`, this.ticket);
  }

  disposePrepared(_prepared: unknown): void {}
  dispose(): void {}
}
