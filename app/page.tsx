"use client";

import { useState } from "react";
import { ARDude } from "./components/ARDude";
import {
  Canvas,
  type Camera,
  type CanvasElementData,
} from "./components/Canvas";
import { Sidebar } from "./components/Sidebar";
import { Instructions } from "./components/Instructions";
import { Navigation } from "./components/Navigation";
import { SpotlightTour } from "./components/SpotlightTour";

export default function Home() {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [elements, setElements] = useState<CanvasElementData[]>([
    { id: "seed", type: "sticky", x: 0, y: 0, text: "Hello World!" },
  ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const createNote = (clientX: number, clientY: number) => {
    setElements((els) => [
      ...els,
      {
        id: crypto.randomUUID(),
        type: "sticky",
        x: (clientX - window.innerWidth / 2 - camera.x) / camera.zoom,
        y: (clientY - window.innerHeight / 2 - camera.y) / camera.zoom,
        text: "New note",
      },
    ]);
  };

  const createText = (clientX: number, clientY: number) => {
    setElements((els) => [
      ...els,
      {
        id: crypto.randomUUID(),
        type: "text",
        x: (clientX - window.innerWidth / 2 - camera.x) / camera.zoom,
        y: (clientY - window.innerHeight / 2 - camera.y) / camera.zoom,
        text: "Add text",
      },
    ]);
  };

  const moveElements = (ids: string[], dx: number, dy: number) => {
    const moving = new Set(ids);
    setElements((els) =>
      els.map((el) =>
        moving.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el,
      ),
    );
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={camera}
        setCamera={setCamera}
        elements={elements}
        onMoveElements={moveElements}
        selectedIds={selectedIds}
        onSelectElement={setSelectedIds}
      />
      <Sidebar
        zoom={camera.zoom}
        onCreateNote={createNote}
        onCreateText={createText}
      />
      <Navigation />
      <SpotlightTour />
      <Instructions />
      <ARDude />
    </div>
  );
}
