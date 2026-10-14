import type { Camera } from "@/app/elements/types";
import type { CameraKeyframe, PointerKeyframe } from "./types";

function bracket<T extends { t: number }>(frames: T[], t: number) {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  const a = frames[lo];
  const b = frames[Math.min(lo + 1, frames.length - 1)];
  const span = b.t - a.t;
  const k = span > 0 ? Math.min(1, Math.max(0, (t - a.t) / span)) : 0;
  return { a, b, k };
}

function sampleCamera(frames: CameraKeyframe[], t: number): Camera | null {
  if (frames.length === 0) return null;
  const { a, b, k } = bracket(frames, t);
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * k),
  };
}

function samplePointer(frames: PointerKeyframe[], t: number) {
  if (frames.length === 0) return null;
  const { a, b, k } = bracket(frames, t);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

export { sampleCamera, samplePointer };
