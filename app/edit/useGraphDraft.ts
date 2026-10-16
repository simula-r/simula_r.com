import { useState } from "react";
import type { Camera, CanvasElementData } from "@/app/elements/types";
import { GRAPH_VERSION, type Graph } from "@/app/graph/types";

function useGraphDraft(initial: Graph) {
  const [camera, setCamera] = useState<Camera>(initial.camera);
  const [elements, setElements] = useState<CanvasElementData[]>(
    initial.elements,
  );

  const addElement = (element: CanvasElementData) =>
    setElements((els) => [...els, element]);

  const moveElements = (ids: string[], dx: number, dy: number) => {
    const moving = new Set(ids);
    setElements((els) =>
      els.map((el) =>
        moving.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el,
      ),
    );
  };

  const updateElement = (id: string, patch: Partial<CanvasElementData>) =>
    setElements((els) =>
      els.map((el) =>
        el.id === id ? ({ ...el, ...patch } as CanvasElementData) : el,
      ),
    );

  const removeElements = (ids: string[]) => {
    const removing = new Set(ids);
    setElements((els) => els.filter((el) => !removing.has(el.id)));
  };

  const graph: Graph = {
    version: GRAPH_VERSION,
    camera,
    start: initial.start,
    elements,
  };

  return {
    camera,
    setCamera,
    elements,
    addElement,
    moveElements,
    updateElement,
    removeElements,
    graph,
  };
}

export { useGraphDraft };
