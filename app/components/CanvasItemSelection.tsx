"use client";

import { memo } from "react";
import type { Camera, CanvasElementData } from "@/app/elements/types";

const EDGE_LENGTH = 4096;
const EDGE_THICKNESS = 4;

const EDGE_CLASS =
  "absolute left-0 top-0 origin-top-left bg-[#3b82f6] will-change-transform";

const HORIZONTAL_EDGE = { width: EDGE_LENGTH, height: EDGE_THICKNESS };
const VERTICAL_EDGE = { width: EDGE_THICKNESS, height: EDGE_LENGTH };

const SelectionBox = memo(function SelectionBox({
  x,
  y,
  width,
  height,
  zoom,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}) {
  const left = (x - width / 2) * zoom - 0.5;
  const top = (y - height / 2) * zoom - 0.5;
  const w = width * zoom + 1;
  const h = height * zoom + 1;
  const scaleW = w / EDGE_LENGTH;
  const scaleH = h / EDGE_LENGTH;
  const thin = 1 / EDGE_THICKNESS;

  return (
    <div className="absolute left-0 top-0">
      <div
        className={EDGE_CLASS}
        style={{
          ...HORIZONTAL_EDGE,
          transform: `translate(${left}px, ${top}px) scale(${scaleW}, ${thin})`,
        }}
      />
      <div
        className={EDGE_CLASS}
        style={{
          ...HORIZONTAL_EDGE,
          transform: `translate(${left}px, ${top + h - 1}px) scale(${scaleW}, ${thin})`,
        }}
      />
      <div
        className={EDGE_CLASS}
        style={{
          ...VERTICAL_EDGE,
          transform: `translate(${left}px, ${top}px) scale(${thin}, ${scaleH})`,
        }}
      />
      <div
        className={EDGE_CLASS}
        style={{
          ...VERTICAL_EDGE,
          transform: `translate(${left + w - 1}px, ${top}px) scale(${thin}, ${scaleH})`,
        }}
      />
    </div>
  );
});

function CanvasItemSelection({
  camera,
  elements,
  selectedIds,
  selectedSizes,
  dragNodeRef,
}: {
  camera: Camera;
  elements: CanvasElementData[];
  selectedIds: string[];
  selectedSizes: Map<string, { width: number; height: number }>;
  dragNodeRef: React.RefObject<HTMLDivElement | null>;
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
            return (
              <SelectionBox
                key={el.id}
                x={el.x}
                y={el.y}
                width={size.width}
                height={size.height}
                zoom={camera.zoom}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CanvasItemSelection };
