import { composeBatchKey, type HudDrawCommand } from "./commands.js";

export type RenderBatch = Readonly<{
  key: string;
  start: number;
  count: number;
}>;

export type RenderQueueSnapshot = Readonly<{
  commands: readonly HudDrawCommand[];
  batches: readonly RenderBatch[];
  topology: readonly string[];
}>;

export class RenderQueue {
  private readonly items: HudDrawCommand[] = [];
  private readonly batches: RenderBatch[] = [];
  private topology: string[] = [];
  private topologyEpoch = 0;
  private lastTopology = "";

  get size(): number {
    return this.items.length;
  }

  get epoch(): number {
    return this.topologyEpoch;
  }

  clear(): void {
    this.items.length = 0;
    this.batches.length = 0;
  }

  push(command: HudDrawCommand): HudDrawCommand {
    const next = Object.freeze({
      ...command,
      batchKey: command.batchKey || composeBatchKey(command),
    }) as HudDrawCommand;
    this.items.push(next);
    return next;
  }

  sort(): void {
    this.items.sort(compareDrawCommand);
  }

  rebuildBatches(): readonly RenderBatch[] {
    this.batches.length = 0;
    let current: { key: string; start: number; count: number } | null = null;
    for (let index = 0; index < this.items.length; index += 1) {
      const command = this.items[index];
      if (!command) continue;
      if (!current || current.key !== command.batchKey) {
        current = { key: command.batchKey, start: index, count: 1 };
        this.batches.push(current);
      } else {
        current.count += 1;
      }
    }
    this.topology = this.batches.map((batch) => batch.key);
    const signature = this.topology.join("\n");
    if (signature !== this.lastTopology) {
      this.topologyEpoch += 1;
      this.lastTopology = signature;
    }
    return this.batches;
  }

  snapshot(): RenderQueueSnapshot {
    this.sort();
    this.rebuildBatches();
    return Object.freeze({
      commands: Object.freeze(this.items.map((command) => Object.freeze({ ...command }))),
      batches: Object.freeze(this.batches.map((batch) => Object.freeze({ ...batch }))),
      topology: Object.freeze(this.topology.slice()),
    });
  }
}

export function compareDrawCommand(a: HudDrawCommand, b: HudDrawCommand): number {
  if (a.layerOrder !== b.layerOrder) return a.layerOrder - b.layerOrder;
  if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
  if (a.sequence !== b.sequence) return a.sequence - b.sequence;
  if (a.batchKey !== b.batchKey) return a.batchKey.localeCompare(b.batchKey);
  return a.sourceNodeId.localeCompare(b.sourceNodeId);
}
