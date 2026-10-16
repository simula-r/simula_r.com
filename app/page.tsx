"use client";

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Canvas } from "./components/Canvas";
import { BOARD_TITLE, Navigation } from "./components/Navigation";
import { SessionBar, type SessionPhase } from "./components/SessionBar";
import { SessionFrame } from "./components/SessionFrame";
import { FakeCursor } from "./components/FakeCursor";
import { JoinCard } from "./components/JoinCard";
import { HoldRing } from "./components/HoldRing";
import { DeviceGate } from "./components/DeviceGate";
import { useHoldToControl } from "./components/useHoldToControl";
import { loadDriveManifest } from "./drive/load";
import { useDrivePlayer } from "./drive/useDrivePlayer";
import type { DriveManifest } from "./drive/types";
import { loadGraph } from "./graph/load";
import type { Camera } from "./elements/types";
import {
  fitCamera,
  paneTransform,
  projectPoint,
  screenTransform,
  type Point,
  windowSize,
} from "@/lib/camera";
import { easeInOut, prefersReducedMotion } from "@/lib/motion";

const SHOW_CURSOR = true;
const RESTING_POINTER = { x: 100, y: 200 };
const GLIDE_MS = 600;
const CHAT_AFTER_RELEASE_MS = 450;
const CHAT_AFTER_END_MS = 850;

type Glide = { from: Point; t0: number };

function glidePoint(glide: Glide | null, target: Point, now: number) {
  if (!glide) return target;
  const k = Math.min(1, (now - glide.t0) / GLIDE_MS);
  const e = easeInOut(k);
  return {
    x: glide.from.x + (target.x - glide.from.x) * e,
    y: glide.from.y + (target.y - glide.from.y) * e,
  };
}

const graph = loadGraph();
const initialCamera = graph.start?.camera ?? graph.camera;

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
  const [camera, setCamera] = useState<Camera>(initialCamera);
  const [manifest, setManifest] = useState<DriveManifest | null>(null);
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const player = useDrivePlayer({ manifest, camera, setCamera });
  const canvasRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const glide = useRef<Glide | null>(null);
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
    const start = graph.start;
    if (joined || !start) return;
    const fit = () =>
      setCamera(fitCamera(start.camera, start.viewport, windowSize()));
    const request = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(request);
      window.removeEventListener("resize", fit);
    };
  }, [joined]);

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
          const now = performance.now();
          const target = projectPoint(
            frame.camera,
            frame.pointer ?? RESTING_POINTER,
          );
          cursor.style.transform = screenTransform(
            glidePoint(glide.current, target, now),
          );
          if (glide.current && now - glide.current.t0 >= GLIDE_MS) {
            glide.current = null;
          }
        }
      }),
    [subscribe],
  );

  useLayoutEffect(() => {
    const cursor = cursorRef.current;
    if (joined && cursor && glide.current) {
      cursor.style.transform = screenTransform(glide.current.from);
    }
  }, [joined]);

  const onSpace = useEffectEvent((e: KeyboardEvent) => {
    if (!joined || isTypingTarget(e.target)) return false;
    if (status === "idle" || status === "ended") return false;
    e.preventDefault();
    if (e.repeat) return true;
    if (status === "playing") player.pause();
    else player.play();
    return true;
  });

  const onEscape = useEffectEvent((e: KeyboardEvent) => {
    if (status !== "playing" && status !== "paused") return;
    if (e.target instanceof Element && e.target.closest('[role="menu"]')) {
      return;
    }
    player.interrupt();
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let handled = false;
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") onEscape(e);
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
    if (phase !== "following") setCamera(update);
  };

  const join = () => {
    const preview = previewRef.current?.getBoundingClientRect();
    if (preview && preview.width > 0 && !prefersReducedMotion()) {
      const { width, height } = windowSize();
      glide.current = {
        from: {
          x: preview.left + preview.width / 2 - width / 2,
          y: preview.top + preview.height / 2 - height / 2,
        },
        t0: performance.now(),
      };
    }
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
        pannable={phase !== "lobby"}
        camera={camera}
        setCamera={updateCamera}
        paneRef={paneRef}
        elements={graph.elements}
      />
      {SHOW_CURSOR && phase !== "lobby" && (
        <FakeCursor
          ref={cursorRef}
          camera={camera}
          x={pointer.x}
          y={pointer.y}
          name="a_r"
          chat={chat}
          chatDelay={
            phase === "ended" ? CHAT_AFTER_END_MS : CHAT_AFTER_RELEASE_MS
          }
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
      {phase !== "lobby" && <SessionFrame phase={phase} player={player} />}
      {hold && (
        <HoldRing
          key={hold.id}
          pointerId={hold.pointerId}
          duration={hold.duration}
          done={hold.done}
          hint={hold.hint}
          x={hold.x}
          y={hold.y}
        />
      )}
      <JoinCard
        open={phase === "lobby"}
        title={BOARD_TITLE}
        previewRef={previewRef}
        ready={player.chapters.length > 0}
        name={name}
        onNameChange={setName}
        onJoin={join}
        onLookAround={lookAround}
      />
      <DeviceGate />
    </div>
  );
}
