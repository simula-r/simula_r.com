import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefObject,
} from "react";
import { MOTION } from "@/lib/motion";

const HOLD_MS = 700;
const WHEEL_HOLD_MS = 490;

type Hold = {
  id: number;
  pointerId: number | null;
  x: number;
  y: number;
  duration: number;
  done?: boolean;
};

function useHoldToControl(
  ref: RefObject<HTMLElement | null>,
  {
    enabled,
    onHold,
  }: {
    enabled: boolean;
    onHold: () => void;
  },
) {
  const [hold, setHold] = useState<Hold | null>(null);
  const active = useRef<{ pointerId: number | null; timer: number } | null>(
    null,
  );
  const isEnabled = useEffectEvent(() => enabled);
  const complete = useEffectEvent(onHold);

  const cancelHold = useEffectEvent(() => {
    const current = active.current;
    if (!current) return;
    window.clearTimeout(current.timer);
    active.current = null;
    setHold(null);
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controller = new AbortController();
    const { signal } = controller;
    let swallowMenu = false;
    let nextId = 0;

    const begin = (
      pointerId: number | null,
      x: number,
      y: number,
      duration: number,
    ) => {
      const id = ++nextId;
      const timer = window.setTimeout(() => {
        active.current = null;
        setHold((current) => current && { ...current, done: true });
        complete();
        window.setTimeout(
          () => setHold((current) => (current?.id === id ? null : current)),
          MOTION.fast,
        );
      }, duration);
      active.current = { pointerId, timer };
      setHold({ id, pointerId, x, y, duration });
    };

    node.addEventListener(
      "pointerdown",
      (e) => {
        swallowMenu = isEnabled();
        if (!swallowMenu) return;
        if (active.current) {
          cancelHold();
          return;
        }
        begin(e.pointerId, e.clientX, e.clientY, HOLD_MS);
      },
      { capture: true, signal },
    );

    node.addEventListener(
      "wheel",
      (e) => {
        if (!isEnabled() || active.current) return;
        begin(null, e.clientX, e.clientY, WHEEL_HOLD_MS);
      },
      { capture: true, passive: true, signal },
    );

    const release = (e: PointerEvent) => {
      if (active.current?.pointerId === e.pointerId) cancelHold();
    };

    window.addEventListener("pointerup", release, { capture: true, signal });
    window.addEventListener("pointercancel", release, {
      capture: true,
      signal,
    });
    window.addEventListener("blur", () => cancelHold(), { signal });

    node.addEventListener(
      "contextmenu",
      (e) => {
        if (swallowMenu) e.preventDefault();
      },
      { signal },
    );

    return () => {
      controller.abort();
      cancelHold();
    };
  }, [ref]);

  useEffect(() => {
    if (!enabled) return;
    return () => cancelHold();
  }, [enabled]);

  return enabled || hold?.done ? hold : null;
}

export { useHoldToControl };
export type { Hold };
