"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Canvas } from "./components/Canvas";
import { BOARD_TITLE, Navigation } from "./components/Navigation";
import { SessionBar, type SessionPhase } from "./components/SessionBar";
import { ActiveBorder } from "./components/ActiveBorder";
import { FakeCursor } from "./components/FakeCursor";
import { LobbyCursor } from "./components/LobbyCursor";
import { JoinCard } from "./components/JoinCard";
import { HoldRing } from "./components/HoldRing";
import { HelpButton } from "./components/HelpButton";
import { SourceLink } from "./components/SourceLink";
import { useHoldToControl } from "./components/useHoldToControl";
import { loadDriveManifest } from "./drive/load";
import { useDrivePlayer } from "./drive/useDrivePlayer";
import type { DriveManifest } from "./drive/types";
import { loadGraph } from "./graph/load";
import type { Camera } from "./elements/types";
import { gridStyle, paneTransform, pointTransform } from "@/lib/camera";

const SHOW_CURSOR = true;
const RESTING_POINTER = { x: 100, y: 200 };

const graph = loadGraph();

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export default function Home() {
  const [camera, setCamera] = useState<Camera>(graph.camera);
  const [manifest, setManifest] = useState<DriveManifest | null>(null);
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const player = useDrivePlayer({ manifest, camera, setCamera });
  const canvasRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const { subscribe, status } = player;

  const phase: SessionPhase = !joined
    ? "lobby"
    : status === "playing" || status === "paused"
      ? "following"
      : status === "ended"
        ? "ended"
        : "control";
  const visitor = name.trim() || "Guest";

  useEffect(() => {
    loadDriveManifest().then(setManifest);
  }, []);

  useEffect(
    () =>
      subscribe((frame) => {
        const pane = paneRef.current;
        if (pane) pane.style.transform = paneTransform(frame.camera);
        const grid = gridRef.current;
        if (grid) Object.assign(grid.style, gridStyle(frame.camera));
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

  const onSpace = useEffectEvent((e: KeyboardEvent) => {
    if (!joined || isTypingTarget(e.target)) return false;
    if (status === "idle" || status === "ended") return false;
    e.preventDefault();
    if (e.repeat) return true;
    if (status === "playing") player.pause();
    else player.play();
    return true;
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let handled = false;
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.code !== "Space") return;
        handled = onSpace(e);
      },
      { signal },
    );
    window.addEventListener(
      "keyup",
      (e) => {
        if (e.code !== "Space" || !handled) return;
        handled = false;
        e.preventDefault();
      },
      { signal },
    );
    return () => controller.abort();
  }, []);

  const hold = useHoldToControl(canvasRef, {
    enabled: status === "playing" || status === "paused",
    onHold: player.interrupt,
  });

  const updateCamera = (update: (c: Camera) => Camera) => {
    if (!player.isPlaying()) setCamera(update);
  };

  const join = () => {
    player.play();
    setJoined(true);
  };

  const lookAround = () => setJoined(true);

  const pointer = player.pointer ?? RESTING_POINTER;
  const chat =
    phase === "control" && status === "interrupted"
      ? "You can click me to resume"
      : phase === "ended"
        ? `Thanks, ${visitor}. Say hi.`
        : undefined;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        ref={canvasRef}
        mode="view"
        pannable={phase === "control" || phase === "ended"}
        camera={camera}
        setCamera={updateCamera}
        paneRef={paneRef}
        gridRef={gridRef}
        elements={graph.elements}
      />
      {SHOW_CURSOR && phase === "lobby" && <LobbyCursor />}
      {SHOW_CURSOR && phase !== "lobby" && (
        <FakeCursor
          ref={cursorRef}
          camera={camera}
          x={pointer.x}
          y={pointer.y}
          name="a_r"
          chat={chat}
          onClick={
            phase === "control" &&
            (status === "interrupted" || status === "idle")
              ? player.play
              : undefined
          }
        />
      )}
      <Navigation />
      <SessionBar
        phase={phase}
        player={player}
        name={name.trim()}
        onStart={join}
      />
      <SourceLink />
      <HelpButton />
      <ActiveBorder player={player} />
      {hold && (
        <HoldRing
          key={hold.id}
          pointerId={hold.pointerId}
          x={hold.x}
          y={hold.y}
        />
      )}
      {phase === "lobby" && (
        <JoinCard
          title={BOARD_TITLE}
          duration={player.total}
          ready={player.chapters.length > 0}
          name={name}
          onNameChange={setName}
          onJoin={join}
          onLookAround={lookAround}
        />
      )}
    </div>
  );
}
