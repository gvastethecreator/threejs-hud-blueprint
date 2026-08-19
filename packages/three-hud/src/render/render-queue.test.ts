import { describe, expect, it } from "vitest";
import { composeBatchKey, serializeDrawCommand, type ShapeInstanceCommand } from "./commands.js";
import { RenderQueue } from "./renderQueue.js";

function withKey<T extends Parameters<typeof composeBatchKey>[0]>(
  command: T,
): T & { batchKey: string } {
  return { ...command, batchKey: composeBatchKey(command) };
}

function rect(
  partial: Partial<ShapeInstanceCommand> & Pick<ShapeInstanceCommand, "sourceNodeId" | "sequence">,
): ShapeInstanceCommand {
  const draft = {
    kind: "shape" as const,
    shape: "rect" as const,
    layerOrder: 0,
    zIndex: 0,
    opacity: 1,
    clip: null,
    blend: "premultiplied" as const,
    rendererProfile: "webgl",
    bounds: { x: 0, y: 0, width: 10, height: 10 },
    fill: 0xffffff,
    ...partial,
  };
  return { ...draft, batchKey: composeBatchKey(draft) };
}

describe("render-queue", () => {
  it("keeps authored order when batch keys are equal", () => {
    const queue = new RenderQueue();
    queue.push(rect({ sourceNodeId: "a", sequence: 0, fill: 1 }));
    queue.push(rect({ sourceNodeId: "b", sequence: 1, fill: 2 }));
    queue.push(rect({ sourceNodeId: "c", sequence: 2, fill: 3, zIndex: 1 }));
    const snapshot = queue.snapshot();
    expect(snapshot.commands.map((command) => command.sourceNodeId)).toEqual(["a", "b", "c"]);
    expect(snapshot.batches).toHaveLength(1);
    expect(snapshot.batches[0]?.count).toBe(3);
  });

  it("does not rebuild unrelated batch topology when only instance data changes", () => {
    const queue = new RenderQueue();
    queue.push(rect({ sourceNodeId: "panel", sequence: 0 }));
    queue.push(
      withKey({
        kind: "image",
        layerOrder: 0,
        zIndex: 0,
        sequence: 1,
        opacity: 1,
        clip: null,
        blend: "premultiplied",
        sourceNodeId: "icon",
        rendererProfile: "webgl",
        bounds: { x: 0, y: 0, width: 8, height: 8 },
        resource: { kind: "texture", id: "atlas-0" },
        tint: 0xffffff,
      }),
    );
    queue.snapshot();
    const epoch = queue.epoch;
    const topology = queue.snapshot().topology;
    queue.clear();
    queue.push(
      rect({
        sourceNodeId: "panel",
        sequence: 0,
        fill: 0xff0000,
        bounds: { x: 4, y: 4, width: 12, height: 12 },
      }),
    );
    queue.push(
      withKey({
        kind: "image",
        layerOrder: 0,
        zIndex: 0,
        sequence: 1,
        opacity: 0.5,
        clip: null,
        blend: "premultiplied",
        sourceNodeId: "icon",
        rendererProfile: "webgl",
        bounds: { x: 1, y: 1, width: 8, height: 8 },
        resource: { kind: "texture", id: "atlas-0" },
        tint: 0x00ff00,
      }),
    );
    const next = queue.snapshot();
    expect(next.topology).toEqual(topology);
    expect(queue.epoch).toBe(epoch);
  });

  it("serializes commands without GPU objects or object-identity batch keys", () => {
    const queue = new RenderQueue();
    queue.push(
      withKey({
        kind: "text",
        layerOrder: 1,
        zIndex: 0,
        sequence: 0,
        opacity: 1,
        clip: { x: 0, y: 0, width: 20, height: 8 },
        blend: "premultiplied",
        sourceNodeId: "label",
        rendererProfile: "native-webgpu",
        bounds: { x: 0, y: 0, width: 20, height: 8 },
        resource: { kind: "font", id: "inter" },
        glyphCount: 4,
        fill: 0xffffff,
        text: "HUD",
        glyphs: [{ x: 0, y: 0, width: 4, height: 8, u0: 0, v0: 0, u1: 0.1, v1: 0.1 }],
      }),
    );
    const snapshot = queue.snapshot();
    const json = JSON.stringify(snapshot);
    expect(json).not.toContain("[object");
    expect(json).not.toContain("[object Object]");
    expect(snapshot.commands[0]?.batchKey).toBe("native-webgpu|text|text|premultiplied|clip|inter");
    expect(serializeDrawCommand(snapshot.commands[0]!)).toEqual(snapshot.commands[0]);
    expect(JSON.parse(json)).toEqual(snapshot);
  });

  it("serializes debug overlay commands without GPU handles", () => {
    const queue = new RenderQueue();
    queue.push(
      withKey({
        kind: "debug",
        layerOrder: 0,
        zIndex: 9,
        sequence: 0,
        opacity: 1,
        clip: null,
        blend: "alpha",
        sourceNodeId: "layout-debug",
        rendererProfile: "webgl",
        bounds: { x: 1, y: 2, width: 3, height: 4 },
        label: "bounds",
      }),
    );
    const snapshot = queue.snapshot();
    expect(snapshot.commands[0]?.kind).toBe("debug");
    const json = JSON.stringify(snapshot);
    expect(JSON.parse(json)).toEqual(snapshot);
    expect(snapshot.commands[0]?.batchKey).toBe("webgl|debug|debug|alpha|noclip|-");
  });

  it("rebuilds topology when a resource handle or clip changes, not when fill changes", () => {
    const queue = new RenderQueue();
    queue.push(rect({ sourceNodeId: "a", sequence: 0 }));
    queue.push(rect({ sourceNodeId: "b", sequence: 1 }));
    queue.snapshot();
    const epoch = queue.epoch;
    queue.clear();
    queue.push(rect({ sourceNodeId: "a", sequence: 0, fill: 0x112233 }));
    queue.push(rect({ sourceNodeId: "b", sequence: 1, clip: { x: 0, y: 0, width: 4, height: 4 } }));
    const next = queue.snapshot();
    expect(next.topology).not.toEqual(["webgl|shape|rect|premultiplied|noclip|-"]);
    expect(queue.epoch).toBeGreaterThan(epoch);
    expect(next.batches).toHaveLength(2);
  });
});
