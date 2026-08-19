export const enum DirtyFlag {
  None = 0,
  Transform = 1 << 0,
  Layout = 1 << 1,
  Style = 1 << 2,
  Text = 1 << 3,
  Geometry = 1 << 4,
  Children = 1 << 5,
  HitTest = 1 << 6,
  Queue = 1 << 7,
  All = Transform | Layout | Style | Text | Geometry | Children | HitTest | Queue,
}

export type InvalidationCounters = Readonly<{
  transform: number;
  layout: number;
  style: number;
  text: number;
  geometry: number;
  children: number;
  hitTest: number;
  queue: number;
  coalescedWrites: number;
}>;

export const DIRTY_STAGE_ORDER: readonly DirtyFlag[] = [
  DirtyFlag.Text,
  DirtyFlag.Layout,
  DirtyFlag.Transform,
  DirtyFlag.Geometry,
  DirtyFlag.Style,
  DirtyFlag.HitTest,
  DirtyFlag.Queue,
  DirtyFlag.Children,
];

export function dirtyFlagNames(flags: DirtyFlag): readonly string[] {
  const names: string[] = [];
  if (flags & DirtyFlag.Transform) names.push("transform");
  if (flags & DirtyFlag.Layout) names.push("layout");
  if (flags & DirtyFlag.Style) names.push("style");
  if (flags & DirtyFlag.Text) names.push("text");
  if (flags & DirtyFlag.Geometry) names.push("geometry");
  if (flags & DirtyFlag.Children) names.push("children");
  if (flags & DirtyFlag.HitTest) names.push("hitTest");
  if (flags & DirtyFlag.Queue) names.push("queue");
  return names;
}
