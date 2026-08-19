import { describe, expect, it } from "vitest";
import { HudLayer } from "../core/HudLayer.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { HudImage, type HudTextureHandle } from "./Image.js";

function handle(
  partial: Partial<HudTextureHandle> & Pick<HudTextureHandle, "id" | "ownership">,
): HudTextureHandle {
  return {
    filter: "nearest",
    ready: true,
    ...partial,
  };
}

describe("image", () => {
  it("never disposes borrowed textures and disposes owned textures exactly once", () => {
    let borrowed = 0;
    let owned = 0;
    const borrowedTex = handle({
      id: "borrowed",
      ownership: "borrowed",
      dispose: () => {
        borrowed += 1;
      },
    });
    const ownedTex = handle({
      id: "owned",
      ownership: "owned",
      dispose: () => {
        owned += 1;
      },
    });
    const a = new HudImage({ texture: borrowedTex });
    const b = new HudImage({ texture: ownedTex });
    a.dispose();
    a.dispose();
    b.dispose();
    b.dispose();
    expect(borrowed).toBe(0);
    expect(owned).toBe(1);
  });

  it("keeps nearest filtering in the batch key and skips unread textures", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 64, height: 64 } });
    layer.add(
      new HudImage({
        id: "icon",
        texture: handle({ id: "px", ownership: "borrowed", filter: "nearest" }),
      }),
    );
    layer.add(
      new HudImage({
        id: "pending",
        texture: handle({ id: "late", ownership: "borrowed", ready: false }),
      }),
    );
    const snapshot = encodeOverlayQueue([layer], "webgl").snapshot();
    expect(snapshot.commands).toHaveLength(1);
    expect(
      snapshot.commands[0] && snapshot.commands[0].kind === "image"
        ? snapshot.commands[0].resource.id
        : "",
    ).toBe("px:nearest");
  });

  it("diagnoses load failure and does not draw a placeholder command", () => {
    const codes: string[] = [];
    const image = new HudImage({
      id: "broken",
      texture: handle({ id: "missing", ownership: "owned", ready: true }),
    });
    image.reportLoadFailure((diagnostic) => codes.push(diagnostic.code));
    const layer = new HudLayer({ id: "main", referenceSize: { width: 64, height: 64 } });
    layer.add(image);
    expect(codes).toEqual(["IMAGE_LOAD_FAILED"]);
    expect(encodeOverlayQueue([layer], "webgl").size).toBe(0);
  });
});
