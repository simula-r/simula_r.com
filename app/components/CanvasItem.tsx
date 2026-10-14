"use client";

import { cn } from "@/lib/utils";

const MOUSE_BUTTON_LEFT = 0;

type CanvasItemInteraction = "drag" | "editing" | "inert";

function CanvasItem({
  x,
  y,
  selected,
  interaction,
  elRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onEdit,
  children,
}: {
  x: number;
  y: number;
  selected: boolean;
  interaction: CanvasItemInteraction;
  elRef: (node: HTMLDivElement | null) => void;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={elRef}
      className={cn(
        "absolute data-dragging:will-change-transform",
        interaction === "inert" && "pointer-events-none",
      )}
      data-selected={selected || undefined}
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
      onPointerDown={(e) => {
        if (interaction === "inert" || e.button !== MOUSE_BUTTON_LEFT) return;
        e.stopPropagation();
        if (interaction === "editing") return;
        e.currentTarget.setPointerCapture(e.pointerId);
        onDragStart(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => onDragMove(e.clientX, e.clientY)}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragCancel}
      onDoubleClick={interaction === "drag" ? onEdit : undefined}
    >
      {children}
    </div>
  );
}

export { CanvasItem };
export type { CanvasItemInteraction };
