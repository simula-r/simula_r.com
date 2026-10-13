"use client";

import { useRef, useState } from "react";
import { ElementPreview } from "./ElementPreview";
import { cn } from "@/lib/utils";

function isBlocked(
  x: number,
  y: number,
  panelRect: DOMRect,
  halfWidth: number,
  halfHeight: number,
) {
  return (
    x - halfWidth <= panelRect.right &&
    y + halfHeight >= panelRect.top &&
    y - halfHeight <= panelRect.bottom
  );
}

type SidebarItemProps = {
  panelRef: React.RefObject<HTMLDivElement | null>;
  icon: React.ReactNode;
  preview: React.ReactNode;
  zoom: number;
  onCreate: (clientX: number, clientY: number) => void;
};

function SidebarItem({
  panelRef,
  icon,
  preview,
  zoom,
  onCreate,
}: SidebarItemProps) {
  const [dragging, setDragging] = useState(false);
  const [canPlace, setCanPlace] = useState(false);

  const iconPreviewRef = useRef<HTMLDivElement>(null);
  const elementPreviewRef = useRef<HTMLDivElement>(null);

  const posRef = useRef({ x: 0, y: 0 });
  const canPlaceRef = useRef(false);
  const halfSizeRef = useRef({ width: 0, height: 0 });
  const panelRectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = () => {
    const { x, y } = posRef.current;
    const panelRect = panelRectRef.current!;
    const { width: halfWidth, height: halfHeight } = halfSizeRef.current;

    if (iconPreviewRef.current) {
      iconPreviewRef.current.style.transform = `translate(${x - panelRect.left}px, ${y - panelRect.top}px) translate(-50%, -50%)`;
    }
    if (elementPreviewRef.current) {
      elementPreviewRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }

    const allowed = !isBlocked(x, y, panelRect, halfWidth, halfHeight);
    if (allowed !== canPlaceRef.current) {
      canPlaceRef.current = allowed;
      setCanPlace(allowed);
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const iconRect = e.currentTarget.getBoundingClientRect();
    halfSizeRef.current = {
      width: iconRect.width / 2,
      height: iconRect.height / 2,
    };
    posRef.current = { x: e.clientX, y: e.clientY };
    panelRectRef.current = panelRef.current!.getBoundingClientRect();
    canPlaceRef.current = false;
    setCanPlace(false);
    setDragging(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    posRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (canPlaceRef.current) {
      onCreate(posRef.current.x, posRef.current.y);
    }
    setDragging(false);
  };

  return (
    <>
      <div
        className={cn("touch-none", dragging && canPlace ? "cursor-grab" : "cursor-default")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {icon}
      </div>
      {dragging && !canPlace && (
        <div
          ref={iconPreviewRef}
          className="absolute left-0 top-0 pointer-events-none"
        >
          {icon}
        </div>
      )}
      {dragging && canPlace && (
        <ElementPreview ref={elementPreviewRef} zoom={zoom}>
          {preview}
        </ElementPreview>
      )}
    </>
  );
}

export { SidebarItem };
