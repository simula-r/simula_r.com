import type { Camera, CanvasElementData } from "@/app/elements/types";

const GRAPH_VERSION = 1;

type Graph = {
  version: typeof GRAPH_VERSION;
  camera: Camera;
  elements: CanvasElementData[];
};

export { GRAPH_VERSION };
export type { Graph };
