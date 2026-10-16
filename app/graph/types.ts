import type { Camera, CanvasElementData } from "@/app/elements/types";
import type { Size } from "@/lib/camera";

const GRAPH_VERSION = 1;

type Graph = {
  version: typeof GRAPH_VERSION;
  camera: Camera;
  start?: { camera: Camera; viewport: Size };
  elements: CanvasElementData[];
};

export { GRAPH_VERSION };
export type { Graph };
