import graphJson from "@/data/graph.json";
import type { Graph } from "./types";

function loadGraph(): Graph {
  return graphJson as Graph;
}

export { loadGraph };
