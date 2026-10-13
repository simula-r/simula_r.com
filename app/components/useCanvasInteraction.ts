import { useEffect, useEffectEvent, type RefObject } from "react";

const MOUSE_BUTTON_LEFT = 0;
const MOUSE_BUTTON_RIGHT = 2;
const DRAG_THRESHOLD_PX = 4;

function useCanvasInteraction(
  ref: RefObject<HTMLElement | null>,
  onInteract: () => void,
) {
  const interact = useEffectEvent(onInteract);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controller = new AbortController();
    const { signal } = controller;
    const gestures = new Map<
      number,
      { x: number; y: number; broken: boolean }
    >();

    const endGesture = (e: PointerEvent) => gestures.delete(e.pointerId);

    node.addEventListener(
      "pointerdown",
      (e) => {
        const isClick =
          e.button === MOUSE_BUTTON_LEFT || e.button === MOUSE_BUTTON_RIGHT;
        gestures.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
          broken: !isClick,
        });
        if (!isClick) interact();
      },
      { capture: true, signal },
    );

    window.addEventListener(
      "pointermove",
      (e) => {
        const gesture = gestures.get(e.pointerId);
        if (!gesture || gesture.broken) return;
        const distance = Math.hypot(
          e.clientX - gesture.x,
          e.clientY - gesture.y,
        );
        if (distance < DRAG_THRESHOLD_PX) return;
        gesture.broken = true;
        interact();
      },
      { capture: true, passive: true, signal },
    );

    window.addEventListener("pointerup", endGesture, { capture: true, signal });
    window.addEventListener("pointercancel", endGesture, {
      capture: true,
      signal,
    });
    window.addEventListener("blur", () => gestures.clear(), { signal });

    node.addEventListener("wheel", () => interact(), {
      capture: true,
      passive: true,
      signal,
    });

    return () => {
      controller.abort();
      gestures.clear();
    };
  }, [ref]);
}

export { useCanvasInteraction };
