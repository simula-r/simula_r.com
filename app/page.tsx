"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Canvas } from "./components/Canvas";
import { BOARD_TITLE, Navigation } from "./components/Navigation";
import { SessionBar, type SessionPhase } from "./components/SessionBar";
import { ActiveBorder } from "./components/ActiveBorder";
import { FakeCursor } from "./components/FakeCursor";
import { JoinCard } from "./components/JoinCard";
import { HoldRing } from "./components/HoldRing";
import { useHoldToControl } from "./components/useHoldToControl";
import { loadDriveManifest } from "./drive/load";
import { useDrivePlayer } from "./drive/useDrivePlayer";
import type { DriveManifest } from "./drive/types";
import { loadGraph } from "./graph/load";
import type { Camera } from "./elements/types";
import { paneTransform, pointTransform } from "@/lib/camera";

const SHOW_CURSOR = true;
const RESTING_POINTER = { x: 100, y: 200 };
const DRIFT_PX = 40;
const DRIFT_MS = 6000;

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
  const cursorRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const { subscribe, status } = player;

  const phase: SessionPhase = !joined
    ? "lobby"
    : status === "playing"
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

  const restCursor = useEffectEvent(() => {
    const cursor = cursorRef.current;
    if (!cursor || player.isPlaying()) return;
    cursor.style.transform = pointTransform(
      camera,
      player.pointer ?? RESTING_POINTER,
    );
  });

  useEffect(() => {
    if (phase !== "lobby") return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    const origin = performance.now();
    let request = requestAnimationFrame(function loop(now) {
      const angle = ((now - origin) / DRIFT_MS) * 2 * Math.PI;
      cursor.style.transform = pointTransform(camera, {
        x: RESTING_POINTER.x + DRIFT_PX * Math.sin(angle),
        y: RESTING_POINTER.y + (DRIFT_PX / 2) * Math.sin(2 * angle),
      });
      request = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(request);
      restCursor();
    };
  }, [phase, camera]);

  const onSpace = useEffectEvent((e: KeyboardEvent) => {
    if (!joined || isTypingTarget(e.target)) return false;
    if (status !== "playing" && status !== "interrupted") return false;
    e.preventDefault();
    if (e.repeat) return true;
    if (status === "playing") player.interrupt();
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

  const pulseHint = () => {
    const node = hintRef.current;
    if (!node || node.getAnimations().length > 0) return;
    node.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.08)", color: "var(--foreground)" },
        { transform: "scale(1)" },
      ],
      { duration: 600, easing: "ease-in-out" },
    );
  };

  const hold = useHoldToControl(canvasRef, {
    enabled: status === "playing",
    onHold: player.interrupt,
    onNudge: pulseHint,
  });

  const updateCamera = (update: (c: Camera) => Camera) => {
    if (!player.isPlaying()) setCamera(update);
  };

  const join = (value: string) => {
    player.play();
    setName(value);
    setJoined(true);
  };

  const lookAround = (value: string) => {
    setName(value);
    setJoined(true);
  };

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
        camera={camera}
        setCamera={updateCamera}
        paneRef={paneRef}
        elements={graph.elements}
      />
      {SHOW_CURSOR && (
        <FakeCursor
          ref={cursorRef}
          camera={camera}
          x={pointer.x}
          y={pointer.y}
          name="a_r"
          chat={chat}
          onClick={
            phase === "control" && status === "interrupted"
              ? player.play
              : undefined
          }
        />
      )}
      <Navigation />
      <SessionBar
        phase={phase}
        started={status !== "idle"}
        name={visitor}
        onPlay={player.play}
        onReplay={player.replay}
      />
      <ActiveBorder player={player} hintRef={hintRef} />
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
          onJoin={join}
          onLookAround={lookAround}
        />
      )}
    </div>
  );
}
