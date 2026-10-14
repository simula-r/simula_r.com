"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "./components/Canvas";
import { Instructions } from "./components/Instructions";
import { Navigation } from "./components/Navigation";
import { SpotlightTour } from "./components/SpotlightTour";
import { ActiveBorder } from "./components/ActiveBorder";
import { FakeCursor } from "./components/FakeCursor";
import { loadDriveManifest } from "./drive/load";
import { useDrivePlayer } from "./drive/useDrivePlayer";
import type { DriveManifest } from "./drive/types";
import { loadGraph } from "./graph/load";
import type { Camera } from "./elements/types";
import { paneTransform, pointTransform } from "@/lib/camera";

const SHOW_CURSOR = true;
const RESTING_POINTER = { x: 100, y: 200 };

const graph = loadGraph();

export default function Home() {
  const [camera, setCamera] = useState<Camera>(graph.camera);
  const [manifest, setManifest] = useState<DriveManifest | null>(null);
  const player = useDrivePlayer({ manifest, camera, setCamera });
  const paneRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const { subscribe } = player;

  useEffect(() => {
    loadDriveManifest().then(setManifest);
  }, []);

  useEffect(
    () =>
      subscribe((frame) => {
        const pane = paneRef.current;
        if (pane) pane.style.transform = paneTransform(frame.camera);
        const cursor = cursorRef.current;
        if (cursor) {
          cursor.style.transform = pointTransform(
            frame.camera,
            frame.pointer ?? RESTING_POINTER,
          );
        }
      }),
    [subscribe],
  );

  const updateCamera = (update: (c: Camera) => Camera) => {
    if (!player.isPlaying()) setCamera(update);
  };

  const following = player.status !== "idle";
  const pointer = player.pointer ?? RESTING_POINTER;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        mode="view"
        camera={camera}
        setCamera={updateCamera}
        paneRef={paneRef}
        elements={graph.elements}
        onInteract={player.interrupt}
      />
      {SHOW_CURSOR && (
        <FakeCursor
          ref={cursorRef}
          camera={camera}
          x={pointer.x}
          y={pointer.y}
          name="a_r"
        />
      )}
      <Navigation />
      <SpotlightTour
        active={following}
        chapters={player.chapters}
        onToggle={player.toggle}
        onSelectChapter={player.playChapter}
      />
      <Instructions />
      <ActiveBorder player={player} />
    </div>
  );
}
