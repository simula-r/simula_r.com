"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { paneTransform } from "@/lib/camera";
import { CanvasItem, type CanvasItemInteraction } from "./CanvasItem";
import { definitionFor } from "@/app/elements/registry";
import type { Camera, CanvasElementData } from "@/app/elements/types";
import { CanvasSelection, type CanvasSelectionHandle } from "./CanvasSelection";
import { CanvasItemSelection } from "./CanvasItemSelection";

type CanvasMode = "edit" | "view";

const MOUSE_BUTTON_LEFT = 0;
const MOUSE_BUTTON_MIDDLE = 1;

function panButtonForMode(mode: CanvasMode) {
  return mode === "view" ? MOUSE_BUTTON_LEFT : MOUSE_BUTTON_MIDDLE;
}

function Canvas({
  camera,
  setCamera,
  elements,
  onMoveElements,
  onUpdateElement,
  selectedIds = [],
  onSelectElement,
  paneRef,
  ref,
  mode = "edit",
  pannable = true,
}: {
  camera: Camera;
  setCamera: (update: (c: Camera) => Camera) => void;
  elements: CanvasElementData[];
  onMoveElements?: (ids: string[], dx: number, dy: number) => void;
  onUpdateElement?: (id: string, patch: Partial<CanvasElementData>) => void;
  selectedIds?: string[];
  onSelectElement?: (ids: string[]) => void;
  paneRef?: Ref<HTMLDivElement>;
  ref?: Ref<HTMLDivElement>;
  mode?: CanvasMode;
  pannable?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRect = useRef<DOMRect | null>(null);

  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const updateRect = () => {
      containerRect.current = node.getBoundingClientRect();
    };
    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(node);
    window.addEventListener("resize", updateRect);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  const zoomAt = useEffectEvent((e: WheelEvent) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = containerRect.current ?? node.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    setCamera((c) => {
      const zoom = Math.min(4, Math.max(0.1, c.zoom - e.deltaY * 0.001));
      const scale = zoom / c.zoom;
      return {
        zoom,
        x: px - (px - c.x) * scale,
        y: py - (py - c.y) * scale,
      };
    });
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const controller = new AbortController();
    node.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        zoomAt(e);
      },
      { passive: false, signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  const pan = useRef<{ x: number; y: number } | null>(null);
  const panButton = panButtonForMode(mode);
  const [isPanning, setIsPanning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState(
    new Map<string, { width: number; height: number }>(),
  );

  const itemNodes = useRef(new Map<string, HTMLDivElement>());
  const selectionDragNode = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<CanvasSelectionHandle>(null);
  const selectedSet = new Set(selectedIds);

  const itemDrag = useRef<{
    id: string;
    ids: string[];
    nodes: HTMLDivElement[];
    startX: number;
    startY: number;
  } | null>(null);
  const itemDragDelta = useRef({ dx: 0, dy: 0 });
  const itemDragFrame = useRef<number | null>(null);

  const selectedKey = mode === "edit" ? selectedIds.join(",") : "";

  const toolbarElement =
    mode === "edit" && selectedIds.length === 1
      ? elements.find((el) => el.id === selectedIds[0])
      : undefined;
  const ElementToolbar = toolbarElement
    ? definitionFor(toolbarElement).Toolbar
    : undefined;
  const toolbarId = toolbarElement?.id;
  const getToolbarAnchor = useCallback(
    () => (toolbarId ? (itemNodes.current.get(toolbarId) ?? null) : null),
    [toolbarId],
  );

  useLayoutEffect(() => {
    if (!selectedKey) return;
    const ids = new Map<Element, string>();
    for (const id of selectedKey.split(",")) {
      const node = itemNodes.current.get(id);
      if (node) ids.set(node, id);
    }
    const sizes = new Map<string, { width: number; height: number }>();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const id = ids.get(entry.target);
        const box = entry.borderBoxSize[0];
        if (!id || !box) continue;
        sizes.set(id, { width: box.inlineSize, height: box.blockSize });
      }
      flushSync(() => setSelectedSizes(new Map(sizes)));
    });
    for (const node of ids.keys()) observer.observe(node);
    return () => observer.disconnect();
  }, [selectedKey]);

  const selectElements = (ids: string[]) => {
    onSelectElement?.(ids);
  };

  const applyDragTransform = (dx: number, dy: number) => {
    const drag = itemDrag.current;
    if (!drag) return;
    const transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    for (const node of drag.nodes) node.style.transform = transform;
    const selectionNode = selectionDragNode.current;
    if (selectionNode) {
      selectionNode.style.transform = `translate(${dx * camera.zoom}px, ${dy * camera.zoom}px)`;
    }
  };

  const flushItemDrag = () => {
    itemDragFrame.current = null;
    applyDragTransform(itemDragDelta.current.dx, itemDragDelta.current.dy);
  };

  const startItemDrag = (id: string, clientX: number, clientY: number) => {
    if (id !== editingId) setEditingId(null);
    const alreadySelected = selectedSet.has(id);
    if (!alreadySelected) selectElements([id]);
    const ids = alreadySelected ? selectedIds : [id];
    const nodes = ids.flatMap((i) => itemNodes.current.get(i) ?? []);
    for (const node of nodes) node.dataset.dragging = "";
    itemDrag.current = { id, ids, nodes, startX: clientX, startY: clientY };
    itemDragDelta.current = { dx: 0, dy: 0 };
  };

  const moveItemDrag = (clientX: number, clientY: number) => {
    const drag = itemDrag.current;
    if (!drag) return;
    itemDragDelta.current = {
      dx: (clientX - drag.startX) / camera.zoom,
      dy: (clientY - drag.startY) / camera.zoom,
    };
    if (itemDragFrame.current == null) {
      itemDragFrame.current = requestAnimationFrame(flushItemDrag);
    }
  };

  const resetDragTransforms = (nodes: HTMLDivElement[]) => {
    for (const node of nodes) {
      node.style.transform = "translate(-50%, -50%)";
      delete node.dataset.dragging;
    }
    const selectionNode = selectionDragNode.current;
    if (selectionNode) selectionNode.style.transform = "";
  };

  const endItemDrag = () => {
    const drag = itemDrag.current;
    if (!drag) return;
    const { dx, dy } = itemDragDelta.current;
    if (itemDragFrame.current != null) {
      cancelAnimationFrame(itemDragFrame.current);
      itemDragFrame.current = null;
    }
    resetDragTransforms(drag.nodes);
    itemDrag.current = null;
    if (dx !== 0 || dy !== 0) onMoveElements?.(drag.ids, dx, dy);
    else if (drag.ids.length > 1) selectElements([drag.id]);
  };

  const cancelItemDrag = () => {
    const drag = itemDrag.current;
    if (itemDragFrame.current != null) {
      cancelAnimationFrame(itemDragFrame.current);
      itemDragFrame.current = null;
    }
    if (drag) resetDragTransforms(drag.nodes);
    itemDrag.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-0 w-full h-full overflow-hidden",
        isPanning
          ? "cursor-grabbing"
          : mode === "view" && pannable
            ? "cursor-grab"
            : "cursor-default",
      )}
      onPointerDown={(e) => {
        if (e.button === MOUSE_BUTTON_LEFT && mode === "edit") {
          e.preventDefault();
          setEditingId(null);
          e.currentTarget.setPointerCapture(e.pointerId);
          marqueeRef.current?.start(e.clientX, e.clientY);
          return;
        }
        if (e.button !== panButton) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        pan.current = { x: e.clientX, y: e.clientY };
        setIsPanning(true);
      }}
      onPointerMove={(e) => {
        marqueeRef.current?.move(e.clientX, e.clientY);
        const last = pan.current;
        if (!last) return;
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        pan.current = { x: e.clientX, y: e.clientY };
        setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
      }}
      onPointerUp={() => {
        marqueeRef.current?.end();
        pan.current = null;
        setIsPanning(false);
      }}
      onPointerCancel={() => {
        marqueeRef.current?.cancel();
        pan.current = null;
        setIsPanning(false);
      }}
    >
      <div
        ref={paneRef}
        id="transform-pane"
        className="absolute left-1/2 top-1/2 origin-top-left"
        style={{ transform: paneTransform(camera) }}
      >
        {elements.map((el) => {
          const definition = definitionFor(el);
          const editing = mode === "edit" && editingId === el.id;
          const interaction: CanvasItemInteraction =
            mode === "view" ? "inert" : editing ? "editing" : "drag";
          return (
            <CanvasItem
              key={el.id}
              x={el.x}
              y={el.y}
              selected={selectedSet.has(el.id)}
              interaction={interaction}
              elRef={(node) => {
                if (node) itemNodes.current.set(el.id, node);
                else itemNodes.current.delete(el.id);
              }}
              onDragStart={(clientX, clientY) =>
                startItemDrag(el.id, clientX, clientY)
              }
              onDragMove={moveItemDrag}
              onDragEnd={endItemDrag}
              onDragCancel={cancelItemDrag}
              onEdit={
                definition.editable ? () => setEditingId(el.id) : undefined
              }
            >
              {editing ? (
                <definition.Editor
                  element={el}
                  onChange={(patch) => onUpdateElement?.(el.id, patch)}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <definition.Render element={el} />
              )}
            </CanvasItem>
          );
        })}
      </div>
      {mode === "edit" && (
        <>
          {toolbarElement && ElementToolbar && (
            <ElementToolbar
              key={toolbarElement.id}
              element={toolbarElement}
              getAnchor={getToolbarAnchor}
              onChange={(patch) => onUpdateElement?.(toolbarElement.id, patch)}
            />
          )}
          <CanvasItemSelection
            camera={camera}
            elements={elements}
            selectedIds={selectedIds}
            selectedSizes={selectedSizes}
            dragNodeRef={selectionDragNode}
          />
          <CanvasSelection
            ref={marqueeRef}
            itemNodes={itemNodes}
            containerRect={containerRect}
            onSelect={selectElements}
          />
        </>
      )}
    </div>
  );
}

export { Canvas };
