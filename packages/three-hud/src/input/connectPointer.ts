import type { HUD } from "../core/HUD.js";
import type { HudPointerController, HudPointerInput } from "./dispatcher.js";

export type ConnectedPointer = Readonly<{
  disconnect: () => void;
  controller: HudPointerController;
}>;

export function connectHudPointerEvents(
  hud: HUD,
  canvas: {
    addEventListener: (
      type: string,
      listener: (event: PointerEvent) => void,
      options?: AddEventListenerOptions,
    ) => void;
    removeEventListener: (type: string, listener: (event: PointerEvent) => void) => void;
    getBoundingClientRect?: () => { left: number; top: number; width: number; height: number };
  },
  controller: HudPointerController,
): ConnectedPointer {
  const listeners: Array<[string, (event: PointerEvent) => void]> = [];
  const origin = (): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect?.();
    return rect ? { x: rect.left, y: rect.top } : { x: 0, y: 0 };
  };
  const bind = (type: string, mapped: HudPointerInput["type"]): void => {
    const listener = (event: PointerEvent): void => {
      const box = origin();
      controller.dispatch(
        {
          pointerId: event.pointerId,
          type: mapped,
          clientX: event.clientX,
          clientY: event.clientY,
          button: event.button,
          buttons: event.buttons,
          pointerType: event.pointerType,
          time: event.timeStamp,
        },
        { canvasOrigin: box },
      );
    };
    canvas.addEventListener(type, listener);
    listeners.push([type, listener]);
  };
  bind("pointermove", "move");
  bind("pointerdown", "down");
  bind("pointerup", "up");
  bind("pointercancel", "cancel");
  return {
    controller,
    disconnect(): void {
      for (const [type, listener] of listeners) canvas.removeEventListener(type, listener);
      listeners.length = 0;
    },
  };
}
