import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ASSET_DIR = "canvas/excalidraw";
const GRAPH_PATH = path.join(ROOT, "data", "graph.json");
const STICKY_OFFSET = { x: 4.3, y: 4.3 };
const EXCALIDRAW_STROKE = "#1e1e1e";
const SHAPE_STROKE = "#9c958e";
const SHAPE_PADDING = 24;
const ARROWHEAD_LENGTH = 20;
const ARROWHEAD_ANGLE = Math.PI / 7;
const VIEWPORT = { width: 1600, height: 900 };

const FONT_FAMILIES = {
  1: "handwritten",
  2: "sans",
  3: "mono",
  5: "handwritten",
  6: "sans",
  7: "handwritten",
  8: "mono",
};

const EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const center = (el) => ({ x: el.x + el.width / 2, y: el.y + el.height / 2 });

function pxToPt(px) {
  return Math.round(px * 0.75);
}

function stickyFrom(el, label) {
  const c = center(el);
  return {
    id: el.id,
    type: "sticky",
    x: round(c.x + STICKY_OFFSET.x),
    y: round(c.y + STICKY_OFFSET.y),
    text: label ? label.originalText ?? label.text : "",
  };
}

function textFrom(el) {
  const c = center(el);
  const element = {
    id: el.id,
    type: "text",
    x: round(c.x),
    y: round(c.y),
    text: el.text,
    font: FONT_FAMILIES[el.fontFamily] ?? "handwritten",
    fontSize: pxToPt(el.fontSize),
  };
  return element;
}

async function imageFrom(el, files) {
  const file = files[el.fileId];
  if (!file) return null;
  const extension = EXTENSIONS[file.mimeType];
  if (!extension) return null;
  const name = `${el.fileId}.${extension}`;
  const base64 = file.dataURL.slice(file.dataURL.indexOf(",") + 1);
  await writeFile(
    path.join(ROOT, "public", ASSET_DIR, name),
    Buffer.from(base64, "base64"),
  );
  const c = center(el);
  return {
    id: el.id,
    type: "image",
    x: round(c.x),
    y: round(c.y),
    src: `/${ASSET_DIR}/${name}`,
    width: round(el.width),
    height: round(el.height),
  };
}

function dashArray(el) {
  if (el.strokeStyle === "dashed") return `${el.strokeWidth * 4} ${el.strokeWidth * 4}`;
  if (el.strokeStyle === "dotted") return `${el.strokeWidth} ${el.strokeWidth * 3}`;
  return null;
}

function strokeAttrs(el) {
  const attrs = [
    `stroke="${el.strokeColor === EXCALIDRAW_STROKE ? SHAPE_STROKE : el.strokeColor}"`,
    `stroke-width="${el.strokeWidth}"`,
    `stroke-linecap="round"`,
    `stroke-linejoin="round"`,
    `fill="${el.backgroundColor === "transparent" ? "none" : el.backgroundColor}"`,
  ];
  const dash = dashArray(el);
  if (dash) attrs.push(`stroke-dasharray="${dash}"`);
  if (el.opacity !== 100) attrs.push(`opacity="${el.opacity / 100}"`);
  return attrs.join(" ");
}

