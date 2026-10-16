"use client";

import { useEffect, useRef } from "react";
import type { Camera } from "@/app/elements/types";
import { pointTransform, windowSize, type Point } from "@/lib/camera";
import { FakeCursor } from "./FakeCursor";

type Waypoint = { at: number; x: number; y: number; bend?: number };

const SCREEN: Camera = { x: 0, y: 0, zoom: 1 };
const LOOP_S = 10;
const JITTER_PX = 1.5;

const PATH: Waypoint[] = [
  { at: 0, x: -0.55, y: -0.45 },
  { at: 0.8, x: -0.55, y: -0.45 },
  { at: 1.6, x: -0.18, y: -0.72, bend: 0.12 },
  { at: 2.3, x: -0.16, y: -0.7 },
  { at: 3.1, x: 0.58, y: -0.38, bend: -0.1 },
  { at: 3.6, x: 0.6, y: -0.36 },
  { at: 4.3, x: 0.68, y: 0.34, bend: 0.08 },
  { at: 5.0, x: 0.7, y: 0.36 },
  { at: 5.7, x: 1.3, y: 0.62, bend: -0.06 },
  { at: 7.1, x: 1.3, y: 0.62 },
  { at: 7.1, x: -1.3, y: 0.78 },
  { at: 8.0, x: -0.62, y: 0.52, bend: 0.1 },
  { at: 8.6, x: -0.6, y: 0.5 },
  { at: 9.4, x: -0.55, y: -0.45, bend: -0.14 },
  { at: LOOP_S, x: -0.55, y: -0.45 },
];

function minimumJerk(u: number) {
  return u * u * u * (10 - 15 * u + 6 * u * u);
}

function jitter(t: number) {
  return {
    x: JITTER_PX * (Math.sin(t * 2.3) + 0.5 * Math.sin(t * 5.7 + 1)),
    y: JITTER_PX * (Math.sin(t * 1.9 + 2) + 0.5 * Math.sin(t * 6.1)),
  };
}

function sample(seconds: number): Point {
  const t = seconds % LOOP_S;
  const { width, height } = windowSize();
  const toScreen = (p: Waypoint) => ({
    x: (p.x * width) / 2,
    y: (p.y * height) / 2,
  });
  const index = PATH.findIndex((p, i) => i > 0 && p.at > t);
  const to = PATH[index === -1 ? PATH.length - 1 : index];
  const from = PATH[index === -1 ? PATH.length - 2 : index - 1];
  const a = toScreen(from);
  const b = toScreen(to);
  const wobble = jitter(seconds);
  if (to.at === from.at) {
    return { x: b.x + wobble.x, y: b.y + wobble.y };
  }
  const k = minimumJerk((t - from.at) / (to.at - from.at));
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const arc = (to.bend ?? 0) * Math.sin(Math.PI * k);
  return {
    x: a.x + dx * k - dy * arc + wobble.x,
    y: a.y + dy * k + dx * arc + wobble.y,
  };
}

function LobbyCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const place = (seconds: number) => {
      node.style.transform = pointTransform(SCREEN, sample(seconds));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(0);
      return;
    }
    const origin = performance.now();
    let request = requestAnimationFrame(function loop(now) {
      place((now - origin) / 1000);
      request = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(request);
  }, []);

  return <FakeCursor ref={ref} camera={SCREEN} x={0} y={0} name="a_r" />;
}

export { LobbyCursor };
