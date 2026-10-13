"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

const BOX_SIZE = 4096;

type CanvasSelectionHandle = {
  start: (clientX: number, clientY: number) => void;
  move: (clientX: number, clientY: number) => void;
  end: () => void;
  cancel: () => void;
};

function intersects(a: DOMRect, b: DOMRect) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

const CanvasSelection = forwardRef<
  CanvasSelectionHandle,
  {
    itemNodes: React.RefObject<Map<string, HTMLDivElement>>;
    containerRect: React.RefObject<DOMRect | null>;
    onSelect: (ids: string[]) => void;
  }
>(function CanvasSelection({ itemNodes, containerRect, onSelect }, ref) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number } | null>(null);
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  const applyBoxTransform = () => {
    const start = drag.current;
    const box = boxRef.current;
    if (!start || !box) return;
    const origin = containerRect.current;
    const minX =
      Math.min(start.startX, current.current.x) - (origin?.left ?? 0);
    const minY = Math.min(start.startY, current.current.y) - (origin?.top ?? 0);
    const sx = Math.abs(current.current.x - start.startX);
    const sy = Math.abs(current.current.y - start.startY);
    box.style.transform = `translate(${minX}px, ${minY}px) scale(${sx / BOX_SIZE}, ${sy / BOX_SIZE})`;
  };

  const flush = () => {
    frame.current = null;
    applyBoxTransform();
  };

  const hideBox = () => {
    if (boxRef.current) boxRef.current.style.transform = "scale(0, 0)";
  };

  useImperativeHandle(ref, () => ({
    start(clientX, clientY) {
      drag.current = { startX: clientX, startY: clientY };
      current.current = { x: clientX, y: clientY };
      applyBoxTransform();
    },
    move(clientX, clientY) {
      if (!drag.current) return;
      current.current = { x: clientX, y: clientY };
      if (frame.current == null) frame.current = requestAnimationFrame(flush);
    },
    end() {
      const start = drag.current;
      if (!start) return;
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      const marquee = new DOMRect(
        Math.min(start.startX, current.current.x),
        Math.min(start.startY, current.current.y),
        Math.abs(current.current.x - start.startX),
        Math.abs(current.current.y - start.startY),
      );
      const ids: string[] = [];
      itemNodes.current.forEach((node, id) => {
        if (intersects(marquee, node.getBoundingClientRect())) ids.push(id);
      });
      drag.current = null;
      hideBox();
      onSelect(ids);
    },
    cancel() {
      drag.current = null;
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      hideBox();
    },
  }));

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      <div
        ref={boxRef}
        className="absolute left-0 top-0 origin-top-left bg-[rgba(59,130,246,0.15)] will-change-transform"
        style={{ width: BOX_SIZE, height: BOX_SIZE, transform: "scale(0, 0)" }}
      />
    </div>
  );
});

export { CanvasSelection };
export type { CanvasSelectionHandle };
