"use client";

import { memo } from "react";
import type { Camera, CanvasElementData } from "@/app/elements/types";
import {
  RESIZE_CORNERS,
  cornerCursor,
  cornerSigns,
  type ResizeCorner,
  type ResizeRect,
} from "@/lib/resize";

const EDGE_LENGTH = 4096;
const EDGE_THICKNESS = 4;
const HANDLE_HIT_SIZE = 16;
const MOUSE_BUTTON_LEFT = 0;

const EDGE_CLASS =
  "absolute left-0 top-0 origin-top-left bg-selection will-change-transform";

const HORIZONTAL_EDGE = { width: EDGE_LENGTH, height: EDGE_THICKNESS };
const VERTICAL_EDGE = { width: EDGE_THICKNESS, height: EDGE_LENGTH };
const EDGE_SIZES = [HORIZONTAL_EDGE, HORIZONTAL_EDGE, VERTICAL_EDGE, VERTICAL_EDGE];

type ResizeHandlers = {
  onResizeStart: (corner: ResizeCorner, clientX: number, clientY: number) => void;
  onResizeMove: (clientX: number, clientY: number, free: boolean) => void;
  onResizeEnd: () => void;
  onResizeCancel: () => void;
};

function edgeTransforms({ x, y, width, height }: ResizeRect, zoom: number) {
  const left = (x - width / 2) * zoom - 0.5;
  const top = (y - height / 2) * zoom - 0.5;
  const w = width * zoom + 1;
  const h = height * zoom + 1;
  const scaleW = w / EDGE_LENGTH;
  const scaleH = h / EDGE_LENGTH;
  const thin = 1 / EDGE_THICKNESS;
  return [
    `translate(${left}px, ${top}px) scale(${scaleW}, ${thin})`,
    `translate(${left}px, ${top + h - 1}px) scale(${scaleW}, ${thin})`,
    `translate(${left}px, ${top}px) scale(${thin}, ${scaleH})`,
    `translate(${left + w - 1}px, ${top}px) scale(${thin}, ${scaleH})`,
  ];
}

function handleTransforms({ x, y, width, height }: ResizeRect, zoom: number) {
  return RESIZE_CORNERS.map((corner) => {
    const { sx, sy } = cornerSigns(corner);
    const cx = (x + (sx * width) / 2) * zoom - HANDLE_HIT_SIZE / 2;
    const cy = (y + (sy * height) / 2) * zoom - HANDLE_HIT_SIZE / 2;
    return `translate(${cx}px, ${cy}px)`;
  });
}

function boxTransforms(rect: ResizeRect, zoom: number, resizable: boolean) {
  const edges = edgeTransforms(rect, zoom);
  return resizable ? [...edges, ...handleTransforms(rect, zoom)] : edges;
}

function previewSelectionBox(
  node: HTMLElement | null,
  rect: ResizeRect,
  zoom: number,
) {
  if (!node) return;
  const transforms = boxTransforms(rect, zoom, true);
  Array.from(node.children).forEach((child, i) => {
    if (transforms[i]) (child as HTMLElement).style.transform = transforms[i];
  });
}

const SelectionBox = memo(function SelectionBox({
  x,
  y,
  width,
  height,
  zoom,
  resize,
  boxRef,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  resize?: ResizeHandlers;
  boxRef?: React.Ref<HTMLDivElement>;
}) {
  const [top, bottom, left, right, ...handles] = boxTransforms(
    { x, y, width, height },
    zoom,
    !!resize,
  );

  return (
    <div ref={boxRef} className="absolute left-0 top-0">
      {[top, bottom, left, right].map((transform, i) => (
        <div
          key={i}
          className={EDGE_CLASS}
          style={{ ...EDGE_SIZES[i], transform }}
        />
      ))}
      {resize &&
        RESIZE_CORNERS.map((corner, i) => (
          <div
            key={corner}
            className="absolute left-0 top-0 flex items-center justify-center pointer-events-auto touch-none will-change-transform"
            style={{
              width: HANDLE_HIT_SIZE,
              height: HANDLE_HIT_SIZE,
              cursor: cornerCursor(corner),
              transform: handles[i],
            }}
            onPointerDown={(e) => {
              if (e.button !== MOUSE_BUTTON_LEFT) return;
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              resize.onResizeStart(corner, e.clientX, e.clientY);
            }}
            onPointerMove={(e) =>
              resize.onResizeMove(e.clientX, e.clientY, e.shiftKey)
            }
            onPointerUp={resize.onResizeEnd}
            onPointerCancel={resize.onResizeCancel}
          >
            <div className="size-2 rounded-[2px] bg-white outline-1 outline-selection" />
          </div>
        ))}
    </div>
  );
});

function CanvasItemSelection({
  camera,
  elements,
  selectedIds,
  selectedSizes,
  dragNodeRef,
  resizeId,
  resize,
  resizeBoxRef,
}: {
  camera: Camera;
  elements: CanvasElementData[];
  selectedIds: string[];
  selectedSizes: Map<string, { width: number; height: number }>;
  dragNodeRef: React.RefObject<HTMLDivElement | null>;
  resizeId?: string;
  resize: ResizeHandlers;
  resizeBoxRef: React.RefObject<HTMLDivElement | null>;
}) {
  const selected = new Set(selectedIds);
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}
      >
        <div
          ref={dragNodeRef}
          className="absolute left-0 top-0 will-change-transform"
        >
          {elements.map((el) => {
            const size = selectedSizes.get(el.id);
            if (!size || !selected.has(el.id)) return null;
            const resizable = el.id === resizeId;
            return (
              <SelectionBox
                key={el.id}
                x={el.x}
                y={el.y}
                width={size.width}
                height={size.height}
                zoom={camera.zoom}
                resize={resizable ? resize : undefined}
                boxRef={resizable ? resizeBoxRef : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CanvasItemSelection, previewSelectionBox };
export type { ResizeHandlers };
