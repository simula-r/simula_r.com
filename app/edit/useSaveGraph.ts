import { useEffect, useEffectEvent, useRef, useState } from "react";
import { saveGraph } from "@/app/graph/save";
import type { Graph } from "@/app/graph/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function useSaveGraph(graph: Graph) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedElements, setSavedElements] = useState(graph.elements);
  const saving = useRef(false);
  const dirty = graph.elements !== savedElements;

  const save = async () => {
    if (saving.current) return;
    saving.current = true;
    setStatus("saving");
    const snapshot = graph;
    const ok = await saveGraph(snapshot);
    saving.current = false;
    if (ok) setSavedElements(snapshot.elements);
    setStatus(ok ? "saved" : "error");
  };

  const onShortcut = useEffectEvent(() => save());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "s") return;
      e.preventDefault();
      onShortcut();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setStatus("idle"), 1500);
    return () => clearTimeout(timer);
  }, [status]);

  return { status, dirty, save };
}

export { useSaveGraph };
export type { SaveStatus };
