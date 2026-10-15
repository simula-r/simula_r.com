import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefObject,
} from "react";

const HOLD_MS = 800;

type Hold = { id: number; pointerId: number; x: number; y: number };

function useHoldToControl(
  ref: RefObject<HTMLElement | null>,
  {
    enabled,
    onHold,
    onNudge,
  }: {
    enabled: boolean;
    onHold: () => void;
    onNudge: () => void;
  },
) {
  const [hold, setHold] = useState<Hold | null>(null);
  const active = useRef<{ pointerId: number; timer: number } | null>(null);
  const isEnabled = useEffectEvent(() => enabled);
  const complete = useEffectEvent(onHold);
  const nudge = useEffectEvent(onNudge);

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

    const begin = (e: PointerEvent) => {
      const id = ++nextId;
      const timer = window.setTimeout(() => {
        active.current = null;
        setHold(null);
        complete();
      }, HOLD_MS);
      active.current = { pointerId: e.pointerId, timer };
      setHold({ id, pointerId: e.pointerId, x: e.clientX, y: e.clientY });
    };

    node.addEventListener(
      "pointerdown",
      (e) => {
        swallowMenu = isEnabled();
        if (!swallowMenu) return;
        if (active.current) {
          cancelHold();
          nudge();
          return;
        }
        begin(e);
      },
      { capture: true, signal },
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

    node.addEventListener(
      "wheel",
      () => {
        if (isEnabled()) nudge();
      },
      { capture: true, passive: true, signal },
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

  return enabled ? hold : null;
}

export { useHoldToControl, HOLD_MS };
export type { Hold };
