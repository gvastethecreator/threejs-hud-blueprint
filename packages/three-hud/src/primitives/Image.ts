import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import type { ReadonlyRect } from "../contracts/geometry.js";
import { HudNode, type HudNodeOptions } from "../core/HudNode.js";

export type TextureOwnership = "borrowed" | "owned";
export type TextureFilter = "nearest" | "linear";

export type HudTextureHandle = Readonly<{
  id: string;
  ownership: TextureOwnership;
  filter: TextureFilter;
  ready: boolean;
  dispose?: () => void;
}>;

export type ImageOptions = HudNodeOptions &
  Readonly<{
    texture?: HudTextureHandle;
    tint?: number;
    uv?: ReadonlyRect;
  }>;

export class HudImage extends HudNode {
  readonly primitive = "image" as const;
  texture: HudTextureHandle | null;
  tint: number;
  uv: ReadonlyRect;
  private ownedDisposed = false;

  constructor(options: ImageOptions = {}) {
    super({ ...options, width: options.width ?? 32, height: options.height ?? 32 });
    this.texture = options.texture ?? null;
    this.tint = options.tint ?? 0xffffff;
    this.uv = options.uv ?? { x: 0, y: 0, width: 1, height: 1 };
  }

  setTexture(texture: HudTextureHandle | null): void {
    this.assertAlive();
    this.texture = texture;
    this.ownedDisposed = false;
  }

  reportLoadFailure(handler?: HudDiagnosticHandler): void {
    this.texture = this.texture ? { ...this.texture, ready: false } : null;
    emitDiagnostic(handler, {
      severity: "error",
      code: "IMAGE_LOAD_FAILED",
      message: "Texture failed to load; image will not draw.",
      nodeId: this.id,
      details: { textureId: this.texture?.id ?? null },
    });
  }

  override dispose(): void {
    this.releaseOwnedTexture();
    super.dispose();
  }

  releaseOwnedTexture(): void {
    if (this.ownedDisposed) return;
    if (this.texture?.ownership !== "owned") return;
    this.texture.dispose?.();
    this.ownedDisposed = true;
  }
}
