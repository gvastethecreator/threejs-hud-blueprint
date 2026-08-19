import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { createMonospaceFace, layoutText, type LayoutTextResult } from "../text/layoutText.js";

export type LabelOptions = HudNodeOptions &
  Readonly<{
    text?: string;
    fontId?: string;
    color?: number;
    fontSize?: number;
  }>;

export class Label extends HudNode {
  readonly primitive = "text" as const;
  text: string;
  fontId: string;
  color: number;
  layout: LayoutTextResult;

  constructor(options: LabelOptions = {}) {
    super({
      ...options,
      width: options.width ?? 0,
      height: options.height ?? options.fontSize ?? 14,
      fill: 0x000000,
    });
    this.opacity = options.opacity ?? 1;
    this.text = options.text ?? "";
    this.fontId = options.fontId ?? "ui";
    this.color = options.color ?? 0xe8f6ff;
    if (options.fontSize !== undefined) this.fontSize = options.fontSize;
    this.layout = layoutText(
      this.text,
      { font: this.fontId, size: this.fontSize },
      createMonospaceFace(this.fontId),
    );
    this.remeasure();
  }

  override setFontSize(fontSize: number): void {
    super.setFontSize(fontSize);
    this.remeasure();
  }

  setFontId(fontId: string): void {
    if (this.fontId === fontId) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.fontId = fontId;
    this.remeasure();
    this.markDirty(DirtyFlag.Text | DirtyFlag.Layout | DirtyFlag.Geometry);
  }

  setText(text: string): void {
    if (this.text === text) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.text = text;
    this.remeasure();
    this.markDirty(DirtyFlag.Text | DirtyFlag.Layout | DirtyFlag.Geometry);
  }

  remeasure(): void {
    this.layout = layoutText(
      this.text,
      { font: this.fontId, size: this.fontSize },
      createMonospaceFace(this.fontId),
    );
    this.setSize(
      this.layout.width,
      this.layout.height,
      DirtyFlag.Layout | DirtyFlag.Geometry | DirtyFlag.Text,
    );
  }
}
