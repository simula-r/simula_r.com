import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { devOnly } from "@/lib/devOnly";
import { GRAPH_VERSION, type Graph } from "@/app/graph/types";

function isGraph(value: unknown): value is Graph {
  if (typeof value !== "object" || value === null) return false;
  const graph = value as Partial<Graph>;
  return (
    graph.version === GRAPH_VERSION &&
    typeof graph.camera === "object" &&
    graph.camera !== null &&
    Array.isArray(graph.elements)
  );
}

export const POST = devOnly(async (request) => {
  const body: unknown = await request.json();
  if (!isGraph(body)) return new Response(null, { status: 400 });

  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "graph.json"),
    `${JSON.stringify(body, null, 2)}\n`,
  );
  return new Response(null, { status: 204 });
});
