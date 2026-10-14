import type { Graph } from "./types";

async function saveGraph(graph: Graph): Promise<boolean> {
  const response = await fetch("/api/graph", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(graph),
  });
  return response.ok;
}

export { saveGraph };
