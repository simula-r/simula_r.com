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
const HINT_MS = 1400;

type Hold = {
  id: number;
  pointerId: number | null;
  x: number;
  y: number;
  duration: number;
  done?: boolean;
  hint?: boolean;
};

function useHoldToControl(
  ref: RefObject<HTMLElement | null>,
  {
    enabled,
    onHold,
    onBegin,
    onCancel,
  }: {
    enabled: boolean;
    onHold: () => void;
    onBegin: (duration: number) => void;
    onCancel: () => void;
  },
) {
  const [hold, setHold] = useState<Hold | null>(null);
  const active = useRef<{
    id: number;
    pointerId: number | null;
    timer: number;
  } | null>(null);
  const isEnabled = useEffectEvent(() => enabled);
  const complete = useEffectEvent(onHold);
  const started = useEffectEvent(onBegin);
  const cancelled = useEffectEvent(onCancel);

  const cancelHold = useEffectEvent(() => {
    const current = active.current;
    if (!current) return;
    window.clearTimeout(current.timer);
    active.current = null;
    cancelled();
    setHold(null);
  });

  const hintHold = useEffectEvent(() => {
    const current = active.current;
    if (!current) return;
    window.clearTimeout(current.timer);
    active.current = null;
    cancelled();
    const { id } = current;
    setHold((hold) => hold && { ...hold, hint: true });
    window.setTimeout(
      () => setHold((hold) => (hold?.id === id ? null : hold)),
      HINT_MS,
    );
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
      active.current = { id, pointerId, timer };
      started(duration);
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
      if (active.current?.pointerId === e.pointerId) hintHold();
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

export { useHoldToControl, HINT_MS };
export type { Hold };
