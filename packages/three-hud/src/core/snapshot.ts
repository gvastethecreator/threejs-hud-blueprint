import { emitDiagnostic, type HudDiagnosticHandler } from "../contracts/diagnostics.js";
import type { HudLayer } from "./HudLayer.js";
import type { HudNode } from "./HudNode.js";
import { collectHitOrder, collectPaintOrder } from "./order.js";

export const USER_KEY_SCOPE = "hud" as const;

export type DuplicateUserKeyRecord = Readonly<{
  userKey: string;
  firstNodeId: string;
  duplicateNodeId: string;
  scope: typeof USER_KEY_SCOPE;
}>;

export type HudNodeSnapshot = Readonly<{
  id: string;
  userKey: string | null;
  debugLabel: string;
  insertionSeq: number;
  renderSeq: number;
  zIndex: number;
  visible: boolean;
  opacity: number;
  position: Readonly<{ x: number; y: number }>;
  size: Readonly<{ width: number; height: number }>;
  children: readonly HudNodeSnapshot[];
}>;

export type HudTreeSnapshot = Readonly<{
  root: HudNodeSnapshot;
  drawOrder: readonly string[];
  hitOrder: readonly string[];
  duplicateUserKeys: readonly DuplicateUserKeyRecord[];
}>;

export type HudSnapshot = Readonly<{
  state: string;
  frame: number;
  layers: readonly Readonly<{
    id: string;
    order: number;
    enabled: boolean;
    insertionSeq: number;
    tree: HudTreeSnapshot;
  }>[];
  duplicateUserKeys: readonly DuplicateUserKeyRecord[];
}>;

export type SnapshotHudLike = Readonly<{
  state: string;
  frame: number;
  layers: readonly HudLayer[];
  reportDiagnostic?: HudDiagnosticHandler;
}>;

export type SnapshotTreeOptions = Readonly<{
  onDiagnostic?: HudDiagnosticHandler;
  diagnoseDuplicates?: boolean;
}>;

export function snapshotHudTree(root: HudNode, options: SnapshotTreeOptions = {}): HudTreeSnapshot {
  const paint = collectPaintOrder(root);
  const hit = collectHitOrder(root);
  const duplicateUserKeys = findDuplicateUserKeys([root]);
  if (options.diagnoseDuplicates !== false) {
    reportDuplicateUserKeys(options.onDiagnostic, duplicateUserKeys);
  }
  return Object.freeze({
    root: serializeNode(root),
    drawOrder: Object.freeze(paint.map((node) => node.id)),
    hitOrder: Object.freeze(hit.map((node) => node.id)),
    duplicateUserKeys: Object.freeze(duplicateUserKeys),
  });
}

export function snapshotHud(hud: SnapshotHudLike): HudSnapshot {
  const duplicateUserKeys = findDuplicateUserKeys(hud.layers);
  const handler = hud.reportDiagnostic
    ? (diagnostic: Parameters<HudDiagnosticHandler>[0]) => {
        hud.reportDiagnostic?.(diagnostic);
      }
    : undefined;
  reportDuplicateUserKeys(handler, duplicateUserKeys);
  const layers = hud.layers.map((layer) =>
    Object.freeze({
      id: layer.id,
      order: layer.order,
      enabled: layer.enabled,
      insertionSeq: layer.insertionSeq,
      tree: snapshotHudTree(layer, { diagnoseDuplicates: false }),
    }),
  );
  return Object.freeze({
    state: hud.state,
    frame: hud.frame,
    layers: Object.freeze(layers),
    duplicateUserKeys: Object.freeze(duplicateUserKeys),
  });
}

export function findDuplicateUserKeys(roots: readonly HudNode[]): DuplicateUserKeyRecord[] {
  const seen = new Map<string, string>();
  const duplicates: DuplicateUserKeyRecord[] = [];
  const visit = (node: HudNode): void => {
    const key = node.userKey;
    if (key !== undefined) {
      const first = seen.get(key);
      if (first === undefined) seen.set(key, node.id);
      else {
        duplicates.push(
          Object.freeze({
            userKey: key,
            firstNodeId: first,
            duplicateNodeId: node.id,
            scope: USER_KEY_SCOPE,
          }),
        );
      }
    }
    for (const child of node.children) visit(child);
  };
  for (const root of roots) visit(root);
  return duplicates;
}

function reportDuplicateUserKeys(
  handler: HudDiagnosticHandler | undefined,
  records: readonly DuplicateUserKeyRecord[],
): void {
  for (const record of records) {
    emitDiagnostic(handler, {
      severity: "warning",
      code: "DUPLICATE_USER_KEY",
      message: `Duplicate userKey "${record.userKey}" within ${record.scope} scope.`,
      nodeId: record.duplicateNodeId,
      details: {
        userKey: record.userKey,
        firstNodeId: record.firstNodeId,
        scope: record.scope,
      },
    });
  }
}

function serializeNode(node: HudNode): HudNodeSnapshot {
  return Object.freeze({
    id: node.id,
    userKey: node.userKey ?? null,
    debugLabel: node.debugLabel,
    insertionSeq: node.insertionSeq,
    renderSeq: node.renderSeq,
    zIndex: node.zIndex,
    visible: node.visible,
    opacity: node.opacity,
    position: Object.freeze({ x: node.position.x, y: node.position.y }),
    size: Object.freeze({ width: node.size.width, height: node.size.height }),
    children: Object.freeze(node.children.map(serializeNode)),
  });
}