function smoothPath(points) {
  if (points.length < 3) {
    return points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)} ${round(y)}`).join(" ");
  }
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

function arrowhead(tip, from) {
  const angle = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const wing = (side) => [
    tip[0] - ARROWHEAD_LENGTH * Math.cos(angle + side * ARROWHEAD_ANGLE),
    tip[1] - ARROWHEAD_LENGTH * Math.sin(angle + side * ARROWHEAD_ANGLE),
  ];
  const [a, b] = [wing(1), wing(-1)];
  return `M${round(a[0])} ${round(a[1])} L${round(tip[0])} ${round(tip[1])} L${round(b[0])} ${round(b[1])}`;
}

function linearShape(el) {
  const points = el.points;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs) - SHAPE_PADDING;
  const minY = Math.min(...ys) - SHAPE_PADDING;
  const width = Math.max(...xs) + SHAPE_PADDING - minX;
  const height = Math.max(...ys) + SHAPE_PADDING - minY;
  const local = points.map(([x, y]) => [x - minX, y - minY]);
  const curved = el.roundness && !el.elbowed;
  const paths = [curved ? smoothPath(local) : polylinePath(local)];
  if (el.endArrowhead && local.length > 1) {
    paths.push(arrowhead(local[local.length - 1], local[local.length - 2]));
  }
  if (el.startArrowhead && local.length > 1) {
    paths.push(arrowhead(local[0], local[1]));
  }
  const strokeOnly = { ...el, backgroundColor: "transparent" };
  const body = paths
    .map((d, i) => `<path d="${d}" ${strokeAttrs(i === 0 && el.polygon ? el : strokeOnly)}/>`)
    .join("");
  return {
    width,
    height,
    center: { x: el.x + minX + width / 2, y: el.y + minY + height / 2 },
    body,
  };
}

function boxShape(el) {
  const pad = SHAPE_PADDING;
  const width = el.width + pad * 2;
  const height = el.height + pad * 2;
  let body;
  if (el.type === "ellipse") {
    body = `<ellipse cx="${round(width / 2)}" cy="${round(height / 2)}" rx="${round(el.width / 2)}" ry="${round(el.height / 2)}" ${strokeAttrs(el)}/>`;
  } else if (el.type === "diamond") {
    const [w, h] = [el.width, el.height];
    body = `<path d="M${round(pad + w / 2)} ${pad} L${round(pad + w)} ${round(pad + h / 2)} L${round(pad + w / 2)} ${round(pad + h)} L${pad} ${round(pad + h / 2)} Z" ${strokeAttrs(el)}/>`;
  } else {
    const radius = el.roundness ? round(Math.min(32, Math.min(el.width, el.height) / 4)) : 0;
    body = `<rect x="${pad}" y="${pad}" width="${round(el.width)}" height="${round(el.height)}" rx="${radius}" ${strokeAttrs(el)}/>`;
  }
  return { width, height, center: center(el), body };
}

async function shapeFrom(el) {
  const shape = el.points ? linearShape(el) : boxShape(el);
  const width = round(shape.width);
  const height = round(shape.height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shape.body}</svg>\n`;
  const name = `${el.id}.svg`;
  await writeFile(path.join(ROOT, "public", ASSET_DIR, name), svg);
  return {
    id: el.id,
    type: "image",
    x: round(shape.center.x),
    y: round(shape.center.y),
    src: `/${ASSET_DIR}/${name}`,
    width,
    height,
    variant: "bare",
  };
}

function cameraFor(scene) {
  const xs = scene.flatMap((el) => [el.x, el.x + el.width]);
  const ys = scene.flatMap((el) => [el.y, el.y + el.height]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const zoom = round(
    Math.min(1, VIEWPORT.width / (maxX - minX), VIEWPORT.height / (maxY - minY)),
    3,
  );
  return {
    zoom,
    x: round(-((minX + maxX) / 2) * zoom),
    y: round(-((minY + maxY) / 2) * zoom),
  };
}

async function convert(source) {
  const scene = JSON.parse(await readFile(source, "utf8"));
  const live = scene.elements.filter((el) => !el.isDeleted);
  const byId = new Map(live.map((el) => [el.id, el]));
  const files = scene.files ?? {};
  const elements = [];
  const skipped = [];

  for (const el of live) {
    if (el.type === "text" && el.containerId && byId.get(el.containerId)?.type === "stickynote") continue;
    if (el.type === "stickynote") {
      const label = (el.boundElements ?? [])
        .map((b) => byId.get(b.id))
        .find((b) => b?.type === "text");
      elements.push(stickyFrom(el, label));
    } else if (el.type === "text") {
      elements.push(textFrom(el));
    } else if (el.type === "image") {
      const image = await imageFrom(el, files);
      if (image) elements.push(image);
      else skipped.push(el);
    } else if (["arrow", "line", "rectangle", "ellipse", "diamond", "freedraw"].includes(el.type)) {
      elements.push(await shapeFrom(el));
    } else {
      skipped.push(el);
    }
  }

  return { graph: { version: 1, camera: cameraFor(live), elements }, skipped };
}

async function main() {
  const source = process.argv[2];
  if (!source) {
    console.error("usage: node scripts/excalidraw-to-graph.mjs <file.excalidraw>");
    process.exit(1);
  }
  await rm(path.join(ROOT, "public", ASSET_DIR), { recursive: true, force: true });
  await mkdir(path.join(ROOT, "public", ASSET_DIR), { recursive: true });
  const { graph, skipped } = await convert(path.resolve(source));
  await writeFile(GRAPH_PATH, `${JSON.stringify(graph, null, 2)}\n`);
  const counts = graph.elements.reduce((acc, el) => ({ ...acc, [el.type]: (acc[el.type] ?? 0) + 1 }), {});
  console.log(`wrote ${graph.elements.length} elements to ${path.relative(ROOT, GRAPH_PATH)}`, counts);
  if (skipped.length) console.log("skipped", skipped.map((el) => `${el.type}:${el.id}`));
}

main();
