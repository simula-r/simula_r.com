import type { Camera } from "@/app/elements/types";

type Point = { x: number; y: number };
type Size = { width: number; height: number };

function windowSize(): Size {
  return { width: window.innerWidth, height: window.innerHeight };
}

function screenToWorld(camera: Camera, point: Point, viewport: Size): Point {
  return {
    x: (point.x - viewport.width / 2 - camera.x) / camera.zoom,
    y: (point.y - viewport.height / 2 - camera.y) / camera.zoom,
  };
}

function viewportCenterWorld(camera: Camera): Point {
  return { x: -camera.x / camera.zoom, y: -camera.y / camera.zoom };
}

function fitCamera(camera: Camera, recorded: Size, viewport: Size): Camera {
  const scale = Math.min(
    viewport.width / recorded.width,
    viewport.height / recorded.height,
  );
  return { x: camera.x * scale, y: camera.y * scale, zoom: camera.zoom * scale };
}

function mixCamera(a: Camera, b: Camera, k: number): Camera {
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * k),
  };
}

function paneTransform(camera: Camera) {
  return `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
}

function pointTransform(camera: Camera, point: Point) {
  return `translate(${point.x * camera.zoom + camera.x}px, ${point.y * camera.zoom + camera.y}px)`;
}

export {
  screenToWorld,
  viewportCenterWorld,
  windowSize,
  fitCamera,
  mixCamera,
  paneTransform,
  pointTransform,
};
export type { Point, Size };
