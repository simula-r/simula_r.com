"use client";

const MOUSE_BUTTON_LEFT = 0;

function CanvasItem({
  x,
  y,
  selected,
  elRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  children,
}: {
  x: number;
  y: number;
  selected: boolean;
  elRef: (node: HTMLDivElement | null) => void;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={elRef}
      className="absolute data-dragging:will-change-transform"
      data-selected={selected || undefined}
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
      onPointerDown={(e) => {
        if (e.button !== MOUSE_BUTTON_LEFT) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDragStart(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => onDragMove(e.clientX, e.clientY)}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragCancel}
    >
      {children}
    </div>
  );
}

export { CanvasItem };
