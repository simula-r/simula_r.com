type ResizeCorner = "nw" | "ne" | "sw" | "se";

type ResizeRect = { x: number; y: number; width: number; height: number };

const RESIZE_CORNERS: ResizeCorner[] = ["nw", "ne", "sw", "se"];

const MIN_RESIZE_SIZE = 16;

function cornerSigns(corner: ResizeCorner) {
  return {
    sx: corner === "ne" || corner === "se" ? 1 : -1,
    sy: corner === "sw" || corner === "se" ? 1 : -1,
  };
}

function cornerCursor(corner: ResizeCorner) {
  return corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize";
}

function resizeRect(
  start: ResizeRect,
  corner: ResizeCorner,
  dx: number,
  dy: number,
  free: boolean,
): ResizeRect {
  const { sx, sy } = cornerSigns(corner);
  const minScaleX = MIN_RESIZE_SIZE / start.width;
  const minScaleY = MIN_RESIZE_SIZE / start.height;
  let scaleX = (start.width + sx * dx) / start.width;
  let scaleY = (start.height + sy * dy) / start.height;
  if (free) {
    scaleX = Math.max(minScaleX, scaleX);
    scaleY = Math.max(minScaleY, scaleY);
  } else {
    const scale = Math.max(minScaleX, minScaleY, scaleX, scaleY);
    scaleX = scale;
    scaleY = scale;
  }
  const width = Math.round(start.width * scaleX);
  const height = Math.round(start.height * scaleY);
  return {
    x: start.x + (sx * (width - start.width)) / 2,
    y: start.y + (sy * (height - start.height)) / 2,
    width,
    height,
  };
}

export { RESIZE_CORNERS, cornerSigns, cornerCursor, resizeRect };
export type { ResizeCorner, ResizeRect };
